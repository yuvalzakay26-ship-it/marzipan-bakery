import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Flame, Users, Briefcase, Plane, ArrowLeft } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

// Conversion psychology: instead of "browse the catalog", let the customer pick
// the *reason* they're buying. Each occasion routes to a curated landing.
const OCCASIONS = [
    {
        id: 'gift',
        icon: Gift,
        eyebrow: 'מתנה ירושלמית',
        title: 'מארז מתנה',
        body: 'נארז ידנית, סגור בסרט גולד, מוכן לקחת.',
        meta: 'החל מ-₪89',
        accent: 'from-[#B91C1C] to-[#380909]',
        textOnAccent: 'text-white',
        to: '/products?occasion=gift'
    },
    {
        id: 'shabbat',
        icon: Flame,
        eyebrow: 'לערב שבת',
        title: 'מארז שבת',
        body: 'חלות מתוקות, רוגלך ובובקט פרג. שריון לערב שישי.',
        meta: 'החל מ-₪60',
        accent: 'from-[#FFF8E1] to-white',
        textOnAccent: 'text-[#380909]',
        to: '/products?occasion=shabbat'
    },
    {
        id: 'hosting',
        icon: Users,
        eyebrow: 'אירוח',
        title: 'מגש לאורחים',
        body: 'כשבאים אליכם — שיהיה מה להציע. מגוון בסגנון בית קפה ירושלמי.',
        meta: 'החל מ-₪120',
        accent: 'from-[#FFF8E1] to-white',
        textOnAccent: 'text-[#380909]',
        to: '/products?occasion=hosting'
    },
    {
        id: 'office',
        icon: Briefcase,
        eyebrow: 'B2B · משרד',
        title: 'הזמנת משרד',
        body: 'מגשים גדולים לישיבות וכנסים. חשבונית מס, משלוח מתואם, ללא הפתעות.',
        meta: 'מחיר חבר',
        accent: 'from-[#380909] to-[#1A0F0A]',
        textOnAccent: 'text-white',
        to: '/products?occasion=office'
    },
    {
        id: 'tourist',
        icon: Plane,
        eyebrow: 'תיירים',
        title: 'טעם של ירושלים',
        body: 'הרוגלך שאתם תזכרו. ארוז להוצאה מהארץ, או לאיסוף מלון.',
        meta: 'הסניפים פתוחים מ-05:00',
        accent: 'from-[#FFF8E1] to-white',
        textOnAccent: 'text-[#380909]',
        to: '/products?occasion=tourist'
    }
];

const OccasionPicker = () => {
    return (
        <section
            id="occasions"
            className="py-20 md:py-28 bg-white relative overflow-hidden"
            aria-label="לאיזה רגע אתם קונים"
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-6">

                <div className="text-center mb-12 md:mb-14">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] text-[11px] tracking-[0.34em] uppercase font-bold">
                            איך משתמשים בנו
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] leading-tight mb-4">
                        לא יודעים מה להזמין?
                        <span className="block text-[#B91C1C] mt-1">תגידו לנו לאיזה רגע.</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto leading-relaxed font-light">
                        מתנה למנהלת החדשה, אירוח של חמותכם, או סוף שבוע במלון בירושלים —
                        בחרו את ההקשר ואנחנו נציג לכם בדיוק את מה שאחרים מזמינים בשבילו.
                    </p>
                </div>

                {/* Editorial card grid: featured first, then 4 supporting */}
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {OCCASIONS.map((occ, i) => {
                        const Icon = occ.icon;
                        const isFeature = i === 0;
                        return (
                            <li
                                key={occ.id}
                                className={`${isFeature ? 'md:col-span-2 lg:row-span-2' : ''}`}
                            >
                                <Link
                                    to={occ.to}
                                    onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, { target: `occasion_${occ.id}` })}
                                    className={`group relative h-full flex flex-col justify-between rounded-3xl border ${occ.textOnAccent === 'text-white' ? 'border-[#D4AF37]/30' : 'border-[#380909]/8'} bg-gradient-to-br ${occ.accent} ${isFeature ? 'p-7 md:p-9 min-h-[340px]' : 'p-6 min-h-[220px]'} shadow-[0_18px_45px_-25px_rgba(56,9,9,0.35)] hover:shadow-[0_28px_60px_-25px_rgba(56,9,9,0.5)] transition-all hover:-translate-y-1 overflow-hidden`}
                                >
                                    {/* Subtle gold pattern on dark cards */}
                                    {occ.textOnAccent === 'text-white' && (
                                        <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                                    )}

                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${occ.textOnAccent === 'text-white' ? 'bg-white/10 text-[#D4AF37] ring-1 ring-[#D4AF37]/30' : 'bg-[#380909] text-[#D4AF37]'}`}>
                                            <Icon size={22} aria-hidden="true" />
                                        </div>
                                        <p className={`text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase mb-2 ${occ.textOnAccent === 'text-white' ? 'text-[#D4AF37]' : 'text-[#B91C1C]'}`}>
                                            {occ.eyebrow}
                                        </p>
                                        <h3 className={`font-black ${isFeature ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} leading-tight mb-3 ${occ.textOnAccent}`}>
                                            {occ.title}
                                        </h3>
                                        <p className={`leading-relaxed ${isFeature ? 'text-base md:text-lg' : 'text-sm'} ${occ.textOnAccent === 'text-white' ? 'text-white/80' : 'text-[#5D4037]'}`}>
                                            {occ.body}
                                        </p>
                                    </div>

                                    <div className={`relative mt-6 flex items-center justify-between gap-3 pt-4 border-t ${occ.textOnAccent === 'text-white' ? 'border-white/15' : 'border-[#380909]/10'}`}>
                                        <span className={`text-sm font-bold ${occ.textOnAccent === 'text-white' ? 'text-[#D4AF37]' : 'text-[#B91C1C]'}`}>
                                            {occ.meta}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${occ.textOnAccent} group-hover:gap-2.5 transition-all`}>
                                            לבחירה
                                            <ArrowLeft size={16} aria-hidden="true" />
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

            </div>
        </section>
    );
};

export default OccasionPicker;
