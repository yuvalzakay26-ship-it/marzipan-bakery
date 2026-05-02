import React from 'react';
import { BUSINESS_INFO, SOCIAL_PROOF } from '../../data/siteContent';

const MILESTONES = [
    {
        year: '1986',
        title: 'ההתחלה — משפחת אוזרקו',
        body: 'שושנה ז״ל ויוסף אוזרקו פותחים את מאפיית מרציפן בלב שוק מחנה יהודה. בצק נילוש בידיים, חמאה אמיתית, ואותו מתכון משפחתי.'
    },
    {
        year: 'לאורך השנים',
        title: 'מאפייה ירושלמית מסורתית',
        body: 'מרציפן הופכת לחלק מהזהות של שוק מחנה יהודה. אותם תנורים, אותם חומרי גלם, אותה הקפדה משפחתית — דור אחר דור.'
    },
    {
        year: 'הדור הבא',
        title: 'איציק ושלומי אוזרקו',
        body: 'הבנים של שושנה ויוסף ממשיכים את המאפייה — באותו מתכון, באותה רוח, ובאותה אהבה לאפייה ירושלמית אמיתית.'
    },
    {
        year: 'היום',
        title: 'אותם תנורים. אותה משפחה.',
        body: 'שלושה סניפים בלב ירושלים. אפייה טרייה לאורך כל היום. אותו טעם של שוק מחנה יהודה — דור אחר דור.'
    }
];

// Editorial timeline — quiet and restrained, lets the dates do the talking.
const HeritageTimeline = () => {
    const yearsActive = SOCIAL_PROOF.yearsActive();

    return (
        <section
            id="heritage"
            className="relative py-20 md:py-28 bg-[#FDFBF7] overflow-hidden"
            aria-label="הסיפור שלנו לאורך השנים"
        >
            {/* Subtle paper texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#380909 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="max-w-6xl mx-auto px-5 sm:px-6 relative">

                <div className="text-center mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] text-[11px] tracking-[0.34em] uppercase font-bold">
                            {yearsActive} שנים · משפחה אחת · עיר אחת
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#380909] leading-[1.05] mb-5">
                        מאז {BUSINESS_INFO.foundedYear}, מאפייה משפחתית.
                        <span className="block text-[#B91C1C] mt-2">דור אחר דור.</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto leading-relaxed font-light">
                        מאפיית מרציפן — משפחת אוזרקו. אותו מתכון, אותם תנורים, ואותה הקפדה ירושלמית.
                    </p>
                </div>

                {/* Timeline rail */}
                <div className="relative">
                    {/* Center vertical line — desktop only */}
                    <div className="hidden md:block absolute right-1/2 translate-x-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/60 to-[#D4AF37]/0" aria-hidden="true"></div>

                    <ol className="space-y-10 md:space-y-14">
                        {MILESTONES.map((m, i) => {
                            const isEven = i % 2 === 0;
                            return (
                                <li key={m.year} className="relative md:grid md:grid-cols-2 md:gap-12 items-center">

                                    {/* Date side */}
                                    <div className={`md:text-left ${isEven ? 'md:order-1' : 'md:order-2'} ${isEven ? 'md:text-left md:pr-10' : 'md:text-right md:pl-10'}`}>
                                        <div className="inline-flex items-baseline gap-3 bg-white border border-[#D4AF37]/30 rounded-full px-5 py-2 shadow-sm">
                                            <span className="text-2xl md:text-4xl font-black text-[#B91C1C] leading-none">{m.year}</span>
                                        </div>
                                    </div>

                                    {/* Card side */}
                                    <div className={`mt-4 md:mt-0 ${isEven ? 'md:order-2 md:pr-10 md:text-right' : 'md:order-1 md:pl-10 md:text-left'}`}>
                                        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-[0_20px_50px_-25px_rgba(56,9,9,0.25)] border border-[#D4AF37]/15 relative">
                                            {/* Center dot — desktop */}
                                            <span className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#D4AF37] ring-4 ring-[#FDFBF7] ${isEven ? '-left-[34px]' : '-right-[34px]'}`} aria-hidden="true"></span>
                                            <h3 className="text-lg md:text-2xl font-black text-[#380909] mb-2 leading-snug">{m.title}</h3>
                                            <p className="text-[#5D4037] leading-relaxed text-sm md:text-base">{m.body}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* Closing brand stamp — family signature, anchored in a real voice */}
                <div className="mt-16 md:mt-20 text-center">
                    <p className="font-light text-[#5D4037] text-base md:text-lg max-w-xl mx-auto italic">
                        אנחנו לא חברה. אנחנו מאפייה משפחתית.
                        <br />
                        זאת הסיבה שזה עדיין אותו טעם.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-3">
                        <span className="block w-6 h-px bg-[#D4AF37]"></span>
                        <span className="text-xs tracking-[0.22em] uppercase font-bold text-[#B91C1C]">
                            משפחת אוזרקו · לזכר שושנה ז״ל
                        </span>
                        <span className="block w-6 h-px bg-[#D4AF37]"></span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeritageTimeline;
