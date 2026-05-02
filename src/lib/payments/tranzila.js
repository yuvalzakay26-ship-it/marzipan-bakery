// Tranzila adapter (skeleton). Same shape as cardcom; server picks the
// provider from the request body.

import { invokeFunction } from '../supabase/client.js';

export const tranzilaAdapter = {
    name: 'tranzila',

    async createCheckoutSession(input) {
        const data = await invokeFunction('create-payment-session', {
            provider: 'tranzila',
            ...input
        });
        return { redirectUrl: data.redirectUrl, sessionId: data.sessionId };
    }
};
