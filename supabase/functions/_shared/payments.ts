// =====================================================================
// Server-side payment provider abstraction.
//
// Every provider implements the same shape:
//
//   createCheckoutSession(input) → { redirectUrl, sessionId, providerRef }
//   verifyWebhook(req, raw)      → { ok, event } | { ok: false, reason }
//
// The "event" structure is normalized so the webhook handler is provider-
// agnostic. Each adapter does its own:
//   - signature verification
//   - server-to-server reconciliation when the provider supports it
//     (Cardcom strongly recommends this — never trust the body alone)
//   - amount + orderId extraction
//
// Picked provider is read from PAYMENT_PROVIDER (server secret), with a
// safe default of 'cardcom'. The client-side VITE_PAYMENT_PROVIDER is
// only a hint; the server has final say.
// =====================================================================

export type ProviderName = 'cardcom' | 'tranzila' | 'payplus';

export type NormalizedEventKind =
    | 'authorized'
    | 'captured'
    | 'failed'
    | 'refunded'
    | 'pending';

export interface NormalizedEvent {
    orderId: string;             // our orders.id (uuid) — providers echo this back
    providerEventId: string;     // PSP's deal-id; unique-per-provider
    kind: NormalizedEventKind;
    amountAgorot: number | null; // null if provider doesn't include it
    note?: string;               // human-readable reason (esp. for 'failed')
    raw: unknown;                // full payload — stored for forensics
}

export interface CreateSessionInput {
    orderId: string;
    orderNumber: string;
    amountAgorot: number;
    customer: { name: string; phone: string; email?: string };
    successUrl: string;
    failureUrl: string;
    webhookUrl: string;
}

export interface CreateSessionResult {
    redirectUrl: string;
    sessionId: string;
    providerRef?: string;
}

export interface PaymentAdapter {
    name: ProviderName;
    createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult>;
    verifyWebhook(req: Request, rawBody: string): Promise<
        | { ok: true; event: NormalizedEvent }
        | { ok: false; reason: string }
    >;
}

// ---------------------------------------------------------------------
// Constant-time string compare. Used for HMAC signature checks.
// ---------------------------------------------------------------------
export function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function hmacSha256Hex(secret: string, body: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function pickProviderName(): ProviderName {
    const v = (Deno.env.get('PAYMENT_PROVIDER') || 'cardcom').toLowerCase();
    if (v === 'cardcom' || v === 'tranzila' || v === 'payplus') return v;
    throw new Error(`unsupported_provider:${v}`);
}

// ---------------------------------------------------------------------
// Provider router. Importers call getAdapter(name) — never construct.
// ---------------------------------------------------------------------
import { cardcomAdapter } from './payments/cardcom.ts';
import { tranzilaAdapter } from './payments/tranzila.ts';
import { payplusAdapter }  from './payments/payplus.ts';

const ADAPTERS: Record<ProviderName, PaymentAdapter> = {
    cardcom:  cardcomAdapter,
    tranzila: tranzilaAdapter,
    payplus:  payplusAdapter
};

export function getAdapter(name?: ProviderName): PaymentAdapter {
    return ADAPTERS[name ?? pickProviderName()];
}
