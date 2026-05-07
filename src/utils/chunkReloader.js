// Self-heals stale clients after a deploy. Three protections layered:
// 1) Top-level error/unhandledrejection listeners catch chunk-load failures
//    from non-React code paths (analytics, eager dynamic imports).
// 2) ErrorBoundary calls reloadForChunkError() for React.lazy() failures
//    (React swallows those rejections, so the listeners above miss them).
// 3) On BFCache restore (iOS Safari pageshow persisted=true), HEAD-probe the
//    bundle this tab booted with — if Vercel 404s it, the deploy moved on
//    while the tab was suspended, so we reload before the user navigates.

const RELOAD_KEY = 'mb:chunk-reload-at';
const RELOAD_COUNT_KEY = 'mb:chunk-reload-count';
const RELOAD_TTL_MS = 10_000;
const MAX_RELOADS_PER_SESSION = 2;

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Loading chunk [\w-]+ failed|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

function extractMessage(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (input.message) return String(input.message);
  if (input.reason) return extractMessage(input.reason);
  return '';
}

export function isChunkLoadError(input) {
  if (!input) return false;
  const target = input.target;
  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const url = target.src || target.href || '';
    if (url.includes('/assets/')) return true;
  }
  return CHUNK_ERROR_PATTERN.test(extractMessage(input));
}

export function reloadForChunkError() {
  if (typeof window === 'undefined') return;

  let last = 0;
  let count = 0;
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    count = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || 0);
  } catch {
    // sessionStorage unavailable (private mode, quota) — fall through and
    // attempt a single reload anyway. Worse to leave the user broken than
    // to risk one extra refresh.
  }

  // If we've already retried twice this session, the deploy is either still
  // mid-rollout or genuinely broken. Stop reloading so the ErrorBoundary
  // can render its manual-refresh UI instead of looping forever.
  if (count >= MAX_RELOADS_PER_SESSION) return;

  if (last && Date.now() - last < RELOAD_TTL_MS) return;

  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count + 1));
  } catch {
    /* ignore */
  }

  window.location.reload();
}

function captureBootBundleUrl() {
  try {
    const tag = document.querySelector('script[type="module"][src*="/assets/"]');
    return tag?.src || null;
  } catch {
    return null;
  }
}

function unregisterStaleServiceWorkers() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  // Defensive: nothing in this repo registers a service worker, but a
  // previous experiment or third-party script could have. A leftover SW
  // would intercept asset fetches and serve stale chunks indefinitely.
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister().catch(() => {})))
    .catch(() => { /* ignore */ });
}

export function installChunkReloader() {
  if (typeof window === 'undefined') return;

  unregisterStaleServiceWorkers();

  const bootBundleUrl = captureBootBundleUrl();

  window.addEventListener(
    'error',
    (event) => {
      if (isChunkLoadError(event)) reloadForChunkError();
    },
    true,
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event)) reloadForChunkError();
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !bootBundleUrl) return;
    fetch(bootBundleUrl, { method: 'HEAD', cache: 'no-store' })
      .then((r) => { if (r.status === 404) reloadForChunkError(); })
      .catch(() => { /* network blip — real failures will surface on next nav */ });
  });
}
