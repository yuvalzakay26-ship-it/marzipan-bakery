import React from 'react';
import { Gift, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { BUNDLE_OFFER } from '../../data/siteContent';

// Visual progress toward a bakery-committed reward threshold.
// Disabled by default in siteContent — only renders when the bakery confirms the offer.
const BundleProgress = () => {
    const { cartTotal } = useCart();

    if (!BUNDLE_OFFER.enabled) return null;

    const threshold = BUNDLE_OFFER.threshold;
    const reached = cartTotal >= threshold;
    const remaining = Math.max(0, threshold - cartTotal);
    const pct = Math.min(100, Math.round((cartTotal / threshold) * 100));

    return (
        <div
            className={`rounded-xl p-3.5 mb-4 border ${reached
                ? 'bg-green-50 border-green-200'
                : 'bg-[#FFF8E1] border-[#D4AF37]/30'
                }`}
        >
            <div className="flex items-center gap-2 mb-2">
                {reached ? (
                    <Check size={18} className="text-green-700 shrink-0" />
                ) : (
                    <Gift size={18} className="text-[#B91C1C] shrink-0" />
                )}
                <p className={`text-sm font-bold ${reached ? 'text-green-800' : 'text-[#380909]'}`}>
                    {reached
                        ? `מצוין! מגיע לכם ${BUNDLE_OFFER.rewardLabel}`
                        : `עוד ₪${remaining} ותקבלו ${BUNDLE_OFFER.rewardLabel}`}
                </p>
            </div>
            <div className="h-2 rounded-full bg-white/70 overflow-hidden border border-black/5" aria-hidden="true">
                <div
                    className={`h-full transition-all duration-500 ${reached
                        ? 'bg-green-500'
                        : 'bg-gradient-to-l from-[#B91C1C] to-[#D4AF37]'
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

export default BundleProgress;
