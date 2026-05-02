import React, { useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productsData } from '../../data/productsData';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

const allProducts = Object.values(productsData).flat();
const findById = (id) => allProducts.find((p) => p.id === id);

const DISMISS_KEY = 'marzipanReorderDismissedAt';
const ORDER_KEY = 'marzipanLastOrder';
const DISMISS_TTL_HOURS = 24;

// Read the saved order at module-init / first render. Returns { order, dismissed }
// so the component can initialize its state synchronously without an effect.
const readSavedOrder = () => {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ORDER_KEY) : null;
        if (!raw) return { order: null, dismissed: true };
        const parsed = JSON.parse(raw);
        if (!parsed?.items?.length) return { order: null, dismissed: true };

        const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
        const stillDismissed =
            dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_HOURS * 3600 * 1000;
        if (stillDismissed) return { order: null, dismissed: true };

        return { order: parsed, dismissed: false };
    } catch {
        return { order: null, dismissed: true };
    }
};

// One-tap reorder for returning customers. Reads the snapshot of the last
// completed order (saved when the user submitted the WhatsApp checkout form).
// Hides itself if dismissed or if the user already has cart items.
const ReorderPrompt = () => {
    const { cartItems, addToCart, setIsCartOpen } = useCart();
    const initial = useMemo(() => readSavedOrder(), []);
    const [dismissed, setDismissed] = useState(initial.dismissed);
    const lastOrder = initial.order;

    const items = useMemo(
        () => (lastOrder?.items || []).map((i) => findById(i.id)).filter(Boolean),
        [lastOrder]
    );

    if (dismissed || !lastOrder || items.length === 0 || cartItems.length > 0) {
        return null;
    }

    const handleReorder = () => {
        items.forEach((p, idx) => {
            const qty = lastOrder.items[idx]?.quantity || 1;
            for (let i = 0; i < qty; i++) addToCart(p);
        });
        trackEvent(ANALYTICS_EVENTS.REORDER_CLICK, {
            items_count: items.length,
            value: lastOrder.total
        });
        setIsCartOpen(true);
        setDismissed(true);
    };

    const handleDismiss = () => {
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch { /* ignore */ }
        setDismissed(true);
    };

    return (
        <div
            role="dialog"
            aria-label="הזמנה חוזרת"
            className="fixed top-24 inset-x-3 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm z-[90]"
        >
            <div className="bg-white border border-[#D4AF37]/40 rounded-2xl shadow-2xl p-4 flex items-start gap-3" dir="rtl">
                <div className="w-11 h-11 rounded-full bg-[#FFF8E1] border border-[#D4AF37]/40 flex items-center justify-center text-[#B91C1C] shrink-0">
                    <RotateCcw size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#380909] leading-snug mb-0.5">
                        ברוכים השבים! להזמין שוב את ההזמנה הקודמת?
                    </p>
                    <p className="text-xs text-gray-500 truncate mb-3">
                        {items.length} פריטים · ₪{lastOrder.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleReorder}
                            className="flex-1 inline-flex items-center justify-center bg-[#B91C1C] hover:bg-[#380909] text-white text-sm font-bold px-3 py-2 rounded-lg transition-colors min-h-[40px]"
                        >
                            כן, הוסיפו לסל
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-500 text-xs hover:text-gray-700 px-2"
                        >
                            לא תודה
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    aria-label="סגור"
                    className="text-gray-300 hover:text-gray-500 shrink-0 p-1"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ReorderPrompt;
