// =====================================================================
// track-abandoned-checkout — client beacon when a known-phone customer
// has items in cart but hasn't submitted yet.
//
// POST /functions/v1/track-abandoned-checkout
// Body: { phone, name?, items: [{name, quantity, priceAgorot}], totalAgorot, branchId? }
//
// Idempotent on (phone_e164, day): one open abandoned_checkouts row per
// customer per day. The `process-campaigns` runner picks these up an hour
// later if no order has happened.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { normalizeILPhone, isE164 } from '../_shared/phone.ts';

const Schema = z.object({
    phone:  z.string().min(7).max(20),
    name:   z.string().max(120).optional(),
    items:  z.array(z.object({
        name: z.string().max(120),
        quantity: z.number().int().positive().max(99),
        priceAgorot: z.number().int().nonnegative().optional()
    })).min(1).max(50),
    totalAgorot: z.number().int().nonnegative(),
    branchId: z.string().uuid().optional()
});

serve(async (req) => {
    const cors = corsHeaders(req.headers.get('origin'));
    const opts = handleOptions(req);
    if (opts) return opts;
    if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405, headers: cors });

    const url        = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    let body: unknown;
    try { body = await req.json(); }
    catch { return json(400, { error: 'invalid_json' }, cors); }

    const parsed = Schema.safeParse(body);
    if (!parsed.success) return json(400, { error: 'validation_failed' }, cors);

    const phoneE164 = normalizeILPhone(parsed.data.phone);
    if (!phoneE164 || !isE164(phoneE164)) return json(400, { error: 'invalid_phone' }, cors);

    // Find existing open row for this phone today.
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const { data: existing } = await admin
        .from('abandoned_checkouts')
        .select('id')
        .eq('phone_e164', phoneE164)
        .is('recovered_order_id', null)
        .gte('created_at', today.toISOString())
        .maybeSingle();

    // Try to link to a customer if they already exist.
    const { data: cust } = await admin
        .from('customers').select('id').eq('phone_e164', phoneE164).maybeSingle();

    if (existing) {
        await admin.from('abandoned_checkouts').update({
            items: parsed.data.items,
            total_agorot: parsed.data.totalAgorot,
            name: parsed.data.name,
            branch_id: parsed.data.branchId ?? null,
            customer_id: cust?.id ?? null
        }).eq('id', existing.id);
        return json(200, { ok: true, id: existing.id, updated: true }, cors);
    }

    const { data: created, error } = await admin.from('abandoned_checkouts').insert({
        phone_e164: phoneE164,
        name: parsed.data.name ?? null,
        items: parsed.data.items,
        total_agorot: parsed.data.totalAgorot,
        branch_id: parsed.data.branchId ?? null,
        customer_id: cust?.id ?? null
    }).select('id').single();
    if (error) return json(500, { error: 'insert_failed' }, cors);
    return json(200, { ok: true, id: created.id, updated: false }, cors);
});

function json(status: number, body: unknown, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status, headers: { ...cors, 'content-type': 'application/json' }
    });
}
