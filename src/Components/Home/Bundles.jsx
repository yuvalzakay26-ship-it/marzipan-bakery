import React, { useMemo } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { productsData } from '../../data/productsData';
import { POPULAR_BUNDLES } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

const allProducts = Object.values(productsData).flat();
const findById = (id) => allProducts.find((p) => p.id === id);

const Bundles = () => {
    const { addToCart, setIsCartOpen } = useCart();

    const bundles = useMemo(
        () => POPULAR_BUNDLES.filter((b) => b.enabled),
        []
    );

    if (bundles.length === 0) return null;

    const handleAddBundle = (bundle) => {
        const items = bundle.productIds.map(findById).filter(Boolean);
        items.forEach((p) => addToCart(p));
        trackEvent(ANALYTICS_EVENTS.APPLY_BUNDLE, {
            bundle_id: bundle.id,
            value: bundle.priceValue,
            items_count: items.length,
            currency: 'ILS'
        });
        setIsCartOpen(true);
    };

    return (
        <section
            id="bundles"
            className="py-16 md:py-24 bg-white border-t border-[#D4AF37]/15"
            aria-label="חבילות פופולריות"
        >
            <div className="max-w-6xl mx-auto px-5 sm:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] font-bold tracking-[0.34em] text-[11px] uppercase">המארזים החתומים</span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] tracking-tight mb-4 leading-tight">
                        מארזים שאומרים <span className="text-[#B91C1C]">"חשבתי עליכם"</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto leading-relaxed font-light">
                        קומבינציות שאספנו על סמך מה שאתם הזמנתם הכי הרבה. בחירה אחת, מארז שלם, מוכן לקחת.
                    </p>
                </div>

                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {bundles.map((bundle) => {
                        const items = bundle.productIds.map(findById).filter(Boolean);
                        return (
                            <li
                                key={bundle.id}
                                className="bg-white border border-[#D4AF37]/25 rounded-3xl p-7 flex flex-col shadow-[0_18px_40px_-25px_rgba(56,9,9,0.3)] hover:shadow-[0_28px_60px_-25px_rgba(56,9,9,0.45)] hover:border-[#D4AF37]/55 transition-all hover:-translate-y-1 relative overflow-hidden"
                            >
                                <span className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-[#D4AF37]/8 blur-2xl pointer-events-none" aria-hidden="true" />
                                <div className="relative">
                                    <div className="text-4xl mb-3 leading-none" aria-hidden="true">{bundle.emoji}</div>
                                    <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#B91C1C] mb-1.5">{bundle.subtitle}</p>
                                    <h3 className="text-2xl font-black text-[#380909] mb-5 leading-tight">{bundle.title}</h3>

                                    <ul className="text-sm text-[#380909] space-y-2 mb-6">
                                        {items.map((item) => (
                                            <li key={item.id} className="flex items-center gap-2.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0"></span>
                                                <span className="truncate font-medium">{item.name}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-end justify-between gap-3 mt-auto pt-5 border-t border-[#D4AF37]/25">
                                        <div>
                                            <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#5D4037]/70">סה״כ למארז</p>
                                            <p className="text-3xl font-black text-[#B91C1C] leading-none mt-1" dir="ltr">₪{bundle.priceValue}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddBundle(bundle)}
                                            className="inline-flex items-center gap-1.5 bg-[#380909] hover:bg-[#B91C1C] text-white text-sm font-bold px-5 py-3 rounded-full transition-colors min-h-[44px] shadow-[0_10px_24px_-12px_rgba(56,9,9,0.5)]"
                                        >
                                            <Plus size={14} aria-hidden="true" />
                                            הוסיפו לסל
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-10 text-center">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-[#B91C1C] font-bold hover:text-[#380909] transition-colors group"
                    >
                        בנו את החבילה שלכם מהקטלוג המלא
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Bundles;
