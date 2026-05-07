// =====================================================================
// place-order  —  Edge Function
//
// POST  /functions/v1/place-order
//
// Accepts two payload shapes; both run through the same pipeline.
//
// (1) Rich shape (existing consumers):
//     {
//       contact: { name, phone, email? },
//       branchId: uuid,
//       fulfillment: 'pickup' | 'delivery',
//       pickupTimeText?: string,
//       deliveryAddress?: string,
//       items: [{ productId?: uuid, legacyId?: int, bundleId?: uuid, quantity: int }],
//       promoCode?: string,
//       notes?: string,
//       channel?: 'web' | 'whatsapp'
//     }
//     → { orderId, orderNumber, totalAgorot, status }
//
// (2) Simple shape (new CheckoutPage):
//     {
//       customer: { name, phone, address, notes? },
//       items:    [{ product_id: uuid|int, quantity, price? }],
//       total_price?
//     }
//     → { success: true, order_id }
//
// Headers:
//   x-idempotency-key   recommended; same key → same order returned.
//
// Server is the SOURCE OF TRUTH for prices. Any price/total in the body
// is accepted but ignored — the order total is recomputed from the DB.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { normalizeILPhone, isE164 } from '../_shared/phone.ts';
import { enqueueNotification } from '../_shared/notifications/enqueue.ts';
import { firstName } from '../_shared/notifications/templates.ts';
import { corsHeaders as buildCorsHeaders, handleOptions } from '../_shared/cors.ts';
import { createLogger, requestId } from '../_shared/logger.ts';

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

// ---------------------------------------------------------------------
// Simple payload (new CheckoutPage shape). Translated to the rich shape
// before the rest of the pipeline runs, so all existing logic — rate
// limiting, idempotency, server-authoritative pricing, notifications —
// applies unchanged. Response is also collapsed to { success, order_id }.
// ---------------------------------------------------------------------
// Order matters: integers and numeric strings (legacy_id) are tried before
// the UUID branch so the validator never surfaces a misleading "Invalid uuid"
// for what is, in fact, a legacy_id. A numeric string ("106") is coerced into
// an int so the downstream `typeof === 'number'` branch routes it to legacyId.
const SimpleItemSchema = z.object({
    product_id: z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform((s) => Number(s)),
        z.string().uuid()
    ]),
    quantity:   z.number().int().positive().max(99),
    // `price` is accepted but ignored — server recomputes from DB.
    price:      z.number().nonnegative().optional()
});

const SimpleRequestSchema = z.object({
    customer: z.object({
        name:    z.string().min(2).max(120),
        phone:   z.string().min(7).max(20),
        address: z.string().min(2).max(240),
        notes:   z.string().max(500).optional().nullable()
    }),
    items:       z.array(SimpleItemSchema).min(1).max(50),
    // Accepted for client display; server recomputes the authoritative total.
    total_price: z.number().nonnegative().optional()
});

