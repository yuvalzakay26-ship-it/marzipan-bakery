// Google Analytics 4 + acquisition channel tracking utility.
//
// Consent gating: GA4 is NEVER loaded until the visitor explicitly accepts
// analytics cookies via CookieConsent. This keeps the site aligned with the
// Israeli Privacy Protection Law (התשמ"א-1981) and EU/GDPR practice for
// non-essential tracking. Until consent, trackEvent() becomes a no-op (or
// a dev-only console echo).

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;
const CHANNEL_KEY = 'marzipan_channel';
const CHANNEL_TS_KEY = 'marzipan_channel_ts';
const CHANNEL_TTL_DAYS = 30;
const CONSENT_KEY = 'marzipan_cookie_consent';

export const hasAnalyticsConsent = () => {
    if (typeof window === 'undefined') return false;
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed?.analytics === true;
    } catch {
        return false;
    }
};

export const initGA = () => {
    if (!GA_MEASUREMENT_ID) {
        console.warn("Analytics: GA_MEASUREMENT_ID is missing in .env");
        return;
    }

    if (!hasAnalyticsConsent()) {
        // Visitor hasn't accepted analytics cookies — do NOT load gtag.
        return;
    }

    if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    }
};

// Acquisition channel inference. Reads UTM params on first landing, persists
// for 30 days. Lets the bakery owner see "what's actually driving conversions":
// organic search, paid, social, direct, referral. Auto-merged into every event.
const detectChannel = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');
    const referrer = (typeof document !== 'undefined' && document.referrer) || '';

    let channel = 'direct';
    if (utm_source) channel = utm_source.toLowerCase();
    else if (referrer.includes('google.')) channel = 'organic_google';
    else if (referrer.includes('bing.')) channel = 'organic_bing';
    else if (referrer.includes('facebook.') || referrer.includes('fb.')) channel = 'social_facebook';
    else if (referrer.includes('instagram.')) channel = 'social_instagram';
    else if (referrer.includes('whatsapp')) channel = 'social_whatsapp';
    else if (referrer.includes('tiktok.')) channel = 'social_tiktok';
    else if (referrer && typeof window !== 'undefined' && !referrer.includes(window.location.hostname)) {
        channel = 'referral';
    }

    return { channel, utm_source, utm_medium, utm_campaign, referrer };
};

export const initChannelTracking = () => {
    if (typeof window === 'undefined') return;
    try {
        const existingTs = Number(localStorage.getItem(CHANNEL_TS_KEY) || 0);
        const fresh = existingTs && Date.now() - existingTs < CHANNEL_TTL_DAYS * 24 * 3600 * 1000;
        if (fresh) return;
        const data = detectChannel();
        if (!data) return;
        localStorage.setItem(CHANNEL_KEY, JSON.stringify(data));
        localStorage.setItem(CHANNEL_TS_KEY, String(Date.now()));
    } catch { /* localStorage might be disabled */ }
};

export const getChannel = () => {
    try {
        const raw = localStorage.getItem(CHANNEL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const trackEvent = (eventName, params = {}) => {
    if (!hasAnalyticsConsent()) {
        // Without consent, analytics is fully silent.
        if (import.meta.env.DEV) {
            console.log(`[Analytics — no consent] ${eventName}`, params);
        }
        return;
    }

    const channel = getChannel();
    const enriched = channel ? { ...channel, ...params } : params;

    if (window.gtag) {
        window.gtag('event', eventName, enriched);
    } else if (import.meta.env.DEV) {
        console.log(`[Analytics Dev] Event: ${eventName}`, enriched);
    }
};

// Standard GA4-style events. Names align with GA4 enhanced ecommerce where possible
// so the property can later be plugged into a real ecommerce tracker without renaming.
export const ANALYTICS_EVENTS = {
    // Catalog / discovery
    VIEW_ITEM:                 'view_item',
    VIEW_ITEM_LIST:            'view_item_list',
    SELECT_ITEM:               'select_item',

    // Cart
    ADD_TO_CART:               'add_to_cart',
    REMOVE_FROM_CART:          'remove_from_cart',
    VIEW_CART:                 'view_cart',
    APPLY_BUNDLE:              'apply_bundle',

    // Checkout funnel
    BEGIN_CHECKOUT:            'begin_checkout',
    PLACE_ORDER:               'place_order',

    // Generic CTAs
    WHATSAPP_CLICK:            'whatsapp_click',
    HERO_CTA_CLICK:            'hero_cta_click',
    VIP_CLUB_CLICK:            'vip_club_click',
    REORDER_CLICK:             'reorder_click',
    CALL_BRANCH_CLICK:         'call_branch_click',

    // Forms
    CONTACT_SUBMIT:            'contact_submit',

    // Growth layer
    LEAD_CAPTURE:              'lead_capture',
    EXIT_INTENT_OPEN:          'exit_intent_open',
    BIRTHDAY_CLUB_JOIN:        'birthday_club_join',
    HOLIDAY_WAITLIST_JOIN:     'holiday_waitlist_join',
    REFERRAL_SHARE:            'referral_share',
    SEO_LANDING_VIEW:          'seo_landing_view',
    STORY_READ:                'story_read'
};
