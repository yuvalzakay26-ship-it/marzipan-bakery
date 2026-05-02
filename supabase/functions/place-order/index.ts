// =====================================================================
// place-order  —  Edge Function
//
// POST  /functions/v1/place-order
// Body: {
//   contact: { name, phone, email? },
//   branchId: uuid,
//   fulfillment: 'pickup' | 'delivery',
//   pickupTimeText?: string,
//   deliveryAddress?: string,
//   items: [{ productId?: uuid, bundleId?: uuid, quantity: int }],
//   promoCode?: string,
//   notes?: string,
//   channel?: 'web' | 'whatsapp'
// }
// Headers:
//   x-idempotency-key   recommended; same key → same order returned.
//
// Returns: { orderNumber, orderId, totalAgorot, status }
//
// Server is the SOURCE OF TRUTH for prices. The client sends only
// productId + quantity — never trust client-provided prices.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { normalizeILPhone, isE164 } from '../_shared/phone.ts';
import { enqueueNotification } from '../_shared/notifications/enqueue.ts';
import { firstName } from '../_shared/notifications/templates.ts';

const ItemSchema = z.object({
    productId: z.string().uuid().optional(),
    legacyId:  z.number().int().positive().optional(),
    bundleId:  z.string().uuid().optional(),
    quantity:  z.number().int().positive().max(99)
}).refine(
    (x) => [x.productId, x.legacyId, x.bundleId].filter(Boolean).length === 1,
    { message: 'Each item must reference exactly one of productId, legacyId, or bundleId' }
);

const RequestSchema = z.object({
    contact: z.object({
        name:  z.string().min(2).max(120),
        phone: z.string().min(7).max(20),
        email: z.string().email().optional()
    }),
    branchId:        z.string().uuid(),
    fulfillment:     z.enum(['pickup', 'delivery']).default('pickup'),
    pickupDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    pickupTime:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
    pickupTimeText:  z.string().max(120).optional(),
    deliveryAddress: z.string().max(240).optional(),
    items:           z.array(ItemSchema).min(1).max(50),
    promoCode:       z.string().max(40).optional(),
    notes:           z.string().max(500).optional(),
    referredByCode:  z.string().max(12).optional(),
    channel:         z.enum(['web', 'whatsapp']).default('web')
});

