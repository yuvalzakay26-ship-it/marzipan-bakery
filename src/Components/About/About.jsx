import React from "react";
import { Award, Clock, Heart, Star, ChefHat, Cookie } from "lucide-react";
import MahaneYehudaStreet from "../../assets/MahaneYehudaStreet.jpg";
import MahaneYehudaNight from "../../assets/MahaneYehudaNight.jpg";
import MarzipanShopfront from "../../assets/MarzipanShopfront.jpg";
import BakeryInterior from "../../assets/BakeryInterior.jpg";

const About = () => {
    return (
        <section id="about" className="py-24 bg-[#FAFAFA] text-[#2D211E] overflow-hidden relative">
            {/* Background Pattern - Subtle */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Magical Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-[10%] text-[#D4AF37]/20 animate-spin duration-[15000ms]">
                    <Cookie size={80} />
                </div>
                <div className="absolute bottom-40 left-[5%] text-[#B91C1C]/10 animate-bounce duration-[4000ms]">
                    <ChefHat size={60} />
                </div>
                {/* Floating Stars */}
                <div className="absolute top-[15%] left-[20%] text-[#D4AF37] opacity-60 animate-pulse delay-[200ms]">
                    <Star size={24} fill="currentColor" />
                </div>
                <div className="absolute top-[40%] right-[30%] text-[#B91C1C] opacity-40 animate-bounce duration-[3000ms]">
                    <Star size={16} fill="currentColor" />
                </div>
                <div className="absolute bottom-[20%] right-[15%] text-[#D4AF37] opacity-50 animate-pulse delay-[1000ms]">
                    <Star size={32} fill="currentColor" />
                </div>
                {/* Soft Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <div className="order-2 lg:order-1 text-right group/text cursor-default">
                        <div className="inline-block relative mb-4">
                            <h3 className="text-[#D4AF37] font-bold tracking-widest text-sm uppercase flex items-center gap-2 transition-all duration-300 group-hover/text:tracking-[0.2em] group-hover/text:text-[#B91C1C]">
                                <span className="w-8 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover/text:w-16 group-hover/text:bg-[#B91C1C]"></span>
                                הסיפור הירושלמי שלנו
                            </h3>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-[#B91C1C] mb-8 leading-tight relative">
                            יותר מ-40 שנה של <br />
                            <span className="relative inline-block group/magic">
                                <span className="relative z-10 group-hover/magic:text-[#D4AF37] transition-colors duration-300">קסם בשוק</span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#D4AF37] group-hover/magic:text-[#B91C1C] transition-colors duration-300" viewBox="0 0 100 20" preserveAspectRatio="none">
                                    <path
                                        d="M0 10 Q 25 20 50 10 T 100 10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="path-animate"
                                    />
                                </svg>
                            </span>
                        </h2>

                        <p className="text-[#2D211E] text-lg leading-relaxed mb-6 font-light transition-all duration-300 group-hover/text:text-black hover:translate-x-1">
                            מי שמכיר את שוק מחנה יהודה, מכיר את הריח. הריח המתוק, החמאתי והמשכר שמושך אתכם ישר אל התנורים שלנו.
                            מאפיית מרציפן היא לא סתם מאפייה - היא חלק מההיסטוריה של ירושלים.
                        </p>
                        <p className="text-[#2D211E] text-lg leading-relaxed mb-10 font-light transition-all duration-300 group-hover/text:text-black hover:translate-x-1">
                            הרוגלך שלנו הפכו לאגדה, אבל הסוד שלנו הוא פשוט: אהבה ענקית, חומרי גלם שלא מתפשרים עליהם,
                            ואווירה שאי אפשר למצוא בשום מקום אחר בעולם.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Clock, title: "טרי חם מהתנור", text: "נאפה ברצף כל היום" },
                                { icon: Award, title: "המתכון הסודי", text: "הטעם המקורי של השוק" },
                                { icon: Heart, title: "אהבה ירושלמית", text: "שירות עם נשמה" },
                            ].map((item, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(185,28,28,0.4)] transition-all duration-500 hover:-translate-y-2 group cursor-default relative overflow-hidden z-0">
                                    {/* Fill Animation Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#B91C1C] to-[#8B0000] z-[-1] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>

                                    {/* Icon Container - Swaps to White on Red */}
                                    <div className="w-14 h-14 bg-[#FFF8E1] group-hover:bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 backdrop-blur-sm">
                                        <item.icon className="w-7 h-7 text-[#D4AF37] group-hover:text-white transition-colors duration-500" />
                                    </div>

                                    <h4 className="font-bold text-[#B91C1C] group-hover:text-white mb-1 relative z-10 text-lg transition-colors duration-500">{item.title}</h4>
                                    <p className="text-xs text-gray-500 group-hover:text-white/80 relative z-10 transition-colors duration-500">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images Grid */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <img
                                        src={MahaneYehudaNight}
                                        alt="שוק מחנה יהודה בלילה"
                                        className="w-full h-64 object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                                        <span className="text-white text-sm font-medium tracking-wider">קסם הלילה</span>
                                    </div>
                                </div>
                                <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <img
                                        src={MarzipanShopfront}
                                        alt="חזית החנות בשוק"
                                        className="w-full h-48 object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                                        <span className="text-white text-sm font-medium tracking-wider">החנות המיתולוגית</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <img
                                        src={BakeryInterior}
                                        alt="פנים המאפייה"
                                        className="w-full h-48 object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                                        <span className="text-white text-sm font-medium tracking-wider">נאפה באהבה</span>
                                    </div>
                                </div>
                                <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <img
                                        src={MahaneYehudaStreet}
                                        alt="רחוב מחנה יהודה"
                                        className="w-full h-64 object-cover filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                                        <span className="text-white text-sm font-medium tracking-wider">השוק שלנו</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
