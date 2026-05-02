import React, { useState, useEffect } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import PremiumLogo from "../../assets/logo_premium.png";
import SEO from "../Shared/SEO";
import SchemaMarkup from "../Shared/SchemaMarkup";
import Breadcrumbs from "../Shared/Breadcrumbs";
import { BRANCHES } from "../../data/siteContent";
import { buildAllBranchSchemas } from "../../lib/seo/localBusinessSchema";

const BranchesPage = () => {
    // Helper to check if open
    const getBranchStatus = (schedule) => {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 60 + minute;

        const todaySchedule = schedule[day];
        // Saturday and any other "closed" day stores open/close as null.
        if (!todaySchedule || !todaySchedule.open || !todaySchedule.close) return false;

        const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = todaySchedule.close.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        return currentTime >= openTime && currentTime < closeTime;
    };

    const branches = BRANCHES;

    // Force re-render every minute to keep status fresh
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen font-sans relative select-none">
            <SEO
                title="הסניפים שלנו"
                description="בואו לבקר בסניפי מאפיית מרציפן בירושלים: שוק מחנה יהודה, סנטר 1 ומרכז העיר. כתובות, שעות פתיחה ודרכי הגעה."
                url="/branches"
            />
            {/* Per-branch LocalBusiness schema for Google Maps Pack ranking */}
            {buildAllBranchSchemas().map((s) => (
                <SchemaMarkup key={s['@id']} data={s} />
            ))}
            {/* Interactive Map Background */}
            <div className="fixed inset-0 z-0">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src="https://maps.google.com/maps?q=Jerusalem&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full opacity-100 filter grayscale-[0.2] contrast-[1.1]"
                    title="Jerusalem Map"
                    style={{ pointerEvents: "auto" }}
                ></iframe>
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/90 to-transparent pointer-events-none"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 pointer-events-none">

                {/* Header - Glassmorphism */}
                <div className="text-center mb-24 px-4 pointer-events-auto">
                    <div className="inline-block bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/40 group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-500 cursor-default">
                        <h1 className="text-5xl md:text-8xl font-black text-[#B91C1C] mb-8 relative inline-block tracking-tight drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                            הסניפים{" "}
                            <span className="relative z-10 text-[#2D211E]">שלנו</span>
                        </h1>

                        <div className="w-32 md:w-48 h-2 bg-gradient-to-r from-[#D4AF37] to-[#F9A825] rounded-full my-8 mx-auto shadow-lg transition-all duration-500 group-hover:w-64"></div>

                        <p className="text-2xl md:text-3xl text-[#2D211E] font-light max-w-3xl mx-auto leading-relaxed mt-6 tracking-wide">
                            בואו לבקר אותנו, להריח את האפייה ולהרגיש בבית.
                        </p>
                    </div>
                </div>

                {/* Branches Grid - 3 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pointer-events-auto">
                    {branches.map((branch, index) => {
                        const isOpen = getBranchStatus(branch.schedule);

                        return (
                            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 group border border-gray-100 flex flex-col h-full transform">
                                {/* Image Area */}
                                <div className="h-64 overflow-hidden relative shrink-0">
                                    <div className="absolute inset-0 bg-[#2D211E]/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={branch.img}
                                        alt={branch.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Premium Logo Overlay */}
                                    <div className="absolute top-0 left-4 z-20 w-16 h-16 opacity-90 drop-shadow-xl filter">
                                        <img src={PremiumLogo} alt="Marzipan Logo" className="w-full h-full object-contain" />
                                    </div>

                                    <div className={`absolute top-4 right-4 px-4 py-1 rounded-full font-bold text-sm shadow-sm z-20 flex items-center gap-2 ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                                        {isOpen ? "פתוח עכשיו" : "סגור כעת"}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 text-center text-[#2D211E] flex flex-col flex-grow relative">
                                    <div className="mb-4 relative inline-block mx-auto">
                                        <h3 className="text-2xl font-extrabold text-[#B91C1C] pb-2 inline-block px-4 relative transition-colors duration-300 group-hover:text-[#D4AF37]">
                                            {branch.name}
                                            {/* Dynamic Underline */}
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D4AF37]/30 transition-all duration-500 group-hover:w-full group-hover:bg-[#D4AF37] rounded-full"></span>
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 mb-6 font-light leading-relaxed h-12 transition-colors duration-300 group-hover:text-[#2D211E]">
                                        {branch.desc}
                                    </p>

                                    <div className="space-y-1 text-sm border-t border-gray-100 pt-6 mb-8">
                                        {/* Address Row */}
                                        <div className="flex items-start gap-4 p-2 rounded-lg transition-all duration-300 hover:bg-[#D4AF37]/10 group/row cursor-default">
                                            <div className="p-2 bg-[#F5F5F5] rounded-full group-hover/row:bg-[#D4AF37] transition-colors duration-300 mt-1 shrink-0">
                                                <MapPin size={16} className="text-[#2D211E] group-hover/row:text-white transition-colors duration-300" />
                                            </div>
                                            <span className="text-right text-gray-600 group-hover/row:text-[#2D211E] transition-colors duration-300 leading-relaxed pt-1">
                                                {branch.address}
                                            </span>
                                        </div>

                                        {/* Phone Row */}
                                        <div className="flex items-center gap-4 p-2 rounded-lg transition-all duration-300 hover:bg-[#D4AF37]/10 group/row">
                                            <div className="p-2 bg-[#F5F5F5] rounded-full group-hover/row:bg-[#D4AF37] transition-colors duration-300 shrink-0">
                                                <Phone size={16} className="text-[#2D211E] group-hover/row:text-white transition-colors duration-300" />
                                            </div>
                                            <a href={`tel:${branch.phoneTel}`} className="text-gray-600 font-medium group-hover/row:text-[#B91C1C] transition-colors duration-300">
                                                {branch.phone}
                                            </a>
                                        </div>

                                        {/* Hours Row */}
                                        <div className="flex items-start gap-4 p-2 rounded-lg transition-all duration-300 hover:bg-[#D4AF37]/10 group/row cursor-default">
                                            <div className="p-2 bg-[#F5F5F5] rounded-full group-hover/row:bg-[#D4AF37] transition-colors duration-300 mt-1 shrink-0">
                                                <Clock size={16} className="text-[#2D211E] group-hover/row:text-white transition-colors duration-300" />
                                            </div>
                                            <span className="text-right text-gray-600 whitespace-pre-line group-hover/row:text-[#2D211E] transition-colors duration-300 leading-relaxed pt-1">
                                                {branch.displayHours}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-4">
                                        <a
                                            href={branch.wazeLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#2D211E] text-[#D4AF37] py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors duration-300 shadow-md flex items-center justify-center gap-2 group/btn"
                                        >
                                            <span className="text-lg">Waze</span>
                                            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 transform group-hover/btn:scale-110 transition-transform" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z" />
                                            </svg>
                                        </a>

                                        <a href={`tel:${branch.phoneTel}`} className="bg-white border-2 border-[#B91C1C] text-[#B91C1C] py-3 rounded-xl font-bold hover:bg-[#B91C1C] hover:text-white transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn">
                                            <span>חייג</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BranchesPage;
