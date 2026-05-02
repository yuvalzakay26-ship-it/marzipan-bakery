// =====================================================================
// payment-webhook  —  shared webhook receiver for Israeli PSPs.
//
//   POST /functions/v1/payment-webhook?provider=cardcom|tranzila|payplus
//
// Pipeline:
//   1. Parse provider from the query string.
//   2. Read the raw body (signature verification needs the unparsed bytes).
//   3. Hand off to the provider adapter to verify + normalize.
//        - Cardcom:  re-calls BillGoldGetLowProfileIndicator2 server→server.
//        - Tranzila: HMAC-SHA256(body) compared in constant time.
//        - PayPlus:  HMAC-SHA256(body) compared in constant time.
//   4. Persist the event into payment_events with
//        UNIQUE (provider, provider_event_id)
//      — duplicate webhooks become idempotent inserts; we return 200 OK
//      without touching the order again.
//   5. Update the order's payment_status / status atomically.
//        - 'captured' → status='confirmed' (this is the only path that
//          ever auto-confirms a web order).
//        - 'failed'   → record reason; status stays 'pending' so the
//          customer can retry.
//   6. Always return 200 once the event is recorded so PSPs stop retrying.
//      Bad signatures are 401; bad payloads are 400.
//
// Order rule: an unpaid web order never auto-confirms. The DB enforces
// this via a CHECK constraint (see migration 20260429000004); this code
// is the only path that flips a web order to 'confirmed', and it only does
// so when payment_status reaches 'captured'.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getAdapter, type ProviderName } from '../_shared/payments.ts';
import { awardOrderPoints, maybeIssueMilestone, maybeProcessReferral } from '../_shared/loyalty.ts';
import { enqueueNotification } from '../_shared/notifications/enqueue.ts';
import { firstName } from '../_shared/notifications/templates.ts';

