import React from 'react';
import { Crown, Check, MessageCircle } from 'lucide-react';
import { CONTACT_INFO, VIP_CLUB } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

const VIPClub = () => {
    if (!VIP_CLUB.enabled) return null;

    const joinUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(VIP_CLUB.joinMessage)}`;

    return (
        <section
            id="vip"
            className="py-16 md:py-24 bg-gradient-to-br from-[#380909] to-[#1A0F0A] text-white relative overflow-hidden"
            aria-label="מועדון VIP"
        >
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="max-w-5xl mx-auto px-5 sm:px-6 relative">
                <div className="bg-white/5 backdrop-blur-sm border border-[#D4AF37]/30 rounded-3xl p-7 md:p-12 grid md:grid-cols-5 gap-8 md:gap-10 items-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)]">

                    {/* Left content */}
                    <div className="md:col-span-3 text-center md:text-right">
                        <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#380909] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.22em] mb-4">
                            <Crown size={13} aria-hidden="true" />
                            מועדון מרציפן
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
                            לקוחות קבועים — <span className="text-[#D4AF37]">יחס של בני בית.</span>
                        </h2>
                        <p className="text-red-100/80 text-sm md:text-base leading-relaxed font-light max-w-xl mx-auto md:mx-0">
                            הצטרפו למועדון הוואטסאפ שלנו. בלי ספאם, בלי הצפה — רק הדברים שחשוב לקבוע מראש.
                        </p>
                    </div>

                    {/* Right perks + CTA */}
                    <div className="md:col-span-2">
                        <ul className="space-y-3 mb-6">
                            {VIP_CLUB.perks.map((perk) => (
                                <li key={perk} className="flex items-start gap-3 text-red-50">
                                    <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#380909] flex items-center justify-center shrink-0 mt-0.5">
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <span className="text-sm md:text-base leading-snug">{perk}</span>
                                </li>
                            ))}
                        </ul>

                        <a
                            href={joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent(ANALYTICS_EVENTS.VIP_CLUB_CLICK)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ba84e] text-white font-bold text-base md:text-lg px-6 py-4 rounded-full shadow-[0_18px_40px_-12px_rgba(37,211,102,0.55)] hover:shadow-[0_22px_48px_-12px_rgba(37,211,102,0.7)] hover:-translate-y-0.5 transition-all min-h-[54px]"
                        >
                            <MessageCircle size={20} aria-hidden="true" />
                            הצטרפו בוואטסאפ — בקליק
                        </a>
                        <p className="text-xs text-red-100/50 text-center mt-2">
                            ללא עלות. אפשר לצאת בכל רגע.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VIPClub;
