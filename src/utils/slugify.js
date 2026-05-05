// URL-safe slug generator. Slugs are English-only (a-z, 0-9, dash) so
// product URLs survive percent-encoding and stay SEO-friendly. Hebrew
// and other non-ASCII characters are stripped — products are expected
// to carry an explicit DB slug (see supabase/migrations) and this only
// runs as a defensive fallback.

export function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}
