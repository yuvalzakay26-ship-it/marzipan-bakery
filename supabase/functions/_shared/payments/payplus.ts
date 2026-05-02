// =====================================================================
// PayPlus adapter — modern JSON-based IL PSP.
//
// Flow: POST to /api/v1.0/PaymentPages/generateLink to mint a hosted
// payment page, then redirect. PayPlus posts callbacks as JSON with an
// HMAC-SHA256 signature header (`X-PayPlus-Signature` or similar) — we
// verify in constant time before parsing.
//
// Required server secrets:
//   PAYPLUS_API_KEY
//   PAYPLUS_SECRET_KEY
//   PAYPLUS_HMAC_SECRET    webhook signing secret
//   PAYPLUS_BASE_URL       default https://restapi.payplus.co.il
// =====================================================================

import {
    type PaymentAdapter,
    type CreateSessionInput,
    type CreateSessionResult,
    type NormalizedEvent,
    type NormalizedEventKind,
    hmacSha256Hex,
    timingSafeEqual
} from '../payments.ts';

const DEFAULT_BASE = 'https://restapi.payplus.co.il';

function cfg() {
    const apiKey = Deno.env.get('PAYPLUS_API_KEY');
    const secret = Deno.env.get('PAYPLUS_SECRET_KEY');
    const hmac   = Deno.env.get('PAYPLUS_HMAC_SECRET');
    const base   = Deno.env.get('PAYPLUS_BASE_URL') || DEFAULT_BASE;
    if (!apiKey || !secret || !hmac) throw new Error('payplus_misconfigured');
    return { apiKey, secret, hmac, base };
}

async function createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const { apiKey, secret, base } = cfg();

    const payload = {
        amount:            input.amountAgorot / 100,
        currency_code:     'ILS',
        language_code:     'he',
        more_info:         input.orderId,                        // echoed back
        more_info_1:       input.orderNumber,
        sendEmailApproval: Boolean(input.customer.email),
        customer: {
            customer_name: input.customer.name,
            email:         input.customer.email ?? '',
            phone:         input.customer.phone
        },
        refURL_success: input.successUrl,
        refURL_failure: input.failureUrl,
        refURL_callback: input.webhookUrl,
        items: [
            { name: `הזמנה ${input.orderNumber}`, quantity: 1, price: input.amountAgorot / 100 }
        ]
    };

    const auth = btoa(`${apiKey}:${secret}`);
    const res = await fetch(`${base}/api/v1.0/PaymentPages/generateLink`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({} as Record<string, unknown>));
    const data = (json as any)?.data ?? {};
    const url  = data.payment_page_link;
    const uid  = data.page_request_uid;

    if (!url || !uid) {
        throw new Error(`payplus_init_failed:${(json as any)?.results?.status || 'unknown'}`);
    }
    return { redirectUrl: url, sessionId: uid, providerRef: uid };
}

async function verifyWebhook(req: Request, rawBody: string) {
    const { hmac } = cfg();
    const sig = req.headers.get('x-payplus-signature') || req.headers.get('x-signature') || '';
    if (!sig) return { ok: false as const, reason: 'missing_signature' };

    const expected = await hmacSha256Hex(hmac, rawBody);
    if (!timingSafeEqual(sig.trim().toLowerCase(), expected.toLowerCase())) {
        return { ok: false as const, reason: 'bad_signature' };
    }

    let json: any;
    try { json = JSON.parse(rawBody); }
    catch { return { ok: false as const, reason: 'invalid_json' }; }

    // PayPlus `transaction.status_code`: '000' = approved.
    const t        = json.transaction ?? json.data?.transaction ?? json;
    const orderId  = json.more_info ?? json.data?.more_info ?? t.more_info;
    const dealId   = t.transaction_uid || t.uid || t.payment_request_uid;
    const status   = t.status_code || t.status || '999';
    const amount   = Number(t.amount ?? json.amount ?? 0);

    if (!orderId || !dealId) return { ok: false as const, reason: 'missing_fields' };

    const kind: NormalizedEventKind =
        status === '000' || status === 'approved' ? 'captured' :
        status === 'pending'                      ? 'pending'  :
        'failed';

    const event: NormalizedEvent = {
        orderId,
        providerEventId: String(dealId),
        kind,
        amountAgorot: Math.round(amount * 100),
        note: kind === 'failed' ? `payplus_${status}` : undefined,
        raw: json
    };
    return { ok: true as const, event };
}

export const payplusAdapter: PaymentAdapter = {
    name: 'payplus',
    createCheckoutSession,
    verifyWebhook
};
