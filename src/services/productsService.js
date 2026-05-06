// Products data layer.
//
// Fetches the public catalog from Supabase (post-rebuild schema) and maps
// each row into the flat shape consumed by ProductCard / ProductsPage /
// ProductPage. The DB stores prices in agorot (1 ₪ = 100); the UI works
// in shekels for display, so we convert here in one place.

import { supabase } from '../lib/supabase';
import { slugify } from '../utils/slugify';

// kg products encode their unit inside priceDisplay ("50 ₪ לק״ג") so the
// secondary unit label can be hidden — see UNIT_LABELS in ProductCard.
function buildPriceDisplay(shekels, unit) {
    return unit === 'kg' ? `${shekels} ₪ לק"ג` : `${shekels} ₪`;
}

// Map enum 'piece' (DB) → 'unit' (frontend's known UNIT_LABELS key).
function mapUnit(dbUnit) {
    return dbUnit === 'piece' ? 'unit' : dbUnit;
}

// Single mapping point so list + by-slug fetches stay in sync.
function mapProduct(row) {
    if (!row) return null;
    const shekels = Math.round((row.price_agorot ?? 0) / 100);
    const meta = row.metadata ?? {};
    const categorySlug = row.category?.slug ?? null;
    const unit = mapUnit(row.unit);
    const description = meta.description_he ?? row.description_he ?? null;
    return {
        id: row.id,
        name: row.name_he,
        description,
        image: row.image_url,
        priceValue: shekels,
        priceDisplay: buildPriceDisplay(shekels, row.unit),
        category_slug: categorySlug,
        isPopular: meta.is_popular === true,
        slug: row.slug || slugify(row.name_he),
        unit,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        legacy_id: row.legacy_id ?? null
    };
}

// One join + column list; reused by both fetch paths.
const SELECT_COLUMNS = `
    id, slug, name_he, description_he,
    price_agorot, unit, image_url,
    is_active, is_sold_out, sort_order,
    legacy_id, metadata,
    category:categories(slug, name_he)
`;

// Fetch the catalog the public site shows — active and not sold out.
// Sorted by sort_order so the seed-defined display order is preserved.
export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(SELECT_COLUMNS)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

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
        .select(SELECT_COLUMNS)
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();

    if (error) {
        console.error('[productsService] failed to fetch product by slug:', error);
        throw error;
    }

    return mapProduct(data);
}
