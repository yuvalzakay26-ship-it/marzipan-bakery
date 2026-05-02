// =====================================================================
// Admin auth — wraps Supabase email/password auth and checks the
// app_metadata.role claim.
//
// Admin accounts are NOT self-service signup. They're created manually
// via the Supabase dashboard with raw_app_meta_data = {"role": "admin"}.
// See docs/COMMERCE_FOUNDATION.md §"Bootstrapping the first admin".
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

export async function signInAdmin({ email, password }) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!hasAdminRole(data.session)) {
        await sb.auth.signOut();
        throw new Error('not_authorized');
    }
    return data.session;
}

export async function signOutAdmin() {
    if (!isBackendEnabled()) return;
    const sb = getSupabase();
    await sb.auth.signOut();
}

export function hasAdminRole(session) {
    const role = session?.user?.app_metadata?.role;
    return role === 'admin' || role === 'staff';
}

export async function getAdminSession() {
    if (!isBackendEnabled()) return null;
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    return hasAdminRole(data.session) ? data.session : null;
}
