# PROJECT BRAIN

> Single source of truth for the Marzipan Bakery digital product.
> Owners: Product / Engineering / Design.
> Last reviewed: 2026-04-29.
> Companion docs: `PROJECT_AUDIT.md` (current-state forensic), `DAILY_EXECUTION.md` (today/this-week ops).

If anything in this document conflicts with code, **this document wins** — change the code or change this document, never both at once and never neither.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Product name | מאפיית מרציפן — Marzipan Bakery (digital) |
| Type | Hebrew (RTL) e-commerce + brand site for a real Jerusalem bakery |
| Repo | `MarzipanBakery` |
| Primary domain (target) | `marzipanbakery.com` |
| Locale | `he-IL` (Hebrew RTL) — Phase 4: `+ en-US`, `+ ar` |
| Currency | ILS (₪) |
| Timezone | Asia/Jerusalem |
| Stack (today) | React 19 · Vite 7 · Tailwind 4 · React Router 7 · react-helmet-async · @emailjs/browser · GA4 |
| Stack (target) | + TypeScript · + Supabase (Postgres / Auth / Storage / Edge Functions) · + Cardcom or Tranzila (PSP) · + TanStack Query · + Vitest + Playwright · + GitHub Actions CI · + Sentry |
| Hosting (target) | Vercel (frontend) · Supabase (backend) · Cloudflare (DNS, image transforms) |
| Build | `npm run dev` · `npm run build` · `npm run lint` |
| Status | Pre-launch. Marketing site complete; ordering pipeline ends in WhatsApp redirect. |

**One-line definition:** A premium bilingual storefront that turns a 40-year-old Jerusalem bakery brand into a national online business, while preserving the in-person ritual of the שוק.

---

## 2. Brand Story

Marzipan Bakery has existed in Mahane Yehuda Market since **1986**. Founded by **שושנה אוזרקו ז״ל** and **יוסף אוזרקו**. Today the bakery is run by their sons, **איציק אוזרקו** and **שלומי אוזרקו**, who continue the family recipe and the same standards. The brand's reputation is anchored to a single product — the **rugelach**, sold hot from the oven, sticky with chocolate, weighed by the kilo. A Jerusalem family bakery that has become a city institution.

**Brand pillars:**
1. **Heritage.** 1986. Founders. Original recipe. Shuk Mahane Yehuda. Family hands.
2. **Heat.** Hot from the oven, served warm, weighed by the kilo. The rugelach is *experiential*, not just baked.
3. **Kashrut.** Badatz Eda Charedit. Non-negotiable. Communicated everywhere.
4. **Jerusalem.** The brand IS the city. Stones, lamps, voices, smell of yeast at 6 AM.
5. **Generosity.** Trays, family boxes, holiday collections. Marzipan is a *gift you bring*.

**Voice:** Warm, confident, slightly old-world. Hebrew first. Never corporate. Never trendy. Speaks like a Jerusalem family bakery that has stood in the same place for decades — the kind of voice you hear from someone who knows you by name.

**Forbidden brand moves:** modern food-tech aesthetics, ironic copy, neon, hand-drawn doodle pastiche, "artisan" cosplay, English-first homepage, AI-generated stock food photography, generic "bakery" stock photography.

---

## 3. Final Vision (10/10 level)

The 10/10 product is a destination, not a website.

**Homepage (10/10):**
- Hero opens on a single, slow video loop of rugelach being hand-rolled at dawn, with a real recording of the shuk waking up. No stock. No AI.
- Above the fold: one CTA — *"הזמינו לאיסוף או למשלוח"*.
- Live "out of the oven" badge fed by a tablet at the counter (admin pushes a button → site shows "חם בתנור: רוגלך שוקולד · עוד 14 דקות").
- Schema, breadcrumbs, FAQ, AggregateRating all present. Lighthouse ≥ 95 mobile.

**Catalog (10/10):**
- Every product has its own page, its own URL, its own photo (real, in-house), its own description, its own allergens, its own kashrut detail, its own price-per-unit and price-per-kilo where relevant.
- Filter by occasion (Shabbat / חגים / מתנה / משרד / ילדים / בלי גלוטן / חלבי / פרווה).
- "Build a tray" composer. Suggested bundles. Smart upsells that don't feel like upsells.

**Checkout (10/10):**
- One screen. Pickup or delivery. Branch picker with live "open now". Real PSP. Apple/Google Pay. Bit. Saved card. 60 seconds, end-to-end, on mobile.
- WhatsApp remains as a *parallel* channel for those who prefer it — never as the only channel.

**Account (10/10):**
- Phone-OTP login (no passwords). Reorder in two taps. Saved address. Order history. "Friday box" subscription one click away.

**Admin (10/10):**
- One bakery manager can update prices, mark items out-of-stock, push the "out of the oven" signal, see today's orders, refund, change branch hours. No developer required.

**Brand (10/10):**
- Site feels like the שוק at 7 AM in autumn — warm, slightly worn, certain of itself. No animation that doesn't earn its frame. No element that wouldn't look right printed on a paper bag.

**Reach (10/10):**
- #1 Google result for `מאפיית מרציפן`, `רוגלך שוק`, `רוגלך ירושלים`, `סופגניות חנוכה ירושלים`. Featured snippet for "איפה הרוגלך הכי טוב בירושלים".
- Organic traffic ≥ 60% of total. Direct ≥ 25%. Paid < 15%.

---

## 4. Business Objectives

### North-star metric
**Online-originated revenue per week** (₪). Everything else is a leading indicator.

