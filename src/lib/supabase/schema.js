// =====================================================================
// Shared validation schemas (Zod) — used on the client for instant feedback
// and re-used by the place-order Edge Function for the authoritative check.
// Keeping the source single avoids drift.
// =====================================================================

import { z } from 'zod';

// Israeli phone pattern: accepts 050-1234567, +972501234567, 0501234567.
const IL_PHONE_RE = /^(\+?972|0)([23489]|5\d|7[2-9])[-.\s]?\d{7}$/;

export const PhoneSchema = z.string().regex(IL_PHONE_RE, 'מספר טלפון לא תקין');
export const NameSchema  = z.string().min(2, 'שם קצר מדי').max(120, 'שם ארוך מדי');
export const EmailSchema = z.string().email('כתובת מייל לא תקינה').optional().or(z.literal(''));

// An item references exactly one of productId (uuid) | legacyId (int from
// productsData.js) | bundleId (uuid). The legacyId path lets the existing
// localStorage cart submit before the catalog has been migrated.
export const OrderItemSchema = z.object({
    productId: z.string().uuid().optional(),
    legacyId:  z.number().int().positive().optional(),
    bundleId:  z.string().uuid().optional(),
    quantity:  z.number().int().positive().max(99)
}).refine(
    (x) => [x.productId, x.legacyId, x.bundleId].filter(Boolean).length === 1,
    { message: 'כל פריט חייב מזהה אחד בלבד' }
);

// Date in ISO yyyy-mm-dd (matches <input type="date"> value).
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין');
// Time in 24h HH:mm (matches the slot select values).
const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'שעה לא תקינה');

export const PlaceOrderSchema = z.object({
    contact: z.object({
        name:  NameSchema,
        phone: PhoneSchema,
        email: EmailSchema
    }),
    branchId:        z.string().uuid(),
    fulfillment:     z.enum(['pickup', 'delivery']).default('pickup'),
    pickupDate:      DateSchema.optional(),
    pickupTime:      TimeSchema.optional(),
    pickupTimeText:  z.string().max(120).optional(),
    deliveryAddress: z.string().max(240).optional(),
    items:           z.array(OrderItemSchema).min(1, 'הסל ריק').max(50),
    promoCode:       z.string().max(40).optional(),
    notes:           z.string().max(500).optional(),
    referredByCode:  z.string().max(12).optional(),
    channel:         z.enum(['web', 'whatsapp']).default('web')
});

/** Translate a Zod error into a flat field → first-message map (Hebrew). */
export function flattenZodErrors(err) {
    const out = {};
    if (!err?.issues) return out;
    for (const issue of err.issues) {
        const path = issue.path.join('.');
        if (!out[path]) out[path] = issue.message;
    }
    return out;
}