const PROVIDERS: ProviderName[] = ['cardcom', 'tranzila', 'payplus'];

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok');
    if (req.method !== 'POST')    return new Response('method_not_allowed', { status: 405 });

    const url        = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return new Response('server_misconfigured', { status: 500 });

    const provider = new URL(req.url).searchParams.get('provider') as ProviderName | null;
    if (!provider || !PROVIDERS.includes(provider)) {
        return new Response('unknown_provider', { status: 400 });
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const raw = await req.text();

    // ---------------- verify + normalize ----------------
    let normalized;
    try {
        const adapter = getAdapter(provider);
        const result = await adapter.verifyWebhook(req, raw);
        if (!result.ok) {
            console.warn('webhook_verify_failed', provider, result.reason);
            await admin.from('payment_events').insert({
                provider,
                provider_event_id: `unverified-${crypto.randomUUID()}`,
                kind: 'failed',
                signature_ok: false,
                raw_payload: { rawText: raw, reason: result.reason },
                note: result.reason
            });
            return new Response('invalid_signature', { status: 401 });
        }
        normalized = result.event;
    } catch (err) {
        console.error('webhook_adapter_threw', provider, err);
        return new Response('adapter_error', { status: 500 });
    }

    // ---------------- idempotent persist ----------------
    const { data: inserted, error: insertErr } = await admin
        .from('payment_events')
        .insert({
            order_id:          normalized.orderId,
            provider,
            provider_event_id: normalized.providerEventId,
            kind:              normalized.kind,
            amount_agorot:     normalized.amountAgorot ?? null,
            signature_ok:      true,
            raw_payload:       normalized.raw,
            note:              normalized.note ?? null
        })
        .select('id')
        .maybeSingle();

    // 23505 = unique-constraint violation. That's a duplicate webhook —
    // legitimate (PSPs retry until they see 200). We answer ok and stop.
    if (insertErr && (insertErr as { code?: string }).code === '23505') {
        return new Response(JSON.stringify({ ok: true, idempotent: true }), {
            status: 200, headers: { 'content-type': 'application/json' }
        });
    }
    if (insertErr) {
        console.error('payment_event_insert_failed', insertErr);
        return new Response('persist_failed', { status: 500 });
    }

    // ---------------- locate + update order ----------------
    const { data: order } = await admin
        .from('orders')
        .select('id, status, payment_status, total_agorot, channel')
        .eq('id', normalized.orderId)
        .maybeSingle();

    if (!order) {
        // Event recorded but no matching order. Mark processed and move on.
        await admin.from('payment_events').update({
            processed_at: new Date().toISOString(),
            note: 'order_not_found'
        }).eq('id', inserted!.id);
        return new Response('order_not_found', { status: 404 });
    }

    // Cross-check the amount. A mismatch is a strong fraud signal.
    if (
        normalized.kind === 'captured' &&
        normalized.amountAgorot !== null &&
        Number(order.total_agorot) !== normalized.amountAgorot
    ) {
        await admin.from('payment_events').update({
            processed_at: new Date().toISOString(),
            note: `amount_mismatch:order=${order.total_agorot},psp=${normalized.amountAgorot}`
        }).eq('id', inserted!.id);
        await admin.from('audit_log').insert({
            action: 'payment.amount_mismatch',
            target_type: 'order',
            target_id: order.id,
            diff: { order: order.total_agorot, psp: normalized.amountAgorot, provider }
        });
        // Don't auto-confirm. Order stays unpaid until manual review.
        return new Response('amount_mismatch_logged', { status: 200 });
    }

    // ---------------- transition ----------------
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { payment_provider: provider };

    if (normalized.kind === 'captured') {
        patch.payment_status      = 'captured';
        patch.payment_captured_at = now;
        patch.payment_failure_reason = null;
        // The single auto-confirm path. Web orders only get here via this branch.
        if (order.status === 'pending') {
            patch.status       = 'confirmed';
            patch.confirmed_at = now;
        }
    } else if (normalized.kind === 'authorized') {
        patch.payment_status      = 'authorized';
        patch.payment_authorized_at = now;
    } else if (normalized.kind === 'pending') {
        patch.payment_status = 'unpaid';     // still pending — don't lift confirmation
    } else if (normalized.kind === 'failed') {
        patch.payment_status        = 'failed';
        patch.payment_failure_reason = normalized.note ?? 'payment_failed';
    } else if (normalized.kind === 'refunded') {
        patch.payment_status = 'refunded';
        patch.status         = 'refunded';
    }

    await admin.from('orders').update(patch).eq('id', order.id);

    await admin.from('payment_events').update({ processed_at: now }).eq('id', inserted!.id);

    await admin.from('audit_log').insert({
        action: `payment.${normalized.kind}`,
        target_type: 'order',
        target_id: order.id,
        diff: { after: patch, providerEventId: normalized.providerEventId, provider }
    });

    // ---------------- retention hooks (only on actual capture) ----------------
    if (normalized.kind === 'captured') {
        try {
            const { data: full } = await admin
                .from('orders')
                .select(`
                    id, order_number, customer_id, contact_phone_e164,
                    customer:customers(name, marketing_sms_opt_in, marketing_whatsapp_opt_in)
                `)
                .eq('id', order.id)
                .maybeSingle();

            if (full?.customer_id) {
                // 1) award points
                await awardOrderPoints(admin, full.id);

                // 2) milestone (5th paid order) — issues a promo + notifies
                await maybeIssueMilestone(admin, full.customer_id, full.id);

                // 3) referral attribution — if this customer was referred,
                //    pay both sides on their first paid order. The function
                //    is idempotent on (referrer, referee) pair.
                await maybeProcessReferral(admin, full.customer_id, full.id);

                // 4) payment-approved notification (transactional, always sent)
                const cust = (full as any).customer ?? {};
                const channel = cust.marketing_whatsapp_opt_in ? 'whatsapp' : 'sms';
                await enqueueNotification(admin, {
                    customerId:  full.customer_id,
                    orderId:     full.id,
                    channel,
                    kind:        'payment_approved',
                    toPhoneE164: full.contact_phone_e164,
                    idempotencyKey: `payment_approved:${full.id}`,
                    vars: {
                        orderNumber: full.order_number,
                        firstName:   firstName(cust.name)
                    }
                });
            }
        } catch (err) {
            // Retention hooks must never block the webhook ack — log and continue.
            console.error('retention_hooks_failed', err);
        }
    }

    return new Response(JSON.stringify({ ok: true, kind: normalized.kind }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
});
