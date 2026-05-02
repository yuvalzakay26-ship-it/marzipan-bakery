// =====================================================================
// Customer profile API used by the AccountPage.
// All reads/writes happen under the customer's own JWT and are gated by
// RLS — there is no admin escalation here.
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

export async function getMyProfile() {
    if (!isBackendEnabled()) return null;
    const sb = getSupabase();
    const { data } = await sb
        .from('customers')
        .select(`
            id, name, phone_e164, email, birthday_md,
            loyalty_points, loyalty_tier, total_orders, total_spent_agorot,
            marketing_sms_opt_in, marketing_whatsapp_opt_in, referral_code
        `)
        .maybeSingle();
    return data ?? null;
}

export async function updateMyProfile(patch) {
    if (!isBackendEnabled()) return null;
    const sb = getSupabase();
    const { data } = await sb.from('customers').update(patch).select().maybeSingle();
    return data;
}

export async function listMyFavorites({ limit = 6 } = {}) {
    if (!isBackendEnabled()) return [];
    const sb = getSupabase();
    const { data } = await sb
        .from('customer_favorites')
        .select(`
            times_ordered, last_ordered_at,
            product:products(id, slug, name_he, price_agorot, image_url, is_sold_out, is_active)
        `)
        .order('times_ordered', { ascending: false })
        .limit(limit);
    return (data ?? [])
        .map((r) => ({
            ...r.product,
            timesOrdered: r.times_ordered,
            lastOrderedAt: r.last_ordered_at
        }))
        .filter((p) => p && p.is_active && !p.is_sold_out);
}

export async function listMyLoyaltyHistory({ limit = 20 } = {}) {
    if (!isBackendEnabled()) return [];
    const sb = getSupabase();
    const { data } = await sb
        .from('loyalty_events')
        .select('id, kind, points_delta, note, created_at, order_id')
        .order('created_at', { ascending: false })
        .limit(limit);
    return data ?? [];
}

export const TIER_LABELS = {
    bronze: 'ברונזה',
    silver: 'כסף',
    gold:   'זהב',
    legend: 'אגדה'
};

export const TIER_COLORS = {
    bronze: { bg: '#FFF8E1', border: '#D4AF37', text: '#380909' },
    silver: { bg: '#F4F4F5', border: '#A1A1AA', text: '#380909' },
    gold:   { bg: '#FEF3C7', border: '#D4AF37', text: '#380909' },
    legend: { bg: '#380909', border: '#D4AF37', text: '#FFF8E1' }
};
