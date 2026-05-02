// =====================================================================
// Client-side helper: ask the server for a hosted-checkout URL and
// redirect the browser to it.
//
// The provider is decided server-side from the PAYMENT_PROVIDER secret;
// VITE_PAYMENT_PROVIDER is only a hint and is never load-bearing.
// =====================================================================

import { invokeFunction, isBackendEnabled } from '../supabase/client.js';

export async function startPaymentSession({ orderId }) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    if (!orderId) throw new Error('missing_order_id');

    const data = await invokeFunction('create-payment-session', {
        orderId,
        provider: import.meta.env.VITE_PAYMENT_PROVIDER || undefined
    });
    if (!data?.redirectUrl) throw new Error('no_redirect_url');
    return data;
}

/** True when payments are enabled (env explicitly opts in). */
export function isPaymentsEnabled() {
    return Boolean(
        isBackendEnabled() && (import.meta.env.VITE_PAYMENTS_ENABLED ?? '').toString() === 'true'
    );
}
