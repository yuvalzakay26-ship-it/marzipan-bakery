import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RugelachImg from "../../assets/Rugelach/RugelachPistachioWhite.jpg";
import SweetPastriesImg from "../../assets/Rugelach/RugelachChocolate.png";
import Donuts from "../../assets/Donuts/ChocolateCrackers.jpg";
import Tarts from "../../assets/Tarts/BrownieTart.jpg";
import FridgeCakes from "../../assets/FridgeCakes/Kinder.jpg";
import RoundParveImg from "../../assets/RoundParveCakes/NougatMousse.jpg";
import BlackForestImg from "../../assets/RoundParveCakes/BlackForest.jpg";
import BabkaImg from "../../assets/BabkaCakes/PoppyBabka.jpg";
import HardCookiesImg from "../../assets/HardCookies/Biscotti.jpg";

// Homepage category preview — sensory copy, price anchor, and a crowd-favorite
// signal. Mobile renders as a horizontal snap rail (premium feel + lower scroll
// fatigue); desktop keeps the editorial 4-column grid.
//
// `badge` keys map to a tiny pill rendered on the card (kept inline rather than
// reusing ProductBadges so we can position/size them for hero-style framing).
// Only ship badges the bakery can stand behind (no fabricated "selling fast").
const CATEGORIES = [
    {
        id: "rugelach",
        title: "רוגלך",
        img: RugelachImg,
        desc: "חמים מהתנור משעה 05:00 — בצק חמאה, שוקולד עשיר, גלילה הדוקה.",
        priceFrom: "מ-₪20",
        badge: { label: "האייקון של מרציפן", tone: "iconic" }
    },
    {
        id: "sweetDairyPastries",
        title: "מאפים חלביים",
        img: SweetPastriesImg,
        desc: "קוראסונים זהובים בפיסטוק, פררו וריבת חלב — נשקלים בקילו.",
        priceFrom: "₪50 לק״ג",
        badge: { label: "בחירת הקהל", tone: "favorite" }
    },
    {
        id: "fridgeCakes",
        title: "עוגות מקרר",
        img: FridgeCakes,
        desc: "מוס קטיפתי בקינדר, מוצרט וטירמיסו — מוכן לקחת הביתה.",
        priceFrom: "מ-₪65",
        badge: { label: "ארוז למתנה", tone: "gift" }
    },
    {
        id: "babkaCakes",
        title: "בבקה",
        img: BabkaImg,
        desc: "פרג עשיר ושוקולד שזור — קלאסיקה לערב שישי.",
        priceFrom: "₪25",
        badge: { label: "מוכן לשבת", tone: "shabbat" }
    },
    {
        id: "tarts",
        title: "טארטים",
        img: Tarts,
        desc: "בצק פריך עם מילוי לימון, פיסטוק או בראוניז.",
        priceFrom: "מ-₪35"
    },
    {
        id: "donuts",
        title: "סופגניות",
        img: Donuts,
        desc: "תות, קרם וניל, ריבת חלב — קלאסיקה ירושלמית.",
        priceFrom: "₪10"
    },
    {
        id: "roundParveCakes",
        title: "עוגות מוס פרווה",
        img: RoundParveImg,
        desc: "מוס נוגט וקיש שוקולד — לארוחות שבת ואירועים.",
        priceFrom: "מ-₪65"
    },
    {
        id: "roundParveCakesNew",
        title: "עוגות חגיגה",
        img: BlackForestImg,
        desc: "יער שחור, טופי, מיקס — לאירוע הקרוב.",
        priceFrom: "מ-₪65"
    },
    {
        id: "hardCookies",
        title: "עוגיות פריכות",
        img: HardCookiesImg,
        desc: "בישקוטי שקדים ואוזני המן ללא סוכר — לקפה אחר הצהריים.",
        priceFrom: "₪17"
    }
];

