// -------------------------
// Bread
// -------------------------
import bread from "../assets/Bread/Bread.jpg";
import assortedBreads from "../assets/Bread/AssortedBreads.jpg";

// -------------------------
// Donuts
// -------------------------
import alfahors from "../assets/Donuts/Alfahors.jpg";
import cheeseCrumbs from "../assets/Donuts/CheeseCrumbs.jpg";
import chocolateCrackers from "../assets/Donuts/ChocolateCrackers.jpg";
import donutEdition from "../assets/Donuts/DonutEdition.jpg";
import ferrero from "../assets/Donuts/Ferrero.jpg";
import folded from "../assets/Donuts/Folded.jpg";
import milkJamCheese from "../assets/Donuts/MilkJamCheese.jpg";
import napoleonCream from "../assets/Donuts/NapoleonCream.jpg";
import oreo from "../assets/Donuts/Oreo.jpg";
import pistachio from "../assets/Donuts/Pistachio.jpg";
import strawberry from "../assets/Donuts/Strawberry.jpg";
import sweetCream from "../assets/Donuts/SweetCream.jpg";

// -------------------------
// Fridge Cakes
// -------------------------
import alfajoresCream from "../assets/FridgeCakes/AlfajoresCream.jpg";
import cheeseAndBerries from "../assets/FridgeCakes/CheeseAndBerries.jpg";
import kinder from "../assets/FridgeCakes/Kinder.jpg";
import mozart from "../assets/FridgeCakes/Mozart.jpg";
import pistachioCream from "../assets/FridgeCakes/PistachioCream.jpg";
import magnum from "../assets/FridgeCakes/Magnum.jpg";
import beeSting from "../assets/FridgeCakes/BeeSting.jpg";
import tiramisu from "../assets/FridgeCakes/Tiramisu.jpg";

// -------------------------
// Tarts
// -------------------------
import brownieTart from "../assets/Tarts/BrownieTart.jpg";
import lemonTart from "../assets/Tarts/LemonTart.jpg";
import pistachioTart from "../assets/Tarts/PistachioTart.jpg";

// -------------------------
// Round Parve Cakes
// -------------------------
import nougatMousse from "../assets/RoundParveCakes/NougatMousse.jpg";

import chocolateHama from "../assets/RoundParveCakes/ChocolateHama.jpg";
import blackForest from "../assets/RoundParveCakes/BlackForest.jpg";
import toffee from "../assets/RoundParveCakes/Toffee.jpg";
import mixCakes from "../assets/RoundParveCakes/MixCakes.jpg";

// -------------------------
// Babka Cakes
// -------------------------
import poppyBabka from "../assets/BabkaCakes/PoppyBabka.jpg";
import chocolateBabka from "../assets/BabkaCakes/ChocolateBabka.jpg";

// -------------------------
// Hard Cookies
// -------------------------
import biscotti from "../assets/HardCookies/Biscotti.jpg";
import sugarFreePalmier from "../assets/HardCookies/SugarFreePalmier.jpg";

// -------------------------
// Rugelach
// -------------------------
import rugelachChocolate from "../assets/Rugelach/RugelachChocolate.png";
import rugelachPistachio from "../assets/Rugelach/RugelachPistachio.png";
import rugelachFerrero from "../assets/Rugelach/RugelachFerrero.png";
import rugelachWhitePistachio from "../assets/Rugelach/RugelachWhitePistachio.png";
import rugelachTray from "../assets/Rugelach/RugelachTray.png";
import rugelachNew from "../assets/Rugelach/RugelachNew.jpg";
import rugelachPistachioWhite from "../assets/Rugelach/RugelachPistachioWhite.jpg";
import rugelachFerreroPack from "../assets/Rugelach/RugelachFerreroPack.jpg";
import rugelachChocolateDairy from "../assets/Rugelach/RugelachChocolateDairy.jpg";
import rugelachMix from "../assets/Rugelach/RugelachMix.jpg";
import butterCroissantImg from "../assets/Rugelach/SweetDairyPastries.jpg";

