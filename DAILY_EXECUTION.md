# DAILY EXECUTION

> Working file. Update at the start and end of every work session.
> Source of truth for *what is happening today*. Strategy lives in `PROJECT_BRAIN.md`.

**Today:** 2026-04-29 · **Sprint:** Phase-1 / Sprint 1 — *Make it Honest* · **Sprint window:** 2026-04-29 → 2026-05-06

---

## Today's Focus (max 3)

1. **Ship the GA fix.** Remove placeholder `G-XXXXXXXXXX` snippet from `index.html`. Verify `VITE_GA_ID` is set. Confirm GA4 real-time picks up a session.
2. **Kill the broken holiday links.** Decide stub-pages vs. remove (Open Decision #1 in `PROJECT_BRAIN.md`). Implement the chosen path.
3. **Replace fictional reviews.** Pull 3 real Google reviews into `Reviews.jsx` with author + date. Note in code comment: replace with Google Places API in Phase 2.

If today gets compressed: do #1 and #3 only. #2 is OK to slide one day.

---

## This Week's Priorities (Sprint commitments)

P0 — must close this week:
- [ ] Remove placeholder GA snippet from `index.html`
- [ ] Fix Navbar holiday dropdown (decide + implement)
- [ ] Fix `NotFoundPage.jsx` CTA → `/products`
- [ ] Fix `CheckoutModal.jsx` setState-during-render
- [ ] Replace fictional reviews with real Google reviews
- [ ] Real phone, real Twitter/X (or remove), real Google Maps URLs in `siteContent.js`
- [ ] Reconcile address: schema in `App.jsx` vs `siteContent.js` (`Agripas 40` vs `אגריפס 44`)
- [ ] Add `og-image.jpg` (1200×630) to `public/`
- [ ] Move `puppeteer` to `devDependencies`, reinstall, verify build
- [ ] Delete `ProductGallery.jsx` and `Product.jsx`, verify no imports
- [ ] Refresh `sitemap.xml` `lastmod` + entries
- [ ] Hide ErrorBoundary stack trace unless `import.meta.env.DEV`
- [ ] Newsletter checkbox: wire to a real list OR remove (decide first — Open Decision #2)

Out of scope this week:
- TypeScript migration · backend · payments · image pipeline · design tokens refactor

---

## Daily Checklist (run every working day)

Start of day:
- [ ] Pull latest. `npm install` if `package.json` changed.
- [ ] `npm run dev` — site loads, no console errors.
- [ ] Open this file. Pick today's 1–3 focus items.
- [ ] Glance at `PROJECT_BRAIN.md` §15 (active sprint) — am I on it?

During work:
- [ ] One change → one commit → one tested outcome.
- [ ] No `console.log` left behind.
- [ ] Mobile (375 px) check before claiming "done."
- [ ] Hebrew RTL not broken.

End of day:
- [ ] Move closed items to `PROJECT_BRAIN.md` §16 (Completed Work Log).
- [ ] Update **Today's Focus** for tomorrow.
- [ ] Note any blockers below.
- [ ] Commit and push if changes are stable.

---

## Quick Verification Steps

After any change, before claiming done:

1. **Build:** `npm run build` — must pass clean.
2. **Lint:** `npm run lint` — zero errors.
3. **Manual click-through:** `/`, `/products`, `/about`, `/branches`, `/contact`, `/holidays/hanukkah`, `/holidays/shavuot`, `/accessibility`, `/terms`, deliberately a bad URL → 404.
4. **Cart smoke:** add 2 items → open cart → change qty → remove → clear → close. Persist a refresh.
5. **Checkout smoke:** open `CheckoutModal` → verify default branch loads → submit with required fields → verify WhatsApp URL is encoded correctly (don't actually send unless intended).
6. **Mobile:** 375 px viewport. Nav opens, cart drawer opens, no horizontal scroll, no clipped CTAs.

---

## Blockers

> Anything that's stopping forward motion. Empty is a feature.

- *(none right now)*

---

## Decisions Pending Today

- **Holiday dropdown** (Open Decision #1) — stub pages or remove? Need Product to call this before end of day, otherwise default to **remove from nav** and revisit when content is ready.
- **Newsletter provider** (Open Decision #2) — pick or remove the checkbox today. Default if no choice: **remove the checkbox**.

---

## End-of-Day Snapshot

> Fill at end of each working session. Overwrite tomorrow.

- **Shipped today:** —
- **In progress, not shipped:** —
- **Tomorrow's first move:** —
- **Anything the next person should know:** —
