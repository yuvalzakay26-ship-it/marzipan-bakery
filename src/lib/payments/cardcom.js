// =====================================================================
// Cardcom adapter (skeleton).
//
// The actual checkout-session creation must happen on the server (the
// terminal credentials are secret). We call our own create-payment-session
// Edge Function, which talks to Cardcom's "low profile" API and returns
// the hosted URL.
//
// Cardcom docs: https://kb.cardcom.solutions/category/lowprofile/  (TODO link)
// =====================================================================

import { invokeFunction } from '../supabase/client.js';

export const cardcomAdapter = {
    name: 'cardcom',

    async createCheckoutSession(input) {
        const data = await invokeFunction('create-payment-session', {
            provider: 'cardcom',
            ...input
        });
        return { redirectUrl: data.redirectUrl, sessionId: data.sessionId };
    }
};
