// Server-side authoritative product catalog.
//
// Every price the user pays comes from THIS file — never from the request body.
// Mirror of src/data/productsData.js (without Vite asset imports), keyed by id.
// If a price changes here, change it in productsData.js too.

const PRODUCTS = Object.freeze({
  // bread
  1:   { name: "חלות באגט",                      priceValue: 8  },
  2:   { name: "לחמים",                          priceValue: 15 },

  // donuts
  10:  { name: "אלפחורס",                        priceValue: 10 },
  11:  { name: "פירורי גבינה",                   priceValue: 10 },
  12:  { name: "שוקולד קראקרס",                  priceValue: 10 },
  13:  { name: "דונאט אדישן",                    priceValue: 10 },
  14:  { name: "פררו",                           priceValue: 10 },
  15:  { name: "קיפול",                          priceValue: 10 },
  16:  { name: "ריבת חלב גבינה",                 priceValue: 10 },
  17:  { name: "נפוליאון קרם",                   priceValue: 10 },
  18:  { name: "אוראו",                          priceValue: 10 },
  19:  { name: "פיסטוק",                         priceValue: 10 },
  20:  { name: "תות",                            priceValue: 10 },
  21:  { name: "שמנת מתוקה",                     priceValue: 10 },

  // fridge cakes
  30:  { name: "קרם אלפחורס",                    priceValue: 65 },
  31:  { name: "גבינה ופירות יער",               priceValue: 65 },
  32:  { name: "קינדר",                          priceValue: 65 },
  33:  { name: "מוצרט",                          priceValue: 65 },
  34:  { name: "קרם פיסטוק",                     priceValue: 65 },
  35:  { name: "מגנום",                          priceValue: 65 },
  36:  { name: "עקיצה הדבורה",                   priceValue: 65 },
  37:  { name: "טירמיסו",                        priceValue: 65 },

  // tarts
  40:  { name: "טארט בראוניז",                   priceValue: 35 },
  41:  { name: "טארט לימון",                     priceValue: 35 },
  42:  { name: "טארט פיסטוק",                    priceValue: 35 },

  // sweet dairy pastries (sold per kg)
  101: { name: "קוראסון שוקולד חלבי",            priceValue: 50 },
  102: { name: "קוראסון פיסטוק",                 priceValue: 50 },
  103: { name: "קוראסון פררו",                   priceValue: 50 },
  104: { name: "קוראסון שוקולד לבן ופיסטוק",     priceValue: 50 },
  105: { name: "מארז קוראסונים",                 priceValue: 50 },
  111: { name: "קוראסון חמאה",                   priceValue: 50 },

  // rugelach
  106: { name: "רוגלך פרווה",                    priceValue: 20 },
  107: { name: "רוגלך פיסטוק ושוקולד לבן",       priceValue: 25 },
  108: { name: "רוגלך פררו",                     priceValue: 25 },
  109: { name: "רוגלך שוקולד חלבי",              priceValue: 25 },
  110: { name: "רוגלך מיקס",                     priceValue: 27 },

  // round parve cakes
  201: { name: "מוס נוגט",                       priceValue: 120 },
  202: { name: "שוקולד חמה",                     priceValue: 120 },
  203: { name: "יער שחור",                       priceValue: 65 },
  204: { name: "טופי",                           priceValue: 65 },
  205: { name: "שוקולד חמה",                     priceValue: 65 },
  206: { name: "מיקס עוגות",                     priceValue: 80 },

  // babka cakes
  301: { name: "בובקט פרג",                      priceValue: 25 },
  302: { name: "בובקט שוקולד",                   priceValue: 25 },

  // hard cookies
  401: { name: "בישקוטים",                       priceValue: 17 },
  402: { name: "אוזן עלים ללא סוכר",             priceValue: 17 },

  // hanukkah collection
  501: { name: "תות קלאסי",                      priceValue: 10 },
  502: { name: "פררו רושה",                      priceValue: 10 },
  503: { name: "פיסטוק",                         priceValue: 10 },
  504: { name: "אלפחורס",                        priceValue: 10 },
  505: { name: "אוראו",                          priceValue: 10 },
  506: { name: "שוקולד קראקרס",                  priceValue: 10 },
  507: { name: "פירורי גבינה",                   priceValue: 10 },
  508: { name: "ריבת חלב גבינה",                 priceValue: 10 },
  509: { name: "נפוליאון קרם",                   priceValue: 10 },
  510: { name: "שמנת מתוקה",                     priceValue: 10 },
  511: { name: "קיפול שוקולד",                   priceValue: 10 },
  512: { name: "דונאט אדישן",                    priceValue: 10 },
});

export function findProduct(id) {
  if (!Number.isInteger(id) || id < 1) return null;
  return PRODUCTS[id] ?? null;
}

export function listProductIds() {
  return Object.keys(PRODUCTS).map(Number);
}