### Year-1 targets (from launch of paid checkout)
| Metric | Target |
|---|---|
| Online orders / week | 250 |
| Average order value | ₪ 180 |
| Online revenue / month | ₪ 195,000 |
| Repeat-customer rate (90 days) | ≥ 35 % |
| Cart-to-paid conversion | ≥ 4.5 % (mobile), ≥ 7 % (desktop) |
| Site → WhatsApp leak rate | ≤ 15 % of intents (down from 100 %) |
| Holiday spike capacity (חנוכה / פסח / ראש השנה) | 10× baseline without ops failure |

### Strategic outcomes
1. **Decouple revenue from foot traffic.** Bakery should sell on Tuesday in Tel Aviv, not just to whoever walked into the shuk.
2. **Capture the holiday windows.** Hanukkah and Pesach concentrate >30 % of yearly demand. Pre-order pipeline must open 14 days in advance with capped daily slots.
3. **Build a customer list the bakery owns.** Phone numbers, opt-in marketing, segmented by behavior. Not on Meta/Instagram alone.
4. **Protect the brand.** Every digital surface has to look like the bakery, not like a Shopify template.

### Non-goals
- Becoming a multi-brand marketplace.
- International shipping in Year 1.
- Becoming a recipe / blog / content site.
- Becoming an app (web is enough until proven otherwise).

---

## 5. User Experience Goals

### Primary personas
1. **The Loyal Jerusalemite.** Knows the bakery. Wants to skip the line on Friday morning. Mobile, Hebrew, hurried.
2. **The Returning Tourist.** Visited the שוק once, dreams about the rugelach. Wants to ship to friends, or pre-order before landing.
3. **The Office Manager.** Books trays for meetings. Wants invoices, scheduled delivery, repeat orders, no surprises.
4. **The Holiday Shopper.** Once a year, pre-orders 40 סופגניות for the office חנוכה party. Wants confirmation, slot, certainty.

### Core UX principles
- **Hebrew first, always.** Never auto-detect English unless the user picks it.
- **Mobile is the product.** Desktop is a courtesy. ~75 % of sessions will be mobile.
- **One thumb, one hand.** Every primary action sits in the bottom 60 % of a phone screen.
- **No surprise loads.** Skeletons, not spinners. Optimistic UI on cart actions.
- **Trust shown, not claimed.** Real photos, real reviews, real kashrut, real address. Never lorem-ipsum, never placeholder.
- **Speed is content.** A page that takes 4 s to load is broken, regardless of what's on it.
- **Respect for Shabbat.** No transactional emails / SMS sent between candle-lighting Friday and motzaei Shabbat. Hard-coded.

### Cardinal sins
- A user lands on a holiday page that doesn't exist (currently happens 3 / 5 holiday menu items).
- A user clicks "buy" and is dropped into WhatsApp without context.
- A user sees a fake review.
- A user sees an English string in the Hebrew flow.
- A user sees a price change between cart and checkout.

---

## 6. Technical Architecture

### Today (as-built)
```
Browser (React SPA on Vite)
  ├── React Router 7 (BrowserRouter, no SSR)
  ├── CartContext (localStorage, marzipanCart key)
  ├── react-helmet-async (per-page <SEO>)
  ├── Schema.org JSON-LD (Bakery, ItemList)
  ├── EmailJS (contact form → owner inbox)
  ├── GA4 (initGA from VITE_GA_ID, plus a stale snippet in index.html — REMOVE)
  └── Static product data (src/data/productsData.js)
        │
        └── No backend. Cart → wa.me redirect with a templated WhatsApp message.
```

### Target (Phase 2 onward)
```
Browser
  ├── Next.js 15 (App Router, RSC, ISR for product pages)        # Phase 3 migration
  ├── TypeScript end-to-end                                      # Phase 2
  ├── TanStack Query (data fetching, optimistic mutations)
  ├── Zustand (UI ephemeral state) + Context for cart
  └── i18next (he default, en, ar)                               # Phase 4

Edge / API
  ├── Vercel Edge runtime for SSR + ISR
  ├── Cloudflare Images (variants, AVIF/WebP, signed URLs)
  └── Supabase Edge Functions for: order intake, OTP, webhooks

Backend (Supabase)
  ├── Postgres
  │     ├── products            (id, slug, name_he, name_en, category_id, price_value, unit, kashrut, allergens, is_active, ...)
  │     ├── categories
  │     ├── branches            (id, name, address, geo, hours_json, is_active)
  │     ├── customers           (phone E.164, name, marketing_opt_in)
  │     ├── orders              (id, customer_id, branch_id, status, channel, total, paid_at, fulfilled_at)
  │     ├── order_items         (order_id, product_id, qty, unit_price, line_total)
  │     ├── slots               (date, branch_id, capacity, taken)        # holiday pre-order
  │     ├── oven_signals        (branch_id, product_id, ready_at, quantity)  # live "out of oven"
  │     └── audit_log
  ├── Auth: phone OTP (Supabase Auth)
  ├── Storage: product images (originals + Cloudflare-derived variants)
  └── RLS: customers see own orders only; admin role bypasses

Payments
  ├── Cardcom (preferred for IL) OR Tranzila
  ├── Apple Pay / Google Pay / Bit
  └── Webhook → Supabase → order status, receipt email/SMS

Comms
  ├── Inforu / Smoove (Hebrew SMS)
  ├── EmailJS deprecated; replaced with Resend or Postmark
  └── WhatsApp Business API (Phase 4) for order updates

Observability
  ├── Sentry (frontend + edge)
  ├── Vercel Analytics (web vitals)
  ├── GA4 (marketing only)
  └── Logflare or BetterStack (Supabase logs)
```

