import OwnersHero from "../assets/OwnersHero.jpg";
import BakeryInterior from "../assets/BakeryInterior.jpg";
import MarzipanShopfront from "../assets/MarzipanShopfront.jpg";

// =====================================================================
// SITE CONTENT — single source of truth for contact, branches, business.
// All phone numbers stored in two forms:
//   - displayPhone:  Israeli local format ("02-6232594") — for UI text
//   - telPhone:      E.164 format ("+97226232594")        — for tel: hrefs
// WhatsApp number is digits only (no +) per wa.me URL spec.
// =====================================================================

export const CONTACT_INFO = {
    // Flagship branch is the customer-facing main number (no separate office line).
    phone: "02-6232594",
    phoneTel: "+97226232594",
    whatsapp: "972533339341",                 // wa.me format, digits only
    whatsappDisplay: "053-333-9341",           // human-readable IL format
    email: "office@marzipan.co.il",
    address: "רחוב אגריפס 44, שוק מחנה יהודה, ירושלים",
    addressShort: "אגריפס 44, ירושלים",
    // Typical first-response time for WhatsApp orders during business hours.
    whatsappResponseMinutes: 15
};

// Public-facing business identification (Israeli "פרטי עוסק" transparency block).
export const BUSINESS_INFO = {
    legalName: "מאפיית מרציפן בע\"מ",
    tradeName: "מאפיית מרציפן",
    foundedYear: 1986,
    kashrut: "בד\"ץ העדה החרדית",
    kashrutShort: "כשרות בד\"ץ",
    paymentMethods: ["מזומן", "אשראי", "ביט", "Apple Pay"]
};

// We do not maintain an active X/Twitter presence, so it's intentionally omitted.
export const SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/marzipanbakery",
    instagram: "https://www.instagram.com/marzipanbakery"
};

// Public Google Maps search links (resolve to the bakery's pin without
// relying on shortener URLs that can rot).
const mapsSearch = (q) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const BRANCHES = [
    {
        id: "mahane_yehuda",
        name: "סניף השוק (המיתולוגי)",
        address: "אגריפס 44, שוק מחנה יהודה, ירושלים",
        phone: "02-6232594",
        phoneTel: "+97226232594",
        displayHours: "א'-ה': 05:00–23:30\nו' וערבי חג: 05:00 עד כניסת שבת\nמוצ\"ש: שעה מצאת השבת עד 23:30",
        img: OwnersHero,
        desc: "הסניף שבו הכל התחיל. הריחות, האווירה והרוגלך החמים שיוצאים ישר מהתנור.",
        wazeLink: "https://waze.com/ul?q=Agripas+44+Jerusalem",
        googleMapsLink: mapsSearch("מאפיית מרציפן אגריפס 44 ירושלים"),
        schedule: {
            0: { open: "05:00", close: "23:30" }, // Sun
            1: { open: "05:00", close: "23:30" }, // Mon
            2: { open: "05:00", close: "23:30" }, // Tue
            3: { open: "05:00", close: "23:30" }, // Wed
            4: { open: "05:00", close: "23:30" }, // Thu
            5: { open: "05:00", close: "15:00" }, // Fri — pre-Shabbat close
            6: { open: null,    close: null    }  // Sat — closed (Shabbat)
        }
    },
    {
        id: "center_1",
        name: "סניף סנטר 1",
        address: "ירמיהו 43, קניון סנטר 1, ירושלים",
        phone: "02-6523311",
        phoneTel: "+97226523311",
        displayHours: "א'-ה': 08:00–22:00\nו' וערבי חג: 07:00–13:00\nמוצ\"ש ושבת: סגור",
        img: BakeryInterior,
        desc: "הסניף המרכזי שלנו בכניסה לעיר. מאפים חמים וטריים לדרך או לישיבה במקום.",
        wazeLink: "https://waze.com/ul?q=Center+1+Mall+Jerusalem",
        googleMapsLink: mapsSearch("מאפיית מרציפן קניון סנטר 1 ירושלים"),
        schedule: {
            0: { open: "08:00", close: "22:00" },
            1: { open: "08:00", close: "22:00" },
            2: { open: "08:00", close: "22:00" },
            3: { open: "08:00", close: "22:00" },
            4: { open: "08:00", close: "22:00" },
            5: { open: "07:00", close: "13:00" },
            6: { open: null,    close: null    }
        }
    },
    {
        id: "luntz",
        name: "סניף מרכז העיר",
        address: "לונץ 1, מדרחוב ירושלים",
        phone: "02-6252277",
        phoneTel: "+97226252277",
        displayHours: "א'-ה': 08:00–19:00\nו' וערבי חג: 06:00–13:00\nמוצ\"ש ושבת: סגור",
        img: MarzipanShopfront,
        desc: "פינה מתוקה בלב המדרחוב. המקום המושלם לעצור בו לקפה ומאפה באמצע היום.",
        wazeLink: "https://waze.com/ul?q=Luntz+1+Jerusalem",
        googleMapsLink: mapsSearch("מאפיית מרציפן לונץ 1 ירושלים"),
        schedule: {
            0: { open: "08:00", close: "19:00" },
            1: { open: "08:00", close: "19:00" },
            2: { open: "08:00", close: "19:00" },
            3: { open: "08:00", close: "19:00" },
            4: { open: "08:00", close: "19:00" },
            5: { open: "06:00", close: "13:00" },
            6: { open: null,    close: null    }
        }
    }
];

