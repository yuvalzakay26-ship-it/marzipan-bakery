// =====================================================================
// Tranzila adapter — alternative IL PSP.
//
// Hosted-page (iFramePay / "TranzilaHostedFields") flow. We pass the order
// metadata as form params; success/failure are routed to our URLs and the
// notify_url posts the result with an HMAC we verify.
//
// Required server secrets:
//   TRANZILA_TERMINAL          terminal name (supplier short name)
//   TRANZILA_HMAC_SECRET       shared secret for notify_url signature
//   TRANZILA_BASE_URL          default https://direct.tranzila.com
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

const DEFAULT_BASE = 'https://direct.tranzila.com';

function cfg() {
    const terminal = Deno.env.get('TRANZILA_TERMINAL');
    const secret   = Deno.env.get('TRANZILA_HMAC_SECRET');
    const base     = Deno.env.get('TRANZILA_BASE_URL') || DEFAULT_BASE;
    if (!terminal || !secret) throw new Error('tranzila_misconfigured');
    return { terminal, secret, base };
}

async function createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const { terminal, base } = cfg();
    const amountIls = (input.amountAgorot / 100).toFixed(2);

    const params = new URLSearchParams({
        supplier:    terminal,
        sum:         amountIls,
        currency:    '1',                       // ILS
        cred_type:   '1',                       // standard credit charge
        lang:        'il',
        u71:         '1',                       // 3DS-required
        TranzilaPW:  Deno.env.get('TRANZILA_PASSWORD') ?? '',
        // Identifiers + redirects
        order_no:    input.orderNumber,
        nologo:      '1',
        contact:     input.customer.name,
        myid:        input.orderId,             // echoed in notify
        email:       input.customer.email ?? '',
        phone:       input.customer.phone,
        success_url_address: input.successUrl,
        fail_url_address:    input.failureUrl,
        notify_url_address:  input.webhookUrl
    });

    return {
        redirectUrl: `${base}/cgi-bin/tranzila71.cgi?${params.toString()}`,
        sessionId:   input.orderId,             // we don't get one until callback
        providerRef: undefined
    };
}

async function verifyWebhook(req: Request, rawBody: string) {
    const { secret } = cfg();

    const sigHeader =
        req.headers.get('x-tranzila-signature') ||
        req.headers.get('x-signature') ||
        '';

    if (!sigHeader) return { ok: false as const, reason: 'missing_signature' };

    const expected = await hmacSha256Hex(secret, rawBody);
    if (!timingSafeEqual(sigHeader.trim().toLowerCase(), expected.toLowerCase())) {
        return { ok: false as const, reason: 'bad_signature' };
    }

    const body = parseQuery(rawBody);
    const orderId   = body.myid || body.MYID;
    const dealId    = body.ConfirmationCode || body.confirmation_code || body.index || body.TransactionId;
    if (!orderId || !dealId) {
        return { ok: false as const, reason: 'missing_fields' };
    }

    // Tranzila's `Response` code: 000 = approved.
    const code = (body.Response || body.response || '').padStart(3, '0');
    const kind: NormalizedEventKind = code === '000' ? 'captured' : 'failed';
    const amountAgorot = Math.round(parseFloat(body.sum || '0') * 100);

    const event: NormalizedEvent = {
        orderId,
        providerEventId: String(dealId),
        kind,
        amountAgorot,
        note: kind === 'failed' ? `tranzila_${code}` : undefined,
        raw: body
    };
    return { ok: true as const, event };
}

function parseQuery(text: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of text.split('&')) {
        if (!part) continue;
        const [k, v = ''] = part.split('=');
        try { out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); }
        catch { out[k] = v; }
    }
    return out;
}

export const tranzilaAdapter: PaymentAdapter = {
    name: 'tranzila',
    createCheckoutSession,
    verifyWebhook
};