serve(async (req) => {
    const cors = corsHeaders(req.headers.get('origin'));
    const opts = handleOptions(req);
    if (opts) return opts;

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
            status: 405, headers: { ...cors, 'content-type': 'application/json' }
        });
    }

    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
        return json(500, { error: 'server_misconfigured' }, cors);
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // -------------------- parse --------------------
    let body: unknown;
    try { body = await req.json(); }
    catch { return json(400, { error: 'invalid_json' }, cors); }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
        return json(400, { error: 'validation_failed', details: parsed.error.flatten() }, cors);
    }
    const input = parsed.data;

    // -------------------- normalize phone --------------------
    const phoneE164 = normalizeILPhone(input.contact.phone);
    if (!phoneE164 || !isE164(phoneE164)) {
        return json(400, { error: 'invalid_phone' }, cors);
    }

    // -------------------- rate limit (5 / 5min / phone) --------------------
    const allowed = await checkRateLimit(admin, `place-order:${phoneE164}`, 5, 300);
    if (!allowed) return json(429, { error: 'rate_limited' }, cors);

    // -------------------- idempotency --------------------
    const idemKey = req.headers.get('x-idempotency-key');
    if (idemKey) {
        const { data: existing } = await admin
            .from('orders')
            .select('id, order_number, total_agorot, status')
            .eq('payment_provider_ref', `idem:${idemKey}`)
            .maybeSingle();
        if (existing) {
            return json(200, {
                orderId: existing.id,
                orderNumber: existing.order_number,
                totalAgorot: existing.total_agorot,
                status: existing.status,
                idempotent: true
            }, cors);
        }
    }

    // -------------------- branch validation --------------------
    const { data: branch, error: branchErr } = await admin
        .from('branches')
        .select('id, accepts_pickup, accepts_delivery, is_active, deleted_at')
        .eq('id', input.branchId)
        .single();
    if (branchErr || !branch || branch.deleted_at || !branch.is_active) {
        return json(400, { error: 'invalid_branch' }, cors);
    }
    if (input.fulfillment === 'pickup' && !branch.accepts_pickup) {
        return json(400, { error: 'branch_no_pickup' }, cors);
    }
    if (input.fulfillment === 'delivery' && !branch.accepts_delivery) {
        return json(400, { error: 'branch_no_delivery' }, cors);
    }

    // -------------------- price lookup --------------------
    const productIds = input.items.map((i) => i.productId).filter(Boolean) as string[];
    const legacyIds  = input.items.map((i) => i.legacyId).filter(Boolean) as number[];
    const bundleIds  = input.items.map((i) => i.bundleId).filter(Boolean) as string[];

    const productCols = 'id, legacy_id, name_he, unit, price_agorot, is_active, is_sold_out, deleted_at';
    const [{ data: productsByUuid }, { data: productsByLegacy }, { data: bundles }] = await Promise.all([
        productIds.length
            ? admin.from('products').select(productCols).in('id', productIds)
            : Promise.resolve({ data: [] as any[] }),
        legacyIds.length
            ? admin.from('products').select(productCols).in('legacy_id', legacyIds)
            : Promise.resolve({ data: [] as any[] }),
        bundleIds.length
            ? admin.from('bundles').select('id, name_he, bundle_price_agorot, is_active, deleted_at').in('id', bundleIds)
            : Promise.resolve({ data: [] as any[] })
    ]);

    const productById       = new Map((productsByUuid    ?? []).map((p) => [p.id, p]));
    const productByLegacyId = new Map((productsByLegacy  ?? []).map((p) => [p.legacy_id, p]));
    const bundleById        = new Map((bundles           ?? []).map((b) => [b.id, b]));

    let subtotalAgorot = 0n;
    const lines: Array<{
        product_id: string | null;
        bundle_id: string | null;
        name_he_snapshot: string;
        unit_snapshot: string;
        quantity: number;
        unit_price_agorot: number;
        line_total_agorot: number;
    }> = [];

    for (const item of input.items) {
        const p = item.productId ? productById.get(item.productId)
                : item.legacyId  ? productByLegacyId.get(item.legacyId)
                : null;
        if (item.productId || item.legacyId) {
            if (!p || !p.is_active || p.deleted_at) {
                return json(400, {
                    error: 'product_unavailable',
                    productId: item.productId,
                    legacyId: item.legacyId
                }, cors);
            }
            if (p.is_sold_out) {
                return json(409, { error: 'product_sold_out', productId: p.id, name: p.name_he }, cors);
            }
            const lineTotal = BigInt(p.price_agorot) * BigInt(item.quantity);
            subtotalAgorot += lineTotal;
            lines.push({
                product_id: p.id,
                bundle_id: null,
                name_he_snapshot: p.name_he,
                unit_snapshot: p.unit,
                quantity: item.quantity,
                unit_price_agorot: Number(p.price_agorot),
                line_total_agorot: Number(lineTotal)
            });
        } else if (item.bundleId) {
            const b = bundleById.get(item.bundleId);
            if (!b || !b.is_active || b.deleted_at) {
                return json(400, { error: 'bundle_unavailable', bundleId: item.bundleId }, cors);
            }
            const lineTotal = BigInt(b.bundle_price_agorot) * BigInt(item.quantity);
            subtotalAgorot += lineTotal;
            lines.push({
                product_id: null,
                bundle_id: b.id,
                name_he_snapshot: b.name_he,
                unit_snapshot: 'box',
                quantity: item.quantity,
                unit_price_agorot: Number(b.bundle_price_agorot),
                line_total_agorot: Number(lineTotal)
            });
        }
    }

    // -------------------- promo (server-side) --------------------
    let discountAgorot = 0n;
    if (input.promoCode) {
        const { data: promo } = await admin
            .from('promotions')
            .select('id, code, kind, value, min_subtotal_agorot, max_uses, used_count, starts_at, ends_at, is_active')
            .eq('code', input.promoCode.toUpperCase())
            .maybeSingle();
        const now = new Date();
        const valid =
            promo && promo.is_active &&
            (!promo.starts_at || new Date(promo.starts_at) <= now) &&
            (!promo.ends_at   || new Date(promo.ends_at)   >= now) &&
            (!promo.max_uses  || promo.used_count < promo.max_uses) &&
            subtotalAgorot >= BigInt(promo.min_subtotal_agorot);
        if (valid) {
            if (promo.kind === 'percent_off') {
                discountAgorot = (subtotalAgorot * BigInt(promo.value)) / 10000n;
            } else if (promo.kind === 'amount_off') {
                discountAgorot = BigInt(promo.value);
            }
            if (discountAgorot > subtotalAgorot) discountAgorot = subtotalAgorot;
        }
    }

    const deliveryFeeAgorot = input.fulfillment === 'delivery' ? 2500n : 0n; // ₪25.00 placeholder
    const totalAgorot = subtotalAgorot - discountAgorot + deliveryFeeAgorot;

    // -------------------- upsert customer (by phone) --------------------
    const { data: existingCustomer } = await admin
        .from('customers')
        .select('id')
        .eq('phone_e164', phoneE164)
        .maybeSingle();

    let customerId = existingCustomer?.id;
    if (!customerId) {
        // Resolve the referral code (if any) before creating the customer so
        // we can set referred_by atomically. Self-referrals + unknown codes
        // are silently ignored — the customer order still goes through.
        let referredById: string | null = null;
        if (input.referredByCode) {
            const { data: refCust } = await admin
                .from('customers')
                .select('id, phone_e164')
                .eq('referral_code', input.referredByCode.toUpperCase())
                .maybeSingle();
            if (refCust && refCust.phone_e164 !== phoneE164) {
                referredById = refCust.id;
            }
        }

        const { data: created, error: custErr } = await admin
            .from('customers')
            .insert({
                phone_e164: phoneE164,
                name: input.contact.name,
                email: input.contact.email,
                referred_by: referredById
            })
            .select('id')
            .single();
        if (custErr || !created) return json(500, { error: 'customer_create_failed' }, cors);
        customerId = created.id;
    } else {
        await admin.from('customers').update({
            name: input.contact.name,
            email: input.contact.email,
            last_order_at: new Date().toISOString()
        }).eq('id', customerId);
    }

    // -------------------- order number --------------------
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm   = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd   = String(today.getUTCDate()).padStart(2, '0');
    const datePart = `${yyyy}-${mm}-${dd}`;
    const { count } = await admin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', `${datePart}T00:00:00Z`)
        .lt('created_at',  `${datePart}T23:59:59Z`);
    const seq = String((count ?? 0) + 1).padStart(3, '0');
    const orderNumber = `MZ-${datePart}-${seq}`;

    // -------------------- structured pickup timestamp --------------------
    // Treat the date+time as Asia/Jerusalem local time. We store UTC so the
    // admin can render whatever timezone they want at display time. Israel is
    // UTC+2 (winter) / UTC+3 (DST); Postgres `timestamptz` will handle the
    // round-trip correctly because we serialize with the correct offset.
    let pickupAt: string | null = null;
    let pickupTimeTextDisplay: string | null = input.pickupTimeText ?? null;
    if (input.pickupDate && input.pickupTime) {
        // ISO local time + IL offset. The DB stores UTC; clients render in
        // Asia/Jerusalem at the boundary (PROJECT_BRAIN §6).
        // We compute the offset by constructing the date in IL local time.
        const ilDate = new Date(`${input.pickupDate}T${input.pickupTime}:00+03:00`);
        // Detect whether IL DST is actually in effect for that wall-clock; if
        // not, recompute with +02:00. A cheap-and-correct way: build it in UTC,
        // ask Intl what wall-clock it produces in Jerusalem, and adjust.
        const probe = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false
        }).format(ilDate);
        const expected = input.pickupTime;
        if (probe !== expected) {
            const winter = new Date(`${input.pickupDate}T${input.pickupTime}:00+02:00`);
            pickupAt = winter.toISOString();
        } else {
            pickupAt = ilDate.toISOString();
        }
        pickupTimeTextDisplay = `${input.pickupDate} · ${input.pickupTime}`;
    }

    // -------------------- insert order + items --------------------
    const { data: order, error: orderErr } = await admin
        .from('orders')
        .insert({
            order_number:        orderNumber,
            customer_id:         customerId,
            branch_id:           input.branchId,
            channel:             input.channel,
            fulfillment:         input.fulfillment,
            status:              'pending',
            subtotal_agorot:     Number(subtotalAgorot),
            discount_agorot:     Number(discountAgorot),
            delivery_fee_agorot: Number(deliveryFeeAgorot),
            total_agorot:        Number(totalAgorot),
            contact_name:        input.contact.name,
            contact_phone_e164:  phoneE164,
            delivery_address:    input.deliveryAddress,
            pickup_time_text:    pickupTimeTextDisplay,
            pickup_at:           pickupAt,
            promo_code:          input.promoCode?.toUpperCase(),
            customer_notes:      input.notes,
            payment_provider_ref: idemKey ? `idem:${idemKey}` : null
        })
        .select('id')
        .single();
    if (orderErr || !order) {
        console.error('order_insert_failed', orderErr);
        return json(500, { error: 'order_create_failed' }, cors);
    }

    const { error: itemsErr } = await admin
        .from('order_items')
        .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsErr) {
        // best-effort cleanup
        await admin.from('orders').delete().eq('id', order.id);
        return json(500, { error: 'order_items_create_failed' }, cors);
    }

    // -------------------- audit --------------------
    await admin.from('audit_log').insert({
        action: 'order.placed',
        target_type: 'order',
        target_id: order.id,
        diff: { after: { order_number: orderNumber, total_agorot: Number(totalAgorot) } },
        request_id: req.headers.get('x-request-id'),
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    });

    // -------------------- notification: order_received --------------------
    // Always SMS the receipt — the customer hasn't opted in yet, but a single
    // transactional confirmation is allowed under IL regulation (and is what
    // the customer expects). Marketing sends require marketing_*_opt_in.
    await enqueueNotification(admin, {
        customerId:  customerId!,
        orderId:     order.id,
        channel:     'sms',
        kind:        'order_received',
        toPhoneE164: phoneE164,
        idempotencyKey: `order_received:${order.id}`,
        vars: {
            orderNumber,
            totalIls:  (Number(totalAgorot) / 100).toFixed(0),
            firstName: firstName(input.contact.name)
        }
    });

    // -------------------- abandoned-checkout cleanup --------------------
    // The customer just completed; mark any in-flight abandoned cart for this
    // phone as recovered so the campaign runner won't ping them.
    await admin.from('abandoned_checkouts')
        .update({ recovered_order_id: order.id })
        .eq('phone_e164', phoneE164)
        .is('recovered_order_id', null);

    return json(200, {
        orderId: order.id,
        orderNumber,
        totalAgorot: Number(totalAgorot),
        status: 'pending'
    }, cors);
});

function json(status: number, body: unknown, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'content-type': 'application/json' }
    });
}
