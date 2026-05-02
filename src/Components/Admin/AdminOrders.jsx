import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, ChevronDown, ChevronLeft, RefreshCw, StickyNote, Phone } from 'lucide-react';
import { getSupabase } from '../../lib/supabase/client';
import { formatAgorot } from '../../lib/commerce/pricing';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'fulfilled'];
const STATUS_HE = {
    pending: 'ממתין', confirmed: 'אושר', preparing: 'בהכנה',
    ready: 'מוכן', fulfilled: 'נמסר', cancelled: 'בוטל', refunded: 'הוחזר'
};

const FILTERS = [
    { key: 'all',        label: 'הכל' },
    { key: 'unpaid',     label: 'לא שולמו', kind: 'payment' },
    { key: 'paid',       label: 'שולמו',    kind: 'payment' },
    { key: 'pending',    label: 'ממתינות' },
    { key: 'confirmed',  label: 'אושרו' },
    { key: 'preparing',  label: 'בהכנה' },
    { key: 'ready',      label: 'מוכנות' },
    { key: 'fulfilled',  label: 'נמסרו' }
];

const PAYMENT_HE = {
    unpaid:     'לא שולם',
    authorized: 'מאושר',
    captured:   'שולם',
    failed:     'נכשל',
    refunded:   'הוחזר'
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expanded, setExpanded] = useState(() => new Set());

    // Effect-only fetcher: never calls setState synchronously, so the
    // react-hooks/set-state-in-effect rule stays happy.
    useEffect(() => {
        const sb = getSupabase();
        let cancelled = false;
        sb.from('orders')
            .select(`
                id, order_number, status, total_agorot, contact_name,
                contact_phone_e164, fulfillment, pickup_time_text, pickup_at,
                customer_notes, created_at,
                payment_status, payment_provider, payment_failure_reason,
                payment_captured_at, channel,
                branch:branches(name_he),
                order_items(name_he_snapshot, quantity, line_total_agorot)
            `)
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }) => {
                if (cancelled) return;
                setOrders(data ?? []);
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    // Manual refresh — runs in event handler, not in an effect.
    const reload = () => {
        setLoading(true);
        const sb = getSupabase();
        sb.from('orders')
            .select(`
                id, order_number, status, total_agorot, contact_name,
                contact_phone_e164, fulfillment, pickup_time_text, pickup_at,
                customer_notes, created_at,
                payment_status, payment_provider, payment_failure_reason,
                payment_captured_at, channel,
                branch:branches(name_he),
                order_items(name_he_snapshot, quantity, line_total_agorot)
            `)
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
    };

    const advance = async (id, current) => {
        const idx = STATUS_FLOW.indexOf(current);
        if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
        const next = STATUS_FLOW[idx + 1];

        const order = orders.find((o) => o.id === id);
        // Web orders never auto-confirm while unpaid. Surface a clear prompt
        // before the DB constraint rejects the update.
        if (next === 'confirmed' && order?.channel === 'web' && order?.payment_status !== 'captured') {
            const ok = window.confirm(
                'הזמנת ווב ללא תשלום שולם. האם לאשר ידנית בכל זאת? (יש לוודא תשלום בנפרד)'
            );
            if (!ok) return;
        }

        const sb = getSupabase();
        const patch = { status: next };
        if (next === 'confirmed') patch.confirmed_at = new Date().toISOString();
        if (next === 'fulfilled') patch.fulfilled_at = new Date().toISOString();
        const { error } = await sb.from('orders').update(patch).eq('id', id);
        if (error) {
            alert(`לא ניתן לקדם סטטוס: ${error.message}`);
        }
        reload();
    };

    const toggleExpand = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const counts = useMemo(() => {
        const out = { all: orders.length };
        for (const f of FILTERS) {
            if (f.key === 'all') continue;
            if (f.kind === 'payment') {
                out[f.key] = orders.filter((o) =>
                    f.key === 'paid'
                        ? o.payment_status === 'captured'
                        : o.payment_status !== 'captured' && o.payment_status !== 'refunded'
                ).length;
            } else {
                out[f.key] = orders.filter((o) => o.status === f.key).length;
            }
        }
        return out;
    }, [orders]);

    const visible = useMemo(() => {
        if (filter === 'all') return orders;
        if (filter === 'paid')   return orders.filter((o) => o.payment_status === 'captured');
        if (filter === 'unpaid') return orders.filter((o) => o.payment_status !== 'captured' && o.payment_status !== 'refunded');
        return orders.filter((o) => o.status === filter);
    }, [orders, filter]);

    return (
        <div className="p-6 md:p-8" dir="rtl">
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-[#380909]">הזמנות</h1>
                <button
                    onClick={reload}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                >
                    <RefreshCw size={14} /> רענון
                </button>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            filter === f.key
                                ? 'bg-[#380909] text-white border-[#380909]'
                                : 'bg-white text-[#380909] border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f.label}
                        <span className={`text-[11px] px-1.5 rounded-full ${
                            filter === f.key ? 'bg-white/15' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {counts[f.key] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader2 className="animate-spin" />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-right text-xs uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-3 py-3 w-8"></th>
                                    <th className="px-3 py-3">מספר</th>
                                    <th className="px-3 py-3">לקוח</th>
                                    <th className="px-3 py-3">סניף</th>
                                    <th className="px-3 py-3">איסוף</th>
                                    <th className="px-3 py-3">סטטוס</th>
                                    <th className="px-3 py-3">סה"כ</th>
                                    <th className="px-3 py-3">נוצרה</th>
                                    <th className="px-3 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((o) => {
                                    const isOpen = expanded.has(o.id);
                                    const itemCount = (o.order_items ?? []).reduce((s, i) => s + i.quantity, 0);
                                    const isPending = o.status === 'pending';
                                    return (
                                        <React.Fragment key={o.id}>
                                            <tr
                                                className={`border-t border-gray-100 ${isPending ? 'bg-[#FFF8E1]/30' : ''}`}
                                            >
                                                <td className="px-3 py-3 align-top">
                                                    <button
                                                        onClick={() => toggleExpand(o.id)}
                                                        aria-label={isOpen ? 'סגירה' : 'פתיחה'}
                                                        className="text-gray-500 hover:text-[#B91C1C]"
                                                    >
                                                        {isOpen ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3 align-top font-mono text-xs">{o.order_number}</td>
                                                <td className="px-3 py-3 align-top">
                                                    <div className="font-bold">{o.contact_name}</div>
                                                    <a
                                                        href={`tel:${o.contact_phone_e164}`}
                                                        className="text-xs text-gray-500 hover:text-[#B91C1C] inline-flex items-center gap-1"
                                                        dir="ltr"
                                                    >
                                                        <Phone size={11} /> {o.contact_phone_e164}
                                                    </a>
                                                </td>
                                                <td className="px-3 py-3 align-top">{o.branch?.name_he ?? '—'}</td>
                                                <td className="px-3 py-3 align-top">{formatPickup(o)}</td>
                                                <td className="px-3 py-3 align-top">
                                                    <StatusPill status={o.status} />
                                                    <div className="mt-1">
                                                        <PaymentPill order={o} />
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 align-top font-bold">
                                                    <div>{formatAgorot(o.total_agorot)}</div>
                                                    <div className="text-[11px] text-gray-500">{itemCount} פריטים</div>
                                                </td>
                                                <td className="px-3 py-3 align-top text-gray-500 whitespace-nowrap">
                                                    {new Date(o.created_at).toLocaleString('he-IL', {
                                                        day: '2-digit', month: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-3 py-3 align-top">
                                                    {STATUS_FLOW.includes(o.status) && o.status !== 'fulfilled' && (
                                                        <button
                                                            onClick={() => advance(o.id, o.status)}
                                                            className="text-xs px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white hover:bg-[#921616] whitespace-nowrap"
                                                        >
                                                            קדם סטטוס
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>

                                            {isOpen && (
                                                <tr className="border-t border-gray-100 bg-gray-50/40">
                                                    <td colSpan={9} className="px-6 py-4">
                                                        {o.customer_notes && (
                                                            <div className="mb-3 flex items-start gap-2 text-sm bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-lg px-3 py-2">
                                                                <StickyNote size={14} className="text-[#B91C1C] mt-0.5 shrink-0" />
                                                                <span className="text-[#380909]">{o.customer_notes}</span>
                                                            </div>
                                                        )}
                                                        <div className="text-xs font-bold text-gray-500 mb-1.5">פריטים</div>
                                                        <ul className="space-y-1">
                                                            {(o.order_items ?? []).map((it, i) => (
                                                                <li key={i} className="flex items-center justify-between text-sm">
                                                                    <span>
                                                                        <span className="font-medium text-[#380909]">{it.name_he_snapshot}</span>
                                                                        <span className="text-gray-500"> × {it.quantity}</span>
                                                                    </span>
                                                                    <span className="font-mono">{formatAgorot(it.line_total_agorot)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {visible.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                                            {filter === 'all' ? 'אין הזמנות עדיין.' : 'אין הזמנות בסטטוס הזה.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const PaymentPill = ({ order }) => {
    const ps = order.payment_status || 'unpaid';
    const label = PAYMENT_HE[ps] || ps;
    const cls = {
        captured:   'bg-emerald-50 text-emerald-800 border-emerald-200',
        authorized: 'bg-blue-50 text-blue-800 border-blue-200',
        unpaid:     'bg-amber-50 text-amber-800 border-amber-200',
        failed:     'bg-red-50 text-red-800 border-red-200',
        refunded:   'bg-orange-50 text-orange-800 border-orange-200'
    }[ps] || 'bg-gray-100 text-gray-700 border-gray-200';
    return (
        <span
            title={order.payment_provider ? `ספק: ${order.payment_provider}` : undefined}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}
        >
            {label}
        </span>
    );
};

const StatusPill = ({ status }) => {
    const cls = {
        pending:    'bg-amber-100 text-amber-800 border-amber-200',
        confirmed:  'bg-blue-50 text-blue-800 border-blue-200',
        preparing:  'bg-purple-50 text-purple-800 border-purple-200',
        ready:      'bg-emerald-50 text-emerald-800 border-emerald-200',
        fulfilled:  'bg-gray-100 text-gray-700 border-gray-200',
        cancelled:  'bg-red-50 text-red-800 border-red-200',
        refunded:   'bg-orange-50 text-orange-800 border-orange-200'
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>
            {STATUS_HE[status] || status}
        </span>
    );
};

function formatPickup(o) {
    if (o.pickup_at) {
        try {
            return new Intl.DateTimeFormat('he-IL', {
                timeZone: 'Asia/Jerusalem',
                day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit'
            }).format(new Date(o.pickup_at));
        } catch { /* fall through */ }
    }
    return o.pickup_time_text || '—';
}

export default AdminOrders;
