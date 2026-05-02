import React, { useState } from 'react';
import { Cake, Check } from 'lucide-react';
import { recordLead } from '../../lib/leads/leadCapture';

// Birthday club: month-of-birth opt-in. The bakery sends a coupon for a free
// signature item during the customer's birthday week. No PII beyond name+phone+month.
const MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const BirthdayClub = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [month, setMonth] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !month) return;
        recordLead({
            kind: 'birthday_club',
            name,
            phone,
            extra: { birthMonth: month }
        });
        setSubmitted(true);
    };

    return (
        <section
            id="birthday-club"
            className="py-16 md:py-20 bg-[#FFF8E1]/40 relative overflow-hidden"
            aria-label="מועדון יום ההולדת"
        >
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#380909 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="max-w-4xl mx-auto px-5 sm:px-6 relative">
                <div className="bg-white rounded-3xl shadow-[0_25px_60px_-30px_rgba(56,9,9,0.35)] border border-[#D4AF37]/30 overflow-hidden grid md:grid-cols-5">

                    <div className="md:col-span-2 bg-gradient-to-br from-[#B91C1C] to-[#380909] text-white p-7 md:p-9 flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#1A0F0A] flex items-center justify-center mb-4">
                            <Cake size={22} aria-hidden="true" />
                        </div>
                        <p className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#D4AF37] mb-1.5">
                            מועדון יום ההולדת
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black leading-tight mb-3">
                            מאפה אישי במתנה — בכל יום הולדת.
                        </h2>
                        <p className="text-sm text-red-100/80 leading-relaxed">
                            הצטרפו פעם אחת. בכל שנה, בשבוע יום ההולדת, תקבלו וואטסאפ עם קוד למאפה חינם בכל סניף.
                        </p>
                    </div>

                    <div className="md:col-span-3 p-7 md:p-9">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <label className="block">
                                    <span className="block text-xs font-bold text-[#380909] mb-1.5">שם מלא</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/30 focus:border-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 text-base"
                                        required
                                        autoComplete="name"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-xs font-bold text-[#380909] mb-1.5">טלפון נייד</span>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        placeholder="050-1234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/30 focus:border-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 text-base"
                                        required
                                        autoComplete="tel"
                                    />
                                </label>
                                <label className="block">
                                    <span className="block text-xs font-bold text-[#380909] mb-1.5">חודש יום ההולדת</span>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/30 focus:border-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 text-base bg-white"
                                        required
                                    >
                                        <option value="">בחרו חודש</option>
                                        {MONTHS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    type="submit"
                                    className="w-full bg-[#380909] hover:bg-[#B91C1C] text-white font-bold py-3.5 rounded-xl transition-colors min-h-[52px] mt-2"
                                >
                                    הצטרפו למועדון
                                </button>
                                <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-1">
                                    אנחנו לא משתפים את הפרטים שלכם עם אף אחד. ההצטרפות חינם.
                                </p>
                            </form>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-14 h-14 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mx-auto mb-4">
                                    <Check size={28} strokeWidth={3} />
                                </div>
                                <p className="text-2xl font-black text-[#380909] mb-2">צורף בהצלחה!</p>
                                <p className="text-[#5D4037] leading-relaxed">
                                    נתראה ב{month}.<br />הקוד יגיע לוואטסאפ שלכם בשבוע יום ההולדת.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BirthdayClub;
