// Products data layer.
//
// Fetches the public catalog from Supabase and maps each row into the
// flat shape consumed by ProductCard / ProductsPage / ProductPage.

import { supabase } from '../lib/supabase';
import { slugify } from '../utils/slugify';

// Single mapping point so list + by-slug fetches stay in sync.
// Falls back to a derived slug if the DB row is missing one (e.g. a
// product seeded before the slug migration ran).
function mapProduct(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        image: row.image_url,
        priceValue: row.price,
        priceDisplay: `${row.price} ₪`,
        category_slug: row.category_slug,
        isPopular: row.is_popular,
        slug: row.slug || slugify(row.name)
    };
}

// Fetch all products, newest first. Returns [] when the table is empty.
// Throws on DB/network errors so callers can render an error state.
export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[productsService] failed to fetch products:', error);
        throw error;
    }

    return (data ?? []).map(mapProduct);
}

// Fetch a single product by its URL slug. Returns null when no row matches
// (so the page can render its own "not found" state instead of throwing).
export async function getProductBySlug(slug) {
    if (!slug) return null;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error('[productsService] failed to fetch product by slug:', error);
        throw error;
    }

    return mapProduct(data);
}
