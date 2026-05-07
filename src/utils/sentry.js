// Sentry frontend bootstrap.
//
// Production-only by design: dev/preview should never spam the project
// inbox, and the DSN is only injected in builds where VITE_SENTRY_DSN is
// defined (Vercel production env). Anything else short-circuits to a
// no-op so tests, local dev, and previews stay clean.
//
// Capture surface:
//   - unhandled exceptions + rejected promises (default Sentry behavior)
//   - React render crashes (via ErrorBoundary -> reportError below)
//   - lazy-route failures (chunk errors are filtered out — they are an
//     expected post-deploy condition handled by chunkReloader.js)
//   - navigation transitions via the BrowserTracing integration
//
// Privacy posture:
//   - sendDefaultPii = false (no IP/cookies/headers attached server-side)
//   - beforeSend strips email/phone-like substrings from messages
//   - no Replay integration → no DOM/screenshots/inputs leave the browser

import * as Sentry from '@sentry/react';
import { isChunkLoadError } from './chunkReloader';

let initialized = false;

const DSN = import.meta.env.VITE_SENTRY_DSN;
const RELEASE = import.meta.env.VITE_APP_VERSION;
const ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;

// Patterns we never want to ship to Sentry. These are either expected
// runtime conditions (chunk recovery) or third-party noise (browser
// extensions, anti-virus injectors, network blips outside our control).
const IGNORED_MESSAGES = [
    /Failed to fetch dynamically imported module/i,
    /Loading chunk [\w-]+ failed/i,
    /Importing a module script failed/i,
    /Unable to preload CSS/i,
    /ResizeObserver loop limit exceeded/i,
    /ResizeObserver loop completed with undelivered notifications/i,
    /Non-Error promise rejection captured with value/i,
    // Browser-extension noise — common on mobile.
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
];

// Conservative PII scrubbers. We do not ship customer phone numbers or
// emails through error telemetry under any circumstances — the customer
// hasn't opted in for that, and Sentry events cross a third-party boundary.
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const IL_PHONE_RE = /(?:\+?972[-\s]?|0)5\d[-\s]?\d{3}[-\s]?\d{4}/g;
const LONG_DIGIT_RE = /\b\d{9,}\b/g;

function scrubString(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(EMAIL_RE, '[email]')
        .replace(IL_PHONE_RE, '[phone]')
        .replace(LONG_DIGIT_RE, '[digits]');
}

function scrubObject(obj, depth = 0) {
    if (!obj || depth > 4) return obj;
    if (typeof obj === 'string') return scrubString(obj);
    if (Array.isArray(obj)) return obj.map((v) => scrubObject(v, depth + 1));
    if (typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
        out[k] = scrubObject(v, depth + 1);
    }
    return out;
}

export function initSentry() {
    if (initialized) return;
    if (typeof window === 'undefined') return;

    // Production-only. Without a DSN the SDK is a no-op anyway, but we
    // also gate on PROD so a leaked DSN in a preview env wouldn't start
    // sending events from someone's localhost.
    if (!import.meta.env.PROD || !DSN) return;

    Sentry.init({
        dsn: DSN,
        environment: ENVIRONMENT,
        release: RELEASE,
        sendDefaultPii: false,
        // Lightweight tracing only. 10% of route transitions is enough to
        // surface regressions without paying for full coverage on a high-
        // traffic marketing site.
        tracesSampleRate: 0.1,
        integrations: [
            Sentry.browserTracingIntegration(),
        ],
        // Drop chunk-recovery noise + extension noise *before* it leaves
        // the browser, so we don't pay quota for events we'd ignore.
        ignoreErrors: IGNORED_MESSAGES,
        denyUrls: [
            /chrome-extension:\/\//i,
            /moz-extension:\/\//i,
            /^safari-extension:\/\//i,
        ],
        beforeSend(event, hint) {
            // Drop chunk-load errors entirely — chunkReloader handles the
            // self-heal, and ErrorBoundary already short-circuits on those.
            const original = hint?.originalException;
            if (isChunkLoadError(original)) return null;

            // Scrub PII from message + exception values + breadcrumb data.
            if (event.message) event.message = scrubString(event.message);
            if (event.exception?.values) {
                for (const val of event.exception.values) {
                    if (val.value) val.value = scrubString(val.value);
                }
            }
            if (Array.isArray(event.breadcrumbs)) {
                event.breadcrumbs = event.breadcrumbs.map((b) => ({
                    ...b,
                    message: scrubString(b.message),
                    data: scrubObject(b.data),
                }));
            }
            // Strip query strings — promo codes, ref codes, idempotency
            // keys, and the like routinely show up there.
            if (event.request?.url) {
                event.request.url = event.request.url.split('?')[0];
            }
            // We never need the User-Agent at the event level (Sentry
            // already infers OS/browser); drop the rest of the headers.
            if (event.request) delete event.request.headers;
            if (event.user) {
                delete event.user.email;
                delete event.user.ip_address;
            }
            return event;
        },
        beforeBreadcrumb(breadcrumb) {
            // Drop console.log breadcrumbs — they tend to carry developer
            // strings that aren't useful in prod and may include data we
            // didn't expect.
            if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
                return null;
            }
            // Strip query strings on navigation/fetch breadcrumbs too.
            if (breadcrumb.data?.url) {
                breadcrumb.data.url = String(breadcrumb.data.url).split('?')[0];
            }
            if (breadcrumb.data?.to) {
                breadcrumb.data.to = String(breadcrumb.data.to).split('?')[0];
            }
            return breadcrumb;
        },
    });

    initialized = true;
}

// Called by ErrorBoundary. Centralized so we can:
//   1. Ignore chunk-recovery flows (chunkReloader handles those).
//   2. Tag the event with React component-stack context.
//   3. No-op in dev so the boundary's developer pre/console paths aren't
//      duplicated by a Sentry round-trip.
export function reportRenderError(error, errorInfo) {
    if (!initialized) return;
    if (isChunkLoadError(error)) return;
    Sentry.withScope((scope) => {
        scope.setTag('source', 'react.error_boundary');
        if (errorInfo?.componentStack) {
            scope.setContext('react', { componentStack: errorInfo.componentStack });
        }
        Sentry.captureException(error);
    });
}

// Re-export the React ErrorBoundary primitive for callers who want the
// pre-wired Sentry boundary (we don't use it — ErrorBoundary.jsx already
// owns the chunk-recovery UX — but it's handy for one-off subtree wraps).
export const SentryErrorBoundary = Sentry.ErrorBoundary;
