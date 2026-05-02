import React, { useEffect, useState } from 'react';
import { Flame, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BAKING_RHYTHM } from '../../data/siteContent';

// Honest urgency: anchored on the real bakery rhythm. Computes which baking window
// is "next up" right now in Asia/Jerusalem time. No fabricated "12 left in stock".
const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const useNextBatch = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Compute current and next batches.
    const minutes = now.getHours() * 60 + now.getMinutes();
    const sorted = [...BAKING_RHYTHM].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

    const next = sorted.find((b) => toMinutes(b.time) > minutes) || sorted[0]; // wrap to tomorrow
    const lastDone = [...sorted].reverse().find((b) => toMinutes(b.time) <= minutes);

    return { next, lastDone };
};

const WhyOrderToday = () => {
    const { next, lastDone } = useNextBatch();

    return (
        <section
            className="py-16 md:py-20 bg-[#FDFBF7] relative overflow-hidden"
            aria-label="למה להזמין היום"
        >
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
                <div className="text-center mb-10 md:mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="inline-flex items-center gap-2 text-[#B91C1C] text-[11px] font-bold uppercase tracking-[0.32em]">
                            <Flame size={12} aria-hidden="true" />
                            לוח האפייה החי
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] mb-3 leading-tight">
                        כשהמאפים יוצאים — אנחנו רושמים את הרגע.
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto font-light leading-relaxed">
                        כל מגש נאפה בנפרד, על השעה. אין מאפים מאתמול, אין שמירה. ככל שמזמינים מוקדם — אתם תופסים בדיוק את המגש הקרוב ביותר ליציאה מהתנור.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5 md:gap-6">

                    {/* Live "next batch" card */}
                    <div className="md:col-span-1 bg-gradient-to-br from-[#B91C1C] to-[#380909] text-white rounded-2xl p-6 shadow-xl border border-[#D4AF37]/30">
                        <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                            </span>
                            היום בתנור
                        </div>
                        <p className="text-lg font-bold mb-1 leading-snug">
                            הבא בתור: {next.time}
                        </p>
                        <p className="text-red-100/90 text-sm leading-relaxed mb-4">
                            {next.what}
                        </p>
                        {lastDone && (
                            <p className="text-xs text-red-100/60 border-t border-white/10 pt-3 leading-relaxed">
                                האפייה האחרונה שיצאה ב-{lastDone.time}: {lastDone.what}
                            </p>
                        )}
                    </div>

                    {/* Reasons grid */}
                    <ul className="md:col-span-2 grid sm:grid-cols-2 gap-3 md:gap-4">
                        {[
                            { title: 'איסוף באותו היום', body: 'הזמנה עד 12:00 — מוכנה לאיסוף לפני סוף היום.' },
                            { title: 'מובטח לשולחן השבת', body: 'הזמנה עד יום חמישי בערב — שריון מקום לערב שישי.' },
                            { title: 'טריות בלי פשרות', body: 'מה שלא נמכר ביום שיצא — לא חוזר למחר. נקודה.' },
                            { title: 'הסניף עונה אישית', body: 'אתם מדברים עם האנשים שאופים. לא עם בוט.' }
                        ].map((r) => (
                            <li
                                key={r.title}
                                className="bg-white rounded-2xl p-5 border border-[#D4AF37]/20 shadow-sm flex gap-3"
                            >
                                <Clock size={20} className="text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
                                <div>
                                    <p className="font-bold text-[#380909] mb-0.5">{r.title}</p>
                                    <p className="text-sm text-gray-600 leading-snug">{r.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10 md:mt-12 text-center">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-3 bg-[#380909] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-[0_18px_40px_-15px_rgba(56,9,9,0.55)] hover:shadow-[0_22px_48px_-15px_rgba(185,28,28,0.55)] transition-all hover:-translate-y-0.5 min-h-[54px] ring-1 ring-[#D4AF37]/30"
                    >
                        תפסו את המגש הבא
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default WhyOrderToday;
