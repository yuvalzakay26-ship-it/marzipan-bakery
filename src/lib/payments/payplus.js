// PayPlus adapter (skeleton).

import { invokeFunction } from '../supabase/client.js';

export const payplusAdapter = {
    name: 'payplus',

    async createCheckoutSession(input) {
        const data = await invokeFunction('create-payment-session', {
            provider: 'payplus',
            ...input
        });
        return { redirectUrl: data.redirectUrl, sessionId: data.sessionId };
    }
};
