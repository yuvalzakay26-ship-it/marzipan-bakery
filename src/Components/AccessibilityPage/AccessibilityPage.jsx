import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle, Smartphone, Eye, MousePointer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO, BUSINESS_INFO } from '../../data/siteContent';

import SEO from "../Shared/SEO";

const AccessibilityPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 md:pt-40 pb-20 font-sans" dir="rtl">
            <SEO
                title="הצהרת נגישות"
                description="הצהרת הנגישות של מאפיית מרציפן. אנו מחויבים להנגשת האתר והסניפים לכלל הלקוחות."
                url="/accessibility"
            />
            <div className="max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-[#380909] mb-6 drop-shadow-sm">הצהרת נגישות</h1>
                    <div className="w-24 h-1.5 bg-[#D4AF37] mx-auto rounded-full mb-8 shadow-sm"></div>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        מאפיית מרציפן רואה חשיבות עליונה בהנגשת אתר האינטרנט שלה לאנשים עם מוגבלויות, מתוך אמונה כי לכל אדם מגיעה הזכות לחיות בכבוד, שוויון, נוחות ועצמאות.
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEE2E2] rounded-bl-full opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFF8E1] rounded-tr-full opacity-50 pointer-events-none"></div>

                    {/* Status Section */}
                    <div className="bg-gradient-to-l from-[#FFF8E1] to-white p-8 border-b border-[#D4AF37]/20 relative z-10">
                        <div className="flex items-start gap-5">
                            <div className="bg-white p-3 rounded-full shadow-sm border border-[#D4AF37]/20">
                                <CheckCircle className="text-[#2E7D32]" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#380909] mb-3">רמת הנגישות באתר</h2>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    אתר זה עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013.
                                    ההתאמות בוצעו עפ"י המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA ומסמך WCAG2.0 הבינלאומי.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-12 relative z-10">

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Visual Card */}
                            <div className="group bg-gray-50 hover:bg-white p-8 rounded-2xl border border-transparent hover:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-default">
                                <div className="flex items-center gap-4 text-[#B91C1C] mb-6">
                                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500 border border-gray-100">
                                        <Eye size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black group-hover:text-[#380909] transition-colors">התאמות חזותיות</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "תמיכה בהגדלת טקסט ללא פגיעה בעיצוב",
                                        "ניגודיות צבעים תקנית",
                                        "מבנה כותרות היררכי ברור",
                                        "הדגשת קישורים בעת מעבר עכבר"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-600 group-hover:text-gray-800 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] group-hover:scale-150 transition-transform"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Navigation Card */}
                            <div className="group bg-gray-50 hover:bg-white p-8 rounded-2xl border border-transparent hover:border-[#D4AF37]/30 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-default">
                                <div className="flex items-center gap-4 text-[#B91C1C] mb-6">
                                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500 border border-gray-100">
                                        <MousePointer size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black group-hover:text-[#380909] transition-colors">ניווט ותפעול</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "תמיכה בניווט מקלדת מלא",
                                        "פוקוס ברור על אלמנטים נבחרים",
                                        "היררכיית מסמך סמנטית (HTML5)",
                                        "טפסים נגישים עם תוויות ברורות"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-600 group-hover:text-gray-800 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] group-hover:scale-150 transition-transform"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Mobile & Compatibility */}
                        <div className="group p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 hover:border-[#D4AF37] transition-all duration-300 relative overflow-hidden cursor-default">
                            <div className="flex items-center gap-4 text-[#380909] mb-4 relative z-10">
                                <Smartphone size={28} className="group-hover:rotate-12 transition-transform duration-300 text-[#D4AF37]" />
                                <h3 className="text-xl font-bold">תאימות דפדפנים ומובייל</h3>
                            </div>
                            <p className="text-gray-600 mb-2 relative z-10 leading-relaxed">
                                האתר נבדק ומותאם לתצוגה במרבית הדפדפנים הנפוצים (Chrome, Firefox, Edge, Safari) וכן מותאם לשימוש במכשירים ניידים (רספונסיביות).
                            </p>
                            <p className="text-gray-800 font-bold relative z-10">
                                האתר מספק תמיכה בתוכנות קוראות מסך מסוג NVDA בצירוף דפדפן Chrome.
                            </p>
                            <div className="absolute top-0 right-0 w-full h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>

                        {/* Coordinator Contact */}
                        <div className="border-t border-gray-200 pt-10">
                            <h2 className="text-3xl font-black text-[#380909] mb-4">נתקלתם בבעיה?</h2>
                            <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
                                על אף מאמצינו להנגיש את כלל הדפים באתר, ייתכן ויתגלו חלקים שטרם הונגשו.
                                נשמח לקבל מכם משוב ואנו נדאג לטפל בפנייה בהקדם האפשרי.
                            </p>

                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full md:max-w-lg">
                                <h4 className="text-base md:text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">פרטי רכז/ת נגישות</h4>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <span className="font-medium text-gray-500">שם:</span>
                                        <span className="text-base md:text-lg font-bold text-gray-800">שירות לקוחות {BUSINESS_INFO.tradeName}</span>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <span className="font-medium text-gray-500">טלפון:</span>
                                        <a href={`tel:${CONTACT_INFO.phoneTel}`} className="text-base md:text-lg font-bold text-[#B91C1C] hover:text-[#D4AF37] transition-colors" dir="ltr">{CONTACT_INFO.phone}</a>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <span className="font-medium text-gray-500">וואטסאפ:</span>
                                        <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noreferrer" className="text-base md:text-lg font-bold text-[#25D366] hover:text-[#380909] transition-colors" dir="ltr">{CONTACT_INFO.whatsappDisplay}</a>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <span className="font-medium text-gray-500">אימייל:</span>
                                        <a href={`mailto:${CONTACT_INFO.email}`} className="text-base md:text-lg font-bold text-[#B91C1C] hover:text-[#D4AF37] transition-colors break-all">{CONTACT_INFO.email}</a>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-start gap-2 pt-2 border-t border-gray-50">
                                        <span className="font-medium text-gray-500">זמן מענה:</span>
                                        <span className="text-sm md:text-base text-gray-700 text-left">תוך 7 ימי עסקים</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Date */}
                        <div className="text-sm text-gray-400 text-left pt-4">
                            עודכן לאחרונה: אפריל 2026
                        </div>

                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-12 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] font-bold hover:text-[#B91C1C] transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        חזרה לעמוד הבית
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityPage;
