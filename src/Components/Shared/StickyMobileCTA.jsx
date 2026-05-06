import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Phone, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CONTACT_INFO } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

// Mobile-only thumb-zone CTA bar. Shows after the user has scrolled past the hero.
// The primary slot is dynamic:
//   - Cart empty   → WhatsApp inquiry (pre-filled message so the composer isn't blank)
//   - Cart has items → "סיום ההזמנה · ₪{total}" — opens the cart drawer.
const STARTER_MESSAGE = 'היי! אני רוצה להתייעץ על הזמנה מהמאפייה 🥐';

const StickyMobileCTA = () => {
    const { cartCount, cartTotal, toggleCart } = useCart();
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 320);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Hide on the contact page (the page IS the CTA) and on legal pages.
    const hidden = ['/contact', '/terms', '/privacy', '/accessibility'].includes(location.pathname);
    if (hidden) return null;

    const hasCart = cartCount > 0;
    const whatsappUrl =
        `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(STARTER_MESSAGE)}`;

    return (
        <div
            className={`fixed bottom-0 inset-x-0 z-[95] lg:hidden transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'
                }`}
            aria-hidden={!visible}
        >
            <div className="bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-3 py-2.5 flex items-stretch gap-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                {hasCart ? (
                    <button
                        type="button"
                        onClick={() => {
                            trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, {
                                target: 'sticky_checkout',
                                cart_count: cartCount,
                                cart_total: cartTotal
                            });
                            toggleCart();
                        }}
                        className="flex-[2] inline-flex items-center justify-center gap-2 bg-gradient-to-l from-[#B91C1C] to-[#380909] hover:from-[#921616] hover:to-[#1A0F0A] text-white font-bold rounded-full shadow-[0_8px_20px_-6px_rgba(185,28,28,0.55)] transition-all min-h-[54px] ring-1 ring-[#D4AF37]/35"
                    >
                        <span>סיום ההזמנה</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/15 text-[12px] font-black" dir="ltr">₪{cartTotal}</span>
                        <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                ) : (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                            trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, { source: 'sticky_mobile' })
                        }
                        className="flex-[2] inline-flex items-center justify-center gap-2 bg-gradient-to-l from-[#25D366] to-[#128C7E] hover:from-[#1ba84e] hover:to-[#0e6e62] text-white font-bold rounded-full shadow-[0_8px_20px_-6px_rgba(37,211,102,0.55)] transition-all min-h-[54px] ring-1 ring-white/30"
                    >
                        <MessageCircle size={18} aria-hidden="true" />
                        <span>הזמנה בוואטסאפ</span>
                    </a>
                )}

                {!hasCart && (
                    <button
                        type="button"
                        onClick={toggleCart}
                        aria-label={`פתח את הסל (${cartCount})`}
                        className="flex-1 relative inline-flex items-center justify-center gap-1 font-bold rounded-full transition-colors min-h-[52px] border bg-[#FFF8E1] border-[#D4AF37]/40 text-[#380909]"
                    >
                        <ShoppingBag size={18} />
                        <span>הסל</span>
                    </button>
                )}

                {hasCart && (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                            trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, { source: 'sticky_mobile_secondary' })
                        }
                        aria-label="התייעצות בוואטסאפ"
                        className="shrink-0 inline-flex items-center justify-center w-[52px] bg-[#25D366] text-white rounded-full transition-colors min-h-[52px] hover:bg-[#1ba84e]"
                    >
                        <MessageCircle size={18} />
                    </a>
                )}

                <a
                    href={`tel:${CONTACT_INFO.phoneTel}`}
                    onClick={() =>
                        trackEvent(ANALYTICS_EVENTS.CALL_BRANCH_CLICK, { source: 'sticky_mobile' })
                    }
                    aria-label="התקשרו אלינו"
                    className="shrink-0 inline-flex items-center justify-center w-[52px] bg-white border border-[#B91C1C] text-[#B91C1C] rounded-full transition-colors min-h-[52px]"
                >
                    <Phone size={18} />
                </a>
            </div>
        </div>
    );
};

export default StickyMobileCTA;
