// =====================================================================
// Payment provider abstraction.
//
// Every IL PSP we'd plausibly use (Cardcom, Tranzila, PayPlus, Meshulam)
// shares the same shape from our app's POV:
//
//   1. createCheckoutSession({orderId, amountAgorot, ...})  → { redirectUrl }
//   2. The user is redirected to the PSP's hosted page.
//   3. PSP calls our payment-webhook Edge Function on success/failure.
//   4. Browser is redirected back to /checkout/confirmation?orderId=...
//
// We expose a tiny adapter interface here so the UI doesn't need to
// know which provider is wired up. Switching providers in the future
// means writing a new adapter and changing one config value.
// =====================================================================

import { cardcomAdapter } from './cardcom.js';
import { tranzilaAdapter } from './tranzila.js';
import { payplusAdapter } from './payplus.js';

const ADAPTERS = {
    cardcom:  cardcomAdapter,
    tranzila: tranzilaAdapter,
    payplus:  payplusAdapter
};

export function getPaymentProvider() {
    const name = import.meta.env.VITE_PAYMENT_PROVIDER || 'cardcom';
    const adapter = ADAPTERS[name];
    if (!adapter) throw new Error(`Unknown payment provider: ${name}`);
    return adapter;
}

/**
 * Common adapter shape. Each provider file exports one of these.
 *
 * @typedef {object} PaymentAdapter
 * @property {string} name
 * @property {(input: {
 *     orderId: string,
 *     orderNumber: string,
 *     amountAgorot: number,
 *     customer: { name: string, phone: string, email?: string },
 *     successUrl: string,
 *     failureUrl: string
 * }) => Promise<{ redirectUrl: string, sessionId?: string }>} createCheckoutSession
 */