// Trust signals shown on home, footer, and checkout — keep wording consistent
// across the product so the customer hears the same promises everywhere.
export const TRUST_SIGNALS = {
    kosher: "כשרות בד\"ץ העדה החרדית",
    freshDaily: "נאפה כל בוקר טרי בסניפי המאפייה",
    pickupCity: "איסוף עצמי משלושת סניפי ירושלים",
    secureOrder: "הזמנה מאובטחת — אישור אישי לפני חיוב",
    whatsappFast: "מענה מהיר בוואטסאפ — בדרך כלל תוך 15 דקות"
};

// Real, defensible social-proof anchors. No fabricated counters.
// Every value here is something the bakery can prove with a screenshot or a tour:
//   - yearsActive: derived from the owner-set foundedYear.
//   - branchesCount: matches the BRANCHES array length below.
//   - googleRating / googleReviewsCount: shown alongside a live link to the Google
//     Business Profile so visitors can verify the number themselves. UI MUST link
//     to googleProfileUrl whenever these are surfaced.
//   - dailyBakingStartHour: matches BRANCHES.mahane_yehuda.schedule (05:00 open).
// If any value here cannot be verified live, the surfacing UI must hide it
// rather than display unsupported text.
export const SOCIAL_PROOF = {
    yearsActive: () => new Date().getFullYear() - BUSINESS_INFO.foundedYear,
    branchesCount: 3,
    googleRating: 4.8,
    googleReviewsCount: null,
    googleProfileUrl: "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("מאפיית מרציפן אגריפס 44 ירושלים"),
    dailyBakingStartHour: "05:00"
};

// Real bakery rhythm — "out of the oven" times the bakery actually pulls trays.
// These drive WhyOrderToday copy. If schedule shifts, update here only.
export const BAKING_RHYTHM = [
    { time: "05:00", what: "רוגלך שוקולד טרי מהתנור" },
    { time: "07:30", what: "סופגניות וקרואסונים בוקר" },
    { time: "11:00", what: "חלות מתוקות ובבקות" },
    { time: "14:30", what: "אפייה אחרונה לפני סיום היום" }
];

// Returns the next BAKING_RHYTHM entry relative to "now" — used by TrustBar /
// freshness micro-copy to make the bakery feel alive in real time. After the
// last bake of the day, returns the first bake of tomorrow (still honest:
// the bakery actually pulls those trays at those times).
export const getNextBakingTime = (now = new Date()) => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const toMin = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };
    const upcoming = BAKING_RHYTHM.find((r) => toMin(r.time) > minutes);
    return upcoming ?? { ...BAKING_RHYTHM[0], isTomorrow: true };
};

// Featured Google reviews — owner-curated, surfaced on the Reviews section.
// Honesty rules (do NOT relax):
//   - Every entry must be a verbatim public Google review the bakery can produce
//     a screenshot of. No paraphrasing, no composites, no AI-generated copy.
//   - First name + last initial only — protect reviewer privacy.
//   - `date` is the original Google review month, in Hebrew (e.g., "מרץ 2024").
//   - `neighborhood` is reviewer-supplied or omitted — never guessed.
//   - Empty array is fine: the section gracefully hides the carousel and shows
//     only the verified Google rating card. We never invent quotes to fill space.
export const FEATURED_REVIEWS = [
    // {
    //     name: "מירי כ.",
    //     neighborhood: "רחביה, ירושלים",
    //     rating: 5,
    //     date: "מרץ 2024",
    //     quote: "...",
    //     googleReviewUrl: "https://..."  // optional, links to the verified review
    // },
];

// Popular pre-built bundles — curated combinations from real items in productsData.
// `productIds` reference real ids; `priceValue` is the sum of the items in the combo
// (no discount baked in unless the bakery commits — keep the math honest).
// Marked `enabled` so the bakery can hide a combo without code changes.
export const POPULAR_BUNDLES = [
    {
        id: "shabbat_box",
        title: "מארז שבת",
        subtitle: "לערב שישי במשפחה",
        emoji: "🕯️",
        productIds: [110, 1, 301],          // רוגלך מיקס + חלות + בבקת פרג
        priceValue: 60,                     // 27 + 8 + 25 — actual sum
        enabled: true
    },
    {
        id: "office_tray",
        title: "מגש משרד",
        subtitle: "10 רוגלך מיקס במגש",
        emoji: "💼",
        productIds: [110, 109, 108],
        priceValue: 77,                     // 27 + 25 + 25
        enabled: true
    },
    {
        id: "host_gift",
        title: "מתנה למארח",
        subtitle: "טארט + רוגלך פיסטוק",
        emoji: "🎁",
        productIds: [42, 107],
        priceValue: 60,                     // 35 + 25
        enabled: true
    }
];

// "Add ₪X more" promotional logic. Kept OFF by default so the site never fabricates
// an offer the bakery hasn't committed to. To enable: set `enabled: true` and confirm
// with the bakery owner that the threshold + reward are honored at pickup.
export const BUNDLE_OFFER = {
    enabled: false,
    threshold: 200,
    rewardLabel: "אריזת מתנה חינם להזמנה",
    rewardSubLabel: "אריזה מתנה אסתטית במשלוח"
};

// Items most worth surfacing as upsells (real bakery favorites).
// Order matters — first eligible item that isn't already in cart wins the slot.
export const UPSELL_PRIORITY_IDS = [110, 109, 108, 1, 301, 42];

// VIP WhatsApp club — opt-in via WhatsApp with a pre-filled message; no DB needed.
export const VIP_CLUB = {
    enabled: true,
    perks: [
        "שריון רוגלך לערב שבת — לפני שכולם",
        "התראות על מארזי חגים מוקדמים",
        "מחיר חבר על מארזי משרד גדולים"
    ],
    joinMessage: "היי! אשמח להצטרף למועדון הוואטסאפ של מאפיית מרציפן 🥐"
};
