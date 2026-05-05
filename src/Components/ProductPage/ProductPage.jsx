import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Flame, ShoppingBag } from 'lucide-react';
import SEO from '../Shared/SEO';
import SchemaMarkup from '../Shared/SchemaMarkup';
import Breadcrumbs from '../Shared/Breadcrumbs';
import SkeletonImage from '../Shared/SkeletonImage';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../context/CartContext';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

// Mirrors the category list on ProductsPage so we can render a Hebrew
// label for the chip without spamming the page with a full filter sidebar.
const CATEGORY_LABELS = {
    rugelach: 'רוגלך',
    'dairy-pastries': 'מאפים מתוקים חלבי',
    donuts: 'סופגניות',
    'fridge-cakes': 'עוגות עגולות חלבי',
    'round-parve-cakes': 'עוגות עגולות פרווה',
    'babka-cakes': 'עוגות בובקט',
    'hard-cookies': 'עוגיות קשות',
    tarts: 'טארטים',
    bread: 'לחמים וחלות'
};

const LoadingState = () => (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
        <div className="space-y-4">
            <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
        </div>
    </div>
);

const ErrorState = () => (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 text-center bg-white border border-red-200 rounded-3xl p-10 shadow-sm">
        <h1 className="text-2xl font-black text-[#B91C1C] mb-3">לא הצלחנו לטעון את המוצר</h1>
        <p className="text-[#5D4037] font-light mb-8">
            אירעה שגיאה זמנית. נסו לרענן את הדף או חזרו לקטלוג.
        </p>
        <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#380909] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#B91C1C] transition-colors"
        >
            לקטלוג המלא
            <ArrowLeft size={18} aria-hidden="true" />
        </Link>
    </div>
);

const NotFoundState = () => (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 text-center bg-white border border-[#D4AF37]/30 rounded-3xl p-10 shadow-sm">
        <h1 className="text-3xl font-black text-[#380909] mb-3">המוצר לא נמצא</h1>
        <p className="text-[#5D4037] font-light mb-8">
            יכול להיות שהקישור ישן או שהמוצר ירד מהמדפים. בדקו את הקטלוג המלא לכל המאפים הזמינים היום.
        </p>
        <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#B91C1C] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#8B1515] transition-colors"
        >
            חזרה לקטלוג
            <ArrowLeft size={18} aria-hidden="true" />
        </Link>
    </div>
);

const ProductPage = () => {
    const { slug } = useParams();
    const { product, loading, error, notFound } = useProduct(slug);
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // Set document.title eagerly per the spec; SEO component also sets it via Helmet,
    // but updating directly avoids a flash for screen readers and history entries.
    useEffect(() => {
        if (product?.name) {
            document.title = `${product.name} | מאפיית מרציפן`;
        }
    }, [product?.name]);

    useEffect(() => {
        if (!product) return;
        trackEvent(ANALYTICS_EVENTS.VIEW_ITEM, {
            product_id: product.id,
            name: product.name,
            price: product.priceValue,
            currency: 'ILS'
        });
    }, [product]);

    const productSchema = useMemo(() => {
        if (!product) return null;
        const absoluteImage = product.image?.startsWith('http')
            ? product.image
            : `https://marzipanbakery.com${product.image?.startsWith('/') ? '' : '/'}${product.image || ''}`;
        return {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: [absoluteImage],
            description: product.description || product.name,
            category: CATEGORY_LABELS[product.category_slug] || product.category_slug,
            offers: {
                '@type': 'Offer',
                priceCurrency: 'ILS',
                price: product.priceValue,
                availability: 'https://schema.org/InStock',
                url: `https://marzipanbakery.com/products/${product.slug}`
            }
        };
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
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

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-32 lg:pt-36 pb-20" dir="rtl">
            <SEO
                title={product?.name}
                description={product?.description || product?.name || 'מאפה טרי מבית מאפיית מרציפן בירושלים.'}
                image={product?.image}
                url={product?.slug ? `/products/${product.slug}` : '/products'}
                ogType={product ? 'product' : 'website'}
            />
            {productSchema && <SchemaMarkup data={productSchema} />}

            {loading && <LoadingState />}
            {!loading && error && <ErrorState />}
            {!loading && !error && notFound && <NotFoundState />}

            {!loading && !error && product && (
                <div className="max-w-5xl mx-auto px-5 sm:px-6">
                    <Breadcrumbs
                        crumbs={[
                            { name: 'בית', path: '/' },
                            { name: 'קטלוג', path: '/products' },
                            { name: product.name }
                        ]}
                    />

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-[0_18px_40px_-25px_rgba(56,9,9,0.3)] border border-[#D4AF37]/20">
                            <div className="aspect-square w-full">
                                <SkeletonImage
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {product.isPopular && (
                                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-[#B91C1C] text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md">
                                    <Flame size={14} aria-hidden="true" />
                                    מוצר פופולרי
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            {product.category_slug && (
                                <Link
                                    to={`/products?category=${product.category_slug}`}
                                    className="self-start inline-flex items-center text-[11px] font-bold tracking-[0.24em] uppercase text-[#B91C1C] hover:text-[#380909] transition-colors mb-4"
                                >
                                    {CATEGORY_LABELS[product.category_slug] || product.category_slug}
                                </Link>
                            )}

                            <h1 className="text-3xl md:text-5xl font-black text-[#380909] leading-tight mb-5">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-2 mb-6" dir="ltr">
                                <span className="text-4xl font-black text-[#B91C1C]">
                                    {product.priceDisplay}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-base md:text-lg text-[#5D4037] leading-relaxed font-light mb-8">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5D4037]/80 mb-8 border-t border-[#D4AF37]/20 pt-5">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                                    <span className="font-bold text-[#380909]">בד״ץ</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Flame size={13} className="text-[#B91C1C]" aria-hidden="true" />
                                    <span className="font-medium text-[#380909]">נאפה הבוקר</span>
                                </span>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                aria-label={`הוסיפו ${product.name} לסל`}
                                className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 text-base
                                    ${isAdded
                                        ? 'bg-[#15803D] text-white shadow-[0_12px_28px_-10px_rgba(21,128,61,0.55)]'
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

                            <Link
                                to="/products"
                                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#B91C1C] hover:text-[#380909] transition-colors self-start"
                            >
                                לכל המוצרים
                                <ArrowLeft size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
