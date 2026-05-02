import React, { useEffect, useRef } from 'react';
import { ShoppingBag, Check, Plus, Flame } from 'lucide-react';
import SkeletonImage from '../Shared/SkeletonImage';
import ProductBadges from '../Shared/ProductBadges';
import { useCart } from '../../context/CartContext';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

// Maps the raw `unit` field on a product to the user-facing Hebrew label.
// We hide the secondary unit when priceDisplay already encodes it (e.g. "50 ₪ לק״ג").
const UNIT_LABELS = {
    unit: 'ליחידה',
    kg:   null   // already shown inside priceDisplay → don't repeat
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = React.useState(false);

    // Fire view_item once per visible card.
    const cardRef = useRef(null);
    const firedRef = useRef(false);
    useEffect(() => {
        if (!cardRef.current || firedRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !firedRef.current) {
                        firedRef.current = true;
                        trackEvent(ANALYTICS_EVENTS.VIEW_ITEM, {
                            product_id: product.id,
                            name: product.name,
                            price: product.priceValue,
                            currency: 'ILS'
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.4 }
        );
        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [product.id, product.name, product.priceValue]);

    const handleAddToCart = () => {
        addToCart(product);
        trackEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
            product_id: product.id,
            name: product.name,
            price: product.priceValue,
            currency: 'ILS'
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1800);
    };

    const unitLabel = UNIT_LABELS[product.unit] ?? null;
    const hasDescription = Boolean(product.description);

    return (
        <div
            ref={cardRef}
            className="group bg-white rounded-3xl overflow-hidden shadow-[0_12px_32px_-20px_rgba(56,9,9,0.25)] hover:shadow-[0_28px_60px_-25px_rgba(56,9,9,0.45)] transition-all duration-500 border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 flex flex-col h-full transform hover:-translate-y-1 relative"
        >
            {/* Image — taller, editorial framing */}
            <div className="relative h-56 md:h-64 overflow-hidden shrink-0 bg-[#FAF6EE]">
                <SkeletonImage
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full group-hover:scale-[1.06] transition-transform duration-700 ease-out ${product.id === 110 ? 'object-contain' : 'object-cover'}`}
                />

                {/* Always-on subtle bottom gradient for legibility + appetite framing */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1A0F0A]/35 via-[#1A0F0A]/10 to-transparent pointer-events-none" />
                {/* Stronger warm overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A]/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Tag badges — top-right (custom) */}
                {product.tags && product.tags.length > 0 && (
                    <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                        <ProductBadges tags={product.tags} size="sm" />
                    </div>
                )}

                {/* Category chip — bottom-left, premium gold pill */}
                {product.category && (
                    <div className="absolute bottom-3 left-3 z-20">
                        <span className="bg-white/95 backdrop-blur-sm text-[#380909] text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full shadow-sm border border-[#D4AF37]/30">
                            {product.category}
                        </span>
                    </div>
                )}

                {/* Quick-add — appears on hover (desktop). Mobile shows the full button below. */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`הוסיפו ${product.name} לסל`}
                    className="hidden md:flex absolute bottom-3 right-3 z-20 w-11 h-11 items-center justify-center rounded-full bg-[#380909] text-white shadow-lg ring-2 ring-white opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 hover:bg-[#B91C1C] hover:scale-105"
                >
                    {isAdded ? <Check size={18} /> : <Plus size={20} />}
                </button>
            </div>

            <div className="p-5 md:p-6 flex flex-col flex-1">
                {/* Title row */}
                <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg md:text-xl font-black text-[#380909] leading-snug">
                        {product.name}
                    </h3>
                    <div className="text-right shrink-0">
                        <span className="block text-xl font-black text-[#B91C1C] leading-none" dir="ltr">
                            {product.priceDisplay}
                        </span>
                        {unitLabel && (
                            <span className="block text-[10px] text-[#5D4037]/70 mt-1 tracking-wider">
                                {unitLabel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description — only show when we actually have one. No mass-duplicated filler. */}
                {hasDescription && (
                    <p className="text-[#5D4037] text-sm mb-4 line-clamp-2 leading-relaxed font-light">
                        {product.description}
                    </p>
                )}

                {/* Editorial meta row — kashrut, fresh-today pulse, gift-ready (if flagged) */}
                <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#5D4037]/80 mb-5 border-t border-[#D4AF37]/15 pt-3 ${hasDescription ? '' : 'mt-1'}`}>
                    <span className="inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#D4AF37]" aria-hidden="true"></span>
                        <span className="font-bold text-[#380909]">בד״ץ</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Flame size={11} className="text-[#B91C1C]" aria-hidden="true" />
                        <span className="font-medium text-[#380909]">נאפה הבוקר</span>
                    </span>
                    {product.giftReady && (
                        <span className="inline-flex items-center gap-1 text-[#B91C1C] font-bold">
                            <span className="w-1 h-1 rounded-full bg-[#B91C1C]" aria-hidden="true"></span>
                            ארוז למתנה
                        </span>
                    )}
                </div>

                {/* Premium CTA */}
                <button
                    onClick={handleAddToCart}
                    aria-label={`הוסיפו ${product.name} לסל`}
                    className={`w-full py-3.5 font-bold rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 mt-auto min-h-[52px] text-base
                        ${isAdded
                            ? 'bg-[#15803D] text-white shadow-[0_12px_28px_-10px_rgba(21,128,61,0.55)] scale-[1.01]'
                            : 'bg-[#380909] text-white hover:bg-[#B91C1C] shadow-[0_10px_24px_-12px_rgba(56,9,9,0.55)] hover:shadow-[0_14px_30px_-12px_rgba(185,28,28,0.55)] hover:-translate-y-0.5'
                        }`}
                >
                    {isAdded ? (
                        <>
                            <Check size={18} aria-hidden="true" />
                            <span>נוסף לסל</span>
                        </>
                    ) : (
                        <>
                            <span>הוסיפו לסל</span>
                            <ShoppingBag size={18} aria-hidden="true" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
