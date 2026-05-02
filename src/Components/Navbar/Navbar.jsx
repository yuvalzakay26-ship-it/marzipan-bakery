import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ChevronDown, ShoppingBag, BookOpen, MessageCircle } from "lucide-react";
import logo from "../../assets/logo.jpg";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { CONTACT_INFO } from "../../data/siteContent";

// =====================================================================
// Navbar — premium, restrained, RTL.
//
// Hierarchy:
//   1. Logo + brand wordmark (visible at sm/md and at xl+)
//   2. Primary links (6, always visible at lg+):
//        הקטלוג · חגים ▾ · סניפים · אודותינו · סיפורים · צור קשר
//   3. "מדריכים" dropdown — long-tail SEO landings only.
//   4. Actions: WhatsApp icon-button + Cart pill.
//
// On mobile (<lg), everything collapses to a single sheet menu.
// =====================================================================
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openMenu, setOpenMenu] = useState(null); // 'holidays' | 'guides' | null
    const location = useLocation();
    const { cartCount, toggleCart } = useCart();
    const navRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Note: mobile sheet links + desktop dropdown items each call their own
    // close handler, so no route-change effect is needed.

    // Close any open dropdown when clicking outside.
    useEffect(() => {
        const onDocClick = (e) => {
            if (!navRef.current) return;
            if (!navRef.current.contains(e.target)) setOpenMenu(null);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Close on Escape — keyboard accessibility.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setOpenMenu(null);
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Lock body scroll when mobile sheet is open. Lock <html> too — iOS Safari
    // ignores body-only locks once a touch-scroll has started, and the global
    // `overflow-x: hidden` rule in index.css means the inline override needs to
    // re-apply x-hidden on cleanup so horizontal-overflow protection survives.
    useEffect(() => {
        if (!isOpen) return;
        const html = document.documentElement;
        const body = document.body;
        const prevBody = body.style.overflow;
        const prevHtml = html.style.overflow;
        body.style.overflow = "hidden";
        html.style.overflow = "hidden";
        return () => {
            body.style.overflow = prevBody;
            html.style.overflow = prevHtml;
        };
    }, [isOpen]);

    // Primary nav — visible at all times on desktop. Order is intentional:
    // commerce-first (catalog → holidays → branches), then trust/content
    // (about → stories → contact). חגים stays grouped because two destinations
    // is the sweet spot for a single labeled trigger.
    const PRIMARY = [
        { name: "הקטלוג", href: "/products" },
        {
            name: "חגים",
            key: "holidays",
            items: [
                { name: "חנוכה — סופגניות",     href: "/holidays/hanukkah" },
                { name: "שבועות — עוגות גבינה", href: "/holidays/shavuot" }
            ]
        },
        { name: "סניפים",   href: "/branches" },
        { name: "אודותינו", href: "/about" },
        { name: "סיפורים",  href: "/stories" },
        { name: "צור קשר",  href: "/contact" }
    ];

    // Long-tail SEO landing pages. These are best left in a single "מדריכים"
    // dropdown — they don't carry primary intent and would crowd the bar.
    const GUIDES = [
        { name: "הרוגלך הכי טוב בירושלים", href: "/jerusalem/best-rugelach" },
        { name: "מאפים לשבת",               href: "/jerusalem/shabbat-pastries" },
        { name: "מארזי מתנה",               href: "/jerusalem/gift-boxes" },
        { name: "מגשי משרד",                href: "/jerusalem/office-trays" },
        { name: "מדריך שוק מחנה יהודה",      href: "/jerusalem/mahane-yehuda-bakery-guide" }
    ];

    const isActive = (path) => location.pathname === path;
    const isHolidayActive = location.pathname.startsWith("/holidays");
    const isGuidesActive  = GUIDES.some((i) => i.href && location.pathname === i.href);

    return (
        <>
        <header
            ref={navRef}
            className={`fixed top-0 inset-x-0 z-50 font-sans transition-all duration-300 ${
                scrolled
                    ? "bg-[#FDFBF7]/92 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(56,9,9,0.18)] border-b border-[#D4AF37]/15"
                    : "bg-[#FDFBF7]/70 backdrop-blur-sm"
            }`}
            dir="rtl"
        >
            <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 transition-all duration-300 ${
                    scrolled ? "h-16 md:h-20" : "h-20 md:h-28"
                }`}
            >
                {/* Logo — luxury presence */}
                <Link
                    to="/"
                    className="relative z-10 flex items-center gap-3 shrink-0 group"
                    aria-label="מאפיית מרציפן — חזרה לעמוד הבית"
                >
                    <img
                        src={logo}
                        alt=""
                        aria-hidden="true"
                        className={`rounded-full object-cover ring-1 ring-[#D4AF37]/30 shadow-md group-hover:ring-[#D4AF37]/60 transition-all duration-300 ${
                            scrolled ? "h-11 w-11 md:h-12 md:w-12" : "h-14 w-14 md:h-16 md:w-16"
                        }`}
                    />
                    {/* Wordmark hides at lg (the 6-link nav needs that horizontal
                        room) and returns at xl where the bar has space to breathe. */}
                    <span className="hidden sm:flex lg:hidden xl:flex flex-col leading-none">
                        <span className={`font-black text-[#380909] tracking-tight transition-all ${scrolled ? "text-base md:text-lg" : "text-lg md:text-xl"}`}>
                            מאפיית מרציפן
                        </span>
                        <span className="text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-bold text-[#B91C1C] mt-1">
                            ירושלים · 1986
                        </span>
                    </span>
                </Link>

                {/* Primary nav — desktop only, 6 visible links + Guides menu.
                 *  At lg the link gap tightens to keep the bar uncluttered;
                 *  at xl it relaxes to its full premium rhythm. */}
                <nav className="hidden lg:flex items-center gap-0 xl:gap-1" aria-label="תפריט ראשי">
                    {PRIMARY.map((link) =>
                        link.items ? (
                            <DropdownButton
                                key={link.key}
                                label={link.name}
                                isOpen={openMenu === link.key}
                                isActive={link.key === "holidays" && isHolidayActive}
                                onToggle={() => setOpenMenu(openMenu === link.key ? null : link.key)}
                            >
                                <DropdownPanel items={link.items} onClose={() => setOpenMenu(null)} />
                            </DropdownButton>
                        ) : (
                            <PrimaryLink key={link.href} to={link.href} active={isActive(link.href)}>
                                {link.name}
                            </PrimaryLink>
                        )
                    )}

                    {/* "מדריכים" — long-tail guides only */}
                    <DropdownButton
                        label="מדריכים"
                        icon={<BookOpen size={13} aria-hidden="true" />}
                        isOpen={openMenu === "guides"}
                        isActive={isGuidesActive}
                        onToggle={() => setOpenMenu(openMenu === "guides" ? null : "guides")}
                    >
                        <DropdownPanel items={GUIDES} onClose={() => setOpenMenu(null)} wide />
                    </DropdownButton>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    {/* WhatsApp — icon-only on desktop, kept reachable */}
                    <a
                        href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`שיחה עם המאפייה בוואטסאפ ${CONTACT_INFO.whatsappDisplay}`}
                        className="hidden md:inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
                    >
                        <MessageCircle size={18} aria-hidden="true" />
                    </a>

                    {/* Cart pill — primary action */}
                    <button
                        onClick={toggleCart}
                        aria-label={`הסל שלי, ${cartCount} פריטים`}
                        className="relative inline-flex items-center gap-2 bg-[#380909] text-white px-4 md:px-5 py-2.5 rounded-full font-bold shadow-[0_10px_24px_-12px_rgba(56,9,9,0.55)] ring-1 ring-[#D4AF37]/40 hover:bg-[#B91C1C] hover:shadow-[0_14px_28px_-12px_rgba(185,28,28,0.55)] transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
                    >
                        <ShoppingBag size={16} aria-hidden="true" />
                        <span className="hidden sm:inline text-sm">הסל שלי</span>
                        {cartCount > 0 && (
                            <span
                                className="absolute -top-1.5 -left-1.5 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-[#D4AF37] text-[#1A0F0A] text-[11px] font-black shadow"
                                aria-hidden="true"
                            >
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        onClick={() => setIsOpen((v) => !v)}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        aria-label={isOpen ? "סגירת תפריט" : "פתיחת תפריט"}
                        className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-[#2D211E] hover:bg-[#FFF8E1] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

        </header>

        {/* Mobile sheet — portaled to document.body to escape the stacking-context
            cap from <div className="relative z-10"> in App.jsx. Without the portal,
            StickyMobileCTA (z-[95] inside the same z-10 context) renders above the
            sheet and covers the bottom links once the user has scrolled past the
            hero. Portaling lifts the sheet to body level, where z-[120] sits above
            the CTA bar but is still below the accessibility widget. */}
        {createPortal(
            <div
                className={`lg:hidden fixed inset-0 z-[120] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={!isOpen}
                dir="rtl"
            >
                {/* Tappable backdrop — closes the menu on outside tap. */}
                <button
                    type="button"
                    aria-label="סגירת תפריט"
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0 w-full h-full bg-[#1A0F0A]/45 backdrop-blur-sm cursor-default"
                />

                {/* Sheet — solid cream surface, dynamic offset clears the live navbar
                    height (h-20 unscrolled / h-16 scrolled on mobile), so the first
                    item is never hidden behind the bar. */}
                <div
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="תפריט ניווט"
                    className={`absolute inset-x-0 bg-[#FDFBF7] shadow-[0_24px_60px_-30px_rgba(56,9,9,0.45)] border-b border-[#D4AF37]/20 overflow-y-auto overscroll-contain transition-transform duration-300 ease-out ${
                        isOpen ? "translate-y-0" : "-translate-y-3"
                    } ${scrolled ? "top-16" : "top-20"} bottom-0`}
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    <nav className="px-5 sm:px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-w-md mx-auto" aria-label="תפריט ראשי נייד">
                        <ul className="space-y-1">
                            {PRIMARY.map((link) =>
                                link.items ? (
                                    <li key={link.key}>
                                        <MobileGroupHeader>{link.name}</MobileGroupHeader>
                                        <ul className="space-y-1 pr-3">
                                            {link.items.map((item) => (
                                                <li key={item.href}>
                                                    <MobileLink to={item.href} onClick={() => setIsOpen(false)} active={isActive(item.href)}>
                                                        {item.name}
                                                    </MobileLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ) : (
                                    <li key={link.href}>
                                        <MobileLink to={link.href} onClick={() => setIsOpen(false)} active={isActive(link.href)}>
                                            {link.name}
                                        </MobileLink>
                                    </li>
                                )
                            )}
                        </ul>

                        <hr className="border-[#D4AF37]/20 my-5" />

                        {/* Guides on mobile — same long-tail items as the desktop dropdown,
                            rendered subtle so they don't compete with the primary list. */}
                        <MobileGroupHeader>מדריכים</MobileGroupHeader>
                        <ul className="space-y-1">
                            {GUIDES.map((item) => (
                                <li key={item.href}>
                                    <MobileLink to={item.href} onClick={() => setIsOpen(false)} active={isActive(item.href)} subtle>
                                        {item.name}
                                    </MobileLink>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <a
                                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white border border-[#25D366]/40 text-[#25D366] font-bold hover:bg-[#25D366] hover:text-white transition-colors min-h-[48px]"
                            >
                                <MessageCircle size={16} aria-hidden="true" />
                                וואטסאפ
                            </a>
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); toggleCart(); }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#380909] text-white font-bold ring-1 ring-[#D4AF37]/40 hover:bg-[#B91C1C] transition-colors min-h-[48px]"
                            >
                                <ShoppingBag size={16} aria-hidden="true" />
                                הסל ({cartCount})
                            </button>
                        </div>
                    </nav>
                </div>
            </div>,
            document.body
        )}
        </>
    );
};

// ---------- desktop primitives ----------
const PrimaryLink = ({ to, active, children }) => (
    <NavLink
        to={to}
        className={({ isActive: a }) => {
            const isOn = active ?? a;
            return `relative px-2.5 xl:px-3 py-2 rounded-full text-[14px] xl:text-[15px] font-medium transition-colors ${
                isOn ? "text-[#B91C1C]" : "text-[#2D211E] hover:text-[#B91C1C]"
            }`;
        }}
    >
        {children}
        <span
            className={`pointer-events-none absolute left-2.5 right-2.5 xl:left-3 xl:right-3 -bottom-0.5 h-px bg-[#D4AF37] origin-center transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0 hover:scale-x-100"
            }`}
            aria-hidden="true"
        />
    </NavLink>
);

const DropdownButton = ({ label, icon, isOpen, isActive, onToggle, children }) => (
    <div className="relative">
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-full text-[14px] xl:text-[15px] font-medium transition-colors ${
                isActive || isOpen ? "text-[#B91C1C]" : "text-[#2D211E] hover:text-[#B91C1C]"
            }`}
        >
            {icon}
            {label}
            <ChevronDown
                size={14}
                aria-hidden="true"
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
        </button>
        <div
            className={`absolute top-full right-0 mt-2 origin-top transition-all duration-200 ${
                isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95 pointer-events-none"
            }`}
        >
            {children}
        </div>
    </div>
);

const DropdownPanel = ({ items, onClose, wide = false }) => (
    <div
        className={`bg-white rounded-2xl shadow-[0_24px_60px_-30px_rgba(56,9,9,0.45)] border border-[#D4AF37]/20 overflow-hidden ${wide ? "w-72" : "w-60"}`}
    >
        <ul className="py-2">
            {items.map((item, i) =>
                item.divider ? (
                    <li key={`d-${i}`} className="px-5 pt-3 pb-1.5 text-[10px] tracking-[0.28em] uppercase font-bold text-[#B91C1C]/70">
                        {item.name}
                    </li>
                ) : (
                    <li key={item.href}>
                        <Link
                            to={item.href}
                            onClick={onClose}
                            className="block px-5 py-2.5 text-right text-sm text-[#2D211E] hover:bg-[#FFF8E1] hover:text-[#B91C1C] transition-colors"
                        >
                            {item.name}
                        </Link>
                    </li>
                )
            )}
        </ul>
    </div>
);

// ---------- mobile primitives ----------
const MobileGroupHeader = ({ children }) => (
    <div className="px-3 pt-4 pb-2 text-[10px] tracking-[0.28em] uppercase font-bold text-[#B91C1C]/70">
        {children}
    </div>
);

const MobileLink = ({ to, onClick, active, subtle, children }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-right transition-colors ${
            active
                ? "bg-[#FFF8E1] text-[#B91C1C] font-bold"
                : subtle
                    ? "text-[#5D4037] hover:bg-[#FFF8E1]/60"
                    : "text-[#2D211E] hover:bg-[#FFF8E1]/60 font-medium"
        }`}
    >
        <span className="text-base">{children}</span>
        <span className={`text-xs ${active ? "text-[#D4AF37]" : "text-[#D4AF37]/40"}`} aria-hidden="true">‹</span>
    </Link>
);

export default Navbar;
