import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    Accessibility, X, ZoomIn, ZoomOut, Contrast, Droplet,
    Pause, Underline, RotateCcw, Check, AlertTriangle
} from "lucide-react";

// =====================================================================
// AccessibilityWidget — Israeli-SME-style floating toolkit.
//
// Design notes that keep this safe under any visual mode:
//
//   1. The widget renders into its OWN portal host (`<div data-a11y-widget-root>`)
//      appended directly to <body>. It is therefore never trapped inside an
//      ancestor that creates a containing block (transform/filter/perspective).
//      The host itself is `position: fixed; inset: 0` with `pointer-events:none`
//      and a near-INT32_MAX z-index — see index.css.
//
//   2. The grayscale filter is applied to <html>, NOT <body>, so fixed-positioned
//      elements (including this widget) stay anchored to the viewport.
//
//   3. Global keyboard escape hatch: Alt+Shift+R resets all accessibility
//      settings even if the panel is somehow unreachable.
//
//   4. URL escape hatch: visiting any page with `?a11y-reset=1` clears the
//      stored settings on load, before the rest of the app paints.
// =====================================================================

const STORAGE_KEY = "marzipan-a11y";
const SCALE_STEP = 0.1;
const SCALE_MIN  = 0.85;
const SCALE_MAX  = 1.4;
const HOST_ATTR  = "data-a11y-widget-root";

const DEFAULTS = {
    scale:           1,
    highContrast:    false,
    grayscale:       false,
    reduceMotion:    false,
    underlineLinks:  false
};

function readSettings() {
    if (typeof window === "undefined") return DEFAULTS;
    // URL escape hatch — wipes everything before reading.
    try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get("a11y-reset") === "1") {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch { /* ignore */ }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        const base = parsed ? { ...DEFAULTS, ...parsed } : DEFAULTS;
        const osReduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        return osReduce ? { ...base, reduceMotion: true } : base;
    } catch {
        return DEFAULTS;
    }
}

function writeSettings(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
    catch { /* private mode — non-fatal */ }
}

/** Apply settings to <html>. Uses attributes so styling lives in CSS. */
function applySettings(s) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--a11y-font-scale", String(s.scale));
    root.toggleAttribute("data-a11y-contrast", s.highContrast);
    root.toggleAttribute("data-a11y-grayscale", s.grayscale);
    root.toggleAttribute("data-a11y-reduce-motion", s.reduceMotion);
    root.toggleAttribute("data-a11y-underline", s.underlineLinks);
}

/** Find or create the dedicated portal host on <body>. */
function getOrCreateHost() {
    if (typeof document === "undefined") return null;
    let host = document.querySelector(`[${HOST_ATTR}]`);
    if (!host) {
        host = document.createElement("div");
        host.setAttribute(HOST_ATTR, "");
        document.body.appendChild(host);
    }
    return host;
}

