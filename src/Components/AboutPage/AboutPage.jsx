import React, { useState } from "react";
import { Award, Heart, Star, Cookie, ChefHat } from "lucide-react";
import OwnersHero from "../../assets/OwnersHero.jpg";
import BakeryInterior from "../../assets/BakeryInterior.jpg";
import PremiumLogo from "../../assets/logo_premium.png";
import SEO from "../Shared/SEO";

const AboutPage = () => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="min-h-screen bg-transparent font-sans text-[#2D211E]">
            <SEO
                title="אודותינו"
                description="הסיפור של מאפיית מרציפן — משושנה ויוסף אוזרקו, ועד לדור הבא איציק ושלומי. מאפייה משפחתית ירושלמית בשוק מחנה יהודה."
                url="/about"
            />



            {/* Introduction / The Beginning */}
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32">
                {/* Frame Container */}
                <div className="relative bg-white rounded-[3rem] p-10 md:p-20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-[#D4AF37]/20 overflow-hidden">
                    {/* Decorative Background Elements inside Frame */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-[10rem] -z-0"></div>

                    <div className="absolute top-8 right-8 w-40 h-40 border-t-2 border-r-2 border-[#D4AF37]/30 rounded-tr-[2.5rem] -z-0 pointer-events-none"></div>
                    <div className="absolute bottom-8 left-8 w-40 h-40 border-b-2 border-l-2 border-[#D4AF37]/30 rounded-bl-[2.5rem] -z-0 pointer-events-none"></div>

                    {/* Magical Decorations - Introduction */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-10 left-[10%] text-[#B91C1C]/5 animate-spin duration-[20000ms]">
                            <Cookie size={120} />
                        </div>
                        <div className="absolute bottom-20 right-[5%] text-[#D4AF37]/10 animate-bounce duration-[6000ms]">
                            <ChefHat size={100} />
                        </div>
                        <div className="absolute top-[20%] right-[15%] text-[#D4AF37] opacity-20 animate-pulse delay-[500ms]">
                            <Star size={24} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
                        <div className="w-full md:w-1/2 text-right group/text">
                            <div className="inline-block relative mb-8 group/badge cursor-default">
                                <span className="relative z-10 text-[#D4AF37] font-bold tracking-[0.2em] text-lg uppercase px-4 py-2 border border-[#D4AF37]/30 rounded-full bg-white/50 backdrop-blur-sm transition-all duration-500 group-hover/badge:bg-[#D4AF37] group-hover/badge:text-white group-hover/badge:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                    ההתחלה שלנו
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-7xl font-black text-[#B91C1C] mb-8 leading-tight drop-shadow-xl transition-transform duration-700 group-hover/text:translate-x-2">
                                הסיפור של <br />
                                <span className="text-[#2D211E] relative inline-block transition-colors duration-500">
                                    שושנה ויוסף
                                    {/* Decorative underline */}
                                    <svg className="absolute w-[110%] h-3 -bottom-2 -right-[5%] text-[#D4AF37] transition-all duration-700 group-hover/text:scale-x-110" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-60 group-hover/text:opacity-100 transition-opacity duration-500" />
                                    </svg>
                                </span>
                            </h2>

                            <div className="space-y-6">
                                <p className="text-xl md:text-2xl leading-relaxed text-gray-700 font-light border-r-4 border-[#D4AF37]/60 pr-8 transition-all duration-500 group-hover/text:border-[#B91C1C] group-hover/text:text-[#2D211E]">
                                    מרציפן נוסדה על ידי <strong className="font-bold text-[#B91C1C] transition-colors duration-500">שושנה ז״ל ויוסף אוזרקו</strong> — מאפייה משפחתית ירושלמית שהתחילה בלב שוק מחנה יהודה, מתוך אהבה לאפייה אמיתית ולקשר האישי עם כל לקוח.
                                </p>
                                <p className="text-xl leading-relaxed text-gray-600 font-light transition-all duration-500 group-hover/text:text-[#2D211E] hover:translate-x-2">
                                    מההתחלה הייתה כאן הקפדה אחת בלתי מתפשרת: <strong className="font-medium text-[#2D211E] group-hover/text:text-[#B91C1C]">חומרי גלם איכותיים, אפייה במנות קטנות, ואותו מתכון משפחתי</strong>. בלי קיצורי דרך. בלי פשרות.
                                </p>
                                <p className="text-xl leading-relaxed text-gray-600 font-light transition-all duration-500 group-hover/text:text-[#2D211E] hover:translate-x-2">
                                    שושנה ז״ל הייתה הנשמה של המקום — חיוך, חום אנושי, והקפדה אימהית על כל פרט. יוסף הביא את המקצועיות והדיוק שעמדו מאחורי כל מגש שיצא מהתנור.
                                    זו המורשת שהבנים שלהם ממשיכים היום, באותה רוח ובאותם ערכים.
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 relative perspective-1000">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[10px] border-white transform -rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) cursor-pointer group origin-center">
                                {/* Image Overlay for "glare" effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-20 group-hover:opacity-0 transition-opacity duration-500"></div>

                                <img
                                    src={OwnersHero}
                                    alt="מגש רוגלך טרי במאפיית מרציפן, שוק מחנה יהודה"
                                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                />
                            </div>

                            {/* Decorative Elements around image */}
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse"></div>
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B91C1C]/10 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Secret / Quote Divider */}
            <div className="bg-[#2D211E] text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    {/* Abstract pattern could go here */}
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <span className="text-6xl text-[#D4AF37] font-serif block mb-6">"</span>
                    <h3 className="text-3xl md:text-5xl font-serif leading-normal md:leading-relaxed mb-6">
                        מאפייה משפחתית ירושלמית. אותם תנורים, אותו מתכון, אותה משפחה — דור אחר דור.
                    </h3>
                    <Heart className="mx-auto animate-heart-slow w-16 h-16 md:w-20 md:h-20 drop-shadow-lg mb-6" />
                    <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
                </div>
            </div>

            {/* The Next Generation */}
            <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                {/* Frame Container */}
                <div className="relative bg-white rounded-[3rem] p-10 md:p-20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-[#D4AF37]/20 overflow-hidden">
                    {/* Decorative Background Elements inside Frame */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-br-[10rem] -z-0"></div>

                    <div className="absolute top-8 left-8 w-40 h-40 border-t-2 border-l-2 border-[#D4AF37]/30 rounded-tl-[2.5rem] -z-0 pointer-events-none"></div>
                    <div className="absolute bottom-8 right-8 w-40 h-40 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-[2.5rem] -z-0 pointer-events-none"></div>

                    {/* Magical Decorations - Next Gen */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute bottom-10 left-[15%] text-[#D4AF37]/10 animate-spin duration-[15000ms]">
                            <Cookie size={100} />
                        </div>
                        <div className="absolute top-20 right-[10%] text-[#B91C1C]/5 animate-bounce duration-[8000ms]">
                            <ChefHat size={80} />
                        </div>
                        <div className="absolute top-[40%] left-[5%] text-[#D4AF37] opacity-20 animate-pulse delay-[1000ms]">
                            <Star size={18} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
                        <div className="w-full md:w-1/2 text-right group/text">
                            <div className="inline-block relative mb-8 group/badge cursor-default">
                                <span className="relative z-10 text-[#D4AF37] font-bold tracking-[0.2em] text-lg uppercase px-4 py-2 border border-[#D4AF37]/30 rounded-full bg-white/50 backdrop-blur-sm transition-all duration-500 group-hover/badge:bg-[#D4AF37] group-hover/badge:text-white group-hover/badge:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                    המורשת ממשיכה
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-7xl font-black text-[#B91C1C] mb-8 leading-tight drop-shadow-xl transition-transform duration-700 group-hover/text:translate-x-2">
                                הדור הבא <br />
                                <span className="text-[#2D211E] relative inline-block transition-colors duration-500">
                                    איציק ושלומי
                                    {/* Decorative underline */}
                                    <svg className="absolute w-[110%] h-3 -bottom-2 -right-[5%] text-[#D4AF37] transition-all duration-700 group-hover/text:scale-x-110" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-60 group-hover/text:opacity-100 transition-opacity duration-500" />
                                    </svg>
                                </span>
                            </h2>

                            <div className="space-y-6 text-gray-600 font-light">
                                <p className="text-xl md:text-2xl leading-relaxed border-r-4 border-[#D4AF37]/60 pr-8 transition-all duration-500 group-hover/text:border-[#B91C1C] group-hover/text:text-[#2D211E]">
                                    היום ממשיכים את המאפייה <strong className="font-bold text-[#B91C1C] transition-colors duration-500">איציק ושלומי אוזרקו</strong>, בניהם של שושנה ויוסף. הם גדלו במאפייה, למדו את המקצוע מההורים, וקיבלו על עצמם להמשיך בדיוק את אותה דרך.
                                </p>
                                <p className="text-xl leading-relaxed transition-all duration-500 group-hover/text:text-[#2D211E] hover:translate-x-2">
                                    אותו מתכון משפחתי, אותם חומרי גלם, אותה הקפדה אימהית על כל פרט — <strong className="font-bold text-[#B91C1C] transition-colors duration-500">כל יום מחדש, באותה רוח שההורים הנחילו</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Next Gen image */}
                        <div className="w-full md:w-1/2 relative perspective-1000">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[10px] border-white transform rotate-2 hover:-rotate-1 hover:scale-110 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) cursor-pointer group origin-center">
                                {/* Image Overlay for "glare" effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-20 group-hover:opacity-0 transition-opacity duration-500"></div>

                                <img
                                    src={BakeryInterior}
                                    alt="פנים מאפיית מרציפן בשוק מחנה יהודה — מאפים על הדלפק"
                                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                                />
                            </div>

                            {/* Decorative Elements around image */}
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse"></div>
                            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#B91C1C]/10 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Values - Dramatic Redesign */}
            <div className="bg-gradient-to-b from-white via-[#FDF6E3]/30 to-white py-32 relative overflow-hidden">
                {/* Background Watermark */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none transition-all duration-500 ${isHovered ? "opacity-[0.15]" : "opacity-[0.03]"}`}>
                    <span className={`text-[15rem] md:text-[20rem] font-bold uppercase tracking-widest leading-none transition-colors duration-500 ${isHovered ? "text-[#B91C1C]" : "text-[#2D211E]"}`}>
                        PROMISE
                    </span>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24 group/header cursor-default">
                        <span className="text-[#D4AF37] tracking-[0.3em] text-sm font-bold uppercase mb-4 block transition-all duration-500 group-hover/header:tracking-[0.5em] group-hover/header:text-[#B91C1C]">
                            הערכים שלנו
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black text-[#B91C1C] drop-shadow-2xl mb-6 relative inline-block transition-transform duration-500 group-hover/header:scale-105">
                            ההבטחה שלנו
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#D4AF37] transition-all duration-500 group-hover/header:w-full group-hover/header:bg-[#D4AF37]"></div>
                        </h2>
                        <p className="text-gray-600 text-xl font-light mt-8 max-w-2xl mx-auto leading-relaxed transition-colors duration-500 group-hover/header:text-[#2D211E]">
                            אנחנו לא רק אופים לחם ועוגות. אנחנו אופים זיכרונות, רגעים ושמחה.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Value 1 - Tradition */}
                        <div
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative p-10 rounded-[2.5rem] bg-white border border-[#D4AF37]/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(185,28,28,0.3)] hover:bg-[#B91C1C] transition-all duration-500 ease-out hover:-translate-y-4 overflow-hidden">
                            {/* Card Background Pattern (Visible on hover) */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 mb-8 rounded-full bg-[#FAFAFA] group-hover:bg-white/10 flex items-center justify-center transition-colors duration-500 shadow-inner group-hover:shadow-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#B91C1C] group-hover:text-[#D4AF37] transition-colors duration-500 group-hover:scale-110 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                <h3 className="text-3xl font-bold mb-6 text-[#2D211E] group-hover:text-white transition-colors duration-500">מסורת</h3>

                                <p className="text-gray-600 group-hover:text-white/90 font-light leading-relaxed transition-colors duration-500 text-lg">
                                    המתכון המשפחתי של שושנה ויוסף אוזרקו עובר מדור לדור ולא השתנה. אותו טעם, אותו ריח, אותה נוסטלגיה שתמיד מחזירה אתכם הביתה.
                                </p>
                            </div>
                        </div>

                        {/* Value 2 - Quality */}
                        <div
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative p-10 rounded-[2.5rem] bg-white border border-[#D4AF37]/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(45,33,30,0.4)] hover:bg-[#2D211E] transition-all duration-500 ease-out hover:-translate-y-6 overflow-hidden mt-0 md:-mt-8">
                            {/* Card Background Pattern (Visible on hover) */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 mb-8 rounded-full bg-[#FAFAFA] group-hover:bg-white/10 flex items-center justify-center transition-colors duration-500 shadow-inner group-hover:shadow-none">
                                    <Award className="h-10 w-10 text-[#2D211E] group-hover:text-[#D4AF37] transition-colors duration-500 group-hover:scale-110 transform" strokeWidth={1.5} />
                                </div>

                                <h3 className="text-3xl font-bold mb-6 text-[#2D211E] group-hover:text-white transition-colors duration-500">איכות</h3>

                                <p className="text-gray-600 group-hover:text-white/90 font-light leading-relaxed transition-colors duration-500 text-lg">
                                    חומרי גלם משובחים שנבחרים בקפידה. בלי קיצורי דרך, בלי פשרות. רק הטוב ביותר שנכנס אלינו למטבח.
                                </p>
                            </div>
                        </div>

                        {/* Value 3 - Family */}
                        <div
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative p-10 rounded-[2.5rem] bg-white border border-[#D4AF37]/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(185,28,28,0.3)] hover:bg-[#B91C1C] transition-all duration-500 ease-out hover:-translate-y-4 overflow-hidden">
                            {/* Card Background Pattern (Visible on hover) */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 mb-8 rounded-full bg-[#FAFAFA] group-hover:bg-white/10 flex items-center justify-center transition-colors duration-500 shadow-inner group-hover:shadow-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#B91C1C] group-hover:text-[#D4AF37] transition-colors duration-500 group-hover:scale-110 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>

                                <h3 className="text-3xl font-bold mb-6 text-[#2D211E] group-hover:text-white transition-colors duration-500">משפחה</h3>

                                <p className="text-gray-600 group-hover:text-white/90 font-light leading-relaxed transition-colors duration-500 text-lg">
                                    מהרגע שנכנסתם, אתם חלק מהמשפחה. השירות ברוחב לב והחיוך הוא המרכיב הסודי בכל מאפה שלנו.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default AboutPage;
