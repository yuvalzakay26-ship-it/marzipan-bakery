import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase/client';
import { formatAgorot } from '../../lib/commerce/pricing';

const AdminBundles = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sb = getSupabase();
        sb.from('bundles')
            .select(`
                id, slug, name_he, bundle_price_agorot, is_active,
                bundle_items(quantity, product:products(name_he))
            `)
            .is('deleted_at', null)
            .order('name_he')
            .then(({ data }) => { setBundles(data ?? []); setLoading(false); });
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-[#380909] mb-6">חבילות (Bundles)</h1>
            <p className="text-sm text-gray-500 mb-4">
                ניהול ויצירת חבילות יתווסף בפיתוח הבא. כרגע: רשימה לקריאה בלבד.
            </p>
            <div className="grid gap-3">
                {bundles.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-black text-[#380909]">{b.name_he}</div>
                                <div className="text-xs text-gray-500">{b.slug} · {b.is_active ? 'פעיל' : 'לא פעיל'}</div>
                            </div>
                            <div className="font-bold text-[#B91C1C]">{formatAgorot(b.bundle_price_agorot)}</div>
                        </div>
                        <ul className="mt-2 text-sm text-gray-700 list-disc pr-5">
                            {(b.bundle_items ?? []).map((it, i) => (
                                <li key={i}>{it.product?.name_he} × {it.quantity}</li>
                            ))}
                        </ul>
                    </div>
                ))}
                {bundles.length === 0 && (
                    <div className="text-center text-gray-500 py-10">עדיין לא הוגדרו חבילות.</div>
                )}
            </div>
        </div>
    );
};

export default AdminBundles;