const AccessibilityWidget = () => {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(readSettings);
    // Resolve the portal host synchronously so the widget mounts on the same
    // tick as the rest of the app — no flicker, no setState-in-effect.
    const [host] = useState(getOrCreateHost);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);

    // Hide on admin routes — owner does not want the widget over the dashboard.
    const onAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

    // Apply persisted settings to <html> on mount + whenever they change.
    useEffect(() => {
        applySettings(settings);
    }, [settings]);

    // Persist + apply whenever settings change.
    const update = (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        writeSettings(next);
    };

    // Global emergency reset — Alt+Shift+R works regardless of widget state.
    // This is the keyboard equivalent of the visible reset button, available
    // even if a future regression makes the button unreachable.
    useEffect(() => {
        const onKey = (e) => {
            if (e.altKey && e.shiftKey && (e.key === "R" || e.key === "r")) {
                e.preventDefault();
                writeSettings(DEFAULTS);
                setSettings(DEFAULTS);
                setOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Close on Escape; restore focus to the toggle button.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    // Focus first control inside the panel on open.
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => {
            const first = panelRef.current?.querySelector("button[data-a11y-focus]");
            first?.focus();
        }, 50);
        return () => clearTimeout(t);
    }, [open]);

    if (onAdmin) return null;
    if (!host) return null;

    const reset = () => update(DEFAULTS);
    const incScale = () => update({ scale: Math.min(SCALE_MAX, +(settings.scale + SCALE_STEP).toFixed(2)) });
    const decScale = () => update({ scale: Math.max(SCALE_MIN, +(settings.scale - SCALE_STEP).toFixed(2)) });

    // Everything below renders into the portal host on <body> so no ancestor
    // (fixed/transformed/filtered) can ever change the widget's anchoring.
    return createPortal(
        <>
            {/* Floating toggle button.
                Desktop (lg+): left side per IL convention.
                Mobile (<lg): right side, anchored above the StickyMobileCTA bar
                via safe-area-aware offset, stacked below ScrollToTopButton.
                position:fixed inside a fixed/inset-0 host stays viewport-anchored. */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="פתיחת תפריט נגישות"
                aria-expanded={open}
                aria-controls="a11y-panel"
                style={{ pointerEvents: "auto" }}
                className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 lg:bottom-6 lg:left-5 lg:right-auto inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1B6FB6] text-white shadow-[0_12px_28px_-10px_rgba(27,111,182,0.6)] ring-2 ring-white hover:bg-[#155890] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B6FB6]/40 transition-colors"
            >
                <Accessibility size={22} aria-hidden="true" />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-0"
                        style={{ pointerEvents: "auto" }}
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        id="a11y-panel"
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="a11y-title"
                        dir="rtl"
                        style={{ pointerEvents: "auto" }}
                        className="fixed bottom-20 left-3 right-3 sm:bottom-24 sm:left-5 sm:right-auto sm:w-[320px] bg-white text-[#1F1F1F] rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] border border-gray-200 overflow-hidden"
                    >
                        <header className="flex items-center justify-between px-4 py-3 bg-[#1B6FB6] text-white">
                            <div className="flex items-center gap-2">
                                <Accessibility size={18} aria-hidden="true" />
                                <h2 id="a11y-title" className="font-bold text-base">תפריט נגישות</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="סגירת תפריט הנגישות"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </header>

                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            <fieldset className="space-y-2">
                                <legend className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-1">גודל טקסט</legend>
                                <div className="flex items-stretch gap-2">
                                    <ToolbarButton onClick={incScale} disabled={settings.scale >= SCALE_MAX} aria-label="הגדלת טקסט" focusFirst>
                                        <ZoomIn size={18} aria-hidden="true" />
                                        <span>הגדלה</span>
                                    </ToolbarButton>
                                    <ToolbarButton onClick={decScale} disabled={settings.scale <= SCALE_MIN} aria-label="הקטנת טקסט">
                                        <ZoomOut size={18} aria-hidden="true" />
                                        <span>הקטנה</span>
                                    </ToolbarButton>
                                </div>
                                <p className="text-[11px] text-gray-500">גודל נוכחי: {Math.round(settings.scale * 100)}%</p>
                            </fieldset>

                            <hr className="border-gray-100" />

                            <fieldset className="space-y-2">
                                <legend className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-1">תצוגה</legend>
                                <ToggleRow
                                    icon={<Contrast size={18} aria-hidden="true" />}
                                    label="ניגודיות גבוהה"
                                    pressed={settings.highContrast}
                                    onClick={() => update({ highContrast: !settings.highContrast })}
                                />
                                <ToggleRow
                                    icon={<Droplet size={18} aria-hidden="true" />}
                                    label="גווני אפור"
                                    pressed={settings.grayscale}
                                    onClick={() => update({ grayscale: !settings.grayscale })}
                                />
                                <ToggleRow
                                    icon={<Underline size={18} aria-hidden="true" />}
                                    label="הדגשת קישורים בקו תחתון"
                                    pressed={settings.underlineLinks}
                                    onClick={() => update({ underlineLinks: !settings.underlineLinks })}
                                />
                                <ToggleRow
                                    icon={<Pause size={18} aria-hidden="true" />}
                                    label="עצירת אנימציות"
                                    pressed={settings.reduceMotion}
                                    onClick={() => update({ reduceMotion: !settings.reduceMotion })}
                                />
                            </fieldset>

                            <hr className="border-gray-100" />

                            <button
                                type="button"
                                onClick={reset}
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-[#1F1F1F] font-bold text-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#1B6FB6]/40"
                            >
                                <RotateCcw size={16} aria-hidden="true" />
                                איפוס הגדרות נגישות
                            </button>

                            <div className="rounded-xl bg-[#FFF8E1] border border-[#D4AF37]/40 p-3 text-[11px] leading-relaxed text-[#5D4037] flex gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-[#B91C1C]" aria-hidden="true" />
                                <div>
                                    <strong className="text-[#380909]">איפוס חירום:</strong>{" "}
                                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px]" dir="ltr">Alt + Shift + R</kbd>
                                    {" "}או{" "}
                                    <a href="?a11y-reset=1" className="text-[#1B6FB6] underline font-bold">/?a11y-reset=1</a>
                                </div>
                            </div>

                            <p className="text-[11px] leading-relaxed text-gray-500 pt-1">
                                להצהרת הנגישות המלאה ולפרטי רכז הנגישות:{" "}
                                <a href="/accessibility" className="text-[#1B6FB6] underline font-bold">/accessibility</a>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </>,
        host
    );
};

const ToolbarButton = ({ children, onClick, disabled, focusFirst, ...rest }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-a11y-focus={focusFirst ? "" : undefined}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1B6FB6]/40"
        {...rest}
    >
        {children}
    </button>
);

const ToggleRow = ({ icon, label, pressed, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={pressed}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-right text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#1B6FB6]/40 ${
            pressed
                ? "bg-[#1B6FB6]/10 border-[#1B6FB6]/40 text-[#1B6FB6]"
                : "bg-white border-gray-200 text-[#1F1F1F] hover:bg-gray-50"
        }`}
    >
        <span className="flex items-center gap-2 font-bold">
            {icon} {label}
        </span>
        <span
            className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full border ${
                pressed ? "bg-[#1B6FB6] border-[#1B6FB6] text-white" : "border-gray-300 text-transparent"
            }`}
            aria-hidden="true"
        >
            <Check size={14} strokeWidth={3} />
        </span>
    </button>
);

export default AccessibilityWidget;
