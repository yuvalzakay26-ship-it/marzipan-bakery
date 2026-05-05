import React, { useEffect, useState } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { CheckCircle2, Copy, Phone, Home } from "lucide-react";
import SEO from "../Shared/SEO";

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, []);

    if (!orderId) {
        return <Navigate to="/" replace />;
    }

    const shortId = orderId.slice(0, 8).toUpperCase();

    const copyOrderId = () => {
        navigator.clipboard?.writeText(orderId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    return (
        <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pt-32 pb-20 px-4">
            <SEO
                title="ההזמנה התקבלה"
                description="ההזמנה שלכם נקלטה במאפיית מרציפן. ניצור איתכם קשר בקרוב לאישור."
                url="/order/success"
            />
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 text-center border border-[#D4AF37]/20">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#15803D]/10 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-[#380909] mb-2">
                        ההזמנה התקבלה!
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        תודה רבה על ההזמנה. נחזור אליכם בהקדם לאישור ותיאום.
                    </p>

                    <div className="bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-2xl px-5 py-4 mb-6 inline-flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-0.5">מספר הזמנה</div>
                            <div className="font-mono font-bold text-[#380909] text-lg tracking-wide">
                                {shortId}
                            </div>
                        </div>
                        <button
                            onClick={copyOrderId}
                            className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                            aria-label="העתק מספר הזמנה"
                            title="העתק מספר הזמנה"
                        >
                            <Copy size={18} className={copied ? "text-[#15803D]" : "text-[#380909]/70"} />
                        </button>
                    </div>
                    {copied && (
                        <p className="text-xs text-[#15803D] -mt-4 mb-4">המזהה הועתק</p>
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

export default OrderSuccess;
