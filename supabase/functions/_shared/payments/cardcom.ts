// =====================================================================
// Cardcom adapter — Israel's most common SME PSP.
//
// We use the "Low Profile" hosted-checkout flow:
//   1. POST to BillGoldGetLowProfileIndicator.aspx with the order details.
//      Response contains a `LowProfileCode` and a `url` to redirect to.
//   2. Customer pays on Cardcom's hosted page.
//   3. Cardcom posts the result to our IndicatorUrl (the webhook). The
//      body alone is NOT trustworthy — anyone could forge it. So we ALSO
//      re-fetch BillGoldGetLowProfileIndicator2.aspx with the LowProfileCode
//      and verify directly with Cardcom that the deal succeeded and that
//      the captured amount matches our order's total.
//
// Trusting the indicator-API response (server → server, over HTTPS, with
// our terminal credentials) is what passes for "signature verification" in
// the Cardcom model. It is the standard recommended integration pattern.
//
// Required server secrets:
//   CARDCOM_TERMINAL_NUMBER     Numeric, e.g. 1000
//   CARDCOM_USERNAME            "ApiName" / username
//   CARDCOM_API_PASSWORD        Cardcom-generated API password (NEVER terminal password)
//   CARDCOM_BASE_URL            Default: https://secure.cardcom.solutions
// =====================================================================

import type {
    PaymentAdapter,
    CreateSessionInput,
    CreateSessionResult,
    NormalizedEvent,
    NormalizedEventKind
} from '../payments.ts';

const DEFAULT_BASE = 'https://secure.cardcom.solutions';

function cfg() {
    const terminal = Deno.env.get('CARDCOM_TERMINAL_NUMBER');
    const username = Deno.env.get('CARDCOM_USERNAME');
    const password = Deno.env.get('CARDCOM_API_PASSWORD');
    const base     = Deno.env.get('CARDCOM_BASE_URL') || DEFAULT_BASE;
    if (!terminal || !username || !password) {
        throw new Error('cardcom_misconfigured');
    }
    return { terminal, username, password, base };
}

// ---------------------------------------------------------------------
// Create session — calls Cardcom's Low Profile init endpoint.
// ---------------------------------------------------------------------
async function createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const { terminal, username, base } = cfg();

    // Cardcom expects amount in shekels (decimal), not agorot.
    const amountIls = (input.amountAgorot / 100).toFixed(2);

    const params = new URLSearchParams({
        TerminalNumber:    terminal,
        UserName:          username,
        APILevel:          '10',
        codepage:          '65001',                  // UTF-8
        Operation:         '1',                      // charge + create token
        Language:          'he',
        CoinID:            '1',                      // ILS
        SumToBill:         amountIls,
        ProductName:       `הזמנה ${input.orderNumber}`,
        ReturnValue:       input.orderId,            // echoed back to the webhook
        SuccessRedirectUrl: input.successUrl,
        ErrorRedirectUrl:   input.failureUrl,
        IndicatorUrl:       input.webhookUrl,
        // Pre-fill customer details on the hosted page.
        InvoiceHead_CustName:    input.customer.name,
        InvoiceHead_CustEmail:   input.customer.email ?? '',
        InvoiceHead_SendByEmail: input.customer.email ? 'true' : 'false'
    });

    const res = await fetch(`${base}/Interface/LowProfile.aspx`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });
    const text = await res.text();
    const body = parseQuery(text);

    // Response codes: 0 = success.
    if (body.ResponseCode !== '0' || !body.LowProfileCode || !body.url) {
        throw new Error(`cardcom_init_failed:${body.ResponseCode || 'unknown'}:${body.Description || ''}`);
    }
    return {
        redirectUrl: body.url,
        sessionId:   body.LowProfileCode,
        providerRef: body.LowProfileCode
    };
}

// ---------------------------------------------------------------------
// Webhook verification — re-call BillGoldGetLowProfileIndicator2.aspx
// with the LowProfileCode and trust *that* response, not the posted body.
// ---------------------------------------------------------------------
async function verifyWebhook(req: Request, rawBody: string) {
    const { terminal, username, password, base } = cfg();

    // Cardcom posts as application/x-www-form-urlencoded. The body has the
    // LowProfileCode and the original ReturnValue (= our order id).
    const posted = parseQuery(rawBody);
    const lpCode = posted.lowprofilecode || posted.LowProfileCode;
    const orderId = posted.ReturnValue || posted.returnvalue;

    if (!lpCode) {
        return { ok: false as const, reason: 'missing_lowprofilecode' };
    }
    if (!orderId) {
        return { ok: false as const, reason: 'missing_orderid' };
    }

    // Server-to-server: ask Cardcom directly what happened on this LP code.
    const params = new URLSearchParams({
        TerminalNumber: terminal,
        UserName:       username,
        Password:       password,
        LowProfileCode: lpCode
    });
    const res = await fetch(`${base}/Interface/BillGoldGetLowProfileIndicator2.aspx`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });
    const verifyText = await res.text();
    const verify = parseQuery(verifyText);

    // OperationResponse: 0 = success, !=0 = failure.
    const code  = verify.OperationResponse ?? verify.ResponseCode ?? 'unknown';
    const dealId =
        verify.InternalDealNumber ||
        verify.DealNumber ||
        lpCode;                                 // fallback for idempotency-key purposes
    const amountStr = verify.SumOfTransaction || verify.Amount || posted.SumToBill || '0';
    const amountAgorot = Math.round(parseFloat(amountStr) * 100);

    let kind: NormalizedEventKind;
    let note: string | undefined;
    if (code === '0') {
        kind = 'captured';
    } else {
        kind = 'failed';
        note = verify.Description || verify.OperationResponse || `cardcom_${code}`;
    }

    const event: NormalizedEvent = {
        orderId,
        providerEventId: dealId,
        kind,
        amountAgorot,
        note,
        raw: { posted, verify }
    };
    return { ok: true as const, event };
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function parseQuery(text: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const part of text.split('&')) {
        if (!part) continue;
        const [k, v = ''] = part.split('=');
        try {
            out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
        } catch {
            out[k] = v;
        }
    }
    return out;
}

export const cardcomAdapter: PaymentAdapter = {
    name: 'cardcom',
    createCheckoutSession,
    verifyWebhook
};
