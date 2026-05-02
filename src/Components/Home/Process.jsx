import React from "react";
import { MousePointerClick, Send, ShoppingBag, MapPin, ArrowLeft } from "lucide-react";
import MagicalBackground from "../Shared/MagicalBackground";
import { trackEvent } from "../../utils/analytics";

const Process = () => {
    const steps = [
        {
            icon: MousePointerClick,
            title: "1. בוחרים את הפינוק",
            desc: "נכנסים לקטלוג המלא שלנו, בוחרים את הרוגלך, העוגות והמאפים שבא לכם.",
            color: "text-[#D4AF37]",
            bg: "bg-[#D4AF37]/5",
            border: "border-[#D4AF37]/20",
            shadow: "shadow-[#D4AF37]/10"
        },
        {
            icon: Send,
            title: "2. שולחים הזמנה בוואטסאפ",
            desc: "לוחצים על 'סיום הזמנה' והעגלה תשלח ישירות אלינו לוואטסאפ לתיאום.",
            color: "text-[#25D366]",
            bg: "bg-[#25D366]/5",
            border: "border-[#25D366]/20",
            shadow: "shadow-[#25D366]/10"
        },
        {
            icon: ShoppingBag,
            title: "3. הכנה ואישור",
            desc: "צוות המאפייה מקבל את ההזמנה, מאשר מולכם זמינות ומכין את המארז.",
            color: "text-[#2D211E]",
            bg: "bg-[#2D211E]/5",
            border: "border-[#2D211E]/20",
            shadow: "shadow-[#2D211E]/10"
        },
        {
            icon: MapPin,
            title: "4. איסוף מהשוק",
            desc: "מגיעים לסניף המיתולוגי באגריפס 44, אוספים ונהנים מכל ביס חם וטרי.",
            color: "text-[#B91C1C]",
            bg: "bg-[#B91C1C]/5",
            border: "border-[#B91C1C]/20",
            shadow: "shadow-[#B91C1C]/10"
        }
    ];

    return (
        <section id="process" className="py-32 bg-[#FDFBF7] relative overflow-hidden">
            {/* Shared Floating Decorations */}
            <MagicalBackground />

            {/* Connecting Line - Behind Content */}
            <div className="hidden lg:block absolute top-[40%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#B91C1C]/5 border border-[#B91C1C]/10 text-[#B91C1C] text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
                        איך זה עובד?
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-[#2D211E] drop-shadow-sm leading-tight">
                        מהתנור שלנו <span className="text-[#B91C1C] relative inline-block px-2">
                            לשולחן שלכם
                            {/* Decorative Underline */}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D4AF37] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span>
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="group relative z-10">
                            {/* Card Container */}
                            <div className={`
                                h-full bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] 
                                border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] 
                                group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] 
                                group-hover:-translate-y-2 transition-all duration-500 ease-out
                                flex flex-col items-center text-center relative overflow-hidden
                            `}>
                                {/* Top Gradient Accent */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${step.color === 'text-[#B91C1C]' ? 'from-red-400 to-red-600' : step.color === 'text-[#D4AF37]' ? 'from-yellow-400 to-yellow-600' : step.color === 'text-[#25D366]' ? 'from-green-400 to-green-600' : 'from-gray-700 to-gray-900'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {/* Step Number Badge */}
                                <div className="absolute top-6 right-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 font-bold text-sm border border-gray-100 group-hover:bg-[#2D211E] group-hover:text-white group-hover:border-[#2D211E] transition-colors duration-500 shadow-inner">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Icon Circle */}
                                <div className={`w-24 h-24 rounded-full ${step.bg} flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500 ring-1 ring-inset ${step.border}`}>
                                    {/* Icon Glow */}
                                    <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${step.bg}`}></div>
                                    <step.icon size={36} className={`${step.color} relative z-10 drop-shadow-sm`} strokeWidth={1.5} />
                                </div>

                                {/* Checkmark Decoration on Hover */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700 z-0 radial-gradient-fade"></div>

                                {/* Title */}
                                <h3 className="text-xl font-black text-[#2D211E] mb-3 relative z-10">
                                    {step.title.split('. ')[1]} {/* Remove number from title standard for design */}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-500 text-sm leading-relaxed font-medium relative z-10">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-20 animate-fade-in-up delay-300">
                    <a
                        href="#products"
                        onClick={() => trackEvent('process_cta_click')}
                        className="group relative inline-flex items-center gap-4 bg-[#B91C1C] text-white px-12 py-5 rounded-full font-bold text-xl shadow-[0_10px_30px_-5px_rgba(185,28,28,0.3)] hover:bg-[#A61919] hover:shadow-[0_20px_40px_-5px_rgba(185,28,28,0.5)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <span className="relative z-10">להתחלת הזמנה בקטלוג</span>
                        <ArrowLeft className="relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />

                        {/* Shine Effect */}
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Process;
