import React, { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { listAllProducts, setSoldOut, setActive, setPriceAgorot } from '../../lib/admin/products';
import { formatAgorot, shekelsToAgorot } from '../../lib/commerce/pricing';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // { id, priceShekels }
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');

    const reload = () => {
        setLoading(true);
        listAllProducts()
            .then((rows) => { setProducts(rows); setLoading(false); })
            .catch((e) => { setError(e.message); setLoading(false); });
    };

    useEffect(reload, []);

    const onToggleSoldOut = async (p) => {
        setSavingId(p.id);
        try { await setSoldOut(p.id, !p.is_sold_out); reload(); }
        catch (e) { setError(e.message); }
        finally { setSavingId(null); }
    };
    const onToggleActive = async (p) => {
        setSavingId(p.id);
        try { await setActive(p.id, !p.is_active); reload(); }
        catch (e) { setError(e.message); }
        finally { setSavingId(null); }
    };
    const onSavePrice = async () => {
        if (!editing) return;
        const agorot = shekelsToAgorot(parseFloat(editing.priceShekels));
        if (!Number.isInteger(agorot) || agorot < 0) { setError('מחיר לא תקין'); return; }
        setSavingId(editing.id);
        try { await setPriceAgorot(editing.id, agorot); setEditing(null); reload(); }
        catch (e) { setError(e.message); }
        finally { setSavingId(null); }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-[#380909]">מוצרים</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-3 py-2 mb-4 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <Loader2 className="animate-spin" />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-right">
                            <tr>
                                <th className="px-4 py-3 font-bold">מוצר</th>
                                <th className="px-4 py-3 font-bold">קטגוריה</th>
                                <th className="px-4 py-3 font-bold">מחיר</th>
                                <th className="px-4 py-3 font-bold">סטטוס</th>
                                <th className="px-4 py-3 font-bold">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100">
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{p.name_he}</div>
                                        <div className="text-xs text-gray-500">{p.slug}</div>
                                    </td>
                                    <td className="px-4 py-3">{p.category?.name_he ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        {editing?.id === p.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={editing.priceShekels}
                                                    onChange={(e) => setEditing({ ...editing, priceShekels: e.target.value })}
                                                    className="w-24 px-2 py-1 border border-gray-200 rounded-lg"
                                                />
                                                <button
                                                    onClick={onSavePrice}
                                                    disabled={savingId === p.id}
                                                    className="text-[#15803D] hover:bg-[#15803D]/10 p-1 rounded"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={() => setEditing(null)} className="text-gray-400 p-1 rounded">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditing({ id: p.id, priceShekels: (p.price_agorot / 100).toString() })}
                                                className="hover:underline"
                                            >
                                                {formatAgorot(p.price_agorot)}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 space-x-1 space-x-reverse">
                                        {!p.is_active && <Pill color="gray">לא פעיל</Pill>}
                                        {p.is_sold_out && <Pill color="red">אזל</Pill>}
                                        {p.is_active && !p.is_sold_out && <Pill color="green">זמין</Pill>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onToggleSoldOut(p)}
                                                disabled={savingId === p.id}
                                                className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                            >
                                                {p.is_sold_out ? 'סמן כזמין' : 'סמן שאזל'}
                                            </button>
                                            <button
                                                onClick={() => onToggleActive(p)}
                                                disabled={savingId === p.id}
                                                className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                            >
                                                {p.is_active ? 'הסתר' : 'הפעל'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                                        עדיין אין מוצרים — הריצו את <code dir="ltr">supabase/seed/products.sql</code>.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const Pill = ({ children, color }) => {
    const tone = {
        red:   'bg-red-100 text-red-800',
        green: 'bg-emerald-100 text-emerald-800',
        gray:  'bg-gray-100 text-gray-700'
    }[color] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${tone}`}>{children}</span>;
};

export default AdminProducts;