// Tone-to-style map for the inline category badge.
const BADGE_TONE = {
    iconic:   "bg-[#380909] text-[#D4AF37] ring-[#D4AF37]/40",
    favorite: "bg-white/95 text-[#380909] ring-[#380909]/15",
    gift:     "bg-[#D4AF37] text-[#1A0F0A] ring-[#1A0F0A]/15",
    shabbat:  "bg-[#FFF8E1] text-[#380909] ring-[#D4AF37]/40"
};

const Products = () => {
    return (
        <section
            className="py-20 md:py-24 bg-white text-[#2D211E] relative overflow-hidden"
            aria-label="הקטלוג שלנו"
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-3 mb-5">
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                        <span className="text-[#B91C1C] text-[11px] tracking-[0.34em] uppercase font-bold">
                            הקטלוג
                        </span>
                        <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-[#380909] leading-tight mb-4">
                        מה מתחשק לכם <span className="text-[#B91C1C]">היום?</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5D4037] max-w-2xl mx-auto font-light leading-relaxed">
                        תשע משפחות של מאפים, כולן יוצאות מאותו תנור.
                        <span className="hidden sm:inline"> בחרו קטגוריה כדי להיכנס לקטלוג המלא.</span>
                    </p>
                </div>

                {/* Mobile: horizontal snap-rail (cards peek to hint swipe). Desktop: 4-col grid. */}
                <div
                    className="
                        flex md:grid md:grid-cols-2 lg:grid-cols-4
                        gap-4 md:gap-6
                        overflow-x-auto md:overflow-visible
                        snap-x snap-mandatory md:snap-none
                        -mx-5 sm:-mx-6 px-5 sm:px-6 md:mx-0 md:px-0
                        pb-3 md:pb-0
                        [&::-webkit-scrollbar]:hidden [scrollbar-width:none]
                    "
                >
                    {CATEGORIES.map((item) => (
                        <Link
                            to={`/products?category=${item.id}`}
                            key={item.id}
                            className="
                                group relative bg-white rounded-3xl overflow-hidden
                                shadow-[0_18px_40px_-25px_rgba(56,9,9,0.3)]
                                hover:shadow-[0_28px_60px_-25px_rgba(56,9,9,0.45)]
                                transition-all duration-500 hover:-translate-y-1
                                border border-[#D4AF37]/15 hover:border-[#D4AF37]/45
                                snap-start shrink-0 w-[78%] xs:w-[68%] sm:w-[55%] md:w-auto md:shrink
                                flex flex-col
                            "
                        >
                            <div className="h-56 md:h-52 overflow-hidden relative">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                                />

                                {/* Always-on bottom gradient anchors the price chip and frames the food */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1A0F0A]/70 via-[#1A0F0A]/15 to-transparent pointer-events-none"></div>

                                {/* Badge — top-right */}
                                {item.badge && (
                                    <span
                                        className={`absolute top-3 right-3 z-10 inline-flex items-center text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full ring-1 backdrop-blur-sm shadow-sm ${BADGE_TONE[item.badge.tone]}`}
                                    >
                                        {item.badge.label}
                                    </span>
                                )}

                                {/* Price-from chip — bottom-left, anchored on the gradient */}
                                <span
                                    className="absolute bottom-3 left-3 z-10 inline-flex items-center bg-white/95 backdrop-blur-sm text-[#380909] text-xs font-black px-3 py-1.5 rounded-full shadow-sm border border-[#D4AF37]/30"
                                    dir="ltr"
                                >
                                    {item.priceFrom}
                                </span>
                            </div>

                            <div className="p-5 text-right flex flex-col flex-1">
                                <h3 className="text-lg md:text-xl font-black text-[#380909] mb-1.5 leading-tight group-hover:text-[#B91C1C] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-[#5D4037]/85 leading-snug font-light line-clamp-2">
                                    {item.desc}
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#B91C1C] group-hover:gap-2.5 transition-all">
                                    לבחירה
                                    <ArrowLeft size={14} aria-hidden="true" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12 md:mt-14">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-[#B91C1C] font-bold hover:text-[#380909] transition-colors group"
                    >
                        לקטלוג המלא
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Products;
