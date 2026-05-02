import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getAdminSession } from '../../lib/admin/auth';
import { isBackendEnabled } from '../../lib/supabase/client';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [state, setState] = useState({ loading: true, authed: false });

    useEffect(() => {
        let cancelled = false;
        getAdminSession()
            .then((session) => { if (!cancelled) setState({ loading: false, authed: !!session }); })
            .catch(() => { if (!cancelled) setState({ loading: false, authed: false }); });
        return () => { cancelled = true; };
    }, []);

    if (!isBackendEnabled()) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-black text-[#380909] mb-3">מנהל לא זמין</h1>
                    <p className="text-gray-600">
                        פאנל הניהול דורש חיבור Supabase. הוסיפו את <code dir="ltr">VITE_SUPABASE_URL</code> ו־<code dir="ltr">VITE_SUPABASE_ANON_KEY</code> ל־<code dir="ltr">.env</code>.
                    </p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
            </div>
        );
    }
    if (!state.authed) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedRoute;
