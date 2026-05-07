// Structured logger for Supabase Edge Functions.
//
// Goals:
//   1. Emit JSON-line records that Supabase log views and any downstream
//      shipper (Logflare, Datadog, Sentry-via-relay) can index without
//      regex-parsing free-form text.
//   2. Carry a per-request correlation id so a single order, admin write,
//      or webhook can be traced end-to-end across multiple log lines.
//   3. Strip predictable PII (phone, email, long digit runs) before the
//      record is written, regardless of what the caller passed in. We
//      never want a customer phone in a server log.
//   4. Stay zero-dependency and ~50 lines so it can drop into every
//      function without import-graph drama.
//
// Usage:
//   import { createLogger, requestId } from '../_shared/logger.ts';
//   const log = createLogger({ fn: 'place-order', reqId: requestId(req) });
//   log.info('order_received', { branchId, fulfillment });
//   log.error('order_create_failed', { code: err.code });
//
// The convention is event_snake_case for the first argument. Treat it
// like a metric name — stable, low-cardinality, greppable. Put the
// variable parts in the `data` object so they don't pollute the event.

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<Level, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

function envLevel(): number {
    const v = (Deno.env.get('LOG_LEVEL') ?? 'info').toLowerCase() as Level;
    return LEVEL_RANK[v] ?? LEVEL_RANK.info;
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const IL_PHONE_RE = /(?:\+?972[-\s]?|0)5\d[-\s]?\d{3}[-\s]?\d{4}/g;
const LONG_DIGIT_RE = /\b\d{9,}\b/g;

const SENSITIVE_KEYS = new Set([
    'phone', 'phoneE164', 'phone_e164',
    'email',
    'authorization', 'apikey', 'api_key', 'token', 'access_token',
    'password', 'secret',
    'card', 'card_number', 'cvv', 'pan',
]);

function scrubString(value: string): string {
    return value
        .replace(EMAIL_RE, '[email]')
        .replace(IL_PHONE_RE, '[phone]')
        .replace(LONG_DIGIT_RE, '[digits]');
}

function scrub(value: unknown, depth = 0): unknown {
    if (value == null || depth > 4) return value;
    if (typeof value === 'string') return scrubString(value);
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(k.toLowerCase())) {
            out[k] = '[redacted]';
        } else {
            out[k] = scrub(v, depth + 1);
        }
    }
    return out;
}

// Pull (or fabricate) the correlation id for a request. We honor any
// upstream `x-request-id` so traces survive proxy hops; otherwise we mint
// a fresh UUID. The result is short enough to grep but unique enough to
// never collide across concurrent invocations.
export function requestId(req: Request): string {
    const upstream = req.headers.get('x-request-id');
    if (upstream && upstream.length <= 64) return upstream;
    return crypto.randomUUID();
}

interface LoggerContext {
    fn: string;            // function name, e.g. 'place-order'
    reqId: string;         // correlation id (see requestId())
    [key: string]: unknown; // optional fixed dimensions: branch, actor, etc.
}

function emit(level: Level, ctx: LoggerContext, event: string, data?: Record<string, unknown>) {
    if (LEVEL_RANK[level] < envLevel()) return;
    const record = {
        ts: new Date().toISOString(),
        level,
        event,
        ...ctx,
        ...(data ? { data: scrub(data) as Record<string, unknown> } : {}),
    };
    // Edge Functions stream stdout to Supabase logs. JSON on a single line
    // keeps the log viewer's filters useful.
    const line = JSON.stringify(record);
    if (level === 'error' || level === 'warn') {
        console.error(line);
    } else {
        console.log(line);
    }
}

export interface Logger {
    debug(event: string, data?: Record<string, unknown>): void;
    info(event: string, data?: Record<string, unknown>): void;
    warn(event: string, data?: Record<string, unknown>): void;
    error(event: string, data?: Record<string, unknown>): void;
    child(extra: Record<string, unknown>): Logger;
    reqId: string;
}

export function createLogger(ctx: LoggerContext): Logger {
    return {
        debug: (e, d) => emit('debug', ctx, e, d),
        info:  (e, d) => emit('info',  ctx, e, d),
        warn:  (e, d) => emit('warn',  ctx, e, d),
        error: (e, d) => emit('error', ctx, e, d),
        // child() lets a single request build up dimensions as it learns
        // them — e.g. start with { fn, reqId }, attach { customerId } once
        // resolved, then { orderId } once inserted. Each line is then
        // grouped by Supabase logs without manual stitching.
        child: (extra) => createLogger({ ...ctx, ...extra }),
        reqId: ctx.reqId,
    };
}
