// =====================================================================
// Admin products data layer.
// Reads run as the admin user (RLS lets admins see all rows including
// is_active=false). Writes go through Edge Functions in production for
// audit trail; for the foundation we expose direct table writes too,
// gated by RLS.
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

export async function listAllProducts() {
    if (!isBackendEnabled()) return [];
    const sb = getSupabase();
    const { data, error } = await sb
        .from('products')
        .select(`
            id, slug, name_he, name_en, price_agorot, unit, image_url,
            is_active, is_sold_out, sort_order,
            category:categories(id, slug, name_he)
        `)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function updateProduct(id, patch) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    const sb = getSupabase();
    const { error } = await sb.from('products').update(patch).eq('id', id);
    if (error) throw error;
}

export async function setSoldOut(id, isSoldOut) {
    return updateProduct(id, { is_sold_out: !!isSoldOut });
}

export async function setActive(id, isActive) {
    return updateProduct(id, { is_active: !!isActive });
}

export async function setPriceAgorot(id, priceAgorot) {
    if (!Number.isInteger(priceAgorot) || priceAgorot < 0) {
        throw new Error('invalid_price');
    }
    return updateProduct(id, { price_agorot: priceAgorot });
}
