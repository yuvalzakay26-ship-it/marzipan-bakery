import React, { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home, Phone } from "lucide-react";
import { useCart } from "../../context/CartContext";
import SEO from "../Shared/SEO";

// Stripe redirects here on completed payment with ?session_id=cs_...
// Order persistence is owned by api/stripe-webhook.js (the only authoritative
// source of "payment really happened"), so this page is intentionally
// trust-on-arrival for the cart-clearing UX — we don't re-verify the session
// here on purpose.
const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;

const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const rawSessionId = searchParams.get("session_id");
    const sessionId =
        rawSessionId && SESSION_ID_RE.test(rawSessionId) ? rawSessionId : null;

    const { clearCart } = useCart();
    const clearedRef = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, []);

    // Clear the cart only when we have a plausible Stripe session id. If the
    // user lands here without one (manual URL, refresh after clear, share link)
    // we preserve the cart so they can recover.
    useEffect(() => {
        if (clearedRef.current || !sessionId) return;
        clearedRef.current = true;
        clearCart();
    }, [sessionId, clearCart]);

    const shortRef = sessionId ? sessionId.slice(-8).toUpperCase() : null;

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO
                title="התשלום הושלם"
                description="התשלום במאפיית מרציפן הושלם בהצלחה. נחזור אליכם בהקדם לאישור ותיאום."
                url="/checkout/success"
            />
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#D4AF37]/20">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#15803D]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">
                        התשלום התקבל!
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        תודה רבה על ההזמנה במאפיית מרציפן.
                        <br />
                        נחזור אליכם בהקדם לאישור ותיאום מועד האיסוף.
                    </p>

                    {shortRef ? (
                        <div className="bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-2xl px-5 py-4 mb-6 inline-flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs text-gray-500 mb-0.5">
                                    מזהה תשלום
                                </div>
                                <div className="font-mono font-bold text-[#380909] text-lg tracking-wide">
                                    {shortRef}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-900 leading-relaxed">
                            לא הצלחנו לאתר את מזהה התשלום בכתובת.
                            <br />
                            אם ביצעתם תשלום בהצלחה — אין צורך לחזור על הפעולה,
                            אנו ניצור איתכם קשר.
                        </div>
                    )}

                    <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-6 leading-relaxed">
                        שמרו את המזהה למקרה שתרצו לפנות אלינו. ניצור קשר בטלפון
                        <br />
                        שהזנתם בהזמנה לאישור הפרטים.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#380909] hover:bg-[#5c1414] text-white font-bold rounded-xl transition-colors"
                        >
                            <Home size={18} />
                            לעמוד הבית
                        </Link>
                        <a
                            href="tel:+97226232594"
                            className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#380909]/20 hover:bg-gray-50 text-[#380909] font-bold rounded-xl transition-colors"
                        >
                            <Phone size={18} />
                            יצירת קשר
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
