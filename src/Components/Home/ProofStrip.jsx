import React from 'react';
import { Calendar, MapPin, Star, ShieldCheck } from 'lucide-react';
import { SOCIAL_PROOF, BUSINESS_INFO } from '../../data/siteContent';

// Honest social proof. Every number here can be defended on a phone call to the bakery:
// "How many years?" — count from BUSINESS_INFO.foundedYear.
// "How many branches?" — three, listed on the branches page.
// "Google rating?" — the live rating; we surface it but don't fabricate review text.
// "Kashrut?" — the certificate hanging at every counter.
const ProofStrip = () => {
    const stats = [
        {
            icon: Calendar,
            value: `+${SOCIAL_PROOF.yearsActive()}`,
            label: 'שנות אפייה ירושלמית',
            sub: `מאז ${BUSINESS_INFO.foundedYear}`
        },
        {
            icon: Star,
            value: SOCIAL_PROOF.googleRating.toFixed(1),
            label: 'דירוג ממוצע בגוגל',
            sub: 'הדירוג בלייב מהפרופיל שלנו'
        },
        {
            icon: MapPin,
            value: SOCIAL_PROOF.branchesCount,
            label: 'סניפים פעילים',
            sub: 'בלב ירושלים'
        },
        {
            icon: ShieldCheck,
            value: 'בד״ץ',
            label: 'כשרות העדה החרדית',
            sub: 'תעודה מתחדשת בכל סניף'
        }
    ];

    return (
        <section
            className="bg-gradient-to-b from-white to-[#FFF8E1]/40 py-12 md:py-16"
            aria-label="המספרים שמאחורי המאפייה"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-10 md:mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] font-bold tracking-[0.34em] text-[11px] uppercase">המספרים שמאחורינו</span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] leading-tight">
                        אגדה ירושלמית — <span className="text-[#B91C1C]">לא בלי סיבה.</span>
                    </h2>
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <li
                                key={stat.label}
                                className="bg-white rounded-2xl border border-[#D4AF37]/20 p-5 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-11 h-11 md:w-12 md:h-12 mx-auto mb-3 rounded-full bg-[#FFF8E1] border border-[#D4AF37]/40 flex items-center justify-center text-[#B91C1C]">
                                    <Icon size={22} aria-hidden="true" />
                                </div>
                                <p className="text-3xl md:text-4xl font-black text-[#380909] leading-none mb-1.5">
                                    {stat.value}
                                </p>
                                <p className="text-xs md:text-sm font-bold text-[#2D211E] leading-snug">
                                    {stat.label}
                                </p>
                                <p className="text-[11px] md:text-xs text-gray-500 mt-1">{stat.sub}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
};

export default ProofStrip;
