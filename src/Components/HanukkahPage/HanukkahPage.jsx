import React, { useEffect } from "react";
import { ShoppingBag, Flame, Star, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import HeroImage from "../../assets/hanukkah/hero.png";
import { productsData } from "../../data/productsData";
import SEO from "../Shared/SEO";

const HanukkahPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const donuts = productsData.hanukkahCollection;

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans rtl">
            <SEO
                title="קולקציית חנוכה"
                description="חג החנוכה במאפיית מרציפן. סופגניות, דונאטס, מארזי חג וכל מה שטעים ומתוק. משלוחים לכל הארץ."
                url="/holidays/hanukkah"
                image={HeroImage}
            />
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img
                    src={HeroImage}
                    alt="Hanukkah at Marzipan Bakery"
                    className="w-full h-full object-cover animate-pan-slow"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6">
                    <div className="mb-6 animate-fade-in-up">
                        <Flame className="w-16 h-16 text-[#D4AF37] mx-auto drop-shadow-lg mb-4" />
                        <span className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase drop-shadow-md bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm border border-[#D4AF37]/30">חג האורים</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tight leading-none animate-fade-in-up delay-100">
                        חנוכה במרציפן
                    </h1>
                    <p className="text-xl md:text-3xl text-white/90 font-light max-w-2xl leading-relaxed drop-shadow-lg animate-fade-in-up delay-200">
                        מסורת של אור, חום וסופגניות שנעשות באהבה גדולה בדיוק כמו פעם.
                    </p>
                </div>
                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FDFBF7] to-transparent z-20"></div>
            </div>

            {/* Intro Text */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center relative">
                <div className="absolute top-10 right-10 text-[#D4AF37]/10 animate-spin-slow">
                    <Star size={120} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#B91C1C] mb-8 relative z-10">
                    נס גדול היה פה
                </h2>
                <p className="text-xl text-gray-700 leading-loose font-light relative z-10">
                    חג החנוכה במאפיית מרציפן הוא לא עוד סתם חג, הוא חגיגה של טעמים וריחות שמחזירים אותנו לילדות.
                    כל בוקר אנחנו מדליקים את האור במאפייה ומתחילים ללוש, להתפיח ולטגן את הסופגניות הכי טעימות בירושלים.
                    מהקלאסיקה הנצחית עם הריבה האדומה ועד לשילובים מודרניים ומפתיעים - הכל נעשה בעבודת יד מוקפדת מחומרי הגלם הטובים ביותר.
                </p>
            </div>

            {/* Product Grid - Premium Collection */}
            <div className="max-w-[1400px] mx-auto px-6 pb-32">
                <div className="text-center mb-16 relative">
                    <span className="text-[#D4AF37] tracking-[0.3em] text-sm font-bold uppercase mb-4 block">המהדורה המוגבלת</span>
                    <h3 className="text-4xl md:text-5xl font-black text-[#2D211E] mb-6">הקולקציה שלנו</h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {donuts.map((item) => (
                        <div key={item.id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            {/* Image Section - Full Width */}
                            <div className="relative h-[320px] w-full overflow-hidden">
                                {/* Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-white/90 backdrop-blur-md text-[#2D211E] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        {item.tag}
                                    </span>
                                </div>

                                {/* Overlay gradient for text readability if needed, though we strictly put text below now. 
                                    Just a subtle dark fade at bottom for luxury feel on hover? Optional. */}

                                <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                />

                                {/* Quick Shop Button (Mobile/Desktop overlay) */}
                                <div className="absolute bottom-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 z-20">
                                    <button className="bg-[#D4AF37] text-white p-3 rounded-full shadow-lg hover:bg-[#B91C1C] transition-colors duration-300">
                                        <ShoppingBag size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-col flex-grow p-6 text-center relative bg-white">
                                {/* Title */}
                                <h3 className="text-2xl font-black text-[#2D211E] mb-2 font-serif tracking-wide group-hover:text-[#B91C1C] transition-colors">
                                    {item.name}
                                </h3>

                                {/* Divider - decorative */}
                                <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mb-3 group-hover:w-full group-hover:bg-[#D4AF37] transition-all duration-500"></div>

                                {/* Description */}
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow font-light px-2 min-h-[3rem]">
                                    {item.description}
                                </p>

                                {/* Price */}
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-3xl font-black text-[#B91C1C] font-serif">{item.priceDisplay}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action Banner - Revamped */}
                <div className="mt-32 relative w-full rounded-[3rem] overflow-hidden group shadow-2xl">
                    {/* Backgrounds */}
                    <div className="absolute inset-0 bg-[#1A0F0A]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#B91C1C]/20 to-transparent"></div>

                    {/* Animated Glow Orbs */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B91C1C]/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                    <div className="relative z-10 py-20 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2 text-right">
                            <div className="inline-block px-4 py-2 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-6 bg-black/30 backdrop-blur-sm">
                                חג חנוכה 2024
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                בא לכם <span className="text-[#D4AF37] italic">מארז</span> לחג?
                            </h3>
                            <p className="text-xl text-gray-300 font-light max-w-lg leading-relaxed">
                                אל תסתבכו עם בחירות קשות. סידרנו לכם מארזים חגיגיים עם כל הטעמים הכי שווים, מוכנים לאירוח או למתנה מושלמת.
                            </p>
                        </div>

                        <div className="md:w-1/3 flex flex-col items-center gap-6">
                            <div className="relative group/box cursor-pointer">
                                {/* Decorative "Box" feel */}
                                <div className="absolute -inset-4 bg-[#D4AF37] rounded-full opacity-20 group-hover/box:opacity-30 blur-xl transition-opacity duration-500"></div>
                                <Link to="/contact">
                                    <button className="relative bg-gradient-to-br from-[#D4AF37] to-[#B4941F] text-[#1A0F0A] text-xl font-black px-12 py-5 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_10px_40px_rgba(212,175,55,0.3)] flex items-center gap-3">
                                        <ShoppingBag size={24} />
                                        <span>הזמינו מארז חג</span>
                                    </button>
                                </Link>
                            </div>
                            <span className="text-sm text-white/40 tracking-wider">משלוחים לכל רחבי ירושלים והסביבה</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HanukkahPage;
