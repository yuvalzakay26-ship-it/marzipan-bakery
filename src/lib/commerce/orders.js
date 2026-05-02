// =====================================================================
// Orders service — single entry point that the UI calls when the user
// hits "place order".
//
// Behavior:
//   1. If backend is enabled (VITE_SUPABASE_URL is set) → submit to
//      the place-order Edge Function. Returns { orderNumber, orderId, ... }.
//   2. Otherwise → build a WhatsApp message (legacy behavior). Returns
//      { whatsappUrl, whatsappOpened: true }.
//
// The CheckoutModal does not need to care which path ran.
// =====================================================================

import { invokeFunction, isBackendEnabled } from '../supabase/client.js';
import { PlaceOrderSchema, flattenZodErrors } from '../supabase/schema.js';
import { formatAgorot, cartSubtotalAgorot } from './pricing.js';
import { getReferralCode, clearReferralCode } from '../customer/referral.js';

const WA_NUMBER = '972533339341';

/** Stable client-generated key — submitting twice in 5 seconds is the same order. */
function makeIdempotencyKey() {
    const rnd = Math.random().toString(36).slice(2, 10);
    return `web-${Date.now()}-${rnd}`;
}

/** Build the Hebrew WhatsApp fallback message. */
function buildWhatsAppMessage({ contact, items, branchName, pickupTimeText, totalAgorot }) {
    const header = `*היי, הזמנה חדשה מאתר מרציפן* 👋\n\n`;
    const userBlock =
        `👤 *פרטי לקוח:*\n` +
        `שם: ${contact.name}\n` +
        `טלפון: ${contact.phone}\n` +
        `סניף איסוף: ${branchName}\n` +
        `זמן איסוף: ${pickupTimeText || 'בהקדם האפשרי'}\n\n`;
    const itemsBlock = `🛒 *פירוט הזמנה:*\n` + items.map((i) =>
        `▫️ *${i.name}*\n   כמות: ${i.quantity} | מחיר: ${formatAgorot((i.priceAgorot ?? Math.round((i.priceValue ?? 0) * 100)) * i.quantity)}`
    ).join('\n\n');
    const total  = `\n\n💰 *סה"כ לתשלום: ${formatAgorot(totalAgorot)}*`;
    const footer = `\n\nאשמח לתיאום תשלום ואישור הזמנה. תודה!`;
    return header + userBlock + itemsBlock + total + footer;
}

/**
 * Look like a v4 UUID? — used to decide whether a string is a Supabase id
 * or a slug like "mahane_yehuda" (in which case we drop into WhatsApp).
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Place an order.
 *
 * @param {object} input
 * @param {{name:string, phone:string, email?:string}} input.contact
 * @param {string} input.branchId               UUID of branch (backend) or slug (WA)
 * @param {string} input.branchName             display name (used by WA fallback)
 * @param {Array<{id:any, productId?:string, name:string, quantity:number, priceValue?:number, priceAgorot?:number}>} input.items
 * @param {string} [input.pickupDate]           ISO yyyy-mm-dd
 * @param {string} [input.pickupTime]           24h HH:mm
 * @param {string} [input.pickupTimeText]       free-form fallback text
 * @param {string} [input.deliveryAddress]
 * @param {'pickup'|'delivery'} [input.fulfillment]
 * @param {string} [input.notes]
 * @param {string} [input.idempotencyKey]       stable per-form-mount; prevents double-submit
 * @returns {Promise<
 *   | { mode:'backend', orderId:string, orderNumber:string, totalAgorot:number, status:string }
 *   | { mode:'whatsapp', whatsappUrl:string, totalAgorot:number }
 * >}
 */
export async function placeOrder(input) {
    const totalAgorot = cartSubtotalAgorot(input.items);
    const branchIsUuid = typeof input.branchId === 'string' && UUID_RE.test(input.branchId);

    // -------- WhatsApp fallback path --------
    // Fires when the backend isn't configured OR when the chosen branch is
    // still using the legacy slug id (no DB row yet).
    if (!isBackendEnabled() || !branchIsUuid) {
        const pickupTimeText =
            (input.pickupDate && input.pickupTime)
                ? `${input.pickupDate} · ${input.pickupTime}`
                : input.pickupTimeText;
        const text = buildWhatsAppMessage({
            contact: input.contact,
            items: input.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                priceAgorot: i.priceAgorot,
                priceValue: i.priceValue
            })),
            branchName: input.branchName,
            pickupTimeText,
            totalAgorot
        });
        const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        return { mode: 'whatsapp', whatsappUrl, totalAgorot };
    }

    // -------- Real backend path --------
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
                productId: i.productId,                                 // uuid (Supabase catalog)
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

    // Successful order — clear the referral code so the next browse session
    // can pick up a different code without paying out twice.
    if (data?.orderId) clearReferralCode();

    return {
        mode:        'backend',
        orderId:     data.orderId,
        orderNumber: data.orderNumber,
        totalAgorot: data.totalAgorot,
        status:      data.status
    };
}
