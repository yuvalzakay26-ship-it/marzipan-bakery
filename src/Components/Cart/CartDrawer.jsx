import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Sunrise, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { TRUST_SIGNALS } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import CheckoutModal from './CheckoutModal';
import CartUpsell from './CartUpsell';
import BundleProgress from './BundleProgress';

const CartDrawer = () => {
    // ... useCart hook ...
    const {
        cartItems,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal
    } = useCart();

    const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);

    // Fire view_cart whenever the drawer is opened with items in it.
    useEffect(() => {
        if (isCartOpen && cartItems.length > 0) {
            trackEvent(ANALYTICS_EVENTS.VIEW_CART, {
                items_count: cartItems.length,
                value: cartTotal,
                currency: 'ILS'
            });
        }
    }, [isCartOpen, cartItems.length, cartTotal]);

    // Lock body scroll while the drawer is open and wire Escape-to-close.
    // Uses the stable state setter (not toggleCart, which is recreated each
    // render). Closes the clear-confirm modal first so a single Escape doesn't
    // dismiss both surfaces in one keystroke.
    useEffect(() => {
        if (!isCartOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (showClearConfirm) {
                setShowClearConfirm(false);
            } else {
                setIsCartOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [isCartOpen, showClearConfirm, setIsCartOpen]);

    const handleCheckoutClick = () => {
        trackEvent(ANALYTICS_EVENTS.BEGIN_CHECKOUT, {
            value: cartTotal,
            currency: 'ILS',
            items_count: cartItems.length
        });
        setIsCheckoutOpen(true);
    };

    const handleClearCart = () => {
        setShowClearConfirm(true);
    };

    const confirmClearCart = () => {
        clearCart();
        setShowClearConfirm(false);
    };

    return (
        <>
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />

            {/* Backdrop — click to close. Keyboard users use Escape (handled above). */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleCart}
                aria-hidden="true"
            />

            {/* Custom Clear Cart Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-scale-in border border-gray-100">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#B91C1C]">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-[#2D211E] mb-2">לרוקן את הסל?</h3>
                        <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
                            כל המוצרים שבחרת יימחקו מהסל ולא ניתן יהיה לשחזר אותם. האם להמשיך?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                לא, השאר מוצרים
                            </button>
                            <button
                                onClick={confirmClearCart}
                                className="flex-1 py-2.5 bg-[#B91C1C] text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-900/20"
                            >
                                כן, רוקן סל
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-full md:w-[450px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-drawer-title"
                aria-hidden={!isCartOpen}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-[#2D211E]">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-[#B91C1C]" aria-hidden="true" />
                        <h2 id="cart-drawer-title" className="text-2xl font-black">סל הקניות שלי</h2>
                    </div>
                    <button
                        type="button"
                        onClick={toggleCart}
                        aria-label="סגור את סל הקניות"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-2"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                            <ShoppingBag size={64} className="opacity-20" />
                            <p className="text-xl font-medium">הסל שלך ריק עדיין...</p>
                            <p className="text-sm">זה הזמן להוסיף קצת מתוק לחיים!</p>
                            <button
                                onClick={toggleCart}
                                className="mt-4 px-6 py-2 border-2 border-[#D4AF37] text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37] hover:text-white transition-all"
                            >
                                חזרה לקטלוג
                            </button>
                        </div>
                    ) : (
                        <>
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#D4AF37]/30 transition-colors">
                                <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 line-clamp-2">{item.name}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label={`הסירו ${item.name} מהסל`}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded"
                                        >
                                            <Trash2 size={18} aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                aria-label={`הפחיתו כמות של ${item.name}`}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#B91C1C] disabled:opacity-50"
                                            >
                                                <Minus size={14} aria-hidden="true" />
                                            </button>
                                            <span className="font-bold w-4 text-center" aria-label={`כמות: ${item.quantity}`}>{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                aria-label={`הוסיפו עוד ${item.name}`}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#B91C1C]"
                                            >
                                                <Plus size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs text-gray-400">סה"כ:</div>
                                            <div className="font-black text-[#B91C1C] text-lg">₪{item.priceValue * item.quantity}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <CartUpsell />
                        </>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-5 md:p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sticky bottom-0">

                        <BundleProgress />

                        {/* Trust strip */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] md:text-xs">
                            <div className="flex items-center gap-1.5 bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-lg px-2.5 py-2 text-[#380909]">
                                <ShieldCheck size={14} className="text-[#B91C1C] shrink-0" />
                                <span className="font-medium leading-tight">{TRUST_SIGNALS.kosher}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#FFF8E1] border border-[#D4AF37]/30 rounded-lg px-2.5 py-2 text-[#380909]">
                                <Sunrise size={14} className="text-[#B91C1C] shrink-0" />
                                <span className="font-medium leading-tight">{TRUST_SIGNALS.freshDaily}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline mb-5">
                            <div className="flex flex-col">
                                <span className="text-gray-600 text-base md:text-lg">סה"כ לתשלום</span>
                                <span className="text-[11px] text-gray-500" dir="rtl">
                                    {cartItems.reduce((n, i) => n + i.quantity, 0)} פריטים · איסוף עצמי
                                </span>
                            </div>
                            <span className="text-2xl md:text-3xl font-black text-[#B91C1C]" dir="ltr">₪{cartTotal}</span>
                        </div>

                        <button
                            onClick={handleCheckoutClick}
                            className="w-full py-4 bg-[#380909] hover:bg-[#B91C1C] text-white font-bold text-lg md:text-xl rounded-xl shadow-[0_18px_40px_-12px_rgba(56,9,9,0.55)] hover:shadow-[0_22px_48px_-12px_rgba(185,28,28,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 mb-3 min-h-[56px] ring-1 ring-[#D4AF37]/40"
                        >
                            <span>סיום ההזמנה</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/15 text-base font-black" dir="ltr">₪{cartTotal}</span>
                            <ArrowLeft size={20} aria-hidden="true" />
                        </button>

                        <p className="text-center text-gray-500 text-xs leading-relaxed">
                            {TRUST_SIGNALS.secureOrder}
                        </p>

                        <div className="flex justify-center mt-2">
                            <button
                                onClick={handleClearCart}
                                className="text-gray-400 text-xs md:text-sm hover:text-red-500 transition-colors flex items-center gap-1 py-2 px-4 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                                <span>רוקן את הסל</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
