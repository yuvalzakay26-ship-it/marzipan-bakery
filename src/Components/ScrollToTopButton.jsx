import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Toggle visibility based on scroll position
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 z-50">
            <button
                type="button"
                onClick={scrollToTop}
                className={`
                    p-4 rounded-full shadow-lg border-2 border-[#D4AF37] bg-white text-[#B91C1C]
                    hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] hover:-translate-y-1
                    transition-all duration-300 ease-in-out focus:outline-none flex items-center justify-center
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
                `}
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-8 w-8" strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default ScrollToTopButton;
