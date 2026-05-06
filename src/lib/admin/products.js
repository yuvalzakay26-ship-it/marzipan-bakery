// =====================================================================
// Admin products data layer.
//
// Reads run under the admin user's JWT — RLS lets admins see all rows
// including drafts. Writes go through the admin-products Edge Function
// so every mutation lands in audit_log under the actor's id; direct
// UPDATE on public.products is fail-closed (no admin-write RLS policy).
// =====================================================================

import { getSupabase, invokeFunction, isBackendEnabled } from '../supabase/client.js';

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
    const result = await invokeFunction('admin-products', { productId: id, patch });
    if (!result?.ok) throw new Error(result?.error ?? 'update_failed');
    return result.product;
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
