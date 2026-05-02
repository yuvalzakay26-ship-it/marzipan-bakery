import React, { useEffect, useMemo, useState } from 'react';
import {
    Loader2, Users, RefreshCw, Crown, Cake, AlertTriangle, MessageSquare,
    TrendingUp, Send
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase/client';
import { formatAgorot } from '../../lib/commerce/pricing';
import { TIER_LABELS } from '../../lib/customer/profile';

const TIER_ORDER = ['legend', 'gold', 'silver', 'bronze'];

const AdminCrm = () => {
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        const sb = getSupabase();
        let cancelled = false;
        setLoading(true);
        Promise.all([
            sb.from('customers')
                .select('id, name, phone_e164, total_orders, total_spent_agorot, last_order_at, loyalty_tier, loyalty_points, birthday_md')
                .order('total_spent_agorot', { ascending: false })
                .limit(500),
            sb.from('campaigns')
                .select('id, kind, title, status, sent_count, converted_count, revenue_agorot, last_run_at, scheduled_for')
                .order('updated_at', { ascending: false })
                .limit(50),
            sb.from('notifications')
                .select('id, kind, channel, status, sent_at, created_at, scheduled_for, customer_id')
                .order('created_at', { ascending: false })
                .limit(200)
        ]).then(([cRes, kRes, nRes]) => {
            if (cancelled) return;
            setCustomers(cRes.data ?? []);
            setCampaigns(kRes.data ?? []);
            setNotifications(nRes.data ?? []);
            setLoading(false);
        }).catch(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [refreshTick]);

    const stats = useMemo(() => {
        const total = customers.length;
        const repeaters = customers.filter((c) => c.total_orders > 1).length;
        const repeatRate = total ? Math.round((repeaters / total) * 100) : 0;

        const now = Date.now();
        const churnRiskCutoff = now - 60 * 86_400_000;
        const churnSafeCutoff = now - 30 * 86_400_000;
        const churnRisk = customers.filter((c) => {
            const last = c.last_order_at ? new Date(c.last_order_at).getTime() : null;
            return c.total_orders >= 2 && last && last < churnRiskCutoff;
        });
        const dormant30 = customers.filter((c) => {
            const last = c.last_order_at ? new Date(c.last_order_at).getTime() : null;
            return c.total_orders >= 1 && last && last < churnSafeCutoff && last >= churnRiskCutoff;
        });

        const tierCounts = {};
        for (const t of TIER_ORDER) tierCounts[t] = customers.filter((c) => c.loyalty_tier === t).length;

        const totalRevenue = customers.reduce((s, c) => s + (c.total_spent_agorot || 0), 0);

        return { total, repeaters, repeatRate, churnRisk, dormant30, tierCounts, totalRevenue };
    }, [customers]);

    const topCustomers = useMemo(
        () => customers.slice().sort((a, b) => (b.total_spent_agorot || 0) - (a.total_spent_agorot || 0)).slice(0, 10),
        [customers]
    );

    const triggerCampaigns = async () => {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-campaigns`;
        await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' }
        });
        setTimeout(() => setRefreshTick((t) => t + 1), 1500);
    };

    if (loading) {
        return <div className="p-10"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-6 md:p-8" dir="rtl">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#380909]">CRM ולקוחות</h1>
                    <p className="text-sm text-gray-500">נאמנות, חזרה ולקוחות בסיכון.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setRefreshTick((t) => t + 1)}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                    >
                        <RefreshCw size={14} /> רענון
                    </button>
                    <button
                        onClick={triggerCampaigns}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[#B91C1C] text-white hover:bg-[#921616]"
                    >
                        <Send size={14} /> הרץ קמפיינים עכשיו
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Stat label="לקוחות"          value={stats.total}                          icon={<Users size={16} />} />
                <Stat label="חוזרים"           value={`${stats.repeaters} (${stats.repeatRate}%)`} icon={<RefreshCw size={16} />} />
                <Stat label="בסיכון נטישה"    value={stats.churnRisk.length}              icon={<AlertTriangle size={16} />} />
                <Stat label="הכנסה מצטברת"    value={formatAgorot(stats.totalRevenue)}    icon={<TrendingUp size={16} />} />
            </ul>

            {/* Tier breakdown */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <h2 className="font-black text-[#380909] mb-3 flex items-center gap-2">
                    <Crown size={16} className="text-[#D4AF37]" /> דרגות נאמנות
                </h2>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIER_ORDER.map((t) => (
                        <li key={t} className="rounded-xl border border-gray-100 p-3">
                            <div className="text-xs uppercase tracking-widest text-gray-500">{TIER_LABELS[t]}</div>
                            <div className="text-2xl font-black text-[#380909]">{stats.tierCounts[t] ?? 0}</div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Top customers */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <h2 className="font-black text-[#380909] mb-3">10 הלקוחות המובילים</h2>
                <table className="w-full text-sm">
                    <thead className="text-right text-xs uppercase text-gray-500">
                        <tr>
                            <th className="py-2 pl-2">לקוח</th>
                            <th className="py-2">דרגה</th>
                            <th className="py-2">הזמנות</th>
                            <th className="py-2">סך הכל</th>
                            <th className="py-2">הזמנה אחרונה</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {topCustomers.map((c) => (
                            <tr key={c.id}>
                                <td className="py-2 pl-2">
                                    <div className="font-bold text-[#380909]">{c.name || '—'}</div>
                                    <div className="text-xs text-gray-500" dir="ltr">{c.phone_e164}</div>
                                </td>
                                <td className="py-2"><TierPill tier={c.loyalty_tier} /></td>
                                <td className="py-2">{c.total_orders}</td>
                                <td className="py-2 font-bold text-[#380909]">{formatAgorot(c.total_spent_agorot)}</td>
                                <td className="py-2 text-xs text-gray-500">
                                    {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('he-IL') : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Churn risk */}
            <section className="bg-white rounded-2xl border border-amber-200 p-5 mb-6">
                <h2 className="font-black text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    בסיכון נטישה (60+ יום ללא הזמנה)
                </h2>
                {stats.churnRisk.length === 0 ? (
                    <p className="text-sm text-gray-500">אין כרגע — חזק.</p>
                ) : (
                    <ul className="divide-y divide-amber-100">
                        {stats.churnRisk.slice(0, 12).map((c) => (
                            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                                <span>
                                    <span className="font-bold">{c.name || '—'}</span>
                                    <span className="text-gray-500 mx-2" dir="ltr">{c.phone_e164}</span>
                                </span>
                                <span className="text-xs text-gray-500">
                                    אחרון: {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('he-IL') : '—'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Campaign results */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
                <h2 className="font-black text-[#380909] mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#B91C1C]" />
                    תוצאות קמפיינים
                </h2>
                {campaigns.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        עדיין אין קמפיינים פרסומיים נשמרים. הקמפיינים האוטומטיים (חלות שישי, חגים, חזרה אחרי 30 יום, סל נטוש) מופעלים אוטומטית — תוצאותיהם יופיעו כאן ברגע שהמשבצת תרוץ.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-right text-xs uppercase text-gray-500">
                            <tr>
                                <th className="py-2 pl-2">סוג</th>
                                <th className="py-2">סטטוס</th>
                                <th className="py-2">נשלחו</th>
                                <th className="py-2">המירו</th>
                                <th className="py-2">הכנסה</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.map((k) => (
                                <tr key={k.id}>
                                    <td className="py-2 pl-2 font-bold">{k.title || k.kind}</td>
                                    <td className="py-2">{k.status}</td>
                                    <td className="py-2">{k.sent_count}</td>
                                    <td className="py-2">{k.converted_count}</td>
                                    <td className="py-2 font-bold">{formatAgorot(k.revenue_agorot)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Notifications stream */}
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-black text-[#380909] mb-3">הודעות אחרונות (200)</h2>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(
                        notifications.reduce((m, n) => {
                            const k = `${n.kind}/${n.status}`;
                            m[k] = (m[k] || 0) + 1; return m;
                        }, {})
                    ).map(([k, c]) => (
                        <li key={k} className="rounded-xl border border-gray-100 p-2.5 text-xs">
                            <div className="text-gray-500" dir="ltr">{k}</div>
                            <div className="text-lg font-black text-[#380909]">{c}</div>
                        </li>
                    ))}
                    {notifications.length === 0 && (
                        <li className="text-sm text-gray-500">אין נתונים עדיין.</li>
                    )}
                </ul>
            </section>
        </div>
    );
};

const Stat = ({ label, value, icon }) => (
    <li className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">{icon}{label}</div>
        <div className="text-2xl font-black text-[#380909]">{value}</div>
    </li>
);

const TierPill = ({ tier }) => {
    const cls = {
        legend: 'bg-[#380909] text-[#FFF8E1] border-[#D4AF37]',
        gold:   'bg-[#FEF3C7] text-[#380909] border-[#D4AF37]',
        silver: 'bg-gray-100 text-[#380909] border-gray-300',
        bronze: 'bg-[#FFF8E1] text-[#380909] border-[#D4AF37]/30'
    }[tier] || 'bg-gray-100 text-gray-700 border-gray-200';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>
            {TIER_LABELS[tier] || tier}
        </span>
    );
};

export default AdminCrm;
