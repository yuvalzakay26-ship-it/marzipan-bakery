// =====================================================================
// Orders service — single entry point that the UI calls when the user
// hits "place order".
//
// Always submits to the place-order Edge Function. Throws
// `backend_disabled` if Supabase env is not configured — the UI must
// surface that to the user and never fall back to WhatsApp.
// =====================================================================

import { invokeFunction, isBackendEnabled } from '../supabase/client.js';
import { PlaceOrderSchema, flattenZodErrors } from '../supabase/schema.js';
import { cartSubtotalAgorot } from './pricing.js';
import { getReferralCode, clearReferralCode } from '../customer/referral.js';

/** Stable client-generated key — submitting twice in 5 seconds is the same order. */
function makeIdempotencyKey() {
    const rnd = Math.random().toString(36).slice(2, 10);
    return `web-${Date.now()}-${rnd}`;
}

/**
 * Place an order.
 *
 * @param {object} input
 * @param {{name:string, phone:string, email?:string}} input.contact
 * @param {string} input.branchId               UUID of branch
 * @param {Array<{id:any, productId?:string, name:string, quantity:number, priceValue?:number, priceAgorot?:number}>} input.items
 * @param {string} [input.pickupDate]           ISO yyyy-mm-dd
 * @param {string} [input.pickupTime]           24h HH:mm
 * @param {string} [input.pickupTimeText]       free-form fallback text
 * @param {string} [input.deliveryAddress]
 * @param {'pickup'|'delivery'} [input.fulfillment]
 * @param {string} [input.notes]
 * @param {string} [input.idempotencyKey]       stable per-form-mount; prevents double-submit
 * @returns {Promise<{ orderId:string, orderNumber:string, totalAgorot:number, status:string }>}
 */
export async function placeOrder(input) {
    if (!isBackendEnabled()) {
        throw new Error('backend_disabled');
    }

    const totalAgorot = cartSubtotalAgorot(input.items);

    const payload = {
        contact: {
            name:  input.contact.name,
            phone: input.contact.phone,
            email: input.contact.email || undefined
        },
        branchId:        input.branchId,
        fulfillment:     input.fulfillment ?? 'pickup',
        pickupDate:      input.pickupDate,
        pickupTime:      input.pickupTime,
        pickupTimeText:  input.pickupTimeText,
        deliveryAddress: input.deliveryAddress,
        items: input.items
            .map((i) => ({
                productId: i.productId,
                legacyId:  i.productId ? undefined : (Number.isInteger(i.id) ? i.id : undefined),
                quantity:  i.quantity
            }))
            .filter((i) => i.productId || i.legacyId),
        notes:   input.notes,
        referredByCode: input.referredByCode || getReferralCode() || undefined,
        channel: 'web'
    };

    const parsed = PlaceOrderSchema.safeParse(payload);
    if (!parsed.success) {
        const err = new Error('validation_failed');
        err.fields = flattenZodErrors(parsed.error);
        throw err;
    }

    const data = await invokeFunction('place-order', parsed.data, {
        idempotencyKey: input.idempotencyKey || makeIdempotencyKey()
    });

    if (data?.orderId) clearReferralCode();

    return {
        orderId:     data.orderId,
        orderNumber: data.orderNumber,
        totalAgorot: data.totalAgorot ?? totalAgorot,
        status:      data.status
    };
}
