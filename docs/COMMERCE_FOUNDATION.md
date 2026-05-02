# Commerce Foundation — Implementation Guide

> Companion to `PROJECT_BRAIN.md` §6, §8, §14 (Phase 3).
> Status: foundation scaffolded; real PSP wiring + product seeding pending.
> Last updated: 2026-04-29.

This document is the operating manual for the Phase 3 commerce stack. It maps
every file the foundation introduced, the order to bring them online, and the
exact handoff points where the implementation needs to be filled in.

---

## 1. What was added (folder map)

```
supabase/
├── config.toml                                 # Supabase project config + Twilio SMS template
├── migrations/
│   ├── 20260429000001_initial_schema.sql       # tables, enums, triggers, helpers
│   ├── 20260429000002_rls_policies.sql         # RLS for every table
│   └── 20260429000003_seed_reference_data.sql  # categories + 2 branches
├── seed/
│   └── products.sql                            # template for product seeding
└── functions/
    ├── _shared/
    │   ├── cors.ts                             # origin allowlist
    │   ├── rate-limit.ts                       # rate_limits-table window
    │   └── phone.ts                            # IL → E.164 normalization
    ├── place-order/index.ts                    # core checkout function
    ├── payment-webhook/index.ts                # PSP callback (skeleton)
    └── request-otp/index.ts                    # phone-OTP send (rate limited)

src/
├── lib/
│   ├── supabase/
│   │   ├── client.js                           # lazy, env-flagged
│   │   └── schema.js                           # Zod + Hebrew error messages
│   ├── commerce/
│   │   ├── pricing.js                          # agorot helpers
│   │   └── orders.js                           # placeOrder(): backend-or-WA fallback
│   ├── customer/
│   │   ├── session.js                          # OTP login + remembered phone
│   │   └── orderHistory.js                     # listMyOrders, reorder
│   ├── admin/
│   │   ├── auth.js                             # admin sign-in + role guard
│   │   └── products.js                         # CRUD wrappers (price, sold-out, active)
│   └── payments/
│       ├── provider.js                         # adapter selector
│       ├── cardcom.js                          # adapter (skeleton)
│       ├── tranzila.js                         # adapter (skeleton)
│       └── payplus.js                          # adapter (skeleton)
├── Components/
│   ├── Checkout/
│   │   └── OrderConfirmation.jsx               # /order/confirmation
│   ├── Account/
│   │   └── AccountPage.jsx                     # /account (OTP + history)
│   └── Admin/
│       ├── ProtectedRoute.jsx                  # role-gated wrapper
│       ├── AdminLogin.jsx                      # /admin/login
│       ├── AdminLayout.jsx                     # /admin shell
│       ├── AdminDashboard.jsx                  # /admin
│       ├── AdminProducts.jsx                   # /admin/products
│       ├── AdminOrders.jsx                     # /admin/orders
│       └── AdminBundles.jsx                    # /admin/bundles
└── App.jsx                                     # routes wired (lazy)

.env.example                                    # adds VITE_SUPABASE_*, VITE_PAYMENT_PROVIDER
package.json                                    # adds @supabase/supabase-js, zod
```

## 2. Files changed (no behavior break)

| File | Change | Risk |
|---|---|---|
| `src/App.jsx` | Lazy imports for new routes; new `<Route>` entries; `<Suspense>` wrapper. | None — existing pages render synchronously via direct imports. |
| `src/Components/Cart/CheckoutModal.jsx` | Calls `placeOrder()` instead of building the `wa.me` URL inline. | When `VITE_SUPABASE_URL` is unset, behavior is byte-identical to before — the WhatsApp message is built and opened. |
| `package.json` | Adds `@supabase/supabase-js`, `zod`. | No transitive impact on existing routes. Run `npm install`. |
| `.env.example` | Adds Supabase + payment-provider vars. | None. |

Nothing else in the existing code is touched.

## 3. Database schema — at a glance

