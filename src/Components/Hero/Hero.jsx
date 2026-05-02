import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck, Flame } from "lucide-react";
import HeroImage from "../../assets/OwnersHero.jpg";
import { CONTACT_INFO, SOCIAL_PROOF } from "../../data/siteContent";
import { trackEvent, ANALYTICS_EVENTS } from "../../utils/analytics";

const Hero = () => {
    const yearsActive = SOCIAL_PROOF.yearsActive();

    return (
        <section
            className="relative min-h-[100svh] flex items-center bg-[#FDFBF7] overflow-hidden pt-24 lg:pt-24 pb-16 lg:pb-20"
            aria-label="מאפיית מרציפן — הטעם של ירושלים"
        >
            {/* Cream-to-bone wash + single warm vignette */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-bl from-[#FDFBF7] via-[#FAF6EE] to-[#F4ECDC]" />
                <div className="absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 w-full">

                {/* Editorial copy block — first on mobile, right on desktop */}
                <div className="lg:col-span-7 order-1 lg:order-1 text-center lg:text-right flex flex-col items-center lg:items-start">

                    {/* Eyebrow — Google rating, links to the live profile so any visitor can verify */}
                    <a
                        href={SOCIAL_PROOF.googleProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 mb-5 sm:mb-7 px-3.5 py-1.5 rounded-full bg-white/70 border border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-sm backdrop-blur-sm animate-fade-in-up transition-colors"
                    >
                        <span className="flex items-center gap-0.5" aria-hidden="true">
                            {[0,1,2,3,4].map(i => (
                                <Star key={i} size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
                            ))}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#380909] tracking-wide">
                            {SOCIAL_PROOF.googleRating} בגוגל
                        </span>
                        <span className="w-px h-3 bg-[#380909]/15" aria-hidden="true"></span>
                        <span className="text-[11px] sm:text-xs font-medium text-[#5D4037]">
                            ראו בגוגל
                        </span>
                    </a>

                    {/* Display headline — concrete + emotional, three-beat rhythm */}
                    <h1 className="font-black text-[#2D211E] leading-[0.95] tracking-tight mb-6 animate-fade-in-up delay-100">
                        <span className="block text-[2.6rem] sm:text-6xl lg:text-7xl">הטעם</span>
                        <span className="block text-[2.6rem] sm:text-6xl lg:text-7xl">שירושלים נשבעת בו</span>
                        <span className="block text-[2.6rem] sm:text-6xl lg:text-7xl mt-1">
                            <span className="relative inline-block">
                                <span className="relative z-10 text-[#B91C1C]">מאז 1986</span>
                                <span className="absolute inset-x-0 bottom-1 h-[8px] bg-[#D4AF37]/40 rounded-full -z-0" aria-hidden="true"></span>
                            </span>
                        </span>
                    </h1>

                    {/* Subline — sensory + concrete, one breath */}
                    <p className="text-base sm:text-lg lg:text-xl text-[#5D4037] mb-8 max-w-xl leading-relaxed font-light animate-fade-in-up delay-200">
                        רוגלך חמים מהתנור משעה <span className="font-semibold text-[#380909]">05:00 בבוקר</span>,
                        חלות מתוקות לערב שבת, ומאפים שנעשים בעבודת יד —
                        <span className="font-semibold text-[#380909]"> ארבעה עשורים בלב שוק מחנה יהודה.</span>
                    </p>

                    {/* Primary CTA + WhatsApp — gold-accented, magnetic */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto animate-fade-in-up delay-300">
                        <Link
                            to="/products"
                            onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, { target: 'catalog' })}
                            className="group relative overflow-hidden bg-[#380909] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_20px_42px_-12px_rgba(56,9,9,0.6)] hover:shadow-[0_26px_50px_-12px_rgba(56,9,9,0.78)] hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-[#D4AF37]/50 min-h-[58px]"
                        >
                            <span className="relative z-10">הזמינו מארז חתום</span>
                            <ArrowLeft size={18} className="relative z-10 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent skew-x-12 pointer-events-none" />
                        </Link>
                        <a
                            href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('היי! אני רוצה להתייעץ על הזמנה מהמאפייה 🥐')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, { target: 'whatsapp' })}
                            className="group bg-white text-[#380909] border border-[#380909]/15 px-7 py-4 rounded-full font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-sm hover:shadow-lg hover:border-[#D4AF37]/60 transition-all duration-300 hover:-translate-y-0.5 min-h-[58px]"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_0_4px_rgba(37,211,102,0.18)]" aria-hidden="true"></span>
                            <span>שיחה ישירה בוואטסאפ</span>
                        </a>
                    </div>

                    {/* Reassurance micro-line — directly under CTAs, low-key */}
                    <p className="mt-3.5 text-[12px] sm:text-[13px] text-[#5D4037]/80 animate-fade-in-up delay-300">
                        אישור אישי לפני חיוב · מענה תוך {CONTACT_INFO.whatsappResponseMinutes} דקות
                    </p>

                    {/* Integrated trust strip — two anchors with icons, premium silence */}
                    <ul className="mt-9 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm text-[#5D4037] animate-fade-in-up delay-400">
                        <li className="flex items-center gap-2">
                            <ShieldCheck size={15} className="text-[#B91C1C]" aria-hidden="true" />
                            <span className="font-bold text-[#380909]">כשרות בד״ץ</span>
                            <span className="text-[#5D4037]/70">העדה החרדית</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Flame size={15} className="text-[#D4AF37]" aria-hidden="true" />
                            <span className="font-bold text-[#380909]">{yearsActive}+ שנות אפייה</span>
                            <span className="text-[#5D4037]/70">· 3 סניפים</span>
                        </li>
                    </ul>
                </div>

                {/* Editorial photo block — second on mobile so headline lands first */}
                <div className="lg:col-span-5 order-2 lg:order-2 relative animate-fade-in-up">
                    <div className="relative">
                        {/* Gold frame */}
                        <div className="absolute -inset-2 sm:-inset-3 border border-[#D4AF37]/40 rounded-[2.25rem] pointer-events-none" aria-hidden="true"></div>

                        <div className="relative rounded-[2rem] overflow-hidden shadow-[0_30px_70px_-20px_rgba(56,9,9,0.45)] border-2 border-white">
                            <img
                                src={HeroImage}
                                alt="מגש רוגלך שוקולד חמים מהתנור במאפיית מרציפן, שוק מחנה יהודה ירושלים"
                                fetchPriority="high"
                                decoding="async"
                                width="900"
                                height="1100"
                                className="w-full h-[360px] sm:h-[500px] lg:h-[560px] object-cover"
                            />
                            {/* Warm overlay for color cohesion */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#380909]/40 via-transparent to-transparent pointer-events-none"></div>

                            {/* "Signature" plaque — anchored bottom */}
                            <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:right-5 sm:bottom-5">
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-[#D4AF37]/30 flex items-center gap-3">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white font-black text-sm">
                                        מ
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#B91C1C]">
                                            המאפה האייקוני
                                        </p>
                                        <p className="text-sm sm:text-base font-black text-[#380909] leading-tight">
                                            רוגלך שוקולד · אגדה ירושלמית
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating "since 1986" stamp */}
                        <div className="hidden sm:flex absolute -top-5 -right-5 lg:-right-7 w-24 h-24 rounded-full bg-[#380909] text-white items-center justify-center shadow-2xl ring-4 ring-[#FDFBF7]">
                            <div className="text-center leading-none">
                                <p className="text-[9px] tracking-[0.22em] text-[#D4AF37] font-bold">SINCE</p>
                                <p className="text-2xl font-black mt-1">1986</p>
                                <p className="text-[9px] tracking-[0.22em] text-[#D4AF37] font-bold mt-1">JLM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