### Migration path
- Phase 2 ships **inside the existing Vite SPA** (no Next yet). Cart context becomes Supabase-aware; payments wire up; admin is a separate route gated by RLS.
- Phase 3 migrates the marketing surfaces (`/`, `/about`, `/branches`, `/holidays/*`) to Next.js App Router for SSR + ISR + true SEO. SPA shell becomes the authenticated app surface (catalog/cart/checkout/account) until it too moves.
- Phase 4 unifies under Next.js.

### Hard architectural rules
- **No business logic in components.** Components render. Logic lives in `lib/`, hooks, or server.
- **No data imports inside components beyond what they render.** Pages compose; sections receive props or fetch.
- **One source of truth per domain.** Products live in DB (or `productsData.ts` until Phase 2). Never duplicated across files (`Products.jsx` and `ProductsPage.jsx` currently both define category lists — this is debt).
- **All money is integer agorot in code, formatted at render.** No floats, no `priceDisplay` strings stored in DB.
- **All times are UTC in DB, Asia/Jerusalem at render.**
- **All phone numbers are stored E.164.**

---

## 7. Frontend Standards

### Language & types
- **TypeScript strict** from Phase 2 forward. New files in `.tsx`. Convert legacy in passes, no big-bang.
- `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes` on.

### Component rules
- One component per file. Filename matches default export.
- Folder pattern: `Components/<Feature>/<Feature>.tsx` + sibling tests + sibling styles if any.
- Props: typed, documented if non-obvious, never `any`.
- A component over **200 lines** is a smell — split it.
- A component with **>5 `useState` hooks** is a smell — extract a hook or reducer.
- No `useEffect` for derived state. Compute during render or `useMemo`.
- No `setState` during render (today's `CheckoutModal.jsx` violates this — fix in Sprint 1).
- No mounting-on-mount data fetches in components — use TanStack Query.

### State
- **Server state** → TanStack Query.
- **URL state** → React Router params/search params.
- **Global UI state** → Zustand store (`useCart`, `useCheckout`).
- **Local UI state** → `useState` / `useReducer`.
- LocalStorage is allowed for: cart pre-auth, theme. Anything else needs justification.

### Styling
- Tailwind only. No CSS modules, no styled-components.
- All brand colors via tokens (`bg-brand-red`), never `bg-[#B91C1C]`. Arbitrary values are a code-review reject.
- No inline styles except for dynamic values that can't be expressed in classes.
- Animations: prefer `@keyframes` in `index.css` with named utilities. No more than 2 simultaneous animations per viewport.

### Performance
- **Route-level `React.lazy` + `<Suspense>`** for every page. Mandatory.
- Images: WebP/AVIF, explicit `width`/`height`, `loading="lazy"` except hero, `decoding="async"`, responsive `srcset`.
- No image > 250 KB shipped to client. Originals can be larger; CDN must transform.
- Bundle budget: initial JS ≤ 180 KB gzipped; per-route chunk ≤ 60 KB gzipped.
- LCP ≤ 2.0 s, CLS ≤ 0.05, INP ≤ 200 ms on 4G mobile.

### Accessibility
- WCAG 2.1 AA. Always.
- Visible focus on every interactive element. `focus:outline-none` is forbidden unless replaced with a `focus-visible` ring.
- Color contrast: text ≥ 4.5:1. Brand gold (`#D4AF37`) **fails** AA on white — never use it for body text.
- Every form input has a `<label>`. Every button has a name (text or `aria-label`).
- Keyboard-traversable from logo to footer with a clear order. Test before merging UI changes.

### Testing
- Vitest + Testing Library for components, hooks, utilities.
- Playwright for: cart flow, checkout flow, login, admin order update.
- Coverage gate: 70 % for `lib/` and `hooks/`. Components are not coverage-gated; they get visual + e2e.

### Linting & formatting
- ESLint flat config (already present). Add `@typescript-eslint`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`.
- Prettier with project config. Format-on-save mandatory.
- No commits with lint errors.

---

## 8. Backend Standards

(Effective from Phase 2.)

### Database
- Postgres via Supabase. All tables have `id` (uuid v7 or bigserial), `created_at`, `updated_at`.
- Soft-delete via `deleted_at` timestamp where data is auditable; hard-delete for ephemeral.
- Foreign keys enforced. No "soft" relationships.
- All money columns are `bigint` agorot (₪0.01 precision). Currency column not needed (ILS only) until international.
- All timestamps `timestamptz`. Never `timestamp`.

### Row-Level Security (RLS)
- **On for every table.** No exceptions.
- Customers: read own rows only. Cannot read other customers' orders, addresses, or phone numbers.
- Admin role: read/write all. Granted via `auth.jwt() ->> 'role' = 'admin'`.
- Service role used only inside Edge Functions, never exposed.

### API surface
- No REST controllers hand-written. Use Supabase auto-generated APIs + RLS for read paths.
- Mutations that need orchestration (place order, refund, cancel, mark out-of-stock) go through **Edge Functions** with idempotency keys.
- Webhooks (PSP, SMS) are signed; signature is verified before any DB write.

### Validation
- Server-side validation with Zod on every Edge Function input. Same Zod schema reused on the client (`packages/shared`).
- Phone numbers normalized to E.164 on entry; rejected if invalid.

### Errors & observability
- Every Edge Function logs `request_id`, `customer_id`, `order_id`, `duration_ms`.
- Every error has a stable `error_code` for the client to translate.
- Sentry captures with PII scrubbed (phone, name, address tagged as PII).

### Background jobs
- Slot capacity recalculation, holiday window opens/closes, daily order summary email to bakery owner: cron via Supabase scheduled functions.

---

## 9. Design System Rules

### Color tokens
| Token | Hex | Use |
|---|---|---|
| `--brand-red` | `#B91C1C` | Primary CTA, brand accents, key headlines |
| `--brand-red-deep` | `#380909` | Footer, dark surfaces, high-contrast bg |
| `--brand-gold` | `#D4AF37` | Decorative accents only — never body text on light bg |
| `--brand-gold-soft` | `#F9A825` | Gradients with `--brand-gold`, badges |
| `--ink` | `#2D211E` | Primary text on light bg |
| `--ink-soft` | `#5D4037` | Secondary text |
| `--cream` | `#FDFBF7` | Page background |
| `--bone` | `#FAFAFA` | Section background variant |
| `--success` | `#15803D` | Confirmation states |
| `--error` | `#B91C1C` | Same as brand red — but reserved semantically; never on a CTA |
| `--whatsapp` | `#25D366` | WhatsApp CTA only |

The `#FFA000` gold currently in `Reviews.jsx` is **wrong** — replace with `--brand-gold`.

### Typography
- **Heebo** for everything Hebrew-first. Weights: 400, 500, 700, 900.
- **Inter** for English (Phase 4).
- Display: 900 weight, tight tracking, line-height 1.05.
- Body: 400 weight, 1.6 line-height.
- No serif fallbacks. No system serif. No "playful" display fonts.

### Spacing
- 4 px base. Scale: `4 8 12 16 24 32 48 64 96 128`.
- Section vertical rhythm: 96 px desktop, 64 px mobile.
- Card padding: 24 px (compact), 32 px (default), 48 px (hero).

### Radius
- `8px` (inputs), `16px` (cards), `24px` (panels), `9999px` (pills, badges, avatars).
- No mixing `rounded-3xl` and `rounded-[2.5rem]` and `rounded-[3rem]` in the same composition (currently happens).

### Shadow
- Three levels: `shadow-sm`, `shadow-md`, `shadow-lg`. No more.
- Custom multi-layer shadows are forbidden in components — they live as utilities (`shadow-card`, `shadow-card-hover`).

### Motion
- Durations: 150 / 250 / 400 ms. No animation > 600 ms unless it's a hero loop.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for incoming, `ease-in` for outgoing.
- `prefers-reduced-motion` honored — drop transforms, keep opacity.

### Imagery
- Hero: real photos, shot on location, warm tone, slightly desaturated yellow channel. No HDR.
- Product: square 1:1, white-paper or natural-wood backdrop, top-down or 3/4. Consistent across catalog.
- Lifestyle: founders, hands, ovens, market crowd. People over product on lifestyle blocks.
- Forbidden: stock food photography, AI-generated food, food on pure-black backgrounds, plastic-wrapped product shots.

### Iconography
- Lucide only. No `react-icons`. Strokes 1.5–2 px. Consistent sizing per zone.

### Decoration ("magical background")
- Centralized in **one** component, used **once** at the layout level.
- Density: ≤ 6 floating elements per viewport.
- No animation that runs forever in the user's peripheral vision while they read.

---

## 10. SEO Domination Plan

### Target queries (Hebrew, ranked by intent strength)
**Branded transactional:**
- מאפיית מרציפן · מרציפן שוק · מרציפן ירושלים · רוגלך מרציפן

**Generic transactional:**
- רוגלך ירושלים · רוגלך שוק מחנה יהודה · עוגות שמרים ירושלים · סופגניות חנוכה ירושלים · עוגות גבינה שבועות · משלוח מאפים ירושלים

**Informational:**
- איפה הרוגלך הכי טוב בירושלים · מה לאכול בשוק מחנה יהודה · איך מכינים רוגלך שוקולד

**Holiday windows (open 30 days before, peak 7 days before):**
- סופגניות חנוכה · עוגות גבינה שבועות · עוגות דבש ראש השנה · עוגיות פורים · קמח לפסח / מאפים לפסח

### On-page
- One H1 per page, with the target keyword in Hebrew, never stuffed.
- Per-product page: title, meta, OG image, JSON-LD `Product` with `Offer`, `priceCurrency: "ILS"`, `availability`, `aggregateRating` once we have real reviews.
- Per-category page: JSON-LD `ItemList` (already done) + `BreadcrumbList`.
- FAQ section: JSON-LD `FAQPage` (currently missing — quick win).
- Branches: JSON-LD `LocalBusiness` per branch (today only the global Bakery is emitted).

### Technical SEO
- Canonical URLs everywhere.
- `sitemap.xml` regenerated on build, includes every product and category. Today it's static and stale (`lastmod 2024-01-04`).
- `robots.txt` allows all, disallows `/admin`, `/api`. Today already correct.
- `hreflang` once English/Arabic launch.
- Move marketing pages to **SSR/ISR** in Phase 3 — SPA-only is leaving ranking on the table.

### Content
- Blog under `/blog` (Phase 4) with weekly Hebrew content: holiday recipes, market history, behind-the-counter stories. 1,000–1,500 words, real photos, internal-linked to product pages.
- Founders' interview / press mentions on `/about`. Real Israeli media has covered the bakery — surface it.

### Off-page
- Google Business Profile: claim, verify, populate per branch. Push photos weekly.
- Backlinks: Israeli food bloggers, ירושלמים-list articles, kashrut directories, tourism boards.
- Pinterest as a long-tail traffic source (food vertical responds well).
- Wikipedia mention: if not already there, draft a Hebrew article — bakery is notable enough.

### Targets
| Metric | 90 days | 6 months | 12 months |
|---|---|---|---|
| Organic sessions / month | 8 k | 25 k | 60 k |
| Branded query share of total | 70 % | 50 % | 35 % |
| Position 1 for `מאפיית מרציפן` | yes | yes | yes |
| Position 1–3 for "רוגלך ירושלים" | — | yes | yes |

---

## 11. Conversion Optimization Plan

### Funnel map
```
Visit → Catalog view → Product card click → Add to cart → Open cart → Checkout start → Pay → Confirmation
        85 %           45 %                  18 %          12 %        7 %               4.5 %
```

### Conversion levers (priority-ordered)

1. **Real on-site checkout.** Single biggest lift. WhatsApp-only is bleeding ~70 % of intent.
2. **Live "out of the oven" badge.** Manufactured urgency, but real — based on actual oven schedule. Lifts add-to-cart on hot items.
3. **Real reviews.** Pull Google reviews via API; replace fictional testimonials. Lifts trust on first visit (esp. tourists).
4. **Bundles.** "Shabbat box ₪149" (challah + rugelach + babka). One-click add. Lifts AOV.
5. **Holiday pre-order with countdown.** "סופגניות חנוכה — איסוף ב-7.12, נותרו 24 חבילות". Slot scarcity + fixed pickup time. Lifts conversion in window.
6. **Phone-OTP login → saved cart + saved address.** Removes the second-visit friction.
7. **Bit / Apple Pay / Google Pay.** Israeli mobile expects these. Friction killer.
8. **Free pickup, ₪25 delivery within Jerusalem, ₪40 outside.** State it everywhere — pricing transparency lifts conversion by removing the "what does it cost" hesitation.
9. **Stock states.** "אזל היום — חוזר מחר 7:00". Better than disappearing.
10. **Pickup time ETA on each branch.** "מוכן בעוד 25 דקות". Reduces back-and-forth.

### A/B tests (post-paid-checkout)
- Hero CTA copy: *"להזמין"* vs *"להוסיף לסל"* vs *"להזמין לאיסוף"*.
- Product card with vs without price-per-kilo.
- Checkout in modal vs full page on mobile.
- Payment method order: Bit-first vs card-first.

### Tooling
- GA4 events: `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`. (Today: only `add_to_cart` and a custom `whatsapp_checkout_click` are wired.)
- Meta CAPI for paid retargeting.
- Microsoft Clarity for heatmaps + session replay (free, no PII concerns with masking on).

---

## 12. Current State Snapshot

### What works
- Marketing site renders cleanly: `/`, `/products`, `/about`, `/branches`, `/contact`, `/holidays/hanukkah`, `/holidays/shavuot`, `/accessibility`, `/terms`, 404.
- Catalog with category filter + Hebrew partial-keyword search.
- Cart with localStorage persistence, quantity controls, clear-cart confirmation.
- WhatsApp checkout that builds a formatted Hebrew message.
- Contact form via EmailJS with Israeli phone validation + honeypot.
- Per-page SEO via `react-helmet-async`.
- Schema.org `Bakery` + per-page `ItemList` JSON-LD.
- ErrorBoundary, ScrollToTop, ScrollToTopButton.
- Branch live "open now" status (1-minute interval).
- Decent RTL handling, Heebo font, mobile menu, mobile cart drawer.

### What is broken or fake
- 3 of 5 holiday menu links 404 (`rosh-hashanah`, `passover`, `purim`).
- 404 page CTA links to `/products/yeastCakes` — also 404.
- GA placeholder `G-XXXXXXXXXX` in `index.html` running alongside a real `initGA()`.
- `og-image.jpg` referenced but not in `public/`.
- Reviews are fictional.
- `CONTACT_INFO.phone = "02-1234567"` is a placeholder.
- `SOCIAL_LINKS.twitter` is generic.
- `googleMapsLink` values are `goo.gl/maps/exampleN` placeholders.
- Address mismatch: schema `Agripas 40` vs copy `אגריפס 44`.
- `sitemap.xml` `lastmod` is 2024-01-04.
- `puppeteer` in production `dependencies`.
- Dead code: `ProductGallery.jsx`, `Product.jsx`.
- Hardcoded design tokens, multiple "magical backgrounds" stacked.
- `setState` during render in `CheckoutModal.jsx`.
- Newsletter checkbox in contact form does nothing.
- ErrorBoundary leaks stack trace in production.
- Unreferenced custom animations: `animate-pan-slow`, `animate-spin-slow`.

(Full forensic in `PROJECT_AUDIT.md`.)

### Audit scores (today)
Design 8 · Code Quality 6 · Performance 5 · Scalability 4 · UX 6.5 · Business Readiness 4 · **Overall 5.8 / 10**.

---

## 13. Known Problems

Authoritative list. Each has a category, severity, and the phase it belongs to.

| # | Category | Severity | Problem | Phase |
|---|---|---|---|---|
| 1 | Bug | P0 | Holiday dropdown links to 3 non-existent routes | 1 |
| 2 | Bug | P0 | GA placeholder `G-XXXXXXXXXX` in `index.html` running with real `initGA()` | 1 |
| 3 | Bug | P0 | `setState` during render in `CheckoutModal.jsx` | 1 |
| 4 | Bug | P0 | 404 page CTA goes to a 404 route | 1 |
| 5 | Trust | P0 | Fictional reviews on homepage | 1 |
| 6 | Data | P0 | Placeholder phone, Twitter, Google Maps links in `siteContent.js` | 1 |
| 7 | Data | P0 | Address mismatch between schema and copy | 1 |
| 8 | Asset | P0 | Missing `og-image.jpg` referenced in `index.html` and SEO defaults | 1 |
| 9 | Build | P0 | `puppeteer` in production `dependencies` | 1 |
| 10 | Cleanup | P0 | Dead code: `ProductGallery.jsx`, `Product.jsx` | 1 |
| 11 | SEO | P1 | Stale `sitemap.xml` (lastmod 2024-01-04) and missing per-product entries | 1 |
| 12 | UX | P1 | ErrorBoundary leaks stack trace in production | 1 |
| 13 | UX | P1 | Newsletter checkbox does nothing | 1 |
| 14 | Perf | P1 | No route-level lazy loading | 2 |
| 15 | Perf | P1 | 18 MB of unoptimized assets in `src/assets` | 2 |
| 16 | Design | P1 | Hardcoded color hex everywhere; tokens unused | 2 |
| 17 | Design | P1 | `MagicalBackground` rendered globally AND inside ~10 sections | 2 |
| 18 | Code | P1 | `Contact.jsx` 427 lines; `Navbar.jsx` 241; needs split | 2 |
| 19 | Code | P1 | Categories list duplicated between `Products.jsx` and `ProductsPage.jsx` | 2 |
| 20 | Data | P1 | Generic blurb on every `ProductCard`; no real per-product description | 2 |
| 21 | SEO | P1 | Missing FAQ, Breadcrumb, per-branch LocalBusiness schema | 2 |
| 22 | A11y | P1 | `focus:outline-none` without replacement on multiple buttons | 2 |
| 23 | A11y | P2 | `#D4AF37` on white used as text — fails AA contrast | 2 |
| 24 | Arch | P2 | No TypeScript | 2 |
| 25 | Arch | P2 | No backend, payments, admin, customer accounts | 3 |
| 26 | Arch | P2 | No tests, no CI | 2 |
| 27 | Arch | P2 | No Sentry / structured logging | 2 |
| 28 | Marketing | P2 | No Google Business Profile per branch (assumed) | 1 |
| 29 | Legal | P2 | No cookie / privacy banner | 2 |
| 30 | Perf | P2 | Google Maps `<iframe>` on `/branches` is heavy + CLS-prone | 2 |

P0 = launch blocker. P1 = professional baseline. P2 = scale enabler.

---

## 14. Master Roadmap (Phase 1–5)

### Phase 1 — Make it Honest (1–2 weeks)
**Goal:** Site is no longer lying. Every link works, every number is real, every review is real, every CTA leads somewhere.
- Resolve all P0 bugs from §13 (#1–#10).
- Replace fictional reviews with embedded Google Reviews (manual paste of real ones is acceptable for v1).
- Update `sitemap.xml` (#11), regenerate on build later.
- Hide ErrorBoundary internals in production.
- Wire newsletter checkbox to a real list (Sender / Mailchimp), or remove it.
- Verify Google Business Profile per branch.
- Ship.

**Exit criterion:** A senior engineer + a copy editor can each click every link and every CTA and find no broken state, no placeholder, no contradiction.

### Phase 2 — Make it Premium (3–6 weeks)
**Goal:** Code quality + design system + perf at the level the brand deserves.
- Introduce `tailwind.config.js` (or v4 `@theme`) with brand tokens. Refactor inline `bg-[#…]` to tokens.
- Centralize `MagicalBackground` to a single layout-level instance.
- Image pipeline: WebP/AVIF, `srcset`, explicit dims, move heavy assets to `public/` or Cloudflare Images.
- Route-level `React.lazy` + `<Suspense>`.
- `useMemo`-ize products list. Split `Contact.jsx` and `Navbar.jsx`.
- Add per-product `description`, `allergens`, `kashrut`. Surface on cards & pages.
- Add Schema: `BreadcrumbList`, `FAQPage`, per-branch `LocalBusiness`.
- Introduce TypeScript (incremental, file-by-file allowed).
- Set up Vitest + Testing Library + Playwright + GitHub Actions CI.
- Sentry frontend wired.
- Lighthouse mobile ≥ 90 across all pages.

**Exit criterion:** Every audit P1 closed. Lighthouse ≥ 90. Fresh hire can land a PR within their first week.

### Phase 3 — Make it Real (6–10 weeks)
**Goal:** Bakery sells online with payment, no WhatsApp dependency.
- Supabase project; schema; RLS; seed.
- Phone-OTP auth.
- Catalog reads from Supabase via TanStack Query.
- Cart persisted server-side once authed.
- Real checkout: pickup OR delivery, branch picker, time slot, payment via Cardcom (Bit, Apple Pay, Google Pay, card).
- SMS receipts via Inforu/Smoove. Email via Resend.
- Admin route gated by RLS role: products CRUD, hours, mark out-of-stock, today's orders, refund.
- Holiday pre-order: slot capacity, countdown, capped daily quantity.
- Migrate marketing pages (`/`, `/about`, `/branches`, `/holidays/*`) to Next.js App Router for SSR/ISR. Catalog/cart/checkout stay SPA until Phase 4.

**Exit criterion:** A real customer places a real paid order online and the bakery fulfills it without a developer in the loop.

### Phase 4 — Make it Scale (8–12 weeks)
**Goal:** Take serious volume; expand reach.
- Unify under Next.js App Router (catalog/cart/checkout/account migrate too).
- i18n: English + Arabic.
- Subscription product ("Friday box").
- Office invoicing (B2B): named contacts, monthly invoice, net-30.
- "Out of the oven" live signal with a tablet UI for the counter.
- Loyalty: punch-card / store credit.
- Blog under `/blog` for SEO content.
- Meta CAPI + Google Ads conversion tracking.
- Holiday windows automated: open/close on schedule, capacity per branch.
- Customer service inbox unified: email + WhatsApp Business API + SMS.

**Exit criterion:** ≥ 250 online orders/week sustained for 4 consecutive weeks. Holiday spike (Hanukkah) handled without ops failure.

### Phase 5 — Make it a Brand (12+ weeks, ongoing)
**Goal:** Marzipan online is as iconic as Marzipan in person.
- Cinematic homepage hero (real-shot loop).
- Founders' page with archival photos and audio.
- Press / media room.
- Pinterest, Instagram product feed sync.
- Israeli food publications: paid editorial features.
- Tourism partnerships (hotels, tour operators).
- National delivery (cold chain, packaging R&D).
- Possibly: Marzipan-branded merch (tote, cookbook, gift card box).
- Continuous CRO: monthly experiments, monthly review of revenue/AOV/repeat-rate.

**Exit criterion:** Brand recognized nationally beyond Jerusalem. Revenue diversified beyond foot traffic. Bakery has a Plan B if foot traffic ever drops.

---

## 15. Current Active Sprint

> Update at the start of every sprint. One sprint = 1 week unless otherwise noted.

**Sprint:** Phase-1 Sprint 1 — *"Make it Honest"*
**Window:** 2026-04-29 → 2026-05-06
**Sprint goal:** Close every P0 from §13. Site stops lying.

### Committed work
- [ ] Remove placeholder GA snippet from `index.html`. Keep only `initGA()` from `.env`. Verify `VITE_GA_ID` is set in production env.
- [ ] Fix Navbar holiday dropdown — either build stub pages for `rosh-hashanah` / `passover` / `purim` (with "coming soon" + email capture) OR remove the items from `navLinks`. Decide this sprint.
- [ ] Fix `NotFoundPage.jsx` CTA → `/products`.
- [ ] Fix `CheckoutModal.jsx` setState-during-render: initialize default branch in `useState` initializer.
- [ ] Replace `Reviews.jsx` content with 3 real Google reviews (manual paste, attribution). Add note: replace with Google Places API in Phase 2.
- [ ] Update `siteContent.js`: real phone number, real Twitter/X URL or remove the link, real Google Maps share URLs per branch.
- [ ] Reconcile bakery address in copy and schema (`App.jsx` schema and `siteContent.js` `address`).
- [ ] Add `og-image.jpg` to `public/` (1200×630, real photo, no text overlay; filename matches the existing reference).
- [ ] Move `puppeteer` to `devDependencies`. Re-run `npm install`. Verify build still passes.
- [ ] Delete `ProductGallery.jsx` and `Product.jsx`. Verify no imports remain.
- [ ] Update `sitemap.xml` `lastmod` to current date. Add per-route entries we actually have.
- [ ] Hide ErrorBoundary stack trace unless `import.meta.env.DEV`.
- [ ] Decide newsletter: wire to a real list or remove the checkbox + label. Don't ship a fake.

### Out of scope this sprint
- TypeScript migration.
- Backend / payments.
- Image pipeline rework.
- Design tokens refactor.

### Definition of done (this sprint)
- A senior engineer clicks every link in the site without hitting a 404.
- A copy editor reads every visible string and finds no placeholder.
- GA4 real-time view shows current session traffic from a real Measurement ID.
- Google Search Console shows the updated sitemap accepted.
- `npm run build` passes; bundle isn't bigger than last week.

---

## 16. Completed Work Log

> Append-only. Most recent first. One line per shipped item, dated.

- *(2026-04-29)* Initial audit completed → `PROJECT_AUDIT.md`.
- *(2026-04-29)* Operating doc system established → `PROJECT_BRAIN.md`, `DAILY_EXECUTION.md`.
- *(prior)* Marketing SPA built: 10 routes, cart with localStorage, WhatsApp checkout, EmailJS contact form, GA scaffolding, Schema.org, react-helmet-async, ErrorBoundary, ScrollToTop, mobile menu, mobile cart drawer, branch live-status, Hebrew RTL throughout.

---

## 17. Open Decisions

> Decisions to be made and dated. Move to Completed Work Log once shipped.

| # | Decision | Options | Owner | Due |
|---|---|---|---|---|
| 1 | Holiday dropdown — stub pages or remove? | (a) Build "coming soon" stubs for ראש השנה, פסח, פורים with email capture (b) Remove from nav until pages exist | Product | Sprint 1 |
| 2 | Newsletter provider | Sender · Mailchimp · Brevo · Smoove (IL) | Marketing | Sprint 1 |
| 3 | Payment processor | Cardcom · Tranzila · Meshulam · PayPlus | Finance + Eng | Phase 3 kickoff |
| 4 | Hosting | Vercel · Netlify · Cloudflare Pages | Eng | Phase 2 |
| 5 | Backend | Supabase · Firebase · Self-hosted Postgres + custom API | Eng | Phase 3 kickoff |
| 6 | SMS provider | Inforu · Smoove · Twilio | Eng | Phase 3 |
| 7 | CMS for products & holiday pages (Phase 4) | Sanity · Strapi · Supabase Studio · None (admin UI in app) | Product | Phase 4 |
| 8 | Multilingual rollout order | (a) en first, then ar (b) ar first (c) en + ar simultaneously | Product | Phase 4 |
| 9 | Whether to migrate to Next.js or stay on Vite SPA + SSR proxy | Next.js App Router · Remix · Vite + Vike | Eng | Phase 3 |
| 10 | Delivery model | In-house bike fleet · 3rd-party (Wolt / Yango Deli) · Outsourced courier | Operations | Phase 3 |

---

## 18. AI Instructions (How to work on this project)

If you are an AI agent (Claude, GPT, Cursor, Aider, etc.) opening this repo, read this section first.

### Read order
1. `PROJECT_BRAIN.md` (this file) — vision, standards, roadmap.
2. `DAILY_EXECUTION.md` — what we're working on right now.
3. `PROJECT_AUDIT.md` — what's already known about the codebase.
4. `package.json`, `vite.config.js`, `eslint.config.js` — environment.
5. `src/App.jsx` and `src/main.jsx` — entry.
6. The specific feature you're being asked to touch.

### Operating rules
- **The user is the product owner.** Do not invent features. If the user is vague, ask one clarifying question, then proceed with the smallest plausible interpretation.
- **One change, one PR-sized diff.** Don't refactor while fixing a bug. Don't fix a bug while refactoring.
- **Preserve Hebrew copy character-for-character.** RTL is fragile. Never auto-translate.
- **Match the existing component pattern unless explicitly told to refactor.** Don't rename folders. Don't restructure imports.
- **No new dependencies without justification.** Three lines is better than a new package.
- **Tests over claims.** If you say it works, prove it: `npm run build`, click the page, paste the result.
- **Money is integers.** When you touch price logic, never introduce a `parseFloat`.
- **RTL by default.** When you add UI, mirror correctly. Test at 375 px and 1440 px.

### What to never do
- Never delete data files (`siteContent.js`, `productsData.js`, `faqData.js`) without explicit approval.
- Never push to `main` directly — always a branch + a description.
- Never skip pre-commit hooks or `--no-verify`.
- Never add a new icon library, CSS framework, or animation library.
- Never introduce English-first defaults.
- Never write fake reviews, fake testimonials, fake addresses, fake phone numbers — even temporarily.
- Never leave `console.log` in shipped code.
- Never silence an error with a try/catch that swallows it. Surface or re-throw.

### How to ask for changes
When proposing an edit, the response should include:
1. The intent in one sentence.
2. The files touched.
3. The diff or the exact change.
4. The risk and the test that proves it works.
5. Anything left undone or assumed.

### Long-running tasks
If a task spans more than one sprint, update §14 (Master Roadmap) and §15 (Current Active Sprint) before claiming it's "in progress."

---

## 19. Golden Rules

Engraved. Do not violate.

1. **Never lie to a customer.** No fake reviews. No fake stock. No fake ETAs. No bait-and-switch prices.
2. **Hebrew first. Always.**
3. **Mobile is the product.** If it doesn't work on a 375 px iPhone with one thumb, it doesn't work.
4. **The bakery owns the customer list.** Never trap data in a third-party we can't export.
5. **Never block on Shabbat.** No transactional SMS/email between candle-lighting Friday and motzaei Shabbat.
6. **Money is integer agorot.** Never floats.
7. **Real photos, real names, real numbers, real reviews.**
8. **Speed is content.** A page > 4 s is broken.
9. **Accessibility is not optional.** WCAG AA, every release.
10. **Design tokens, not hex codes.**
11. **Tests over claims. Logs over guesses. Diffs over descriptions.**
12. **Never ship a feature whose failure mode is "the bakery owner finds out from a customer."**
13. **Less is the design language.** Every animation, decoration, gradient must justify its frame.
14. **Brand consistency over novelty.** If it wouldn't look right printed on the bakery's paper bag, it doesn't ship.
15. **One source of truth per fact.** Address. Phone. Hours. Price. Anywhere it appears, it pulls from that one place.

---

## 20. Definition of Perfection

The product is "perfect" — the 10/10 the brand deserves — when **all** of the following are simultaneously true:

### Brand
- A first-time visitor describes the site in one word from this list: *warm, real, premium, Jerusalem, classic*. Not from this list: *modern, minimal, sleek, app-y, startup-y, bakery-website-y*.
- The site looks like the שוק at 7 AM. The bakery's paper bag and the homepage share a visual language.

### Product
- A returning customer can place a repeat order in **≤ 30 seconds on mobile**.
- A holiday pre-order opens at a fixed minute, sells out gracefully, and never double-books a slot.
- The bakery owner manages the entire catalog without asking a developer.

### Engineering
- TypeScript strict, RLS on, tests green, CI green, Lighthouse mobile ≥ 95, LCP ≤ 2.0 s, CLS ≤ 0.05, INP ≤ 200 ms.
- Sentry shows < 0.1 % session error rate.
- A new engineer ships their first PR within their first 3 days, without breaking anything.

### Business
- Online-originated revenue ≥ ₪ 195 k/month, sustained for 12 weeks.
- Repeat-customer rate ≥ 35 %.
- Holiday windows handle 10× baseline without manual heroics.
- 70 % of sessions arrive organically (search + direct), not paid.

### Soul
- A customer in Tel Aviv places an order on Thursday night, picks up Friday at 7 AM, and feels the same warmth they would have walking into the שוק.
- A returning tourist in New York ships a holiday box to a friend in Haifa and the experience makes them want to do it again next year.
- The founders' family sees the site and says: *"כן. זה אנחנו."*

That is 10/10. Anything less is a draft.
