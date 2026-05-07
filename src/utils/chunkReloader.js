// Self-heals stale clients after a deploy: when the active HTML references
// chunk hashes that no longer exist on the CDN, dynamic imports throw. We
// catch those, reload once, and rely on sessionStorage to break loops.

const RELOAD_KEY = 'mb:chunk-reload-at';
const RELOAD_TTL_MS = 10_000;

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Loading chunk [\w-]+ failed|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

function extractMessage(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (input.message) return String(input.message);
  if (input.reason) return extractMessage(input.reason);
  return '';
}

function looksLikeChunkError(event) {
  const target = event && event.target;
  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const url = target.src || target.href || '';
    if (url.includes('/assets/')) return true;
  }
  return CHUNK_ERROR_PATTERN.test(extractMessage(event));
}

function reloadOnce() {
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  } catch {
    // sessionStorage unavailable — fall through and reload anyway; one
    // attempt without throttling is still better than a broken page.
  }

  if (last && Date.now() - last < RELOAD_TTL_MS) return;

  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }

  window.location.reload();
}

export function installChunkReloader() {
  if (typeof window === 'undefined') return;

  window.addEventListener(
    'error',
    (event) => {
      if (looksLikeChunkError(event)) reloadOnce();
    },
    true,
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (looksLikeChunkError(event)) reloadOnce();
  });
}
