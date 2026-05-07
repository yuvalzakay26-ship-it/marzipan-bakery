import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef(null);

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

    const scrollToTop = () => {
        // Drop focus so mobile browsers don't retain a synthesized :hover/:focus
        // visual after the tap. Some Android/Chrome devices keep :hover applied
        // until the user taps elsewhere, leaving the button stuck in red.
        buttonRef.current?.blur();
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Hover styles are gated behind (hover:hover) and (pointer:fine) — only real
    // mouse-capable devices apply them. Tailwind v4 already gates `hover:` with
    // `(hover:hover)`, but some hybrid/Android devices report it as true on
    // touch; adding `(pointer:fine)` is the reliable kill-switch.
    return (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:right-8 z-50">
            <button
                ref={buttonRef}
                type="button"
                onClick={scrollToTop}
                className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg border-2 border-[#D4AF37] bg-white text-[#B91C1C]
                    [@media(hover:hover)and(pointer:fine)]:hover:bg-[#B91C1C]
                    [@media(hover:hover)and(pointer:fine)]:hover:text-white
                    [@media(hover:hover)and(pointer:fine)]:hover:border-[#B91C1C]
                    [@media(hover:hover)and(pointer:fine)]:hover:-translate-y-1
                    transition-all duration-300 ease-in-out focus:outline-none flex items-center justify-center touch-manipulation
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
                `}
                aria-label="Scroll to top"
            >
                <ArrowUp size={22} strokeWidth={2.5} aria-hidden="true" />
            </button>
        </div>
    );
};

export default ScrollToTopButton;
