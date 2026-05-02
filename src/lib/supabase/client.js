// =====================================================================
// Supabase client — lazy-initialized, feature-flagged.
//
// Returns null when env vars are absent so the rest of the app can
// detect "no backend configured" and gracefully fall back to WhatsApp.
// This is what lets us ship the foundation without breaking the live site.
// =====================================================================

import { createClient } from '@supabase/supabase-js';

const url     = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _client = null;

export function getSupabase() {
    if (!url || !anonKey) return null;
    if (!_client) {
        _client = createClient(url, anonKey, {
            auth: {
                persistSession: true,
                storageKey: 'marzipan-auth',
                autoRefreshToken: true,
                detectSessionInUrl: false   // we never use OAuth redirects
            }
        });
    }
    return _client;
}

/** True when the env is wired up. Use this to gate "real backend" UI paths. */
export function isBackendEnabled() {
    return Boolean(url && anonKey);
}

/** Convenience: invoke an Edge Function with consistent error shape. */
export async function invokeFunction(name, body, { idempotencyKey } = {}) {
    const sb = getSupabase();
    if (!sb) throw new Error('backend_disabled');
    const { data, error } = await sb.functions.invoke(name, {
        body,
        headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined
    });
    if (error) {
        const msg = error.context?.error || error.message || 'invoke_failed';
        const wrapped = new Error(msg);
        wrapped.cause = error;
        throw wrapped;
    }
    return data;
}
