import React, { useEffect, useState } from 'react';
import { Loader2, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase/client';
import { formatAgorot } from '../../lib/commerce/pricing';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sb = getSupabase();
        const today = new Date();
        const startISO = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

        Promise.all([
            sb.from('orders').select('id, status, total_agorot', { count: 'exact' }).gte('created_at', startISO),
            sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending')
        ]).then(([todayRes, pendingRes]) => {
            const rows = todayRes.data ?? [];
            setStats({
                todayCount: rows.length,
                todayRevenue: rows.reduce((s, r) => s + (r.total_agorot || 0), 0),
                pendingCount: pendingRes.count ?? 0
            });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-10"><Loader2 className="animate-spin" /></div>;
    }
    if (!stats) {
        return <div className="p-10 text-gray-600">לא הצלחנו לטעון נתונים.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-[#380909] mb-6">סקירה</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card label="הזמנות היום"   value={stats.todayCount}                    icon={<ShoppingBag />} />
                <Card label="הכנסות היום"   value={formatAgorot(stats.todayRevenue)}    icon={<CheckCircle2 />} />
                <Card label="ממתינות לאישור" value={stats.pendingCount}                  icon={<Clock />} />
            </div>
        </div>
    );
};

const Card = ({ label, value, icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">{icon}{label}</div>
        <div className="text-3xl font-black text-[#380909]">{value}</div>
    </div>
);

export default AdminDashboard;
