import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ChefHat, Cookie } from 'lucide-react';
import SEO from "../Shared/SEO";

const NotFoundPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center font-sans font-sans relative overflow-hidden" dir="rtl">
            <SEO
                title="404 - עמוד לא נמצא"
                description="העמוד שחיפשתם לא נמצא. חיזרו לדף הבית של מאפיית מרציפן."
                url="/404"
            />
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-20 right-20 text-[#D4AF37] animate-spin duration-[10000ms]">
                    <Cookie size={120} />
                </div>
                <div className="absolute bottom-20 left-20 text-[#B91C1C] animate-bounce duration-[3000ms]">
                    <ChefHat size={100} />
                </div>
                <div className="absolute top-1/2 left-10 w-4 h-4 bg-[#D4AF37] rounded-full animate-ping"></div>
                <div className="absolute bottom-1/3 right-10 w-6 h-6 bg-[#B91C1C] rounded-full animate-pulse"></div>
            </div>

            <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-xl border border-[#D4AF37]/20 relative z-10 transition-all hover:shadow-2xl hover:scale-[1.01] duration-500">

                <div className="text-[#B91C1C] mb-6 flex justify-center">
                    <div className="relative">
                        <span className="text-9xl font-black opacity-20 select-none blur-[2px]">404</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl font-black drop-shadow-md">404</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-[#380909] mb-4">
                    אופס! נראה שחיסלו את כל הפירורים...
                </h1>

                <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F9A825] mx-auto rounded-full mb-8"></div>

                <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                    הדף שחיפשתם כנראה נאפה יותר מדי או שפשוט לא קיים.
                    אל דאגה, יש לנו עוד המון מאפים טריים שמחכים רק לכם!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-3 bg-[#B91C1C] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#8B1515] transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-red-900/30"
                    >
                        <Home size={20} />
                        חזרה לדף הבית
                    </Link>

                    <Link
                        to="/products"
                        className="flex items-center justify-center gap-3 bg-white text-[#380909] border-2 border-[#D4AF37]/30 px-8 py-4 rounded-xl font-bold hover:bg-[#FFF8E1] hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-1"
                    >
                        <Search size={20} className="text-[#D4AF37]" />
                        צפייה בקטלוג
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