serve(async (req) => {
    // Allowlist CORS via the shared helper. `x-idempotency-key` is included
    // in the preflight allowlist there so retries of the same submit aren't
    // blocked at the browser. Localhost dev + production domains come from
    // the ALLOWED_ORIGINS env (or DEFAULT_ALLOWED in cors.ts as fallback).
    const corsHeaders = buildCorsHeaders(req.headers.get('origin'));

    const opts = handleOptions(req);
    if (opts) return opts;

    // Per-request correlation id + structured logger. The id is echoed back
    // on every response via `x-request-id` so failed orders can be matched
    // to their server log line without operator guesswork.
    const reqId = requestId(req);
    const log = createLogger({ fn: 'place-order', reqId });
    const t0 = performance.now();

    // Per-request response builder so every reply carries the resolved CORS
    // headers. Defined inside serve() because corsHeaders depends on the
    // request origin (see cors.ts allowlist).
    const json = (status: number, body: unknown) =>
        new Response(JSON.stringify(body), {
            status,
            headers: { ...corsHeaders, 'content-type': 'application/json', 'x-request-id': reqId }
        });

    if (req.method !== 'POST') {
        return json(405, { error: 'method_not_allowed' });
    }

    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) {
        return json(500, { error: 'server_misconfigured' });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // -------------------- parse --------------------
    let body: unknown;
    try { body = await req.json(); }
    catch { return json(400, { error: 'invalid_json' }); }

    // Detect simple payload (new CheckoutPage) vs rich payload (existing
    // consumers). Simple has top-level `customer`; rich has top-level `contact`.
    const bodyObj = (body && typeof body === 'object') ? (body as Record<string, unknown>) : {};
    const isSimpleShape = 'customer' in bodyObj && !('contact' in bodyObj);

    let input: z.infer<typeof RequestSchema>;
    if (isSimpleShape) {
        const parsedSimple = SimpleRequestSchema.safeParse(body);
        if (!parsedSimple.success) {
            return json(400, { error: 'validation_failed', details: parsedSimple.error.flatten() });
        }
        const simple = parsedSimple.data;

        // Pick a default branch — first active, non-deleted branch by creation
        // order. The simple payload has no branch concept; the existing schema
        // requires one (NOT NULL FK), so we use the first seeded branch.
        const { data: defaultBranch, error: branchLookupErr } = await admin
            .from('branches')
            .select('id')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
        if (branchLookupErr || !defaultBranch) {
            return json(500, { error: 'no_branch_configured' });
        }

        input = {
            contact: {
                name:  simple.customer.name,
                phone: simple.customer.phone
            },
            branchId:        defaultBranch.id,
            // `pickup` matches the seeded branch's capabilities. The address is
            // still captured below in delivery_address regardless of fulfillment.
            fulfillment:     'pickup',
            deliveryAddress: simple.customer.address,
            // Number → legacy_id (int from productsData.js) → resolved to real
            // UUID via products.legacy_id below. UUID-string → products.id
            // directly. Integer ids must NEVER reach the UUID column.
            items: simple.items.map((it) => {
                if (typeof it.product_id === 'number') {
                    return { legacyId: it.product_id, quantity: it.quantity };
                }
                return { productId: it.product_id, quantity: it.quantity };
            }),
            notes:   simple.customer.notes ?? undefined,
            channel: 'web'
        };
    } else {
        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
            return json(400, { error: 'validation_failed', details: parsed.error.flatten() });
        }
        input = parsed.data;
    }

    // -------------------- normalize phone --------------------
    const phoneE164 = normalizeILPhone(input.contact.phone);
    if (!phoneE164 || !isE164(phoneE164)) {
        return json(400, { error: 'invalid_phone' });
    }

    // -------------------- rate limit (5 / 5min / phone) --------------------
    const allowed = await checkRateLimit(admin, `place-order:${phoneE164}`, 5, 300);
    if (!allowed) return json(429, { error: 'rate_limited' });

    // -------------------- idempotency --------------------
    // Dedicated column + unique partial index (orders_idempotency_key_unique).
    // payment_provider_ref is reserved for PSP transaction refs; do NOT
    // overload it here. The unique index also guards the race between the
    // pre-insert lookup and the actual INSERT — see the 23505 handler below.
    const idemKey = req.headers.get('x-idempotency-key');
    if (idemKey) {
        const { data: existing } = await admin
            .from('orders')
            .select('id, order_number, total_agorot, status')
            .eq('order_idempotency_key', idemKey)
            .maybeSingle();
        if (existing) {
            if (isSimpleShape) {
                return json(200, { success: true, order_id: existing.id });
            }
            return json(200, {
                orderId: existing.id,
                orderNumber: existing.order_number,
                totalAgorot: existing.total_agorot,
                status: existing.status,
                idempotent: true
            });
        }
    }

    // -------------------- branch validation --------------------
    const { data: branch, error: branchErr } = await admin
        .from('branches')
        .select('id, accepts_pickup, accepts_delivery, is_active, deleted_at')
        .eq('id', input.branchId)
        .single();
    if (branchErr || !branch || branch.deleted_at || !branch.is_active) {
        return json(400, { error: 'invalid_branch' });
    }
    if (input.fulfillment === 'pickup' && !branch.accepts_pickup) {
        return json(400, { error: 'branch_no_pickup' });
    }
    if (input.fulfillment === 'delivery' && !branch.accepts_delivery) {
        return json(400, { error: 'branch_no_delivery' });
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
                });
            }
            if (p.is_sold_out) {
                return json(409, { error: 'product_sold_out', productId: p.id, name: p.name_he });
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
                return json(400, { error: 'bundle_unavailable', bundleId: item.bundleId });
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
        if (custErr || !created) return json(500, { error: 'customer_create_failed' });
        customerId = created.id;
    } else {
        await admin.from('customers').update({
            name: input.contact.name,
            email: input.contact.email,
            last_order_at: new Date().toISOString()
        }).eq('id', customerId);
    }

    // -------------------- order number --------------------
    // Atomic per-day counter via next_order_number RPC. INSERT...ON CONFLICT
    // DO UPDATE inside the function returns a strictly monotonic sequence per
    // UTC day, so concurrent place-order calls cannot collide on order_number.
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm   = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd   = String(today.getUTCDate()).padStart(2, '0');
    const datePart = `${yyyy}-${mm}-${dd}`;
    const { data: seqValue, error: seqErr } = await admin
        .rpc('next_order_number', { p_date_part: datePart });
    if (seqErr || typeof seqValue !== 'number') {
        log.error('next_order_number_failed', { code: seqErr?.code, message: seqErr?.message });
        return json(500, { error: 'order_number_failed' });
    }
    const seq = String(seqValue).padStart(3, '0');
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
            order_idempotency_key: idemKey ?? null
        })
        .select('id')
        .single();
    if (orderErr || !order) {
        // 23505 = unique_violation. The only unique constraint we can race
        // on here is orders_idempotency_key_unique — two concurrent retries
        // of the same submit. The winner already wrote the row; resurface
        // it instead of returning a 500.
        if (orderErr?.code === '23505' && idemKey) {
            const { data: winner } = await admin
                .from('orders')
                .select('id, order_number, total_agorot, status')
                .eq('order_idempotency_key', idemKey)
                .maybeSingle();
            if (winner) {
                if (isSimpleShape) {
                    return json(200, { success: true, order_id: winner.id });
                }
                return json(200, {
                    orderId: winner.id,
                    orderNumber: winner.order_number,
                    totalAgorot: winner.total_agorot,
                    status: winner.status,
                    idempotent: true
                });
            }
        }
        log.error('order_insert_failed', { code: orderErr?.code, message: orderErr?.message });
        return json(500, { error: 'order_create_failed' });
    }

    const { error: itemsErr } = await admin
        .from('order_items')
        .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsErr) {
        // best-effort cleanup
        await admin.from('orders').delete().eq('id', order.id);
        return json(500, { error: 'order_items_create_failed' });
    }

    // -------------------- audit --------------------
    await admin.from('audit_log').insert({
        action: 'order.placed',
        target_type: 'order',
        target_id: order.id,
        diff: { after: { order_number: orderNumber, total_agorot: Number(totalAgorot) } },
        // Use the resolved correlation id (upstream header or freshly
        // minted), so audit_log rows and structured logs share an id.
        request_id: reqId,
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    });

    // -------------------- notification: order_received --------------------
    // Always SMS the receipt — the customer hasn't opted in yet, but a single
    // transactional confirmation is allowed under IL regulation (and is what
    // the customer expects). Marketing sends require marketing_*_opt_in.
    //
    // The order is already committed at this point. The enqueue path runs
    // through the Shabbat guard + template render before touching the DB,
    // and any of those steps could fail. We isolate the entire post-commit
    // tail so a notifications-table outage / template bug / Shabbat-guard
    // edge case can never roll the customer's order back.
    try {
        const enq = await enqueueNotification(admin, {
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
        if (!enq.ok) {
            log.warn('order_received_enqueue_failed', { orderId: order.id, reason: enq.reason });
        }
    } catch (e) {
        log.error('order_received_enqueue_threw', { orderId: order.id, message: (e as Error).message });
    }

    // -------------------- abandoned-checkout cleanup --------------------
    // Best-effort: if we can't mark the abandoned row recovered, the worst
    // case is a stray reminder SMS — never fail the order over it.
    try {
        await admin.from('abandoned_checkouts')
            .update({ recovered_order_id: order.id })
            .eq('phone_e164', phoneE164)
            .is('recovered_order_id', null);
    } catch (e) {
        log.warn('abandoned_checkout_cleanup_failed', { orderId: order.id, message: (e as Error).message });
    }

    log.info('order_placed', {
        orderId: order.id,
        orderNumber,
        totalAgorot: Number(totalAgorot),
        fulfillment: input.fulfillment,
        durationMs: Math.round(performance.now() - t0),
    });

    if (isSimpleShape) {
        return json(200, { success: true, order_id: order.id });
    }

    return json(200, {
        orderId: order.id,
        orderNumber,
        totalAgorot: Number(totalAgorot),
        status: 'pending'
    });
});
