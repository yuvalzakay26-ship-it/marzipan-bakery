import React from 'react';
import { ShieldCheck, Sunrise, MapPin, MessageCircle } from 'lucide-react';
import { TRUST_SIGNALS, getNextBakingTime } from '../../data/siteContent';

// A horizontal strip of 4 trust signals shown on the home page and on
// transactional surfaces (checkout, cart). Compact and silent on mobile —
// no animation that fights the user's reading focus.
const TrustBar = ({ variant = "light", className = "" }) => {
    // Live "next baking" tick — proves the bakery is alive *now*, not a stock photo.
    // Honest: BAKING_RHYTHM mirrors the times the ovens actually pull trays.
    const nextBake = getNextBakingTime();
    const freshSub = nextBake.isTomorrow
        ? `האפייה הבאה: מחר ב-${nextBake.time}`
        : `האפייה הבאה היום: ${nextBake.time} · ${nextBake.what}`;

    const items = [
        { icon: ShieldCheck,   label: TRUST_SIGNALS.kosher,        sub: "תעודה מתחדשת בכל סניף" },
        { icon: Sunrise,       label: TRUST_SIGNALS.freshDaily,    sub: freshSub },
        { icon: MapPin,        label: TRUST_SIGNALS.pickupCity,    sub: "השוק • סנטר 1 • מדרחוב" },
        { icon: MessageCircle, label: TRUST_SIGNALS.whatsappFast,  sub: "אישור אישי לפני חיוב" }
    ];

    const isDark = variant === "dark";
    const surface = isDark
        ? "bg-[#1A0F0A] border-y border-[#D4AF37]/20"
        : "bg-[#FAF6EE] border-y border-[#D4AF37]/25";
    const titleColor = isDark ? "text-white" : "text-[#380909]";
    const subColor   = isDark ? "text-red-100/60" : "text-gray-500";
    const iconWrap   = isDark
        ? "bg-white/5 text-[#D4AF37] border-white/10"
        : "bg-[#FFF8E1] text-[#B91C1C] border-[#D4AF37]/30";

    return (
        <section
            aria-label="הבטחות שירות"
            className={`${surface} ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 md:py-9">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
                    {items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                            <li
                                key={item.label}
                                className="flex items-start gap-3 text-right"
                            >
                                <span className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center ${iconWrap}`}>
                                    <ItemIcon size={20} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <p className={`font-bold text-sm md:text-base leading-snug ${titleColor}`}>
                                        {item.label}
                                    </p>
                                    <p className={`text-xs md:text-sm leading-snug mt-0.5 ${subColor}`}>
                                        {item.sub}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default TrustBar;
