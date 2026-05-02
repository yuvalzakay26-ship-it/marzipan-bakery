import React, { useState } from 'react';
import { CalendarHeart, Check } from 'lucide-react';
import { recordLead } from '../../lib/leads/leadCapture';

// Pre-order waitlist for holiday windows. The bakery cuts off slot capacity
// 14 days before the holiday and sends the waitlist a window-open notification
// 30 days before. This is the highest-converting list the bakery owns —
// holiday concentrations are >30% of yearly demand.
//
// Pesach is intentionally OFF the list: the bakery is a chametz-based
// operation and does not produce kosher-for-Passover items. Surfacing a
// Pesach lead form would mislead customers and break Golden Rule #1.
const HOLIDAYS = [
    { id: 'rosh_hashanah', label: 'ראש השנה — עוגת דבש וחלות מתוקות' },
    { id: 'hanukkah',      label: 'חנוכה — סופגניות חמות מהתנור' },
    { id: 'purim',         label: 'פורים — אוזני המן ומשלוחי מנות' },
    { id: 'shavuot',       label: 'שבועות — עוגות גבינה ומאפי חלב' }
];

const HolidayPreorderList = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [picked, setPicked] = useState(new Set());
    const [submitted, setSubmitted] = useState(false);

    const togglePick = (id) => {
        setPicked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || picked.size === 0) return;
        recordLead({
            kind: 'holiday_preorder_waitlist',
            name,
            phone,
            extra: { holidays: Array.from(picked) }
        });
        setSubmitted(true);
    };

    return (
        <section
            id="holiday-preorder"
            className="py-16 md:py-24 bg-[#1A0F0A] text-white relative overflow-hidden"
            aria-label="הזמנה מוקדמת לחגים"
        >
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />

            <div className="max-w-4xl mx-auto px-5 sm:px-6 relative">
                <div className="text-center mb-12 md:mb-14">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#D4AF37] text-[11px] tracking-[0.34em] uppercase font-bold">
                            רשימת המתנה לחגים
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                        חגי השנה — <span className="text-[#D4AF37]">תופסים מקום מראש.</span>
                    </h2>
                    <p className="text-base md:text-lg text-red-100/75 max-w-2xl mx-auto leading-relaxed font-light">
                        בחגים אנחנו מגבילים את מספר המארזים ביום. הצטרפו לרשימת ההמתנה ותקבלו הודעה
                        ברגע שחלון ההזמנות נפתח — 30 יום לפני, לפני שכולם.
                    </p>
                </div>

                {!submitted ? (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/5 backdrop-blur-sm border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 space-y-5"
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="block text-xs font-bold text-[#D4AF37] mb-1.5 tracking-wider uppercase">שם</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 text-white"
                                    required
                                    autoComplete="name"
                                />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-bold text-[#D4AF37] mb-1.5 tracking-wider uppercase">וואטסאפ</span>
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    placeholder="050-1234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1A0F0A] border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 text-white"
                                    required
                                    autoComplete="tel"
                                />
                            </label>
                        </div>

                        <div>
                            <span className="block text-xs font-bold text-[#D4AF37] mb-3 tracking-wider uppercase">
                                לאיזה חגים — בחרו אחד או יותר
                            </span>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {HOLIDAYS.map((h) => {
                                    const active = picked.has(h.id);
                                    return (
                                        <button
                                            key={h.id}
                                            type="button"
                                            onClick={() => togglePick(h.id)}
                                            aria-pressed={active}
                                            className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] text-right ${
                                                active
                                                    ? 'bg-[#D4AF37] text-[#1A0F0A] border border-[#D4AF37]'
                                                    : 'bg-transparent text-red-50 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                                            }`}
                                        >
                                            <span>{h.label}</span>
                                            {active && <Check size={16} strokeWidth={3} aria-hidden="true" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={picked.size === 0}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A0F0A] font-bold py-3.5 rounded-xl transition-colors min-h-[54px] inline-flex items-center justify-center gap-2"
                        >
                            <CalendarHeart size={18} aria-hidden="true" />
                            לרשימת המתנה
                        </button>
                        <p className="text-[11px] text-red-100/55 text-center">
                            הודעה אחת לחג. אפשר להתנתק בכל רגע. ללא ספאם.
                        </p>
                    </form>
                ) : (
                    <div className="bg-white/5 border border-[#D4AF37]/30 rounded-3xl p-9 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#D4AF37] text-[#1A0F0A] flex items-center justify-center mx-auto mb-4">
                            <Check size={28} strokeWidth={3} />
                        </div>
                        <p className="text-2xl font-black mb-2">נרשמתם!</p>
                        <p className="text-red-100/75 leading-relaxed max-w-md mx-auto">
                            אתם תקבלו וואטסאפ ברגע שחלון ההזמנות נפתח — 30 יום לפני החג.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HolidayPreorderList;
