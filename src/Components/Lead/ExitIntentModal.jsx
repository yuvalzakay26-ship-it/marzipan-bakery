import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Gift, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import { recordLead, isExitIntentMuted, muteExitIntent } from '../../lib/leads/leadCapture';

// Triggers when the user shows leaving intent:
//   - Desktop: cursor leaves the top of the viewport
//   - Mobile: scroll up after deep scroll (history-back proxy) OR 45s of inactivity
// Suppressed for 14 days after dismiss/submit. Disabled on legal/admin pages.
const HIDDEN_PATHS = ['/contact', '/terms', '/privacy', '/accessibility'];

const ExitIntentModal = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (HIDDEN_PATHS.includes(location.pathname)) return;
        if (location.pathname.startsWith('/admin')) return;
        if (isExitIntentMuted()) return;

        let armedAt = Date.now() + 8000; // wait 8s before arming — don't pop on first second
        let inactivityTimer;
        let triggered = false;

        const fire = (reason) => {
            if (triggered) return;
            triggered = true;
            setOpen(true);
            trackEvent('exit_intent_open', { reason, path: location.pathname });
        };

        const onMouseLeave = (e) => {
            if (Date.now() < armedAt) return;
            if (e.clientY <= 0) fire('cursor_top');
        };

        const onScroll = () => {
            if (Date.now() < armedAt) return;
            // Mobile signal: deep scroll then significant scroll-back.
            const scrolled = window.scrollY;
            if (window.innerWidth < 768 && scrolled > 1200 && window._lastY > scrolled + 150) {
                fire('scroll_back');
            }
            window._lastY = scrolled;
        };

        const resetInactivity = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (window.innerWidth < 768) fire('inactivity');
            }, 45_000);
        };

        document.addEventListener('mouseout', onMouseLeave);
        window.addEventListener('scroll', onScroll, { passive: true });
        ['touchstart', 'click', 'scroll'].forEach((e) =>
            window.addEventListener(e, resetInactivity, { passive: true })
        );
        resetInactivity();

        return () => {
            document.removeEventListener('mouseout', onMouseLeave);
            window.removeEventListener('scroll', onScroll);
            ['touchstart', 'click', 'scroll'].forEach((e) =>
                window.removeEventListener(e, resetInactivity)
            );
            clearTimeout(inactivityTimer);
        };
    }, [location.pathname]);

    const close = () => {
        muteExitIntent();
        setOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!phone.trim()) return;
        recordLead({
            kind: 'exit_intent_first_order',
            phone,
            extra: { offer: 'first_order_gift_pastry' }
        });
        muteExitIntent();
        setSubmitted(true);
        setTimeout(() => setOpen(false), 2400);
    };

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="הצעה מיוחדת"
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-[#1A0F0A]/70 backdrop-blur-sm"
            onClick={close}
        >
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/40"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
            >
                {/* Decorative top */}
                <div className="bg-gradient-to-br from-[#380909] to-[#1A0F0A] text-white px-6 pt-7 pb-9 relative">
                    <button
                        onClick={close}
                        aria-label="סגור"
                        className="absolute top-3 left-3 text-white/70 hover:text-white p-1"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#1A0F0A] flex items-center justify-center mb-3">
                        <Gift size={22} aria-hidden="true" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.32em] uppercase text-[#D4AF37] mb-1.5">
                        רגע לפני שתעזבו
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                        מאפה במתנה — עם ההזמנה הראשונה שלכם
                    </h3>
                    <p className="text-sm text-red-100/80 leading-relaxed">
                        השאירו מספר טלפון. אנחנו שולחים קוד מתנה אישי בוואטסאפ.
                        מאפה אחד טרי, על חשבון הבית, עם ההזמנה הבאה.
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3">
                        <label htmlFor="exit-phone" className="block">
                            <span className="block text-xs font-bold text-[#380909] mb-1.5">
                                מספר טלפון
                            </span>
                            <input
                                id="exit-phone"
                                type="tel"
                                inputMode="tel"
                                pattern="0[0-9]{8,9}"
                                placeholder="050-1234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#D4AF37]/30 focus:border-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 text-base"
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            className="w-full bg-[#B91C1C] hover:bg-[#380909] text-white font-bold rounded-xl py-3.5 transition-colors min-h-[52px] inline-flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={18} aria-hidden="true" />
                            לשלוח לי את הקוד
                        </button>
                        <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                            ללא ספאם. אפשר להתנתק בכל רגע. הקוד תקף 30 יום.
                        </p>
                        <a
                            href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('היי! ראיתי את ההצעה במתנה ואשמח להזמין')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, { source: 'exit_intent' });
                                muteExitIntent();
                            }}
                            className="block w-full text-center text-sm text-[#25D366] hover:text-[#0e6e62] font-medium pt-1"
                        >
                            או — לדבר איתנו ישר בוואטסאפ
                        </a>
                    </form>
                ) : (
                    <div className="p-7 text-center">
                        <p className="text-2xl font-black text-[#15803D] mb-2">תודה!</p>
                        <p className="text-[#5D4037]">
                            הקוד יישלח לוואטסאפ שלכם בדקות הקרובות.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExitIntentModal;
