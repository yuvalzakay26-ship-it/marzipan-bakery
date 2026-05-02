import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { signInAdmin } from '../../lib/admin/auth';
import SEO from '../Shared/SEO';

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await signInAdmin({ email, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError(
                err.message === 'not_authorized'
                    ? 'אין לחשבון הזה הרשאות ניהול.'
                    : 'התחברות נכשלה. בדקו את הפרטים.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
            <SEO title="כניסת מנהל" description="פאנל ניהול מאפיית מרציפן." />
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <Lock className="mx-auto w-10 h-10 text-[#B91C1C] mb-2" />
                    <h1 className="text-2xl font-black text-[#380909]">כניסת מנהל</h1>
                    <p className="text-sm text-gray-500 mt-1">פאנל ניהול מאפיית מרציפן</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-email" className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Mail size={14} /> מייל
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            required
                            autoComplete="email"
                            dir="ltr"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-pass" className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <Lock size={14} /> סיסמה
                        </label>
                        <input
                            id="admin-pass"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#B91C1C] hover:bg-[#921616] disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? <><Loader2 className="animate-spin" size={18} /> מתחבר…</> : 'כניסה'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
