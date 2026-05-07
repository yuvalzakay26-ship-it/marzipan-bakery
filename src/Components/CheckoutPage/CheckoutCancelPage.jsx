import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { XCircle, ShoppingBag, Home, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";
import SEO from "../Shared/SEO";

const CheckoutCancelPage = () => {
    // Cart is intentionally NOT cleared here — Stripe sends users to this URL
    // when they back out of the hosted page, and we want them to be able to
    // resume from where they left off.
    const { cartItems, setIsCartOpen } = useCart();
    const hasCart = cartItems.length > 0;

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, []);

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO
                title="התשלום בוטל"
                description="התשלום לא הושלם. הסל שלכם נשמר — אפשר להמשיך משם."
                url="/checkout/cancel"
            />
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#D4AF37]/20">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-amber-100 flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-amber-600" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">
                        התשלום לא הושלם
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        ביטלתם את התשלום לפני סיומו — לא חויבתם.
                        {hasCart && (
                            <>
                                <br />
                                הסל שלכם נשמר ואפשר להמשיך מאותה נקודה.
                            </>
                        )}
                    </p>

                    <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-6 leading-relaxed">
                        אם נתקלתם בבעיה במהלך התשלום אנחנו כאן לעזור.
                        <br />
                        ניתן לחזור לסל ההזמנה ולנסות שוב, או ליצור איתנו קשר.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hasCart ? (
                            <>
                                <Link
                                    to="/checkout"
                                    className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#B91C1C] hover:bg-[#921616] text-white font-bold rounded-xl transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                    חזרה לסיום הזמנה
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsCartOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#380909]/20 hover:bg-gray-50 text-[#380909] font-bold rounded-xl transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                    פתיחת הסל
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#B91C1C] hover:bg-[#921616] text-white font-bold rounded-xl transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                    חזרה למוצרים
                                </Link>
                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#380909]/20 hover:bg-gray-50 text-[#380909] font-bold rounded-xl transition-colors"
                                >
                                    <Home size={18} />
                                    לעמוד הבית
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutCancelPage;
