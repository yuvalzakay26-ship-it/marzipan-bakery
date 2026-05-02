import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    CheckCircle2,
    Phone,
    Clock,
    Copy,
    MessageCircle,
    Calendar,
    MapPin,
    PackageCheck,
    BellRing,
    HandCoins
} from 'lucide-react';
import SEO from '../Shared/SEO';
import { getSupabase, isBackendEnabled } from '../../lib/supabase/client';
import { formatAgorot } from '../../lib/commerce/pricing';
import { CONTACT_INFO } from '../../data/siteContent';
import PostPurchaseFlow from './PostPurchaseFlow';

const OrderConfirmation = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const orderNumberQuery = searchParams.get('orderNumber');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(Boolean(orderId && isBackendEnabled()));
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!orderId || !isBackendEnabled()) return;
        const sb = getSupabase();
        sb.from('orders')
            .select(`
                order_number, status, total_agorot, fulfillment, pickup_time_text, pickup_at,
                contact_name, contact_phone_e164, customer_notes,
                branch:branches(name_he, address_he),
                order_items(name_he_snapshot, quantity, line_total_agorot)
            `)
            .eq('id', orderId)
            .maybeSingle()
            .then(({ data }) => { setOrder(data); setLoading(false); });
    }, [orderId]);

    const orderNumber = order?.order_number || orderNumberQuery;

    const copyOrderNumber = () => {
        if (!orderNumber) return;
        navigator.clipboard?.writeText(orderNumber).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const pickupDisplay = formatPickup(order);

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO
                title="ההזמנה התקבלה"
                description="ההזמנה שלכם נקלטה במאפיית מרציפן. ניצור קשר לאישור."
            />
            <div className="max-w-xl mx-auto">

                {/* Hero card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#D4AF37]/20">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#15803D]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">
                        ההזמנה התקבלה!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        תודה רבה. שמרו את מספר ההזמנה — נחזור אליכם לאישור.
                    </p>

                    {orderNumber && (
                        <div className="bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-2xl px-5 py-4 mb-6 inline-flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs text-gray-600 mb-0.5">מספר הזמנה</div>
                                <div className="font-mono font-black text-xl text-[#380909] tracking-wider" dir="ltr">{orderNumber}</div>
                            </div>
                            <button
                                onClick={copyOrderNumber}
                                className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#B91C1C]"
                                aria-label="העתק מספר הזמנה"
                            >
                                <Copy size={16} className="text-[#B91C1C]" />
                            </button>
                            {copied && <span className="text-xs text-[#15803D]">הועתק</span>}
                        </div>
                    )}

                    {loading && (
                        <div className="text-sm text-gray-500 mb-4">טוען פרטי הזמנה…</div>
                    )}

                    {order && (
                        <div className="text-right space-y-3 border-t border-gray-100 pt-6">
                            {order.branch && (
                                <Row icon={<MapPin size={14} />} label="סניף איסוף" value={order.branch.name_he} />
                            )}
                            {pickupDisplay && (
                                <Row icon={<Calendar size={14} />} label="זמן איסוף" value={pickupDisplay} />
                            )}
                            <Row icon={<Clock size={14} />} label="סטטוס" value={hebrewStatus(order.status)} />
                            {order.customer_notes && (
                                <Row label="הערה" value={order.customer_notes} />
                            )}
                            <div>
                                <div className="text-sm text-gray-500 mb-2 mt-4">פירוט</div>
                                <ul className="space-y-1">
                                    {(order.order_items ?? []).map((it, i) => (
                                        <li key={i} className="flex justify-between text-sm">
                                            <span>{it.name_he_snapshot} × {it.quantity}</span>
                                            <span className="font-medium">{formatAgorot(it.line_total_agorot)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-100 font-bold">
                                <span>סה"כ</span>
                                <span className="text-[#B91C1C]">{formatAgorot(order.total_agorot)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* What happens next */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mt-5">
                    <h2 className="text-lg font-black text-[#380909] mb-5">מה קורה עכשיו?</h2>
                    <ol className="space-y-4">
                        <Step
                            step={1}
                            icon={<BellRing size={18} />}
                            title="המאפייה מקבלת את ההזמנה"
                            body="ההזמנה מופיעה אצלנו במערכת. נצור קשר טלפוני בתוך כ-15 דקות בשעות הפעילות לאישור הזמנה."
                            done
                        />
                        <Step
                            step={2}
                            icon={<HandCoins size={18} />}
                            title="אישור וסגירת תשלום"
                            body="נוודא איתכם את הפריטים ואת זמן האיסוף, ונסגור את התשלום (מזומן, אשראי או ביט בעת האיסוף)."
                        />
                        <Step
                            step={3}
                            icon={<PackageCheck size={18} />}
                            title="איסוף בסניף"
                            body="ההזמנה מוכנה בזמן שסיכמנו. תגיעו לסניף, תזכירו את מספר ההזמנה — וזה הכל."
                        />
                    </ol>
                </section>

                {/* Support CTAs */}
                <div className="mt-6 grid gap-3">
                    <a
                        href={`https://wa.me/${CONTACT_INFO.whatsapp}${orderNumber ? `?text=${encodeURIComponent(`שלום, יש לי שאלה על הזמנה ${orderNumber}`)}` : ''}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#1ba84e] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
                    >
                        <MessageCircle size={18} />
                        פתחו וואטסאפ אם יש שאלה
                    </a>
                    <a
                        href={`tel:${CONTACT_INFO.phoneTel}`}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#380909] font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Phone size={18} />
                        התקשרו: {CONTACT_INFO.phone}
                    </a>
                    <Link
                        to="/products"
                        className="inline-block text-sm text-gray-500 underline hover:text-[#B91C1C] mt-2 text-center"
                    >
                        חזרה לקטלוג
                    </Link>
                </div>

                {/* Post-purchase upsells: VIP + Birthday + Share */}
                <PostPurchaseFlow
                    phone={order?.contact_phone_e164}
                    name={order?.contact_name}
                />
            </div>
        </div>
    );
};

const Row = ({ label, value, icon }) => (
    <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-gray-500 flex items-center gap-1 shrink-0">{icon}{label}</span>
        <span className="font-medium text-[#380909] text-right">{value}</span>
    </div>
);

const Step = ({ step, icon, title, body, done }) => (
    <li className="flex gap-3">
        <div className={`mt-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
            done ? 'bg-[#15803D] text-white' : 'bg-[#FFF8E1] text-[#B91C1C] border border-[#D4AF37]/40'
        }`}>
            {done ? <CheckCircle2 size={18} /> : icon}
        </div>
        <div>
            <div className="font-bold text-[#380909]">
                <span className="text-xs text-gray-400 ml-2">שלב {step}</span>
                {title}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{body}</p>
        </div>
    </li>
);

function formatPickup(order) {
    if (!order) return '';
    if (order.pickup_at) {
        try {
            return new Intl.DateTimeFormat('he-IL', {
                timeZone: 'Asia/Jerusalem',
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(order.pickup_at));
        } catch { /* fall through */ }
    }
    return order.pickup_time_text || '';
}

function hebrewStatus(status) {
    return {
        pending:    'ממתין לאישור',
        confirmed:  'אושר',
        preparing:  'בהכנה',
        ready:      'מוכן לאיסוף',
        fulfilled:  'נמסר',
        cancelled:  'בוטל',
        refunded:   'הוחזר'
    }[status] || status;
}

export default OrderConfirmation;