| Table | Purpose | Notes |
|---|---|---|
| `categories` | Catalog taxonomy. | Public-readable when active. |
| `products` | Catalog rows. Money in `price_agorot` (bigint). | `legacy_id` bridges the JS catalog. |
| `bundles` + `bundle_items` | Composed offers ("Shabbat box ₪149"). | Time-windowed via `available_*`. |
| `branches` | Pickup/delivery locations + hours JSON. | Same shape `siteContent.js` already uses. |
| `customers` | Phone-keyed identity. Optional `auth_user_id` link when OTP-authed. | Phone is unique; one customer ↔ one phone. |
| `orders` | Snapshot at submit time. `order_number` is human-readable. | Money fields: `subtotal/discount/delivery_fee/total` agorot. |
| `order_items` | Line-level snapshot. Names + unit prices frozen. | Not joined to live products for historical orders. |
| `promotions` | Codes (percent / amount / bundle / free-shipping). | Validation server-side only. |
| `audit_log` | Append-only sensitive-action log. | Written by Edge Functions; admin read. |
| `rate_limits` | Sliding-window counters. | Internal — admin read only. |

**Money:** every column is `bigint` agorot (`100 = ₪1.00`). No floats anywhere.
**Phones:** stored E.164 (`+972...`). The `place-order` function normalizes IL local formats automatically.
**Times:** `timestamptz`; rendered in `Asia/Jerusalem` at the UI boundary.

## 4. Security model

- **RLS on every table** (see `20260429000002_rls_policies.sql`).
- **Public anon role** can read only active rows of `products`, `categories`, `branches`, `bundles`, `bundle_items`. Cannot read customers, orders, promotions, or audit logs.
- **Authenticated customers** read their own `customers` row + their own `orders` + `order_items`. Cannot read other customers. Cannot insert/update orders directly.
- **Staff/admin** read everything. Admin writes everything (price changes, status transitions). Roles are stored in `auth.users.raw_app_meta_data.role` so `auth.jwt() -> 'app_metadata' ->> 'role'` is the source of truth (`is_admin()` / `is_staff_or_admin()` helpers).
- **Service role** is used only inside Edge Functions (`SUPABASE_SERVICE_ROLE_KEY` server secret).
- **Validation:** every Edge-Function input runs through Zod (`PlaceOrderSchema` etc.). The same schema lives in `src/lib/supabase/schema.js` for client-side instant feedback.
- **Rate limits:**
  - `place-order:<phone>` → 5 / 5 min.
  - `otp:<phone>` → 3 / 10 min.
  - `otp:ip:<ip>` → 10 / 10 min.
- **Idempotency:** `place-order` accepts `x-idempotency-key`; the same key returns the same order rather than creating a duplicate.
- **Audit:** `order.placed`, `order.refund`, `payment.webhook_received`, `product.price_change` all write to `audit_log`. Admin UI surface for this lands in Phase 3.5.

## 5. Implementation steps

The site keeps working at every step because the backend activates only when env vars are set.

### Step 1 — Install
```bash
npm install
npm install --save-dev supabase
```

### Step 2 — Create the Supabase project
1. Create project at https://app.supabase.com (region: `eu-west-2` or `eu-central-1`).
2. Copy the `URL` and `anon` key into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Link the local config:
   ```bash
   npx supabase link --project-ref <project-ref>
   ```
4. Push migrations:
   ```bash
   npx supabase db push
   ```
   This applies all three `migrations/*.sql` in order.

### Step 3 — Seed the catalog
Two paths.

**A. One-off script (recommended):** write `scripts/seed-from-legacy.mjs` that reads `src/data/productsData.js`, maps each product into an `INSERT` statement (filling `legacy_id`), and runs it via `psql` or the Supabase JS service-role client. Template at the bottom of `supabase/seed/products.sql`.

**B. Manual:** open the Supabase SQL editor and paste copies of the example block in `seed/products.sql` for each product.

After seeding, `/admin/products` will show every row.

### Step 4 — Bootstrap the first admin
Supabase doesn't expose role assignment in the UI yet. Run from the SQL editor:
```sql
-- 1. Create a user (or invite by email from the Auth page).
-- 2. Promote to admin:
update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
 where email = 'owner@marzipan.co.il';
```
Then sign in at `/admin/login`.

