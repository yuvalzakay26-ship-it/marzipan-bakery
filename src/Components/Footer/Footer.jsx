import React from "react";
import {
    Facebook,
    Instagram,
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    ArrowLeft,
    ShieldCheck,
    Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    CONTACT_INFO,
    SOCIAL_LINKS,
    BUSINESS_INFO,
    BRANCHES
} from "../../data/siteContent";

const navColumn = [
    { to: "/", label: "עמוד הבית" },
    { to: "/about", label: "הסיפור שלנו" },
    { to: "/products", label: "הקטלוג המלא" },
    { to: "/branches", label: "סניפים" },
    { to: "/contact", label: "יצירת קשר" }
];

const legalColumn = [
    { to: "/terms", label: "תנאי שימוש" },
    { to: "/privacy", label: "מדיניות פרטיות" },
    { to: "/accessibility", label: "הצהרת נגישות" }
];

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const yearsActive = currentYear - BUSINESS_INFO.foundedYear;

    return (
        <footer
            className="bg-[#380909] text-red-50/90 font-light border-t-4 border-[#D4AF37] relative z-40"
            aria-label="כותרת תחתונה"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-right">

                    {/* Column 1 — Brand */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-wide">
                                {BUSINESS_INFO.tradeName}
                            </h2>
                            <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-bold mt-1">
                                המסורת של ירושלים · מאז {BUSINESS_INFO.foundedYear}
                            </p>
                        </div>
                        <p className="leading-relaxed text-red-100/80 text-sm">
                            כבר {yearsActive} שנה אנחנו אופים את הרוגלך, החלות והעוגות שמלוות את שולחן השבת של דורות של ירושלמים.
                            איכות, כשרות ואהבה — בכל ביס.
                        </p>

                        {/* Kosher badge */}
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-[#D4AF37]/30 px-3 py-2 rounded-lg">
                            <ShieldCheck size={18} className="text-[#D4AF37] shrink-0" />
                            <div className="leading-tight">
                                <p className="text-white text-sm font-bold">{BUSINESS_INFO.kashrutShort}</p>
                                <p className="text-red-100/60 text-xs">{BUSINESS_INFO.kashrut}</p>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href={SOCIAL_LINKS.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="פייסבוק"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-transparent flex items-center justify-center transition-colors text-white"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href={SOCIAL_LINKS.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="אינסטגרם"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E4405F] border border-white/10 hover:border-transparent flex items-center justify-center transition-colors text-white"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="וואטסאפ"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#25D366] border border-white/10 hover:border-transparent flex items-center justify-center transition-colors text-white"
                            >
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 — Navigation */}
                    <nav aria-label="ניווט תחתון" className="space-y-5">
                        <h3 className="text-lg font-bold text-white relative inline-block">
                            ניווט
                            <span className="absolute -bottom-2 right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
                        </h3>
                        <ul className="space-y-2.5">
                            {navColumn.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="inline-flex items-center gap-2 text-red-100 hover:text-[#D4AF37] transition-colors min-h-[32px]"
                                    >
                                        <ArrowLeft size={14} className="text-[#D4AF37]/60" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-lg font-bold text-white relative inline-block pt-3">
                            מידע משפטי
                            <span className="absolute -bottom-2 right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
                        </h3>
                        <ul className="space-y-2.5">
                            {legalColumn.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="inline-flex items-center gap-2 text-red-100 hover:text-[#D4AF37] transition-colors min-h-[32px]"
                                    >
                                        <ArrowLeft size={14} className="text-[#D4AF37]/60" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Column 3 — Contact */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-white relative inline-block">
                            יצירת קשר
                            <span className="absolute -bottom-2 right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#D4AF37] shrink-0 mt-1" />
                                <div>
                                    <p className="text-white font-bold mb-0.5">סניף הדגל</p>
                                    <p className="text-red-100/80 leading-snug">{CONTACT_INFO.address}</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-[#D4AF37] shrink-0" />
                                <a
                                    href={`tel:${CONTACT_INFO.phoneTel}`}
                                    className="text-red-100 hover:text-[#D4AF37] transition-colors min-h-[32px] flex items-center"
                                    dir="ltr"
                                >
                                    {CONTACT_INFO.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MessageCircle size={18} className="text-[#25D366] shrink-0" />
                                <a
                                    href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-100 hover:text-[#25D366] transition-colors min-h-[32px] flex items-center"
                                    dir="ltr"
                                >
                                    {CONTACT_INFO.whatsappDisplay}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                                <a
                                    href={`mailto:${CONTACT_INFO.email}`}
                                    className="text-red-100 hover:text-[#D4AF37] transition-colors break-all min-h-[32px] flex items-center"
                                >
                                    {CONTACT_INFO.email}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 — Hours */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-white relative inline-block">
                            שעות פעילות
                            <span className="absolute -bottom-2 right-0 w-10 h-0.5 bg-[#D4AF37]"></span>
                        </h3>
                        <div className="bg-black/20 p-5 rounded-xl border border-white/5 text-sm">
                            <div className="flex items-center gap-2 text-[#D4AF37] mb-3 pb-3 border-b border-white/10">
                                <Clock size={16} />
                                <span className="font-bold uppercase tracking-wider text-xs">סניף השוק</span>
                            </div>
                            <ul className="space-y-2.5">
                                <li className="flex justify-between gap-2">
                                    <span className="text-red-200">א'-ה'</span>
                                    <span className="text-white font-bold tabular-nums" dir="ltr">05:00–23:30</span>
                                </li>
                                <li className="flex justify-between gap-2">
                                    <span className="text-red-200">ו' וערבי חג</span>
                                    <span className="text-white font-bold tabular-nums" dir="ltr">05:00–15:00</span>
                                </li>
                                <li className="flex justify-between gap-2">
                                    <span className="text-red-200">שבת</span>
                                    <span className="text-red-100/70">סגור</span>
                                </li>
                            </ul>
                        </div>
                        <Link
                            to="/branches"
                            className="block text-center px-5 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#380909] transition-colors rounded-full text-sm font-bold uppercase tracking-wider"
                        >
                            כל הסניפים ושעות הפעילות
                        </Link>
                    </div>
                </div>
            </div>

            {/* Business identification + copyright */}
            <div className="border-t border-white/10 bg-[#1A0F0A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs md:text-sm text-red-200/60">
                    <div className="text-center md:text-right space-y-1">
                        <p>
                            © {currentYear} {BUSINESS_INFO.legalName}. כל הזכויות שמורות.
                        </p>
                        <p className="text-red-200/40">
                            פעיל משנת {BUSINESS_INFO.foundedYear} · {BRANCHES.length} סניפים בירושלים · {BUSINESS_INFO.kashrutShort}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2">
                        <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">תנאי שימוש</Link>
                        <span className="text-white/10" aria-hidden="true">|</span>
                        <Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">פרטיות</Link>
                        <span className="text-white/10" aria-hidden="true">|</span>
                        <Link to="/accessibility" className="hover:text-[#D4AF37] transition-colors">נגישות</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
