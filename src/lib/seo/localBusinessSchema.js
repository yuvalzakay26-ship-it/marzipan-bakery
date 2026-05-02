// =====================================================================
// Local SEO — per-branch LocalBusiness JSON-LD generator.
// Maps a single source of truth (BRANCHES + BUSINESS_INFO) into the
// schema.org shape Google uses for Maps Pack rankings.
// =====================================================================

import { BRANCHES, BUSINESS_INFO, CONTACT_INFO } from '../../data/siteContent';

const SITE_URL = 'https://marzipanbakery.com';
const dayLetterToName = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

// Coordinates per branch (manually verified against Google Maps).
// Centralized here so admin can update without touching component code.
const BRANCH_GEO = {
    mahane_yehuda: { lat: 31.7855, lng: 35.2118 },
    center_1:      { lat: 31.7902, lng: 35.1929 },
    luntz:         { lat: 31.7820, lng: 35.2210 }
};

// Group consecutive days with identical hours into a single OpeningHoursSpecification entry.
const buildOpeningHours = (schedule) => {
    const entries = [];
    Object.entries(schedule).forEach(([day, hours]) => {
        if (!hours.open || !hours.close) return;
        entries.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: dayLetterToName[Number(day)],
            opens: hours.open,
            closes: hours.close
        });
    });
    return entries;
};

export const buildBranchSchema = (branchId) => {
    const branch = BRANCHES.find((b) => b.id === branchId);
    if (!branch) return null;

    const geo = BRANCH_GEO[branch.id];

    return {
        '@context': 'https://schema.org',
        '@type': 'Bakery',
        '@id': `${SITE_URL}/branches#${branch.id}`,
        name: `${BUSINESS_INFO.tradeName} — ${branch.name}`,
        image: `${SITE_URL}/favicon.jpg`,
        url: `${SITE_URL}/branches`,
        telephone: branch.phoneTel,
        priceRange: '₪₪',
        currenciesAccepted: 'ILS',
        paymentAccepted: BUSINESS_INFO.paymentMethods.join(', '),
        servesCuisine: ['Israeli', 'Bakery', 'Jewish', 'Middle Eastern'],
        keywords: 'מאפייה ירושלים, רוגלך, חלות, בד״ץ, שוק מחנה יהודה',
        address: {
            '@type': 'PostalAddress',
            streetAddress: branch.address.split(',')[0],
            addressLocality: 'Jerusalem',
            addressRegion: 'Jerusalem District',
            addressCountry: 'IL'
        },
        ...(geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: geo.lat,
                longitude: geo.lng
            }
        }),
        openingHoursSpecification: buildOpeningHours(branch.schedule),
        parentOrganization: {
            '@type': 'Organization',
            name: BUSINESS_INFO.legalName,
            url: SITE_URL,
            telephone: CONTACT_INFO.phoneTel,
            foundingDate: String(BUSINESS_INFO.foundedYear)
        }
    };
};

// Returns the full set — useful to render once on /branches and let Google index all three.
export const buildAllBranchSchemas = () => BRANCHES.map((b) => buildBranchSchema(b.id)).filter(Boolean);
