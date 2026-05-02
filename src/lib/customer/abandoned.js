// =====================================================================
// Abandoned-checkout beacon. Fires when a returning customer (phone known
// from a prior order or the form) has populated a cart but hasn't submitted.
//
// Throttled to once every 30 minutes per browser to avoid hammering the
// edge function on every cart edit. Server is idempotent per phone-per-day
// regardless.
// =====================================================================

import { invokeFunction, isBackendEnabled } from '../supabase/client.js';

const SENT_AT_KEY = 'marzipan-abandoned-sent-at';
const THROTTLE_MIN = 30;

export async function trackAbandonedCheckout({ phone, name, items, totalAgorot, branchId }) {
    if (!isBackendEnabled()) return false;
    if (!phone || !items?.length) return false;

    try {
        const last = Number(localStorage.getItem(SENT_AT_KEY) || 0);
        if (Date.now() - last < THROTTLE_MIN * 60 * 1000) return false;
    } catch { /* private mode */ }

    try {
        await invokeFunction('track-abandoned-checkout', {
            phone, name,
            items: items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                priceAgorot: i.priceAgorot ?? Math.round((i.priceValue ?? 0) * 100)
            })),
            totalAgorot,
            branchId: branchId || undefined
        });
        try { localStorage.setItem(SENT_AT_KEY, String(Date.now())); }
        catch { /* ignore */ }
        return true;
    } catch (err) {
        // Beacon failure is non-fatal — never let it block the user.
        console.warn('abandoned_checkout_beacon_failed', err);
        return false;
    }
}
