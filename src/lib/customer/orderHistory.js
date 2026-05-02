// =====================================================================
// Customer order history.
// RLS ensures the user only sees their own orders (orders_self_read policy).
// =====================================================================

import { getSupabase, isBackendEnabled } from '../supabase/client.js';

export async function listMyOrders({ limit = 20 } = {}) {
    if (!isBackendEnabled()) return [];
    const sb = getSupabase();
    const { data, error } = await sb
        .from('orders')
        .select(`
            id,
            order_number,
            status,
            total_agorot,
            fulfillment,
            pickup_time_text,
            created_at,
            order_items ( id, name_he_snapshot, quantity, line_total_agorot )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

export async function reorder(orderId, addToCart, productLookup) {
    if (!isBackendEnabled()) throw new Error('backend_disabled');
    const sb = getSupabase();
    const { data, error } = await sb
        .from('order_items')
        .select('product_id, name_he_snapshot, quantity')
        .eq('order_id', orderId);
    if (error) throw error;
    let added = 0;
    for (const row of data ?? []) {
        const product = productLookup?.(row.product_id, row.name_he_snapshot);
        if (!product) continue;
        for (let i = 0; i < row.quantity; i++) addToCart(product);
        added += row.quantity;
    }
    return added;
}
