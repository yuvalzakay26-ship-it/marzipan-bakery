import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Quote } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import OwnersHero from '../../assets/OwnersHero.jpg';

// Editorial "Legend" section dedicated to the rugelach — the brand's anchor product.
// Pure storytelling + a single conversion path. No decoration noise.
const SignatureRugelach = () => {
    return (
        <section
            id="signature"
            className="relative py-20 md:py-28 bg-[#1A0F0A] text-white overflow-hidden"
            aria-label="האגדה של הרוגלך"
        >
            {/* Warm overhead light */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#D4AF37]/8 blur-[140px]"></div>
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">

                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#D4AF37] text-[11px] tracking-[0.34em] uppercase font-bold">
                            המאפה האייקוני
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-5">
                        האגדה של הרוגלך
                        <span className="block text-[#D4AF37] mt-2">חמים מהתנור · נשקלים בקילוגרם</span>
                    </h2>
                    <p className="text-base md:text-xl text-red-100/70 max-w-3xl mx-auto leading-relaxed font-light">
                        מתכון אחד. ארבעה עשורים של חזרה. כל בוקר, מאפס.
                        <br className="hidden md:block" />
                        זה לא מאפה — זה ריטואל ירושלמי.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

                    {/* Editorial photo */}
                    <div className="lg:col-span-6 relative">
                        <div className="absolute -inset-3 border border-[#D4AF37]/30 rounded-[2rem] pointer-events-none" aria-hidden="true"></div>
                        <div className="relative rounded-[1.75rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
                            <img
                                src={OwnersHero}
                                alt="מגש רוגלך שוקולד חמים, יוצא מהתנור במאפיית מרציפן"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-[440px] md:h-[560px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-transparent to-transparent"></div>

                            {/* Daily count plaque */}
                            <div className="absolute top-5 left-5 bg-[#D4AF37] text-[#1A0F0A] rounded-2xl px-4 py-3 shadow-2xl">
                                <p className="text-[10px] tracking-[0.22em] font-bold uppercase">היום בתנור</p>
                                <p className="text-2xl font-black leading-none mt-1">אפיות לאורך כל היום</p>
                                <p className="text-[10px] mt-1 font-bold">החל מ-05:00 בבוקר</p>
                            </div>
                        </div>
                    </div>

                    {/* Story column */}
                    <div className="lg:col-span-6 text-right">
                        <Quote className="text-[#D4AF37]/60 mb-3" size={36} aria-hidden="true" />
                        <blockquote className="text-xl md:text-2xl text-white font-light leading-relaxed mb-8 italic">
                            רוגלך אמיתי לא נמדד במתכון.
                            הוא נמדד <span className="text-[#D4AF37] not-italic font-bold">בידיים שמכינות אותו</span> — דור אחר דור.
                        </blockquote>
                        <p className="text-red-100/70 leading-relaxed mb-8 text-base md:text-lg">
                            המתכון המשפחתי של שושנה ויוסף אוזרקו, שעמד מאחורי הדלפק של מרציפן מאז 1986,
                            הוא אותו מתכון שיוצא מהתנורים שלנו היום. בצק ספוג בחמאה, רובד עבה של שוקולד טהור,
                            וגלילה הדוקה שמשאירה את הפנים רך והקרום זהוב. אנחנו לא משחקים עם זה.
                        </p>

                        {/* Anatomy of the rugelach */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-9 border-y border-[#D4AF37]/20 py-6">
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-black text-[#D4AF37] leading-none">דור אחר דור</p>
                                <p className="text-[11px] sm:text-xs text-red-100/60 mt-2">משפחת אוזרקו</p>
                            </div>
                            <div className="text-center border-x border-[#D4AF37]/15">
                                <p className="text-2xl md:text-3xl font-black text-[#D4AF37] leading-none">100%</p>
                                <p className="text-[11px] sm:text-xs text-red-100/60 mt-2">חמאה אמיתית</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-black text-[#D4AF37] leading-none">חמים מהתנור</p>
                                <p className="text-[11px] sm:text-xs text-red-100/60 mt-2">לאורך כל היום</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/products?category=rugelach"
                                onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, { target: 'signature_rugelach' })}
                                className="group inline-flex items-center justify-center gap-3 bg-[#D4AF37] hover:bg-[#B8860B] text-[#1A0F0A] px-7 py-4 rounded-full font-bold text-base shadow-[0_18px_40px_-12px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_48px_-12px_rgba(212,175,55,0.6)] transition-all hover:-translate-y-0.5 min-h-[54px]"
                            >
                                להזמנת מגש רוגלך
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center text-white/85 hover:text-[#D4AF37] font-medium px-2 py-4 transition-colors min-h-[54px]"
                            >
                                לקרוא את הסיפור המלא
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SignatureRugelach;
