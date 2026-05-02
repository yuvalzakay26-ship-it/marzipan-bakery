// =====================================================================
// create-payment-session — mints a hosted-checkout URL for a placed order.
//
// POST  /functions/v1/create-payment-session
// Body: { orderId: uuid, provider?: 'cardcom'|'tranzila'|'payplus' }
// Returns: { redirectUrl, sessionId, provider }
//
// Server is the source of truth: client may HINT at provider but the
// PAYMENT_PROVIDER env var wins. The amount comes from the orders table —
// never from the client.
//
// Idempotent: if the order already has a payment_session_id and the order
// is still 'pending'/'unpaid', we return the existing redirect URL rather
// than minting a second one (avoids double-charge windows).
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { getAdapter, pickProviderName, type ProviderName } from '../_shared/payments.ts';

const RequestSchema = z.object({
    orderId:  z.string().uuid(),
    provider: z.enum(['cardcom', 'tranzila', 'payplus']).optional()
});

serve(async (req) => {
    const cors = corsHeaders(req.headers.get('origin'));
    const opts = handleOptions(req);
    if (opts) return opts;

    if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, cors);

    const url        = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return json(500, { error: 'server_misconfigured' }, cors);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    let body: unknown;
    try { body = await req.json(); }
    catch { return json(400, { error: 'invalid_json' }, cors); }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) return json(400, { error: 'validation_failed', details: parsed.error.flatten() }, cors);

    // Provider: client hint is advisory; env wins.
    const envProvider: ProviderName = pickProviderName();
    const provider = envProvider;

    // Rate limit by IP — protects against URL-spamming a provider.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!(await checkRateLimit(admin, `create-session:ip:${ip}`, 30, 300))) {
        return json(429, { error: 'rate_limited' }, cors);
    }

    // Load the order and verify it is payable.
    const { data: order, error: orderErr } = await admin
        .from('orders')
        .select(`
            id, order_number, total_agorot, status, payment_status,
            payment_session_id, payment_provider, channel,
            contact_name, contact_phone_e164, customer_id
        `)
        .eq('id', parsed.data.orderId)
        .maybeSingle();

    if (orderErr || !order) return json(404, { error: 'order_not_found' }, cors);

    if (order.payment_status === 'captured') {
        return json(409, { error: 'already_paid' }, cors);
    }
    if (['cancelled', 'refunded'].includes(order.status)) {
        return json(409, { error: 'order_closed' }, cors);
    }
    if (order.total_agorot <= 0) {
        // Free order — caller should not have asked for a session.
        return json(400, { error: 'order_not_chargeable' }, cors);
    }

    // Fetch customer email if we have a linked customer.
    let email: string | undefined;
    if (order.customer_id) {
        const { data: c } = await admin
            .from('customers')
            .select('email')
            .eq('id', order.customer_id)
            .maybeSingle();
        email = c?.email ?? undefined;
    }

    // Idempotency — if we already have a session and the provider hasn't changed,
    // return the same redirect (Cardcom URL stays valid until the LP code expires).
    if (
        order.payment_session_id &&
        order.payment_provider === provider &&
        order.payment_status !== 'failed'
    ) {
        const cached = await rebuildRedirect(provider, order.payment_session_id);
        if (cached) {
            return json(200, {
                provider,
                sessionId: order.payment_session_id,
                redirectUrl: cached,
                idempotent: true
            }, cors);
        }
    }

    // URLs for the hosted page + webhook.
    const successBase = Deno.env.get('PAYMENT_SUCCESS_URL_BASE') || 'https://marzipanbakery.com/order/payment/result';
    const failureBase = Deno.env.get('PAYMENT_FAILURE_URL_BASE') || 'https://marzipanbakery.com/order/payment/result';
    const webhookBase = Deno.env.get('PAYMENT_WEBHOOK_URL_BASE')
        || `${url.replace(/\/$/, '')}/functions/v1/payment-webhook`;

    const successUrl = `${successBase}?orderId=${order.id}&status=success`;
    const failureUrl = `${failureBase}?orderId=${order.id}&status=failed`;
    const webhookUrl = `${webhookBase}?provider=${provider}`;

    // Mint with the provider.
    const adapter = getAdapter(provider);
    let session;
    try {
        session = await adapter.createCheckoutSession({
            orderId:      order.id,
            orderNumber:  order.order_number,
            amountAgorot: Number(order.total_agorot),
            customer: {
                name:  order.contact_name,
                phone: order.contact_phone_e164,
                email
            },
            successUrl,
            failureUrl,
            webhookUrl
        });
    } catch (err) {
        console.error('create_session_failed', err);
        await admin.from('audit_log').insert({
            action: 'payment.session_failed',
            target_type: 'order',
            target_id: order.id,
            diff: { reason: String((err as Error).message || err) }
        });
        return json(502, { error: 'provider_error' }, cors);
    }

    await admin.from('orders').update({
        payment_provider:    provider,
        payment_session_id:  session.sessionId,
        payment_provider_ref: session.providerRef ?? null
    }).eq('id', order.id);

    await admin.from('audit_log').insert({
        action: 'payment.session_created',
        target_type: 'order',
        target_id: order.id,
        diff: { after: { provider, sessionId: session.sessionId } }
    });

    return json(200, {
        provider,
        sessionId: session.sessionId,
        redirectUrl: session.redirectUrl
    }, cors);
});

// Cardcom URLs are recoverable from the LowProfileCode — others need a fresh
// init. For the first cut we only short-circuit for Cardcom; otherwise we
// re-mint (still idempotent on the order side because the prior session_id
// gets overwritten by `update`).
async function rebuildRedirect(provider: ProviderName, sessionId: string): Promise<string | null> {
    if (provider === 'cardcom') {
        const base = Deno.env.get('CARDCOM_BASE_URL') || 'https://secure.cardcom.solutions';
        return `${base}/Interface/LowProfile.aspx?LowProfileCode=${encodeURIComponent(sessionId)}`;
    }
    return null;
}

function json(status: number, body: unknown, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'content-type': 'application/json' }
    });
}
