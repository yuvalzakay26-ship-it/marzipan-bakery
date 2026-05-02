import React, { useState, useEffect } from "react";
import { productsData } from '../../data/productsData.js';
import { Search, ShoppingBag, Filter, Wheat, Cookie, ChefHat } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import SkeletonImage from "../Shared/SkeletonImage";
import SEO from "../Shared/SEO";
import ProductCard from "../Product/ProductCard";
import SchemaMarkup from "../Shared/SchemaMarkup";

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
            setActiveCategory(categoryParam);
        } else {
            setActiveCategory("all");
        }
    }, [searchParams]);

    // Automatically switch to "all" when searching
    useEffect(() => {
        if (searchTerm) {
            setActiveCategory("all");
        }
    }, [searchTerm]);

    const categories = [
        { id: "all", label: "הכל", keywords: [] },
        { id: "rugelach", label: "רוגלך", keywords: ["רוגלך", "רוגאלך", "רוגאלכים"] },
        { id: "sweetDairyPastries", label: "מאפים מתוקים חלבי", keywords: ["קוראסון", "קוראסונים", "מאפה", "מאפים"] },
        { id: "donuts", label: "סופגניות", keywords: ["סופגניה", "סופגניות", "דונאט", "דונאטס"] },
        { id: "fridgeCakes", label: "עוגות עגולות חלבי", keywords: ["עוגה", "עוגות"] },
        { id: "roundParveCakes", label: "עוגות עגולות גדולות פרווה", keywords: ["עוגה", "פרווה"] },
        { id: "roundParveCakesNew", label: "עוגות עגולות פרווה", keywords: ["עוגה", "פרווה"] },
        { id: "babkaCakes", label: "עוגות בובקט", keywords: ["בובקט"] },
        { id: "hardCookies", label: "עוגיות קשות", keywords: ["עוגיות", "בישקוטים"] },
        { id: "tarts", label: "טארטים", keywords: ["טארט", "טארטים"] },
        { id: "bread", label: "לחמים וחלות", keywords: ["לחם", "לחמים", "חלה", "חלות"] },
    ];

    // Safely get products for a category
    const getCategoryProducts = (key, label) => {
        // Safe access: if productsData or the key is missing, return empty array
        const list = productsData?.[key] || [];
        return list.map(p => ({ ...p, category: label, categoryId: key }));
    };

    // Combine all efficiently inside useMemo or component body (it's small enough here)
    const allProducts = [
        ...getCategoryProducts("rugelach", "רוגלך"),
        ...getCategoryProducts("sweetDairyPastries", "מאפים מתוקים חלבי"),
        ...getCategoryProducts("donuts", "סופגניות"),
        ...getCategoryProducts("fridgeCakes", "עוגות עגולות חלבי"),
        ...getCategoryProducts("roundParveCakes", "עוגות עגולות גדולות פרווה"),
        ...getCategoryProducts("roundParveCakesNew", "עוגות עגולות פרווה"),
        ...getCategoryProducts("babkaCakes", "עוגות בובקט"),
        ...getCategoryProducts("hardCookies", "עוגיות קשות"),
        ...getCategoryProducts("tarts", "טארטים"),
        ...getCategoryProducts("bread", "לחמים וחלות"),
    ];

    const finalProducts = searchTerm
        ? allProducts.filter(p => {
            const categoryObj = categories.find(c => c.id === p.categoryId);
            const searchLower = searchTerm.trim().toLowerCase();

            // Helper to check if any word in a string includes the search term (partial match)
            const matchesWord = (str) => str?.toLowerCase().includes(searchLower);

            return (
                matchesWord(p.name) ||
                matchesWord(p.category) ||
                (categoryObj?.keywords?.some(k => k.toLowerCase().startsWith(searchLower)))
            );
        })
        : activeCategory === "all"
            ? allProducts
            : allProducts.filter(p => p.categoryId === activeCategory);

    // Calculate page title based on category
    const categoryLabel = categories.find(c => c.id === activeCategory)?.label || "כל המוצרים";
    const pageTitle = `קטלוג - ${categoryLabel}`;

    // Schema.org ItemList
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": finalProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "image": product.image, // Ideally absolute URL
                "description": "מאפה טרי מבית מאפיית מרציפן",
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "ILS",
                    "price": product.priceValue,
                    "availability": "https://schema.org/InStock"
                }
            }
        }))
    };

    return (
        <div className="min-h-screen bg-white/90 font-sans pb-24 relative overflow-hidden backdrop-blur-sm">
            <SEO
                title={pageTitle}
                description="קטלוג המאפים המלא של מאפיית מרציפן. רוגלך, עוגות, וחלות טריות."
                url="/products"
            />
            <SchemaMarkup data={itemListSchema} />
            {/* Floating Decorative Elements */}
            <div className="absolute top-40 left-10 text-[#D4AF37]/20 animate-bounce duration-[4000ms] pointer-events-none hidden xl:block">
                <Wheat size={120} />
            </div>
            <div className="absolute top-96 right-10 text-[#B91C1C]/10 animate-pulse duration-[5000ms] pointer-events-none hidden xl:block">
                <Cookie size={100} />
            </div>
            <div className="absolute bottom-40 left-20 text-[#D4AF37]/15 animate-spin-slow duration-[10000ms] pointer-events-none hidden xl:block">
                <ChefHat size={140} />
            </div>
            <div className="absolute top-1/2 right-5 text-[#B91C1C]/5 rotate-45 pointer-events-none hidden xl:block">
                <Wheat size={180} />
            </div>
            {/* New Central Elements */}
            <div className="absolute top-60 left-1/3 text-[#B91C1C]/5 animate-pulse duration-[6000ms] pointer-events-none">
                <ChefHat size={80} />
            </div>
            <div className="absolute top-[30%] right-1/4 text-[#D4AF37]/10 animate-bounce duration-[8000ms] pointer-events-none">
                <Cookie size={60} />
            </div>

            <div className="absolute top-[45%] left-[20%] text-[#D4AF37]/10 rotate-12 pointer-events-none">
                <ChefHat size={90} />
            </div>
            <div className="absolute bottom-[25%] right-[30%] text-[#B91C1C]/5 -rotate-12 pointer-events-none">
                <Cookie size={110} />
            </div>
            <div className="absolute top-[15%] left-[60%] text-[#D4AF37]/10 animate-pulse duration-[7000ms] pointer-events-none">
                <Wheat size={70} />
            </div>
            <div className="absolute bottom-[10%] left-[45%] text-[#B91C1C]/10 animate-bounce duration-[9000ms] pointer-events-none">
                <ChefHat size={100} />
            </div>


            {/* Header */}
            <div className="relative z-10 pt-40 pb-12 mb-8 text-center bg-transparent group cursor-default">
                <h1 className="text-5xl md:text-7xl font-black text-[#B91C1C] mb-4 tracking-tight drop-shadow-sm leading-tight transition-all duration-500 group-hover:scale-105">
                    מה מתחשק לכם היום ?
                    <span className="block text-3xl md:text-4xl font-bold text-gray-800 mt-2 transition-colors duration-500">המאפים הכי טריים בירושלים</span>
                </h1>

                <div className="w-32 h-2 bg-gradient-to-r from-[#D4AF37] to-[#F9A825] rounded-full my-6 mx-auto shadow-md transition-all duration-700 ease-in-out group-hover:w-64"></div>

                {activeCategory !== "all" ? (
                    <div className="mt-8 flex justify-center animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-8 py-3 bg-white border border-[#D4AF37]/30 rounded-full shadow-[0_4px_20px_-5px_rgba(212,175,55,0.2)] hover:shadow-[0_8px_25px_-8px_rgba(185,28,28,0.2)] transition-all duration-300 transform hover:-translate-y-1">
                            <span className="text-gray-400 font-light text-sm tracking-wide">צפייה ב:</span>
                            <span className="text-[#B91C1C] text-xl font-bold tracking-tight">
                                {categories.find(c => c.id === activeCategory)?.label}
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 mt-6 text-xl font-light tracking-wide animate-pulse">לחצו על קטגוריה כדי לראות את כל המוצרים</p>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Sidebar / Topbar Filter */}
                <div className="lg:w-1/4">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-28">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-[#2D211E] mb-4 flex items-center gap-2">
                                <Search size={20} />
                                חיפוש
                            </h3>
                            <input
                                type="text"
                                placeholder="חפש מוצר..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-[#2D211E] mb-4 flex items-center gap-2">
                                <Filter size={20} />
                                קטגוריות
                            </h3>
                            <ul className="space-y-2">
                                {categories.map(cat => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => {
                                                setActiveCategory(cat.id);
                                                setSearchTerm("");
                                            }}
                                            className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center ${activeCategory === cat.id
                                                ? "bg-[#B91C1C] text-white font-bold shadow-md"
                                                : "hover:bg-[#FFEBEE] text-[#2D211E]"
                                                }`}
                                        >
                                            {cat.label}
                                            {activeCategory === cat.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="lg:w-3/4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {finalProducts.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
