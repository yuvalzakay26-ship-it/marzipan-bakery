import React, { useMemo, useState } from 'react';
import { Download, Trash2, RefreshCw, Crown } from 'lucide-react';
import { listLeads, clearLeads } from '../../lib/leads/leadCapture';
import { getChannel } from '../../utils/analytics';

// Lightweight, in-browser growth dashboard. Reads the localStorage-backed
// lead list (until Phase 3 ships Supabase tables for persisted leads) and
// surfaces channel attribution + lead breakdowns for the bakery owner.
//
// Once the Supabase `leads` table is wired up, swap listLeads() to query it.
const KIND_LABELS = {
    exit_intent_first_order: 'מאפה במתנה (Exit-Intent)',
    birthday_club: 'מועדון יום הולדת',
    birthday_club_post_purchase: 'מועדון יום הולדת (אחרי רכישה)',
    holiday_preorder_waitlist: 'רשימת המתנה לחגים',
    vip_club: 'מועדון VIP'
};

const channelLabel = (c) => ({
    direct: 'ישיר',
    organic_google: 'גוגל אורגני',
    organic_bing: 'בינג אורגני',
    social_facebook: 'פייסבוק',
    social_instagram: 'אינסטגרם',
    social_whatsapp: 'וואטסאפ',
    social_tiktok: 'טיקטוק',
    referral: 'הפניה'
}[c] || c);

const GrowthDashboard = () => {
    const [refreshTick, setRefreshTick] = useState(0);
    const leads = useMemo(() => listLeads(), [refreshTick]);
    const currentChannel = getChannel();

    const byKind = useMemo(() => {
        const m = {};
        leads.forEach((l) => { m[l.kind] = (m[l.kind] || 0) + 1; });
        return m;
    }, [leads]);

    const lastWeek = useMemo(() => {
        const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
        return leads.filter((l) => new Date(l.capturedAt).getTime() > cutoff);
    }, [leads]);

    const exportCsv = () => {
        if (!leads.length) return;
        const header = ['id', 'kind', 'name', 'phone', 'capturedAt', 'source', 'referrer', 'extra'];
        const rows = leads.map((l) => [
            l.id, l.kind, l.name, l.phone, l.capturedAt, l.source, l.referrer,
            JSON.stringify(l.extra || {})
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [header.join(','), ...rows].join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marzipan-leads-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        if (!confirm('למחוק את כל הלידים מהדפדפן הזה? פעולה לא הפיכה.')) return;
        clearLeads();
        setRefreshTick((t) => t + 1);
    };

    return (
        <div dir="rtl" className="space-y-6 p-5 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#380909]">לוח צמיחה</h1>
                    <p className="text-sm text-[#5D4037] mt-1">
                        לידים, ערוצי הגעה והמרות — ב-30 הימים האחרונים.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setRefreshTick((t) => t + 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#D4AF37]/30 text-[#380909] text-sm font-bold hover:bg-[#FFF8E1]"
                    >
                        <RefreshCw size={14} aria-hidden="true" />
                        רענן
                    </button>
                    <button
                        type="button"
                        onClick={exportCsv}
                        disabled={!leads.length}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#380909] text-white text-sm font-bold hover:bg-[#B91C1C] disabled:opacity-40"
                    >
                        <Download size={14} aria-hidden="true" />
                        הורדה ל-CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={!leads.length}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 text-red-700 text-sm font-bold hover:bg-red-50 disabled:opacity-40"
                    >
                        <Trash2 size={14} aria-hidden="true" />
                        ניקוי
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="סה״כ לידים" value={leads.length} />
                <Stat label="שבעת הימים" value={lastWeek.length} accent />
                <Stat
                    label="המקור הראשי"
                    value={
                        Object.entries(byKind).sort((a, b) => b[1] - a[1])[0]?.[0]
                            ? KIND_LABELS[Object.entries(byKind).sort((a, b) => b[1] - a[1])[0][0]]
                            : '—'
                    }
                />
                <Stat
                    label="ערוץ נוכחי"
                    value={currentChannel ? channelLabel(currentChannel.channel) : 'ישיר'}
                    sub={currentChannel?.utm_campaign}
                />
            </ul>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-[#D4AF37]/20 p-5">
                <h2 className="font-black text-[#380909] mb-3">פירוט לפי סוג ליד</h2>
                {Object.keys(byKind).length === 0 ? (
                    <p className="text-sm text-[#5D4037]">אין לידים עדיין. ההצעות באתר עובדות — חכו.</p>
                ) : (
                    <ul className="divide-y divide-[#D4AF37]/15">
                        {Object.entries(byKind)
                            .sort((a, b) => b[1] - a[1])
                            .map(([kind, count]) => (
                                <li key={kind} className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-[#380909] font-medium">
                                        {KIND_LABELS[kind] || kind}
                                    </span>
                                    <span className="text-sm font-bold text-[#B91C1C]">{count}</span>
                                </li>
                            ))}
                    </ul>
                )}
            </div>

            {/* Latest leads table */}
            <div className="bg-white rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
                <div className="p-5 border-b border-[#D4AF37]/15">
                    <h2 className="font-black text-[#380909]">לידים אחרונים</h2>
                </div>
                {leads.length === 0 ? (
                    <p className="p-5 text-sm text-[#5D4037]">אין נתונים.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#FFF8E1] text-[#380909]">
                                <tr className="text-right">
                                    <th className="px-4 py-2.5 font-bold">סוג</th>
                                    <th className="px-4 py-2.5 font-bold">שם</th>
                                    <th className="px-4 py-2.5 font-bold">טלפון</th>
                                    <th className="px-4 py-2.5 font-bold">מקור</th>
                                    <th className="px-4 py-2.5 font-bold">תאריך</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4AF37]/10">
                                {leads.slice().reverse().slice(0, 25).map((l) => (
                                    <tr key={l.id} className="text-right">
                                        <td className="px-4 py-2.5">
                                            <span className="inline-flex items-center gap-1.5">
                                                {l.kind.includes('vip') && <Crown size={12} className="text-[#D4AF37]" aria-hidden="true" />}
                                                {KIND_LABELS[l.kind] || l.kind}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5">{l.name || '—'}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs" dir="ltr">{l.phone || '—'}</td>
                                        <td className="px-4 py-2.5 text-xs text-[#5D4037]">{l.source}</td>
                                        <td className="px-4 py-2.5 text-xs text-[#5D4037]" dir="ltr">
                                            {new Date(l.capturedAt).toLocaleString('he-IL')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const Stat = ({ label, value, sub, accent }) => (
    <li className={`rounded-2xl p-4 border ${accent ? 'bg-[#380909] border-[#D4AF37]/40 text-white' : 'bg-white border-[#D4AF37]/20'}`}>
        <p className={`text-[10px] tracking-[0.22em] uppercase font-bold mb-1 ${accent ? 'text-[#D4AF37]' : 'text-[#B91C1C]'}`}>
            {label}
        </p>
        <p className={`text-2xl font-black ${accent ? 'text-white' : 'text-[#380909]'} leading-none`}>
            {value}
        </p>
        {sub && <p className={`text-[10px] mt-1 ${accent ? 'text-red-100/60' : 'text-[#5D4037]/70'}`}>{sub}</p>}
    </li>
);

export default GrowthDashboard;
