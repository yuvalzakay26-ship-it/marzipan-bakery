import React, { useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productsData } from '../../data/productsData';
import { UPSELL_PRIORITY_IDS } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

// Flatten products once at module load — avoids rebuilding on every render.
const allProducts = Object.values(productsData).flat();
const findById = (id) => allProducts.find((p) => p.id === id);

// Map a product id → the data slice it belongs to. Used to detect when a cart
// is already category-saturated so we suggest a *different* category instead
// of stacking 5th rugelach on top of 4 rugelach.
const idToCategory = new Map();
Object.entries(productsData).forEach(([cat, list]) => {
    list.forEach((p) => idToCategory.set(p.id, cat));
});

const CartUpsell = () => {
    const { cartItems, addToCart } = useCart();

    // Smarter suggestion ranking:
    //   1. Skip anything already in cart.
    //   2. Prefer products from a category NOT yet represented in the cart
    //      (forces variety → larger baskets, not deeper repetition).
    //   3. Within that, keep UPSELL_PRIORITY_IDS ordering (bakery's own picks).
    //   4. Cap at 2 — keep the panel quiet.
    const suggestions = useMemo(() => {
        const inCart = new Set(cartItems.map((i) => i.id));
        const cartCategories = new Set(
            cartItems.map((i) => idToCategory.get(i.id)).filter(Boolean)
        );

        const candidates = UPSELL_PRIORITY_IDS
            .map(findById)
            .filter((p) => p && !inCart.has(p.id));

        const newCategoryFirst = candidates.filter((p) => !cartCategories.has(idToCategory.get(p.id)));
        const sameCategory     = candidates.filter((p) => cartCategories.has(idToCategory.get(p.id)));

        return [...newCategoryFirst, ...sameCategory].slice(0, 2);
    }, [cartItems]);

    if (cartItems.length === 0 || suggestions.length === 0) return null;

    const handleAdd = (product) => {
        addToCart(product);
        trackEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
            product_id: product.id,
            name: product.name,
            price: product.priceValue,
            currency: 'ILS',
            source: 'cart_upsell'
        });
    };

    return (
        <div className="border-t border-dashed border-[#D4AF37]/40 pt-5 mt-2">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <h4 className="text-sm font-bold text-[#380909]">אולי תאהבו גם</h4>
            </div>
            <ul className="space-y-2">
                {suggestions.map((p) => (
                    <li
                        key={p.id}
                        className="flex items-center gap-3 bg-[#FFF8E1]/60 hover:bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-xl p-2.5 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#380909] truncate">{p.name}</p>
                            <p className="text-xs text-gray-500" dir="ltr">{p.priceDisplay}</p>
                        </div>
                        <button
                            onClick={() => handleAdd(p)}
                            aria-label={`הוסף ${p.name} לסל`}
                            className="shrink-0 inline-flex items-center gap-1 bg-[#B91C1C] hover:bg-[#380909] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors min-h-[36px]"
                        >
                            <Plus size={14} />
                            הוסיפו
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CartUpsell;
