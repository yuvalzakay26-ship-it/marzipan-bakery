import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Tag, LogOut, LayoutDashboard, TrendingUp, Users } from 'lucide-react';
import { signOutAdmin } from '../../lib/admin/auth';

const AdminLayout = () => {
    const navigate = useNavigate();

    const onSignOut = async () => {
        await signOutAdmin();
        navigate('/admin/login', { replace: true });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] flex">
            <aside className="w-60 bg-[#380909] text-white flex flex-col">
                <div className="p-5 border-b border-white/10">
                    <div className="font-black text-xl">מרציפן</div>
                    <div className="text-xs text-white/60">פאנל ניהול</div>
                </div>
                <nav className="flex-1 p-3 space-y-1 text-sm">
                    <NavItem to="/admin" end icon={<LayoutDashboard size={16} />}>סקירה</NavItem>
                    <NavItem to="/admin/products" icon={<Package size={16} />}>מוצרים</NavItem>
                    <NavItem to="/admin/orders"   icon={<ShoppingBag size={16} />}>הזמנות</NavItem>
                    <NavItem to="/admin/bundles"  icon={<Tag size={16} />}>חבילות</NavItem>
                    <NavItem to="/admin/crm"      icon={<Users size={16} />}>לקוחות</NavItem>
                    <NavItem to="/admin/growth"   icon={<TrendingUp size={16} />}>צמיחה</NavItem>
                </nav>
                <button
                    onClick={onSignOut}
                    className="m-3 mt-0 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm flex items-center gap-2"
                >
                    <LogOut size={14} /> התנתקות
                </button>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

const NavItem = ({ to, end, icon, children }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
        }
    >
        {icon}{children}
    </NavLink>
);

export default AdminLayout;
