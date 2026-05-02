import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone, KeyRound, Loader2, ShoppingBag, Crown, Cake, Share2, Repeat,
    Gift, Heart, Bell, Check, Copy
} from 'lucide-react';
import SEO from '../Shared/SEO';
import { isBackendEnabled } from '../../lib/supabase/client';
import { requestOtp, verifyOtp, getSession, signOut } from '../../lib/customer/session';
import { listMyOrders, reorder } from '../../lib/customer/orderHistory';
import {
    getMyProfile, updateMyProfile, listMyFavorites,
    TIER_LABELS, TIER_COLORS
} from '../../lib/customer/profile';
import { buildShareUrl } from '../../lib/customer/referral';
import { formatAgorot } from '../../lib/commerce/pricing';
import { useCart } from '../../context/CartContext';
import { productsData } from '../../data/productsData';

const allLegacyProducts = Object.values(productsData).flat();

const AccountPage = () => {
    const { addToCart, setIsCartOpen } = useCart();

    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    // OTP login flow
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('enterPhone');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getSession().then((s) => {
            setSession(s);
            setStep(s ? 'done' : 'enterPhone');
        });
    }, []);

    useEffect(() => {
        if (!session) return;
        setLoading(true);
        Promise.all([
            getMyProfile(),
            listMyOrders({ limit: 10 }),
            listMyFavorites({ limit: 6 })
        ]).then(([p, o, f]) => {
            setProfile(p); setOrders(o); setFavorites(f); setLoading(false);
        }).catch(() => setLoading(false));
    }, [session]);

    const onRequestOtp = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await requestOtp(phone);
            setStep('enterCode');
        } catch (err) {
            setError(err.message === 'rate_limited' ? 'נסיונות רבים מדי. נסו שוב בעוד דקה.' : 'שליחת קוד נכשלה.');
        } finally { setSubmitting(false); }
    };

    const onVerifyOtp = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            const s = await verifyOtp({ phone, code });
            setSession(s); setStep('done');
        } catch {
            setError('הקוד לא תקין או פג תוקף.');
        } finally { setSubmitting(false); }
    };

    const onSignOut = async () => {
        await signOut();
        setSession(null); setProfile(null); setOrders([]); setFavorites([]);
        setStep('enterPhone');
    };

    const onSaveBirthday = async (md) => {
        const updated = await updateMyProfile({ birthday_md: md });
        if (updated) setProfile(updated);
    };

    const onToggleMarketing = async (key) => {
        const next = { [key]: !profile?.[key] };
        const updated = await updateMyProfile(next);
        if (updated) setProfile(updated);
    };

    const onCopyReferral = async () => {
        if (!profile?.referral_code) return;
        try {
            await navigator.clipboard.writeText(buildShareUrl(profile.referral_code));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* ignore */ }
    };

    const onShareReferral = async () => {
        if (!profile?.referral_code) return;
        const url = buildShareUrl(profile.referral_code);
        const text = `קוד מתנה למאפיית מרציפן — ₪20 הנחה על ההזמנה הראשונה: ${url}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'מרציפן', text, url }); } catch { /* cancelled */ }
        } else {
            const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(wa, '_blank', 'noopener');
        }
    };

    const onReorder = async (orderId) => {
        const lookup = (productId, name) => {
            return allLegacyProducts.find((p) => p.supabaseId === productId)
                || allLegacyProducts.find((p) => p.name === name)
                || null;
        };
        const added = await reorder(orderId, addToCart, lookup);
        if (added > 0) setIsCartOpen(true);
    };

    const tier = profile?.loyalty_tier || 'bronze';
    const tierColors = TIER_COLORS[tier];

    if (!isBackendEnabled()) {
        return (
            <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
                <SEO title="האזור האישי" description="ההזמנות שלי, היסטוריה והעדפות." />
                <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-sm text-center">
                    <h1 className="text-2xl font-black text-[#380909] mb-3">האזור האישי</h1>
                    <p className="text-gray-600">
                        האזור האישי יופעל ברגע שנחבר את המערכת לשרת.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO title="האזור האישי" description="הנקודות, ההזמנות, וההעדפות שלכם במאפיית מרציפן." />
            <div className="max-w-2xl mx-auto">
                {!session ? (
                    <div className="bg-white rounded-3xl shadow-sm p-8">
                        <h1 className="text-2xl font-black text-[#380909] mb-2">כניסה</h1>
                        <p className="text-sm text-gray-500 mb-6">כניסה עם מספר טלפון. נשלח קוד חד־פעמי בהודעה.</p>
                        {step === 'enterPhone' && (
                            <form onSubmit={onRequestOtp} className="space-y-4">
                                <Field id="ap-phone" label="מספר טלפון" icon={<Phone size={14} />}>
                                    <input
                                        id="ap-phone" type="tel" required autoComplete="tel"
                                        value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                        placeholder="050-0000000"
                                    />
                                </Field>
                                <Submit submitting={submitting} label="שליחת קוד" />
                            </form>
                        )}
                        {step === 'enterCode' && (
                            <form onSubmit={onVerifyOtp} className="space-y-4">
                                <Field id="ap-code" label="קוד אימות" icon={<KeyRound size={14} />}>
                                    <input
                                        id="ap-code" type="text" inputMode="numeric"
                                        autoComplete="one-time-code" required
                                        value={code} onChange={(e) => setCode(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-center text-lg tracking-widest"
                                        placeholder="000000"
                                    />
                                </Field>
                                <Submit submitting={submitting} label="כניסה" />
                            </form>
                        )}
                        {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Loyalty card */}
                        <section
                            className="rounded-3xl shadow-md p-6 md:p-7 border"
                            style={{ background: tierColors.bg, borderColor: tierColors.border, color: tierColors.text }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] tracking-[0.32em] uppercase font-bold mb-1 opacity-70">
                                        מועדון מרציפן
                                    </p>
                                    <p className="text-2xl font-black">
                                        שלום{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
                                    </p>
                                </div>
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs border"
                                    style={{ borderColor: tierColors.border, background: '#fff' }}
                                >
                                    <Crown size={12} className="text-[#D4AF37]" />
                                    דרגת {TIER_LABELS[tier]}
                                </span>
                            </div>
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                <KPI label="נקודות"   value={profile?.loyalty_points ?? 0} />
                                <KPI label="הזמנות"   value={profile?.total_orders ?? 0} />
                                <KPI label="ביחד"     value={formatAgorot(profile?.total_spent_agorot ?? 0)} />
                            </div>
                            <p className="text-[11px] mt-4 leading-relaxed opacity-75">
                                כל ₪1 = נקודה אחת. 100 נקודות = ₪10 הנחה. בכל הזמנה חמישית מתנה אוטומטית.
                            </p>
                        </section>

                        {/* Identity */}
                        <section className="bg-white rounded-3xl shadow-sm p-6 flex justify-between items-center">
                            <div>
                                <div className="font-black text-[#380909]">החשבון שלי</div>
                                <div className="text-sm text-gray-500" dir="ltr">{session.user?.phone}</div>
                            </div>
                            <button onClick={onSignOut} className="text-sm text-gray-500 hover:text-[#B91C1C] underline">
                                התנתקות
                            </button>
                        </section>

                        {/* Birthday + marketing prefs */}
                        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                            <h2 className="font-black text-[#380909] flex items-center gap-2">
                                <Cake size={16} className="text-[#B91C1C]" />
                                יום הולדת ומתנות
                            </h2>
                            <BirthdayPicker
                                value={profile?.birthday_md ?? ''}
                                onSave={onSaveBirthday}
                            />
                            <ToggleRow
                                icon={<Bell size={14} />}
                                label="עדכוני SMS על מאפים חמים מהתנור וחגים"
                                checked={profile?.marketing_sms_opt_in ?? false}
                                onToggle={() => onToggleMarketing('marketing_sms_opt_in')}
                            />
                            <ToggleRow
                                icon={<Bell size={14} />}
                                label="עדכוני וואטסאפ"
                                checked={profile?.marketing_whatsapp_opt_in ?? false}
                                onToggle={() => onToggleMarketing('marketing_whatsapp_opt_in')}
                            />
                        </section>

                        {/* Referral */}
                        <section className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="font-black text-[#380909] flex items-center gap-2 mb-3">
                                <Gift size={16} className="text-[#B91C1C]" />
                                הפנו חברים — ₪20 לשניכם
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                שלחו לחבר את הקישור שלכם. ברגע שהוא יזמין הזמנה ראשונה — שניכם מקבלים קוד מתנה של ₪20.
                            </p>
                            {profile?.referral_code ? (
                                <div className="space-y-2">
                                    <div className="font-mono text-lg text-[#380909] bg-[#FFF8E1] border border-[#D4AF37]/40 rounded-xl p-3 text-center" dir="ltr">
                                        {profile.referral_code}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onShareReferral}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#B91C1C] text-white font-bold py-2.5 px-4 rounded-xl hover:bg-[#921616]"
                                        >
                                            <Share2 size={16} /> שתפו עם חבר
                                        </button>
                                        <button
                                            onClick={onCopyReferral}
                                            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#380909] font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50"
                                        >
                                            {copied ? <Check size={16} className="text-[#15803D]" /> : <Copy size={16} />}
                                            {copied ? 'הועתק' : 'העתיקו קישור'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">קוד הפנייה ייווצר עם ההזמנה הראשונה.</p>
                            )}
                        </section>

                        {/* Favorites */}
                        {favorites.length > 0 && (
                            <section className="bg-white rounded-3xl shadow-sm p-6">
                                <h2 className="font-black text-[#380909] flex items-center gap-2 mb-3">
                                    <Heart size={16} className="text-[#B91C1C]" />
                                    האהובים עליכם
                                </h2>
                                <ul className="grid grid-cols-2 gap-3">
                                    {favorites.map((f) => (
                                        <li key={f.id} className="flex items-center gap-2 p-2 border border-gray-100 rounded-xl">
                                            {f.image_url && (
                                                <img src={f.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-[#380909] truncate">{f.name_he}</div>
                                                <div className="text-xs text-gray-500">הזמנת {f.timesOrdered} פעמים</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Orders */}
                        <section className="bg-white rounded-3xl shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-[#380909]">
                                <ShoppingBag size={18} />
                                <h2 className="font-black text-lg">ההזמנות שלי</h2>
                            </div>
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <div className="space-y-2">
                                    {orders.map((o) => (
                                        <div key={o.id} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center gap-3">
                                            <div className="min-w-0">
                                                <div className="font-mono text-sm font-bold">{o.order_number}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(o.created_at).toLocaleString('he-IL')} · {o.fulfillment === 'pickup' ? 'איסוף' : 'משלוח'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="font-bold text-[#B91C1C]">{formatAgorot(o.total_agorot)}</div>
                                                <button
                                                    onClick={() => onReorder(o.id)}
                                                    title="הזמינו שוב"
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#FFF8E1] text-[#B91C1C] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30"
                                                >
                                                    <Repeat size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="text-sm text-gray-500 text-center py-6">
                                            עדיין אין הזמנות — <Link to="/products" className="underline text-[#B91C1C]">לעיון בקטלוג</Link>.
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

const Field = ({ id, label, icon, children }) => (
    <div>
        <label htmlFor={id} className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
            {icon} {label}
        </label>
        {children}
    </div>
);

const Submit = ({ submitting, label }) => (
    <button
        type="submit" disabled={submitting}
        className="w-full py-3 bg-[#B91C1C] text-white font-bold rounded-xl hover:bg-[#921616] disabled:bg-gray-300 flex items-center justify-center gap-2"
    >
        {submitting ? <><Loader2 className="animate-spin" size={18} /> שולח…</> : label}
    </button>
);

const KPI = ({ label, value }) => (
    <div className="rounded-2xl bg-white/70 px-3 py-2.5 text-center backdrop-blur-sm">
        <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
        <div className="font-black text-xl mt-0.5">{value}</div>
    </div>
);

const ToggleRow = ({ icon, label, checked, onToggle }) => (
    <button
        type="button" onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
    >
        <span className="flex items-center gap-2 text-sm text-[#380909]">
            <span className="text-[#B91C1C]">{icon}</span> {label}
        </span>
        <span className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#15803D]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
        </span>
    </button>
);

const BirthdayPicker = ({ value, onSave }) => {
    const [m, setM] = useState(value?.split('-')?.[0] || '');
    const [d, setD] = useState(value?.split('-')?.[1] || '');
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!m || !d) return;
        const md = `${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        await onSave(md);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')), []);
    const days   = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')), []);

    return (
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">חודש</label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-200" value={m} onChange={(e) => setM(e.target.value)}>
                    <option value="">—</option>
                    {months.map((mm) => <option key={mm} value={mm}>{mm}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">יום</label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-200" value={d} onChange={(e) => setD(e.target.value)}>
                    <option value="">—</option>
                    {days.map((dd) => <option key={dd} value={dd}>{dd}</option>)}
                </select>
            </div>
            <button
                onClick={handleSave}
                disabled={!m || !d}
                className="px-4 py-2 rounded-xl bg-[#B91C1C] text-white font-bold disabled:bg-gray-300"
            >
                {saved ? 'נשמר' : 'שמירה'}
            </button>
        </div>
    );
};

export default AccountPage;
