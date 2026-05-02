import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Cookie, X, ShieldCheck, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

// =====================================================================
// CookieConsent — Israeli/GDPR-aligned consent banner.
//
// Loads BEFORE Google Analytics, and only persists analytics consent when
// the visitor opts in explicitly. The choice is saved per-browser to
// localStorage under `marzipan_cookie_consent` (versioned, so we can force
// a re-prompt if the policy meaningfully changes).
//
// The reopen-flow listens for a custom `marzipan:open-cookie-settings`
// event so the Footer (or anywhere else) can re-launch the banner without
// importing this component directly:
//
//   window.dispatchEvent(new Event("marzipan:open-cookie-settings"));
//
// We expose only two categories: technical (always on) and analytics
// (opt-in). We deliberately do NOT load any marketing/advertising pixels,
// so there's no third bucket to lie about.
// =====================================================================

const STORAGE_KEY = "marzipan_cookie_consent";
const CONSENT_VERSION = 1;
const REOPEN_EVENT = "marzipan:open-cookie-settings";

const readConsent = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.version !== CONSENT_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeConsent = (analytics) => {
    const payload = {
        version: CONSENT_VERSION,
        analytics: !!analytics,
        ts: Date.now()
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); }
    catch { /* private mode — non-fatal */ }
    return payload;
};

const CookieConsent = () => {
    const [open, setOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [analyticsOn, setAnalyticsOn] = useState(false);

    // Decide whether to show the banner on first paint.
    useEffect(() => {
        const existing = readConsent();
        if (!existing) {
            // Defer slightly so the banner doesn't fight first contentful paint.
            const t = setTimeout(() => setOpen(true), 600);
            return () => clearTimeout(t);
        }
        setAnalyticsOn(existing.analytics === true);
    }, []);

    // Reopen trigger — wired from Footer / Privacy page.
    useEffect(() => {
        const onReopen = () => {
            const existing = readConsent();
            setAnalyticsOn(existing?.analytics === true);
            setShowDetails(true);
            setOpen(true);
        };
        window.addEventListener(REOPEN_EVENT, onReopen);
        return () => window.removeEventListener(REOPEN_EVENT, onReopen);
    }, []);

    const persistAndClose = useCallback((analytics) => {
        writeConsent(analytics);
        setAnalyticsOn(!!analytics);
        setOpen(false);
        setShowDetails(false);
        // If analytics was just enabled, dynamically initialize GA without
        // needing a page reload. If it was disabled, no-op — the next page
        // load will simply skip GA loading.
        if (analytics) {
            import("../../utils/analytics").then(({ initGA, initChannelTracking }) => {
                initGA();
                initChannelTracking();
            });
        }
    }, []);

    const acceptAll = () => persistAndClose(true);
    const rejectAll = () => persistAndClose(false);
    const saveCustom = () => persistAndClose(analyticsOn);

    if (!open) return null;
    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-desc"
            dir="rtl"
            className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:left-auto sm:max-w-md z-[2147483630]"
        >
            <div className="bg-white text-[#1F1F1F] rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] border border-gray-200 overflow-hidden">
                <div className="bg-[#380909] text-white px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Cookie size={18} className="text-[#D4AF37]" aria-hidden="true" />
                        <h2 id="cookie-consent-title" className="font-bold text-base">העוגיות שלנו (לא אלה מהמאפייה)</h2>
                    </div>
                    <button
                        type="button"
                        onClick={rejectAll}
                        aria-label="סגירה ודחייה של עוגיות לא חיוניות"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <p id="cookie-consent-desc" className="text-sm leading-relaxed text-gray-700">
                        אנחנו משתמשים בעוגיות הכרחיות לתפעול האתר, וברשותכם — גם בעוגיות סטטיסטיקה אנונימיות (Google Analytics) שעוזרות לנו להבין איך משתמשים באתר ולשפר אותו.
                        ניתן לקרוא בהרחבה ב{" "}
                        <Link to="/privacy" className="text-[#B91C1C] font-bold underline decoration-[#D4AF37]/40 underline-offset-4">
                            מדיניות הפרטיות
                        </Link>.
                    </p>

                    {showDetails && (
                        <div className="space-y-2.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <CategoryRow
                                icon={<ShieldCheck size={16} className="text-[#2E7D32]" aria-hidden="true" />}
                                title="עוגיות חיוניות"
                                desc="נדרשות לתפעול האתר, סל הקניות והעדפות נגישות. תמיד פעילות."
                                locked
                                pressed
                            />
                            <CategoryRow
                                icon={<BarChart3 size={16} className="text-[#1B6FB6]" aria-hidden="true" />}
                                title="עוגיות סטטיסטיקה (Google Analytics)"
                                desc="אנונימיות. עוזרות לנו לראות אילו דפים פופולריים ואיפה כדאי לשפר."
                                pressed={analyticsOn}
                                onToggle={() => setAnalyticsOn((v) => !v)}
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            onClick={acceptAll}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B91C1C] hover:bg-[#380909] text-white font-bold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#B91C1C]/40"
                        >
                            אישור הכל
                        </button>
                        <button
                            type="button"
                            onClick={rejectAll}
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#1F1F1F] border border-gray-200 font-bold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#1B6FB6]/40"
                        >
                            רק חיוניות
                        </button>
                    </div>

                    {showDetails ? (
                        <button
                            type="button"
                            onClick={saveCustom}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#1B6FB6] font-bold text-xs hover:underline"
                        >
                            שמירת ההעדפות שבחרתי
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDetails(true)}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#1B6FB6] font-bold text-xs hover:underline"
                        >
                            התאמה אישית של ההעדפות
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const CategoryRow = ({ icon, title, desc, pressed, locked, onToggle }) => (
    <div className="flex items-start justify-between gap-3 text-right">
        <div className="flex items-start gap-2 min-w-0">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-[#1F1F1F]">{title}</p>
                <p className="text-[11px] leading-relaxed text-gray-500">{desc}</p>
            </div>
        </div>
        <button
            type="button"
            disabled={locked}
            onClick={onToggle}
            aria-pressed={pressed}
            aria-label={`${title} — ${pressed ? "פעיל" : "כבוי"}`}
            className={`shrink-0 mt-1 inline-flex items-center w-10 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#1B6FB6]/40 ${
                pressed
                    ? "bg-[#1B6FB6]"
                    : "bg-gray-300"
            } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
        >
            <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pressed ? "translate-x-[-16px]" : "translate-x-[-2px]"
                }`}
                aria-hidden="true"
            />
        </button>
    </div>
);

export default CookieConsent;
