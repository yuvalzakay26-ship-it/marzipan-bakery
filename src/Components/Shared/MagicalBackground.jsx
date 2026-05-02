import React from 'react';
import { Star, ChefHat, Cookie } from 'lucide-react';

const MagicalBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none h-full">
            {/* Base Background Color */}
            <div className="absolute inset-0 bg-transparent"></div>

            {/* Gradient Orbs - Fixed to top/bottom of page */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse duration-[8000ms]"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#B91C1C]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 animate-pulse duration-[10000ms]"></div>

            {/* Animated Shapes - Distributed vertically */}
            {/* Animated Shapes - Distributed vertically - Optimized for mobile */}
            <div className="absolute top-20 right-[15%] text-[#D4AF37]/20 animate-spin duration-[20000ms] hidden md:block">
                <Cookie size={100} />
            </div>
            <div className="absolute top-[30%] left-[5%] text-[#B91C1C]/10 animate-bounce duration-[6000ms] hidden md:block">
                <ChefHat size={80} />
            </div>
            {/* Kept smaller on mobile */}
            <div className="absolute top-[60%] right-[10%] text-[#D4AF37]/15 animate-spin duration-[25000ms]">
                <Cookie size={40} className="md:w-20 md:h-20" />
            </div>
            <div className="absolute bottom-40 left-[10%] text-[#B91C1C]/10 animate-bounce duration-[7000ms] hidden md:block">
                <ChefHat size={60} />
            </div>

            {/* Floating Stars - Distributed across full height */}
            {/* Floating Stars - Distributed across full height */}
            <div className="absolute top-[15%] left-[20%] text-[#D4AF37] opacity-60 animate-pulse delay-[200ms]">
                <Star size={24} fill="currentColor" />
            </div>
            <div className="absolute top-[25%] right-[25%] text-[#B91C1C] opacity-30 animate-bounce duration-[4000ms] hidden md:block">
                <Star size={18} fill="currentColor" />
            </div>
            <div className="absolute top-[80%] left-[15%] text-[#D4AF37] opacity-40 animate-pulse delay-[1500ms]">
                <Star size={20} fill="currentColor" />
            </div>
            <div className="absolute top-[30%] right-[5%] text-[#D4AF37] opacity-30 animate-bounce duration-[5000ms] hidden md:block">
                <Star size={16} fill="currentColor" />
            </div>
        </div>
    );
};

export default MagicalBackground;
