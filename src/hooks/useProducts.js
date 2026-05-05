// Thin React wrapper around getProducts(). Owns loading/error state so
// pages don't re-implement the same useEffect each time.

import { useEffect, useState } from 'react';
import { getProducts } from '../services/productsService';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const rows = await getProducts();
                if (cancelled) return;
                setProducts(rows);
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
    }, []);

    return { products, loading, error };
}
