import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { FAQ_DATA } from '../../data/faqData';
import { CONTACT_INFO } from '../../data/siteContent';
import SchemaMarkup from "../Shared/SchemaMarkup";

// FAQPage JSON-LD — surfaces these Q&As as rich SERP results.
const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
};

const FAQ = () => {
    const [activeId, setActiveId] = useState(null);
    const answerRef = useRef(null);
    const sectionRef = useRef(null);

    // Initialize Active ID
    useEffect(() => {
        const hashId = parseInt(window.location.hash.replace('#faq-', ''));
        const storedId = parseInt(sessionStorage.getItem('marzipan_faq_active'));

        if (!isNaN(hashId) && FAQ_DATA.some(item => item.id === hashId)) {
            setActiveId(hashId);
        } else if (!isNaN(storedId) && FAQ_DATA.some(item => item.id === storedId)) {
            setActiveId(storedId);
        } else {
            setActiveId(FAQ_DATA[0].id);
        }
    }, []);

    // Handle Selection
    const handleSelect = (id, fromMobileClick = false) => {
        setActiveId(id);
        window.location.hash = `#faq-${id}`;
        sessionStorage.setItem('marzipan_faq_active', id);

        if (fromMobileClick && window.innerWidth < 1024 && answerRef.current) {
            setTimeout(() => {
                const yOffset = -100; // Offset for sticky header if exists
                const element = answerRef.current;
                const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100);
        }
    };

    const currentIndex = FAQ_DATA.findIndex(item => item.id === activeId);
    const activeItem = FAQ_DATA[currentIndex] || FAQ_DATA[0];

    return (
        <>
        <SchemaMarkup data={faqSchema} />
        <section ref={sectionRef} className="py-20 md:py-28 bg-[#FDFBF7] relative overflow-hidden" id="faq">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
                {/* Editorial Header — system-consistent gold-line eyebrow */}
                <div className="text-center mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] text-[11px] tracking-[0.34em] uppercase font-bold">
                            מרכז העזרה
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] tracking-tight leading-tight mb-4">
                        שאלות <span className="text-[#B91C1C]">נפוצות.</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto leading-relaxed font-light">
                        כל מה שכדאי לדעת על משלוחים, טריות, כשרות וזמני האפייה.
                        צוות המאפייה זמין לכל שאלה נוספת בוואטסאפ.
                    </p>
                </div>

                {/* Master-Detail Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative">

                    {/* Navigation List (Timeline Style) */}
                    <div className="lg:col-span-4 flex flex-col relative">
                        {/* Timeline Line */}
                        <div className="absolute right-[19px] top-4 bottom-4 w-px bg-[#D4AF37]/20 hidden lg:block"></div>

                        {FAQ_DATA.map((item, index) => {
                            const isActive = activeId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item.id, true)}
                                    className={`
                                        group relative w-full text-right py-6 pr-12 pl-6 transition-all duration-500 rounded-l-2xl
                                        ${isActive ? 'bg-[#FFF9E6] border-r-4 border-[#B91C1C]' : 'hover:bg-[#FFF9E6]/50 border-r-4 border-transparent'}
                                    `}
                                >
                                    {/* Timeline Dot (Desktop) */}
                                    <div className={`
                                        absolute right-[15px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full border border-[#D4AF37] transition-all duration-500 hidden lg:block z-10
                                        ${isActive ? 'scale-150 shadow-[0_0_10px_rgba(185,28,28,0.4)] bg-[#B91C1C]' : 'bg-[#D4AF37]/20 group-hover:bg-[#D4AF37]'}
                                    `}></div>

                                    {/* Numbering (Mobile/Desktop) */}
                                    <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.18em] lg:hidden ${isActive ? 'text-[#B91C1C] font-bold' : 'text-[#D4AF37]'}`}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>

                                    <h3 className={`
                                        text-base md:text-lg transition-all duration-500 leading-snug
                                        ${isActive ? 'font-black text-[#B91C1C] translate-x-0' : 'font-bold text-[#2D211E]/75 -translate-x-2 group-hover:text-[#2D211E]'}
                                    `}>
                                        {item.question}
                                    </h3>
                                </button>
                            );
                        })}
                    </div>

                    {/* Answer Panel (Sticky Card) */}
                    <div className="lg:col-span-7 lg:sticky lg:top-28 h-fit" ref={answerRef}>
                        <div className="relative">

                            {/* Card Container — restrained editorial */}
                            <div className="bg-white p-7 md:p-12 shadow-[0_30px_70px_-30px_rgba(56,9,9,0.3)] border border-[#D4AF37]/25 min-h-[400px] flex flex-col justify-between overflow-hidden rounded-3xl relative">

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6 text-[#D4AF37]">
                                        <div className="h-px w-10 bg-[#D4AF37] opacity-70"></div>
                                        <span className="text-[11px] uppercase tracking-[0.34em] font-bold">התשובה</span>
                                    </div>

                                    <div key={activeId} className="animate-fade-in-slide">
                                        <h3 className="text-2xl md:text-3xl font-black text-[#380909] tracking-tight mb-6 leading-tight">
                                            {activeItem.question}
                                        </h3>
                                        <div className="text-base md:text-lg text-[#2D211E]/80 leading-relaxed font-light max-w-2xl">
                                            {activeItem.answer}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Navigation */}
                                <div className="relative z-10 mt-12 pt-6 border-t border-[#D4AF37]/15 flex items-center justify-between">
                                    <button
                                        onClick={() => currentIndex > 0 && handleSelect(FAQ_DATA[currentIndex - 1].id)}
                                        disabled={currentIndex === 0}
                                        className={`group/btn flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.28em] transition-all ${currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'text-[#B91C1C]/70 hover:text-[#B91C1C]'}`}
                                    >
                                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
                                        הקודמת
                                    </button>

                                    {/* Quote Mark Decoration — restrained */}
                                    <Quote className="text-[#D4AF37]/[0.06] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 pointer-events-none" size={64} fill="currentColor" stroke="none" aria-hidden="true" />

                                    <button
                                        onClick={() => currentIndex < FAQ_DATA.length - 1 && handleSelect(FAQ_DATA[currentIndex + 1].id)}
                                        disabled={currentIndex === FAQ_DATA.length - 1}
                                        className={`group/btn flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.28em] transition-all ${currentIndex === FAQ_DATA.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-[#B91C1C]/70 hover:text-[#B91C1C]'}`}
                                    >
                                        הבאה
                                        <ArrowLeft size={14} className="transition-transform group-hover/btn:-translate-x-1" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="text-center mt-16 md:mt-20">
                    <a
                        href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[#B91C1C] font-bold hover:text-[#380909] transition-colors group"
                    >
                        לא מצאתם את התשובה? דברו איתנו בוואטסאפ
                        <span className="inline-block transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span>
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-slide {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slide {
                    animation: fade-in-slide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
        </>
    );
};

export default FAQ;
