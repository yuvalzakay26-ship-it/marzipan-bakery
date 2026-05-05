// Single-product fetch by slug. notFound is a distinct state from error so
// the page can render a friendly "doesn't exist" branch separately from a
// network/DB failure.

import { useEffect, useState } from 'react';
import { getProductBySlug } from '../services/productsService';

export function useProduct(slug) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            setNotFound(false);
            setProduct(null);

            if (!slug) {
                if (!cancelled) {
                    setNotFound(true);
                    setLoading(false);
                }
                return;
            }

            try {
                const row = await getProductBySlug(slug);
                if (cancelled) return;
                if (!row) {
                    setNotFound(true);
                } else {
                    setProduct(row);
                }
            } catch (err) {
                if (cancelled) return;
                setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    return { product, loading, error, notFound };
}
