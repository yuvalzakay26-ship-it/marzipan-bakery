// =====================================================================
// Lead capture — pre-backend persistence layer.
//
// Until Phase 3 ships its real Supabase customers table, lead submissions
// land in localStorage so the bakery owner can export them via the admin
// dashboard. When Supabase is wired up, swap recordLead() to write to the
// `leads` table and dropLead() will continue to work unchanged.
// =====================================================================

import { trackEvent } from '../../utils/analytics';

const LEADS_KEY = 'marzipanLeads';
const EXIT_INTENT_DISMISSED_KEY = 'marzipanExitIntentDismissedAt';
const EXIT_INTENT_TTL_DAYS = 14;
const BIRTHDAY_DISMISSED_KEY = 'marzipanBirthdayDismissedAt';

const safeJsonGet = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const safeJsonSet = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

// Phone normalization aligned with siteContent: IL local → E.164.
const normalizePhone = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('972')) return `+${digits}`;
    if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
    return digits.startsWith('+') ? digits : `+972${digits}`;
};

export const recordLead = ({ kind, name = '', phone = '', extra = {} }) => {
    const lead = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        name: name.trim(),
        phone: normalizePhone(phone),
        extra,
        capturedAt: new Date().toISOString(),
        source: typeof location !== 'undefined' ? location.pathname : '',
        referrer: typeof document !== 'undefined' ? document.referrer : ''
    };
    const existing = safeJsonGet(LEADS_KEY, []);
    safeJsonSet(LEADS_KEY, [...existing, lead]);
    trackEvent('lead_capture', { kind, source: lead.source });
    return lead;
};

export const listLeads = () => safeJsonGet(LEADS_KEY, []);
export const clearLeads = () => safeJsonSet(LEADS_KEY, []);

export const isExitIntentMuted = () => {
    const at = Number(localStorage.getItem(EXIT_INTENT_DISMISSED_KEY) || 0);
    if (!at) return false;
    return Date.now() - at < EXIT_INTENT_TTL_DAYS * 24 * 3600 * 1000;
};

export const muteExitIntent = () => {
    try {
        localStorage.setItem(EXIT_INTENT_DISMISSED_KEY, String(Date.now()));
    } catch { /* ignore */ }
};

export const isBirthdayClubDismissed = () => {
    return Boolean(localStorage.getItem(BIRTHDAY_DISMISSED_KEY));
};
export const dismissBirthdayClub = () => {
    try {
        localStorage.setItem(BIRTHDAY_DISMISSED_KEY, String(Date.now()));
    } catch { /* ignore */ }
};
