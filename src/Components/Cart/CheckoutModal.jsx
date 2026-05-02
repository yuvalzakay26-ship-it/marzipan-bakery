import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Send,
    ShoppingBag,
    MapPin,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    StickyNote,
    ShieldCheck,
    MessageCircle,
    Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { BRANCHES, CONTACT_INFO, TRUST_SIGNALS } from '../../data/siteContent';
import { placeOrder } from '../../lib/commerce/orders';
import { isBackendEnabled } from '../../lib/supabase/client';
import { formatAgorot, cartSubtotalAgorot } from '../../lib/commerce/pricing';
import { rememberContact, getRememberedContact } from '../../lib/customer/session';
import { trackAbandonedCheckout } from '../../lib/customer/abandoned';
import { getOpenSlots, ilDateIso, describeSlotIssue } from '../../lib/commerce/slots';
import { startPaymentSession, isPaymentsEnabled } from '../../lib/payments/session';

/** yyyy-mm-dd in Asia/Jerusalem. Used as <input type="date"> min + default. */
const todayIso = () => ilDateIso();

/** Stable idempotency key for the lifetime of the modal mount. */
function newIdempotencyKey() {
    return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const CheckoutModal = ({ isOpen, onClose }) => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const backendOn = isBackendEnabled();

    const totalAgorot = useMemo(() => cartSubtotalAgorot(cartItems), [cartItems]);
    const idempotencyKey = useMemo(newIdempotencyKey, []);
    const paymentsOn = isPaymentsEnabled();

    const remembered = useMemo(() => getRememberedContact(), []);
    const wasRemembered = Boolean(remembered.name && remembered.phone);

    const [formData, setFormData] = useState(() => ({
        name: remembered.name || '',
        phone: remembered.phone || '',
        email: remembered.email || '',
        branchId: BRANCHES[0]?.id || '',
        branch: BRANCHES[0]?.name || '',
        pickupDate: todayIso(),
        pickupTime: '',
        notes: ''
    }));
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    // True once a real submit succeeds — suppresses the abandoned beacon on
    // unmount because the order itself supersedes the cart-abandoned signal.
    const submittedRef = useRef(false);

    // Fire the abandoned-checkout beacon when the modal closes without a
    // submit AND we have a phone we trust (typed by the user, normalized).
    useEffect(() => {
        return () => {
            if (submittedRef.current) return;
            const phone = formData?.phone?.trim();
            if (!phone || !cartItems?.length) return;
            // Don't await — beacon is fire-and-forget.
            trackAbandonedCheckout({
                phone,
                name: formData.name,
                items: cartItems,
                totalAgorot,
                branchId: formData.branchId
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Body scroll-lock + Escape-to-close while the modal is mounted-and-open.
    // Suppressed during submit so an accidental Escape can't abort an in-flight
    // place-order request.
    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => {
            if (e.key === 'Escape' && !submitting) onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [isOpen, submitting, onClose]);

    if (!isOpen) return null;

    const branches = BRANCHES;

    // Slot list is recomputed for the chosen (branch, date). Filters out
    // closed days, Saturday, Friday-after-15:00, and slots in the past.
    const selectedBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const openSlots = getOpenSlots(selectedBranch, formData.pickupDate);
    const branchClosedToday = openSlots.length === 0;

    /** Light client-side validation. Server validates again with Zod. */
    const validate = () => {
        const errs = {};
        if (!formData.name || formData.name.trim().length < 2) errs.name = 'שם קצר מדי';
        if (!/^(\+?972|0)([23489]|5\d|7[2-9])[-.\s]?\d{7}$/.test(formData.phone)) errs.phone = 'מספר טלפון לא תקין';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'כתובת מייל לא תקינה';
        if (!formData.branchId) errs.branchId = 'בחרו סניף';
        const slotMsg = formData.pickupTime
            ? describeSlotIssue(selectedBranch, formData.pickupDate, formData.pickupTime)
            : null;
        if (slotMsg) errs.pickupTime = slotMsg;
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || cartItems.length === 0) return;

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length) return;

        setErrorMsg('');
        setSubmitting(true);

        // Track event (preserves existing analytics behavior).
        import('../../utils/analytics').then(({ trackEvent, ANALYTICS_EVENTS }) => {
            trackEvent(ANALYTICS_EVENTS.WHATSAPP_ORDER_CLICK, {
                value: totalAgorot,
                currency: 'ILS',
                items_count: cartItems.length,
                branch: formData.branch,
                pickup_time: formData.pickupTime || 'asap',
                channel: backendOn ? 'web' : 'whatsapp'
            });
        });

        rememberContact({
            name: formData.name,
            phone: formData.phone,
            email: formData.email
        });

        // Persist a snapshot for the reorder prompt regardless of which path runs.
        try {
            localStorage.setItem(
                'marzipanLastOrder',
                JSON.stringify({
                    items: cartItems.map((i) => ({ id: i.id, quantity: i.quantity })),
                    total: totalAgorot,
                    branch: formData.branch,
                    at: Date.now()
                })
            );
        } catch { /* storage unavailable — non-fatal */ }

        try {
            const result = await placeOrder({
                contact: {
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || undefined
                },
                branchId: formData.branchId,
                branchName: formData.branch,
                items: cartItems.map((i) => ({
                    id: i.id,
                    productId: i.supabaseId,
                    name: i.name,
                    quantity: i.quantity,
                    priceValue: i.priceValue,
                    priceAgorot: i.priceAgorot
                })),
                pickupDate: formData.pickupTime ? formData.pickupDate : undefined,
                pickupTime: formData.pickupTime || undefined,
                pickupTimeText: formData.pickupTime ? undefined : 'בהקדם האפשרי',
                fulfillment: 'pickup',
                notes: formData.notes.trim() || undefined,
                idempotencyKey
            });

            if (result.mode === 'backend') {
                submittedRef.current = true;
                clearCart();
                onClose();

                // Online payment path — redirect to the PSP's hosted page.
                // The PSP later posts to payment-webhook; the PaymentResult
                // page polls until the order's payment_status flips to a
                // terminal state, then sends the user to /order/confirmation.
                if (paymentsOn) {
                    try {
                        const session = await startPaymentSession({ orderId: result.orderId });
                        window.location.href = session.redirectUrl;
                        return;
                    } catch (sessionErr) {
                        console.error('payment_session_failed', sessionErr);
                        // Fall through to confirmation; admin will follow up
                        // for payment manually rather than block the flow.
                    }
                }

                navigate(
                    `/order/confirmation?orderId=${encodeURIComponent(result.orderId)}` +
                    `&orderNumber=${encodeURIComponent(result.orderNumber)}`
                );
            } else {
                // WhatsApp fallback — keep existing behavior verbatim.
                submittedRef.current = true;
                window.open(result.whatsappUrl, '_blank');
                onClose();
            }
        } catch (err) {
            console.error('place_order_failed', err);
            // err.fields is a flat {path: msg} object from Zod when validation
            // failed on the client; surface the first one.
            if (err?.fields) {
                setFieldErrors(err.fields);
                setErrorMsg(Object.values(err.fields)[0]);
            } else {
                const msg = err?.message;
                setErrorMsg(
                    msg === 'rate_limited'      ? 'הרבה ניסיונות בזמן קצר — נסו שוב בעוד דקה.' :
                    msg === 'product_sold_out'  ? 'אחד הפריטים בסל אזל היום.' :
                    msg === 'invalid_phone'     ? 'מספר הטלפון לא תקין.' :
                    msg === 'invalid_branch'    ? 'הסניף שבחרתם אינו זמין כרגע.' :
                    'משהו השתבש בשליחה. אפשר לנסות שוב או לפנות בוואטסאפ.'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md relative z-10 overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="bg-[#B91C1C] p-5 md:p-6 text-white text-center relative shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 left-3 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="סגור"
                    >
                        <X size={20} />
                    </button>
                    <ShoppingBag className="mx-auto w-10 h-10 md:w-12 md:h-12 mb-2 drop-shadow-md" />
                    <h2 id="checkout-title" className="text-xl md:text-2xl font-black">סיום הזמנה</h2>
                    <p className="text-white/85 text-xs md:text-sm mt-1">
                        {backendOn
                            ? 'מלאו פרטים ושלחו — תקבלו מספר הזמנה לאישור'
                            : 'מלאו פרטים ושלחו — נחזור לאישור הזמנה'}
                    </p>
                </div>

                {/* Trust strip */}
                <div className="px-5 md:px-6 py-3 bg-[#FFF8E1] border-b border-[#D4AF37]/30 shrink-0">
                    <div className="flex items-center justify-center gap-2 text-[#380909]">
                        <ShieldCheck size={16} className="text-[#B91C1C] shrink-0" />
                        <p className="text-xs md:text-sm font-medium leading-tight">
                            {TRUST_SIGNALS.secureOrder}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* Remembered-contact welcome pill — only when we have prior contact */}
                        {wasRemembered && (
                            <div className="bg-[#FFF8E1] border border-[#D4AF37]/40 rounded-xl px-3 py-2.5 text-xs md:text-sm text-[#380909] flex items-center justify-between gap-3">
                                <span className="leading-snug">
                                    ברוך שובך{remembered.name ? `, ${remembered.name.split(' ')[0]}` : ''} —
                                    הפרטים מילאו את עצמם. עדכנו אם משהו השתנה.
                                </span>
                            </div>
                        )}

                        {/* Order summary */}
                        <section className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3">
                            <div className="text-xs font-bold text-gray-500 mb-2">פירוט הזמנה</div>
                            <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {cartItems.map((it) => {
                                    const lineAgorot = (it.priceAgorot ?? Math.round((it.priceValue ?? 0) * 100)) * it.quantity;
                                    return (
                                        <li key={it.id} className="flex items-center justify-between text-sm">
                                            <span className="truncate ml-2">
                                                <span className="font-medium text-[#380909]">{it.name}</span>
                                                <span className="text-gray-500"> × {it.quantity}</span>
                                            </span>
                                            <span className="font-bold text-[#380909] shrink-0">
                                                {formatAgorot(lineAgorot)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-600">סה"כ לתשלום</span>
                                <span className="text-lg font-black text-[#B91C1C]">
                                    {formatAgorot(totalAgorot)}
                                </span>
                            </div>
                        </section>

                        <Field
                            id="checkout-name"
                            label="שם מלא"
                            icon={<User size={16} className="text-[#D4AF37]" />}
                            error={fieldErrors['contact.name'] || fieldErrors.name}
                        >
                            <input
                                id="checkout-name"
                                type="text"
                                required
                                autoComplete="name"
                                className={inputCls(fieldErrors['contact.name'] || fieldErrors.name)}
                                placeholder="ישראל ישראלי"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Field>

                        <Field
                            id="checkout-phone"
                            label="טלפון"
                            icon={<Phone size={16} className="text-[#D4AF37]" />}
                            error={fieldErrors['contact.phone'] || fieldErrors.phone}
                        >
                            <input
                                id="checkout-phone"
                                type="tel"
                                required
                                inputMode="tel"
                                autoComplete="tel"
                                pattern="^0(5\d|[2-489])-?\d{7}$"
                                className={inputCls(fieldErrors['contact.phone'] || fieldErrors.phone)}
                                placeholder="050-0000000"
                                value={formData.phone}
                                onChange={(e) => {
                                    setFormData({ ...formData, phone: e.target.value });
                                    // Clear stale error as the user types
                                    if (fieldErrors.phone || fieldErrors['contact.phone']) {
                                        setFieldErrors((prev) => ({ ...prev, phone: undefined, 'contact.phone': undefined }));
                                    }
                                }}
                                onBlur={(e) => {
                                    const v = e.target.value.trim();
                                    if (!v) return;
                                    if (!/^(\+?972|0)([23489]|5\d|7[2-9])[-.\s]?\d{7}$/.test(v)) {
                                        setFieldErrors((prev) => ({ ...prev, phone: 'מספר טלפון לא תקין — לדוגמה 050-0000000' }));
                                    }
                                }}
                            />
                        </Field>

                        <Field
                            id="checkout-email"
                            label="מייל (אופציונלי)"
                            icon={<Mail size={16} className="text-[#D4AF37]" />}
                            error={fieldErrors['contact.email'] || fieldErrors.email}
                        >
                            <input
                                id="checkout-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                className={inputCls(fieldErrors['contact.email'] || fieldErrors.email)}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Field>

                        <Field
                            id="checkout-branch"
                            label="סניף איסוף"
                            icon={<MapPin size={16} className="text-[#D4AF37]" />}
                            error={fieldErrors.branchId}
                        >
                            <select
                                id="checkout-branch"
                                className={selectCls(fieldErrors.branchId)}
                                value={formData.branchId}
                                onChange={(e) => {
                                    const b = branches.find((x) => x.id === e.target.value);
                                    setFormData({ ...formData, branchId: e.target.value, branch: b?.name || '' });
                                }}
                            >
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                id="checkout-date"
                                label="תאריך איסוף"
                                icon={<Calendar size={16} className="text-[#D4AF37]" />}
                            >
                                <input
                                    id="checkout-date"
                                    type="date"
                                    min={todayIso()}
                                    className={inputCls(false)}
                                    value={formData.pickupDate}
                                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                                />
                            </Field>

                            <Field
                                id="checkout-time"
                                label="שעת איסוף"
                                icon={<Clock size={16} className="text-[#D4AF37]" />}
                                error={fieldErrors.pickupTime || (branchClosedToday ? 'הסניף סגור ביום זה' : null)}
                            >
                                <select
                                    id="checkout-time"
                                    className={selectCls(Boolean(fieldErrors.pickupTime) || branchClosedToday)}
                                    value={formData.pickupTime}
                                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                                    disabled={branchClosedToday}
                                >
                                    <option value="">{branchClosedToday ? 'אין שעות פעילות ביום זה' : 'בהקדם האפשרי'}</option>
                                    {openSlots.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field
                            id="checkout-notes"
                            label="הערה למאפייה (אופציונלי)"
                            icon={<StickyNote size={16} className="text-[#D4AF37]" />}
                        >
                            <textarea
                                id="checkout-notes"
                                rows={2}
                                maxLength={500}
                                className={inputCls(false) + ' resize-none'}
                                placeholder="לדוגמה: בלי אגוזים, אריזת מתנה..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Field>

                        {/* Response indicator */}
                        <div className="flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl px-3 py-2.5 text-sm text-[#155b2a]">
                            <MessageCircle size={16} className="text-[#25D366] shrink-0" />
                            <p className="leading-snug">
                                {paymentsOn
                                    ? <>תועברו לתשלום מאובטח. ההזמנה תאושר אוטומטית כשהתשלום יושלם.</>
                                    : backendOn
                                        ? <>נחזור אליכם לאישור ההזמנה <strong>תוך {CONTACT_INFO.whatsappResponseMinutes} דקות</strong>.</>
                                        : <>מענה ממוצע בוואטסאפ: <strong>תוך {CONTACT_INFO.whatsappResponseMinutes} דקות</strong>.</>
                                }
                            </p>
                        </div>

                        {errorMsg && (
                            <div
                                role="alert"
                                className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-3 py-2.5 text-sm"
                            >
                                {errorMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || cartItems.length === 0 || branchClosedToday}
                            className="w-full py-4 bg-[#B91C1C] hover:bg-[#921616] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg md:text-xl rounded-xl shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3 min-h-[56px] focus-visible:ring-2 focus-visible:ring-[#380909] focus-visible:ring-offset-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>{paymentsOn ? 'מעבר לתשלום…' : 'שולח…'}</span>
                                </>
                            ) : (
                                <>
                                    <span>
                                        {paymentsOn
                                            ? `המשך לתשלום · ${formatAgorot(totalAgorot)}`
                                            : `שלחו הזמנה · ${formatAgorot(totalAgorot)}`}
                                    </span>
                                    <Send size={20} />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center leading-relaxed pt-1">
                            בלחיצה על הכפתור אתם מאשרים את{' '}
                            <a href="/terms" className="underline hover:text-[#B91C1C]">תנאי השימוש</a>
                            {' '}ואת{' '}
                            <a href="/privacy" className="underline hover:text-[#B91C1C]">מדיניות הפרטיות</a>.
                            {paymentsOn
                                ? ' התשלום מתבצע בעמוד מאובטח של ספק הסליקה.'
                                : ' תשלום מתבצע רק לאחר אישור ההזמנה אישית.'}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Field = ({ id, label, icon, error, children }) => (
    <div>
        <label htmlFor={id} className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            {icon}{label}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
);

const inputCls = (hasError) =>
    `w-full px-4 py-3 rounded-xl border ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-300/30' : 'border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30'} focus:ring-2 outline-none transition-all placeholder-gray-400 min-h-[48px]`;

const selectCls = (hasError) => inputCls(hasError) + ' bg-white';

export default CheckoutModal;