// -------------------------
// ProductsData
// -------------------------
export const productsData = {
  rugelach: [
    { id: 106, name: 'רוגלך פרווה', image: rugelachNew, priceValue: 20, priceDisplay: '20 ₪', unit: 'unit', tags: ['shabbat-staple'] },
    { id: 107, name: 'רוגלך פיסטוק ושוקולד לבן', image: rugelachPistachioWhite, priceValue: 25, priceDisplay: '25 ₪', unit: 'unit', tags: ['family-favorite'] },
    { id: 108, name: 'רוגלך פררו', image: rugelachFerreroPack, priceValue: 25, priceDisplay: '25 ₪', unit: 'unit' },
    { id: 109, name: 'רוגלך שוקולד חלבי', image: rugelachChocolateDairy, priceValue: 25, priceDisplay: '25 ₪', unit: 'unit', tags: ['iconic'] },
    { id: 110, name: 'רוגלך מיקס', image: rugelachMix, priceValue: 27, priceDisplay: '27 ₪', unit: 'unit', tags: ['bestseller'] },
  ],
  sweetDairyPastries: [
    { id: 111, name: 'קוראסון חמאה', image: butterCroissantImg, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
    { id: 101, name: 'קוראסון שוקולד חלבי', image: rugelachChocolate, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
    { id: 102, name: 'קוראסון פיסטוק', image: rugelachPistachio, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
    { id: 103, name: 'קוראסון פררו', image: rugelachFerrero, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
    { id: 104, name: 'קוראסון שוקולד לבן ופיסטוק', image: rugelachWhitePistachio, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
    { id: 105, name: 'מארז קוראסונים', image: rugelachTray, priceValue: 50, priceDisplay: '50 ₪ לק"ג', unit: 'kg' },
  ],
  bread: [
    { id: 1, name: 'חלות באגט', image: bread, priceValue: 8, priceDisplay: '8 ₪', unit: 'unit', tags: ['shabbat-staple'] },
    { id: 2, name: 'לחמים', image: assortedBreads, priceValue: 15, priceDisplay: '15 ₪', unit: 'unit' },
  ],

  donuts: [
    { id: 10, name: 'אלפחורס', image: alfahors, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 11, name: 'פירורי גבינה', image: cheeseCrumbs, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 12, name: 'שוקולד קראקרס', image: chocolateCrackers, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 13, name: 'דונאט אדישן', image: donutEdition, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 14, name: 'פררו', image: ferrero, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 15, name: 'קיפול', image: folded, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 16, name: 'ריבת חלב גבינה', image: milkJamCheese, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 17, name: 'נפוליאון קרם', image: napoleonCream, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 18, name: 'אוראו', image: oreo, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 19, name: 'פיסטוק', image: pistachio, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 20, name: 'תות', image: strawberry, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
    { id: 21, name: 'שמנת מתוקה', image: sweetCream, priceValue: 10, priceDisplay: '10 ₪', unit: 'unit' },
  ],

  fridgeCakes: [
    { id: 30, name: 'קרם אלפחורס', image: alfajoresCream, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 31, name: 'גבינה ופירות יער', image: cheeseAndBerries, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 32, name: 'קינדר', image: kinder, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 33, name: 'מוצרט', image: mozart, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 34, name: 'קרם פיסטוק', image: pistachioCream, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 35, name: 'מגנום', image: magnum, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 36, name: 'עקיצה הדבורה', image: beeSting, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 37, name: 'טירמיסו', image: tiramisu, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
  ],

  tarts: [
    { id: 40, name: 'טארט בראוניז', image: brownieTart, priceValue: 35, priceDisplay: '35 ₪', unit: 'unit' },
    { id: 41, name: 'טארט לימון', image: lemonTart, priceValue: 35, priceDisplay: '35 ₪', unit: 'unit' },
    { id: 42, name: 'טארט פיסטוק', image: pistachioTart, priceValue: 35, priceDisplay: '35 ₪', unit: 'unit' },
  ],

  roundParveCakes: [
    { id: 201, name: 'מוס נוגט', image: nougatMousse, priceValue: 120, priceDisplay: '120 ₪', unit: 'unit' },
    { id: 202, name: 'שוקולד חמה', image: chocolateHama, priceValue: 120, priceDisplay: '120 ₪', unit: 'unit' },
  ],

  roundParveCakesNew: [
    { id: 203, name: 'יער שחור', image: blackForest, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 204, name: 'טופי', image: toffee, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 205, name: 'שוקולד חמה', image: chocolateHama, priceValue: 65, priceDisplay: '65 ₪', unit: 'unit' },
    { id: 206, name: 'מיקס עוגות', image: mixCakes, priceValue: 80, priceDisplay: '80 ₪', unit: 'unit' },
  ],

  babkaCakes: [
    { id: 301, name: 'בובקט פרג', image: poppyBabka, priceValue: 25, priceDisplay: '25 ₪', unit: 'unit', tags: ['family-favorite'] },
    { id: 302, name: 'בובקט שוקולד', image: chocolateBabka, priceValue: 25, priceDisplay: '25 ₪', unit: 'unit', tags: ['family-favorite'] },
  ],

  hardCookies: [
    { id: 401, name: 'בישקוטים', image: biscotti, priceValue: 17, priceDisplay: '17 ₪', unit: 'unit' },
    { id: 402, name: 'אוזן עלים ללא סוכר', image: sugarFreePalmier, priceValue: 17, priceDisplay: '17 ₪', unit: 'unit', tags: ['no-sugar'] },
  ],

  hanukkahCollection: [
    {
      id: 501,
      name: "תות קלאסי",
      description: "הקלאסית והאהובה. מילוי ריבת תות איכותית ואבקת סוכר.",
      image: strawberry,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "הקלאסית",
      unit: 'unit'
    },
    {
      id: 502,
      name: "פררו רושה",
      description: "במילוי נוגט עשיר, ציפוי שוקולד רושה ושברי אגוזי לוז קלויים.",
      image: ferrero,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "מומלץ",
      unit: 'unit'
    },
    {
      id: 503,
      name: "פיסטוק",
      description: "במילוי קרם פיסטוק אמיתי וציפוי שוקולד לבן עם שברי פיסטוק.",
      image: pistachio,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "רב מכר",
      unit: 'unit'
    },
    {
      id: 504,
      name: "אלפחורס",
      description: "במילוי ריבת חלב ארגנטינאית, ציפוי שוקולד לבן ועיטור קוקוס קלוי.",
      image: alfahors,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "מתוק במיוחד",
      unit: 'unit'
    },
    {
      id: 505,
      name: "אוראו",
      description: "במילוי קרם עוגיות וניל, ציפוי שוקולד לבן ושברי עוגיות אוראו פריכים.",
      image: oreo,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "ילדים אוהבים",
      unit: 'unit'
    },
    {
      id: 506,
      name: "שוקולד קראקרס",
      description: "ציפוי שוקולד חלב קטיפתי עם שבבי וופל קראנצ'יים ומפתיעים.",
      image: chocolateCrackers,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "קראנצ'י",
      unit: 'unit'
    },
    {
      id: 507,
      name: "פירורי גבינה",
      description: "במילוי קרם גבינה עשיר וציפוי פירורי שטרויזל חמאתיים ופריכים.",
      image: cheeseCrumbs,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "חלבי",
      unit: 'unit'
    },
    {
      id: 508,
      name: "ריבת חלב גבינה",
      description: "שילוב מושלם של מילוי גבינת שמנת וריבת חלב קרמלית מפנקת.",
      image: milkJamCheese,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "שחיתות",
      unit: 'unit'
    },
    {
      id: 509,
      name: "נפוליאון קרם",
      description: "במילוי קרם וניל צרפתי, ציפוי קרמל שרוף ושכבות בצק עלים.",
      image: napoleonCream,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "צרפתי",
      unit: 'unit'
    },
    {
      id: 510,
      name: "שמנת מתוקה",
      description: "סופגנייה פתוחה במילוי הר של קצפת שמנת מתוקה טרייה.",
      image: sweetCream,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "קלאסיקה",
      unit: 'unit'
    },
    {
      id: 511,
      name: "קיפול שוקולד",
      description: "ציפוי שוקולד עשיר עם שברי שוקולד מקופלת מעל לחגיגה של מרקמים.",
      image: folded,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "שוקולד",
      unit: 'unit'
    },
    {
      id: 512,
      name: "דונאט אדישן",
      description: "הסופגנייה המיוחדת שלנו במהדורה חגיגית ומוגבלת לחג החנוכה.",
      image: donutEdition,
      priceValue: 10,
      priceDisplay: "10 ₪",
      tag: "ספיישל",
      unit: 'unit'
    }
  ]
};
