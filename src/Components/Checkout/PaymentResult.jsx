import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, AlertTriangle, Loader2, Phone, MessageCircle, RefreshCw
} from 'lucide-react';
import SEO from '../Shared/SEO';
import { getSupabase, isBackendEnabled } from '../../lib/supabase/client';
import { startPaymentSession } from '../../lib/payments/session';
import { formatAgorot } from '../../lib/commerce/pricing';
import { CONTACT_INFO } from '../../data/siteContent';

// Polls the order's payment_status until we see a terminal state (captured /
// failed / refunded). We need this because the redirect from the PSP back to
// our success URL can land BEFORE the webhook lands — the customer sees the
// browser come back; the bakery's record updates seconds later.
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15;     // ~30s total

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const queryStatus = searchParams.get('status');     // success | failed (PSP-provided hint)

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [retryError, setRetryError] = useState('');
    const attemptsRef = useRef(0);
    const cancelRef = useRef(false);

    useEffect(() => {
        cancelRef.current = false;
        attemptsRef.current = 0;
        if (!orderId || !isBackendEnabled()) { setLoading(false); return; }

        let timer;
        const poll = async () => {
            const sb = getSupabase();
            const { data } = await sb.from('orders')
                .select(`
                    order_number, status, total_agorot, payment_status,
                    payment_failure_reason, contact_phone_e164
                `)
                .eq('id', orderId)
                .maybeSingle();
            if (cancelRef.current) return;

            setOrder(data);
            setLoading(false);

            const terminal =
                data && ['captured', 'failed', 'refunded'].includes(data.payment_status);
            if (terminal) return;

            attemptsRef.current += 1;
            if (attemptsRef.current < POLL_MAX_ATTEMPTS && !cancelRef.current) {
                timer = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };
        poll();
        return () => { cancelRef.current = true; if (timer) clearTimeout(timer); };
    }, [orderId]);

    const retryPayment = async () => {
        if (!orderId) return;
        setRetrying(true);
        setRetryError('');
        try {
            const { redirectUrl } = await startPaymentSession({ orderId });
            window.location.href = redirectUrl;
        } catch (err) {
            setRetrying(false);
            setRetryError(err?.message || 'retry_failed');
        }
    };

    // What we render is driven by the AUTHORITATIVE payment_status, falling
    // back to the URL hint when we couldn't load the order.
    const status = order?.payment_status
        ?? (queryStatus === 'success' ? 'unpaid'        // pending — webhook hasn't landed yet
          : queryStatus === 'failed'  ? 'failed'
          : 'unpaid');

    if (loading) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-[#B91C1C]" />
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO title="תוצאת תשלום" description="עדכון על מצב התשלום של ההזמנה במאפיית מרציפן." />
            <div className="max-w-xl mx-auto">

                {status === 'captured' && (
                    <SuccessCard order={order} onContinue={() => navigate(`/order/confirmation?orderId=${orderId}`)} />
                )}

                {status === 'failed' && (
                    <FailureCard
                        order={order}
                        onRetry={retryPayment}
                        retrying={retrying}
                        retryError={retryError}
                    />
                )}

                {(status === 'unpaid' || status === 'authorized') && (
                    <PendingCard order={order} />
                )}

                <SupportFooter orderNumber={order?.order_number} />
            </div>
        </div>
    );
};

const SuccessCard = ({ order, onContinue }) => (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#15803D]/20">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#15803D]/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">התשלום התקבל</h1>
        <p className="text-gray-600 mb-2">ההזמנה אושרה ועוברת להכנה.</p>
        {order?.total_agorot != null && (
            <p className="text-sm text-gray-500 mb-6">חויבת ב־{formatAgorot(order.total_agorot)}</p>
        )}
        <button
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 bg-[#B91C1C] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#921616] transition-colors"
        >
            המשך לאישור הזמנה
        </button>
    </div>
);

const FailureCard = ({ order, onRetry, retrying, retryError }) => (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-red-200">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-700" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">התשלום לא הושלם</h1>
        <p className="text-gray-600 mb-2">לא חויבתם. אפשר לנסות שוב.</p>
        {order?.payment_failure_reason && (
            <p className="text-xs text-gray-400 mb-6 font-mono" dir="ltr">{order.payment_failure_reason}</p>
        )}
        <button
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 bg-[#B91C1C] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#921616] transition-colors disabled:bg-gray-300 mb-3"
        >
            {retrying ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {retrying ? 'מעבר לתשלום…' : 'נסו תשלום שוב'}
        </button>
        {retryError && <p className="text-sm text-red-700 mt-2">לא הצלחנו לחדש את התשלום. נסו שוב או פנו אלינו.</p>}
    </div>
);

const PendingCard = ({ order }) => (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#D4AF37]/20">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#FFF8E1] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#B91C1C] animate-spin" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">מאמתים את התשלום…</h1>
        <p className="text-gray-600 mb-6">
            זה עשוי לקחת כמה שניות. אם הדף לא מתעדכן עוד דקה — שלחו לנו וואטסאפ עם מספר ההזמנה.
        </p>
        {order?.order_number && (
            <p className="text-sm font-mono text-[#380909]" dir="ltr">{order.order_number}</p>
        )}
    </div>
);

const SupportFooter = ({ orderNumber }) => (
    <div className="mt-6 grid gap-3">
        <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp}${orderNumber ? `?text=${encodeURIComponent(`שלום, יש לי שאלה על תשלום הזמנה ${orderNumber}`)}` : ''}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#1ba84e] transition-colors"
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
        <Link to="/products" className="inline-block text-sm text-gray-500 underline hover:text-[#B91C1C] mt-2 text-center">
            חזרה לקטלוג
        </Link>
    </div>
);

export default PaymentResult;