### Step 5 — Deploy the Edge Functions
```bash
npx supabase functions deploy place-order
npx supabase functions deploy request-otp
npx supabase functions deploy payment-webhook
```
Set the function secrets:
```bash
npx supabase secrets set ALLOWED_ORIGINS=https://marzipanbakery.com,http://localhost:5173
```
For SMS-OTP: configure Twilio credentials in the Supabase Auth settings (Dashboard → Authentication → Phone). The included `config.toml` reserves the right keys.

### Step 6 — First real order
1. With Supabase env vars set, run `npm run dev`.
2. Add a product to the cart, open the cart, hit "סיום הזמנה".
3. The `place-order` Edge Function returns `{ orderNumber, orderId }`.
4. The browser navigates to `/order/confirmation?orderId=...`.
5. The order appears in `/admin/orders`.
6. Admin advances status: `pending → confirmed → preparing → ready → fulfilled`.

### Step 7 — Wire payments (Phase 3.5)
1. Pick a provider (Cardcom is the default in `.env.example`).
2. Implement `supabase/functions/create-payment-session/index.ts` — it should call the PSP's hosted-checkout API with `amount=total_agorot/100`, `orderRef=orderId`, and our success/failure URLs, then return `{ redirectUrl, sessionId }`.
3. Fill in `supabase/functions/payment-webhook/index.ts`:
   - `verifySignature` per provider (HMAC for Tranzila/PayPlus, terminal+token for Cardcom).
   - `parseProviderEvent` → returns `{ orderId, status, providerRef, amountAgorot }`.
4. After `place-order` returns, the UI redirects to the PSP's hosted page (already shaped by the `provider.js` adapter).
5. PSP webhook updates `orders.payment_status = 'captured'` and `orders.status = 'confirmed'`.

Until step 7 is complete, orders are placed but unpaid — exactly the same trust model as the WhatsApp flow. The admin still calls to confirm, and the site is no worse off than today.

### Step 8 — Cut over the catalog
Replace `productsData.js` reads with a TanStack Query hook against `products`. Keep `legacy_id` as a backstop so existing carts in `localStorage` rehydrate correctly. Remove `productsData.js` once analytics show no traffic on legacy IDs for 30 days.

## 6. Migration safety

| Concern | Mitigation |
|---|---|
| Existing site goes down | All new code is additive. With env unset, `placeOrder()` short-circuits to WhatsApp. |
| Old localStorage carts break | `CartContext` rehydrates from `productsData.js` regardless. New `supabaseId` field is optional. |
| Half-migrated catalog | `legacy_id` lets us run JS catalog and DB catalog side-by-side until parity. |
| Hebrew RTL in admin | All admin pages render under `dir="rtl"` and use Heebo. |
| WhatsApp regression | `CheckoutModal` still opens `wa.me` URL when backend disabled — message format unchanged. |

## 7. Outstanding work (post-foundation)

- [ ] `create-payment-session` Edge Function (PSP-specific).
- [ ] PSP webhook signature + parsing for chosen provider.
- [ ] Receipt SMS via Inforu/Twilio after `payment.captured`.
- [ ] Receipt email via Resend after `payment.captured`.
- [ ] Holiday pre-order slot system (`slots` table) — schema TODO when capacity rules are decided.
- [ ] Admin: holiday window open/close, hours overrides, refund button.
- [ ] Catalog read-from-Supabase via TanStack Query.
- [ ] Phone-OTP linking on checkout (one tap to attach orphaned guest orders to a returning customer).
- [ ] Vitest + Playwright suites for cart → checkout → admin happy path.

## 8. Where to look when something breaks

| Symptom | Look at |
|---|---|
| "Backend not configured" everywhere | `.env.local` missing `VITE_SUPABASE_*` vars. |
| 401 on admin pages | `app_metadata.role` not set on the auth user (re-run the SQL in §Bootstrap). |
| Order placed but status stays `pending` | Payment webhook not wired or signature invalid. Check `supabase functions logs payment-webhook`. |
| 429 on place-order | Rate limit (`rate_limits` table). The window is 5 / 5 min / phone. |
| Hebrew shows as boxes in OTP SMS | Twilio sender unverified for IL. Check Auth → Phone. |
| Customer can read another customer's order | Means RLS is off. Verify `alter table ... enable row level security` ran. |
