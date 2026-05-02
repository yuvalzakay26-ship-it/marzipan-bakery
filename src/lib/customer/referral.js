// =====================================================================
// Referral capture — runs on the landing page when a /?ref=ABCDEF param is
// present (or /r/ABCDEF deep link). Stores the code in localStorage with
// a 30-day TTL so a friend's invite still applies after the user browses.
//
// At place-order time the client resolves the code → referrer customer id
// and submits it as `referredByCode`. The server validates, then stores
// `customers.referred_by` on the new customer row.
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

const REF_KEY = 'marzipan-ref-code';
const REF_AT_KEY = 'marzipan-ref-at';
const TTL_DAYS = 30;

const CODE_RE = /^[A-Z0-9]{4,12}$/;

/** Read the code from URL (?ref= or /r/<code>) and persist it. Returns the code or null. */
export function captureReferralFromUrl() {
    if (typeof window === 'undefined') return null;
    try {
        const sp = new URLSearchParams(window.location.search);
        let code = (sp.get('ref') || '').toUpperCase();
        if (!code) {
            const m = window.location.pathname.match(/^\/r\/([A-Z0-9]+)\b/i);
            if (m) code = m[1].toUpperCase();
        }
        if (!code || !CODE_RE.test(code)) return null;
        localStorage.setItem(REF_KEY, code);
        localStorage.setItem(REF_AT_KEY, String(Date.now()));
        return code;
    } catch {
        return null;
    }
}

/** Returns the active (non-expired) referral code, or null. */
export function getReferralCode() {
    try {
        const at = Number(localStorage.getItem(REF_AT_KEY) || 0);
        if (!at || Date.now() - at > TTL_DAYS * 86_400_000) {
            localStorage.removeItem(REF_KEY);
            localStorage.removeItem(REF_AT_KEY);
            return null;
        }
        const code = localStorage.getItem(REF_KEY);
        return code && CODE_RE.test(code) ? code : null;
    } catch {
        return null;
    }
}

/** Clear after a successful order so the same code doesn't pay out twice. */
export function clearReferralCode() {
    try {
        localStorage.removeItem(REF_KEY);
        localStorage.removeItem(REF_AT_KEY);
    } catch { /* ignore */ }
}

/** Build a shareable URL for a customer's own referral code. */
export function buildShareUrl(code) {
    return `https://marzipanbakery.com/?ref=${encodeURIComponent(code)}`;
}

/** Read the current customer's own code (RLS lets them read their own row only). */
export async function getMyReferralCode() {
    if (!isBackendEnabled()) return null;
    const sb = getSupabase();
    const { data: session } = await sb.auth.getSession();
    if (!session?.session) return null;
    const { data } = await sb
        .from('customers')
        .select('referral_code')
        .maybeSingle();
    return data?.referral_code ?? null;
}
