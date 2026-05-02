// =====================================================================
// Customer session — phone-OTP login wrapper around Supabase Auth.
//
// Two layers of identity:
//   - Anonymous: a phone is remembered locally so the next visit can
//     pre-fill the checkout form. No auth.users row.
//   - Authenticated: phone-OTP creates a real auth.users row. The customer
//     row is upserted by place-order anyway, but with a real auth user we
//     can also show order history (RLS policies use auth_user_id).
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

const PHONE_KEY = 'marzipan-known-phone';
const NAME_KEY  = 'marzipan-known-name';
const EMAIL_KEY = 'marzipan-known-email';

export function rememberContact({ name, phone, email }) {
    try {
        if (name)  localStorage.setItem(NAME_KEY,  name);
        if (phone) localStorage.setItem(PHONE_KEY, phone);
        if (email) localStorage.setItem(EMAIL_KEY, email);
    } catch { /* private mode */ }
}

export function getRememberedContact() {
    try {
        return {
            name:  localStorage.getItem(NAME_KEY)  || '',
            phone: localStorage.getItem(PHONE_KEY) || '',
            email: localStorage.getItem(EMAIL_KEY) || ''
        };
    } catch {
        return { name: '', phone: '', email: '' };
    }
}

export async function requestOtp(phone) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    const sb = getSupabase();
    const { error } = await sb.functions.invoke('request-otp', { body: { phone } });
    if (error) throw new Error(error.context?.error || 'otp_send_failed');
}

export async function verifyOtp({ phone, code }) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    const sb = getSupabase();
    // Supabase verifies the OTP directly; our request-otp Edge Function only
    // adds rate-limiting on the *send* side.
    const { data, error } = await sb.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) throw new Error(error.message || 'otp_verify_failed');
    return data.session;
}

export async function getSession() {
    if (!isBackendEnabled()) return null;
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    return data.session ?? null;
}

export async function signOut() {
    if (!isBackendEnabled()) return;
    const sb = getSupabase();
    await sb.auth.signOut();
}

export function onAuthChange(cb) {
    if (!isBackendEnabled()) return () => {};
    const sb = getSupabase();
    const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
    return () => data.subscription.unsubscribe();
}
