import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    User,
    Phone,
    MapPin,
    StickyNote,
    Loader2,
    ArrowLeft,
    ShieldCheck
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import SEO from "../Shared/SEO";

const PHONE_REGEX = /^(\+?972|0)([23489]|5\d|7[2-9])[-.\s]?\d{7}$/;

const formatILS = (value) =>
    new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0
    }).format(value || 0);

// Send only id + quantity — server is authoritative for name and price.
// Anything else here would be ignored (or rejected) by the API anyway.
const buildStripeItems = (cartItems) =>
    cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity
    }));

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice } = useCart();

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address: "",
        notes: ""
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Hard guard against re-entry — survives across renders even before
    // setSubmitting flips. Belt-and-suspenders with the disabled button.
    const inFlightRef = useRef(false);

    // Empty cart guard — redirect to /products. Runs in effect so we don't
    // dispatch navigation during render. Live updates: as soon as the last
    // item is removed (e.g. from another tab / drawer), the page redirects.
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate("/products", { replace: true });
        }
    }, [cartItems.length, navigate]);

    const itemCount = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
        [cartItems]
    );

    const validate = () => {
        const errs = {};
        if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
            errs.full_name = "נא להזין שם מלא";
        }
        const phone = formData.phone.trim();
        if (!phone) {
            errs.phone = "נא להזין מספר טלפון";
        } else if (!PHONE_REGEX.test(phone)) {
            errs.phone = "מספר טלפון לא תקין — לדוגמה 050-0000000";
        }
        if (!formData.address.trim() || formData.address.trim().length < 4) {
            errs.address = "נא להזין כתובת מלאה";
        }
        return errs;
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inFlightRef.current || submitting || cartItems.length === 0) return;

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length) {
            setErrorMsg("יש למלא את כל שדות החובה לפני המשך ההזמנה.");
            return;
        }

        inFlightRef.current = true;
        setErrorMsg("");
        setSubmitting(true);

        try {
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: buildStripeItems(cartItems) })
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                console.error("checkout_session_failed", {
                    status: response.status,
                    body: data
                });
                throw new Error(data?.error || `http_${response.status}`);
            }

            if (!data?.url) {
                console.error("checkout_session_missing_url", data);
                throw new Error("missing_redirect_url");
            }

            window.location.href = data.url;
        } catch (err) {
            console.error("checkout_submit_failed", err);
            setErrorMsg(
                "משהו השתבש במעבר לתשלום. אנא נסו שוב, ואם הבעיה נמשכת — צרו קשר."
            );
            inFlightRef.current = false;
            setSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div dir="rtl" className="pt-20 pb-16 min-h-screen bg-[#FDFBF7]">
            <SEO
                title="סיום הזמנה"
                description="השלימו את ההזמנה שלכם ממאפיית מרציפן — מלאו פרטים והמשיכו לתשלום."
                url="/checkout"
            />

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h1 className="text-2xl md:text-3xl font-black text-[#380909] flex items-center gap-2">
                        <ShoppingBag className="text-[#B91C1C]" size={28} />
                        סיום הזמנה
                    </h1>
                    <Link
                        to="/products"
                        className="text-sm text-[#380909]/70 hover:text-[#B91C1C] inline-flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        המשך קנייה
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">
                    {/* LEFT — Customer form */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-7">
                        <h2 className="text-lg md:text-xl font-bold text-[#380909] mb-1">
                            פרטי לקוח
                        </h2>
                        <p className="text-sm text-gray-500 mb-5">
                            כל השדות המסומנים בכוכבית הם חובה
                        </p>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <Field
                                id="checkout-full-name"
                                label="שם מלא"
                                required
                                icon={<User size={16} className="text-[#D4AF37]" />}
                                error={fieldErrors.full_name}
                            >
                                <input
                                    id="checkout-full-name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="ישראל ישראלי"
                                    value={formData.full_name}
                                    onChange={handleChange("full_name")}
                                    className={inputCls(Boolean(fieldErrors.full_name))}
                                />
                            </Field>

                            <Field
                                id="checkout-phone"
                                label="טלפון"
                                required
                                icon={<Phone size={16} className="text-[#D4AF37]" />}
                                error={fieldErrors.phone}
                            >
                                <input
                                    id="checkout-phone"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="050-0000000"
                                    value={formData.phone}
                                    onChange={handleChange("phone")}
                                    className={inputCls(Boolean(fieldErrors.phone))}
                                />
                            </Field>

                            <Field
                                id="checkout-address"
                                label="כתובת"
                                required
                                icon={<MapPin size={16} className="text-[#D4AF37]" />}
                                error={fieldErrors.address}
                            >
                                <input
                                    id="checkout-address"
                                    type="text"
                                    autoComplete="street-address"
                                    placeholder="רחוב, מספר בית, עיר"
                                    value={formData.address}
                                    onChange={handleChange("address")}
                                    className={inputCls(Boolean(fieldErrors.address))}
                                />
                            </Field>

                            <Field
                                id="checkout-notes"
                                label="הערות (אופציונלי)"
                                icon={<StickyNote size={16} className="text-[#D4AF37]" />}
                            >
                                <textarea
                                    id="checkout-notes"
                                    rows={3}
                                    maxLength={500}
                                    placeholder="הערה למאפייה, העדפות אריזה וכו׳"
                                    value={formData.notes}
                                    onChange={handleChange("notes")}
                                    className={inputCls(false) + " resize-none"}
                                />
                            </Field>

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
                                disabled={submitting}
                                className="w-full mt-2 py-4 bg-[#B91C1C] hover:bg-[#921616] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-3 min-h-[56px] focus-visible:ring-2 focus-visible:ring-[#380909] focus-visible:ring-offset-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>מעבד הזמנה…</span>
                                    </>
                                ) : (
                                    <span>המשך להזמנה · {formatILS(totalPrice)}</span>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center leading-relaxed pt-1 flex items-center justify-center gap-1.5">
                                <ShieldCheck size={14} className="text-[#B91C1C]" />
                                הפרטים נשמרים מאובטחים ומשמשים רק לצורך ההזמנה הנוכחית.
                            </p>
                        </form>
                    </section>

                    {/* RIGHT — Order summary */}
                    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-[#380909]">
                                סיכום הזמנה
                            </h2>
                            <span className="text-sm text-gray-500">
                                {itemCount} פריטים
                            </span>
                        </div>

                        <ul className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 -mr-1">
                            {cartItems.map((item) => {
                                const lineTotal =
                                    (item.price ?? item.priceValue ?? 0) * item.quantity;
                                return (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0"
                                    >
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                loading="lazy"
                                                className="w-14 h-14 rounded-lg object-cover bg-gray-50 shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[#380909] text-sm truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatILS(item.price ?? item.priceValue ?? 0)} ×{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-bold text-[#380909] text-sm shrink-0">
                                            {formatILS(lineTotal)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>סכום ביניים</span>
                                <span>{formatILS(totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-base font-bold text-[#380909]">
                                    סה"כ לתשלום
                                </span>
                                <span className="text-2xl font-black text-[#B91C1C]">
                                    {formatILS(totalPrice)}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const Field = ({ id, label, icon, required, error, children }) => (
    <div>
        <label
            htmlFor={id}
            className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"
        >
            {icon}
            {label}
            {required && <span className="text-[#B91C1C]">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
);

const inputCls = (hasError) =>
    `w-full px-4 py-3 rounded-xl border ${
        hasError
            ? "border-red-300 focus:border-red-400 focus:ring-red-300/30"
            : "border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30"
    } focus:ring-2 outline-none transition-all placeholder-gray-400 min-h-[48px] bg-white`;

export default CheckoutPage;
