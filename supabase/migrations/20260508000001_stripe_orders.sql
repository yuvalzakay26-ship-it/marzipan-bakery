-- =====================================================================
-- Stripe-native order persistence.
--
-- These tables are the source of truth for orders that arrive via the
-- Stripe Checkout flow (api/stripe-webhook.js → checkout.session.completed).
--
-- They sit ALONGSIDE the legacy public.orders / public.order_items tables,
-- which were designed for the Cardcom/Tranzila/PayPlus place-order flow
-- (customer_id + branch_id + order_number generation, money in agorot,
-- payment_provider enum without 'stripe'). That schema cannot accept a
-- Stripe-driven row without dropping NOT NULLs and weakening constraints
-- for legacy data, so the Stripe path gets a dedicated, simpler shape.
--
-- Conventions match the rest of the schema:
--   - timestamptz, stored UTC.
--   - Money in the smallest currency unit Stripe gives us (`amount_total`
--     is already in agorot for ILS — no conversion).
--   - RLS enabled. Service role (used by the webhook) bypasses; admin reads.
-- =====================================================================

-- ---------------------------------------------------------------------
-- stripe_orders
-- ---------------------------------------------------------------------
create table public.stripe_orders (
    id                          uuid primary key default gen_random_uuid(),
    created_at                  timestamptz not null default now(),

    -- Stripe identifiers. session_id is the canonical idempotency key —
    -- the UNIQUE constraint is what prevents double-fulfillment on
    -- retried webhook deliveries, even across cold starts.
    stripe_session_id           text not null unique,
    stripe_payment_intent_id    text,

    -- Customer snapshot from Stripe's customer_details. We do NOT FK into
    -- public.customers because Stripe Checkout collects guest details and
    -- we can't always reconcile to an existing record at webhook time.
    -- (TODO: backfill/link to public.customers in a later phase if/when
    -- account creation is wired in.)
    customer_name               text,
    customer_phone              text,
    customer_email              citext,
    -- Stripe Address shape: {line1, line2, city, state, postal_code, country}.
    -- Stored as jsonb (not text) so admin queries can filter by city/postcode
    -- without parsing strings.
    customer_address            jsonb,

    -- Money snapshot. Stripe `amount_total` is already in the smallest
    -- currency unit (agorot for ILS, cents for USD). Do not convert.
    total_amount                bigint not null,
    currency                    text   not null,

    -- payment_status mirrors Stripe's session.payment_status verbatim
    -- ('paid' | 'unpaid' | 'no_payment_required'). Free-form text rather
    -- than an enum so future Stripe values do not break inserts.
    payment_status              text not null,

    -- fulfillment_status is OUR state machine, not Stripe's. Starts at
    -- 'pending' on insert; the eventual fulfillment pipeline transitions
    -- it to 'preparing' / 'ready' / 'fulfilled' / 'cancelled'.
    fulfillment_status          text not null default 'pending',

    -- Full Stripe Checkout Session payload as received (with line_items
    -- expanded). Useful for forensic queries and reprocessing without
    -- another Stripe API call.
    raw_stripe_payload          jsonb,

    constraint stripe_orders_total_non_neg     check (total_amount >= 0),
    constraint stripe_orders_currency_lowercase check (currency = lower(currency)),
    constraint stripe_orders_fulfillment_status check (
        fulfillment_status in ('pending','preparing','ready','fulfilled','cancelled','refunded')
    )
);
create index stripe_orders_created_at_idx
    on public.stripe_orders(created_at desc);
create index stripe_orders_payment_intent_idx
    on public.stripe_orders(stripe_payment_intent_id)
    where stripe_payment_intent_id is not null;
create index stripe_orders_fulfillment_status_idx
    on public.stripe_orders(fulfillment_status);

-- ---------------------------------------------------------------------
-- stripe_order_items
-- ---------------------------------------------------------------------
create table public.stripe_order_items (
    id           uuid primary key default gen_random_uuid(),
    order_id     uuid not null references public.stripe_orders(id) on delete cascade,

    -- Stripe product id (`prod_...`) when present. Nullable because we use
    -- price_data inline products in create-checkout-session.js, which means
    -- Stripe creates an ad-hoc product on the fly that we may not want to
    -- persist long-term. Treat as a hint for analytics, not an FK.
    product_id   text,
    product_name text not null,
    quantity     int not null,
    -- Per-unit price in the smallest currency unit, frozen at purchase.
    unit_price   bigint not null,

    constraint stripe_order_items_qty_positive check (quantity > 0),
    constraint stripe_order_items_unit_non_neg check (unit_price >= 0)
);
create index stripe_order_items_order_idx on public.stripe_order_items(order_id);

-- ---------------------------------------------------------------------
-- stripe_processed_events
--
-- Append-only ledger of webhook deliveries we have handled, keyed by
-- Stripe's event id (`evt_...`). The webhook checks this BEFORE doing
-- any work so retried deliveries return 200 immediately without re-running
-- handlers.
--
-- This is the durable replacement for the in-memory PROCESSED_EVENT_IDS
-- Set that lived in api/stripe-webhook.js. The UNIQUE on
-- stripe_orders.stripe_session_id remains the safety net at the order
-- level — this table is the fast-path early return.
-- ---------------------------------------------------------------------
create table public.stripe_processed_events (
    stripe_event_id text primary key,
    processed_at    timestamptz not null default now(),
    event_type      text,
    -- The session id we associated with this event, when applicable. Lets
    -- ops trace "which event created order X?" without joining on raw payload.
    session_id      text
);
create index stripe_processed_events_processed_at_idx
    on public.stripe_processed_events(processed_at desc);
create index stripe_processed_events_session_id_idx
    on public.stripe_processed_events(session_id)
    where session_id is not null;

-- ---------------------------------------------------------------------
-- create_stripe_order — atomic order + items insert.
--
-- Postgres functions in plpgsql run inside an implicit transaction. If
-- the items insert raises (bad jsonb shape, constraint violation), the
-- order insert above is rolled back too — preventing the "order row
-- exists but has no items" partial-persistence failure mode.
--
-- Returns the new order id, or NULL when the session_id already exists
-- (treat as duplicate; do not retry from the caller).
-- ---------------------------------------------------------------------
create or replace function public.create_stripe_order(
    p_session_id         text,
    p_payment_intent_id  text,
    p_customer_name      text,
    p_customer_phone     text,
    p_customer_email     citext,
    p_customer_address   jsonb,
    p_total_amount       bigint,
    p_currency           text,
    p_payment_status     text,
    p_raw_payload        jsonb,
    -- jsonb array of {product_id, product_name, quantity, unit_price}
    p_items              jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order_id uuid;
begin
    insert into public.stripe_orders (
        stripe_session_id, stripe_payment_intent_id,
        customer_name, customer_phone, customer_email, customer_address,
        total_amount, currency, payment_status, raw_stripe_payload
    ) values (
        p_session_id, p_payment_intent_id,
        p_customer_name, p_customer_phone, p_customer_email, p_customer_address,
        p_total_amount, lower(p_currency), p_payment_status, p_raw_payload
    )
    on conflict (stripe_session_id) do nothing
    returning id into v_order_id;

    -- Conflict path: another delivery has already inserted this session.
    -- Return NULL so the caller knows to skip the items insert and log a
    -- duplicate. The existing order's items stay intact.
    if v_order_id is null then
        return null;
    end if;

    insert into public.stripe_order_items (
        order_id, product_id, product_name, quantity, unit_price
    )
    select
        v_order_id,
        item->>'product_id',
        item->>'product_name',
        (item->>'quantity')::int,
        (item->>'unit_price')::bigint
    from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as item;

    return v_order_id;
end
$$;

-- Lock the function down: only the service role (webhook) may invoke it.
revoke all on function public.create_stripe_order(
    text, text, text, text, citext, jsonb, bigint, text, text, jsonb, jsonb
) from public;
revoke all on function public.create_stripe_order(
    text, text, text, text, citext, jsonb, bigint, text, text, jsonb, jsonb
) from anon, authenticated;
grant execute on function public.create_stripe_order(
    text, text, text, text, citext, jsonb, bigint, text, text, jsonb, jsonb
) to service_role;

-- ---------------------------------------------------------------------
-- RLS — service role bypasses; admin reads; nobody else gets in.
-- ---------------------------------------------------------------------
alter table public.stripe_orders            enable row level security;
alter table public.stripe_order_items       enable row level security;
alter table public.stripe_processed_events  enable row level security;

create policy stripe_orders_admin_read
    on public.stripe_orders for select
    using (public.is_staff_or_admin());

create policy stripe_order_items_admin_read
    on public.stripe_order_items for select
    using (public.is_staff_or_admin());

create policy stripe_processed_events_admin_read
    on public.stripe_processed_events for select
    using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies for non-service roles. Writes are
-- exclusively performed by api/stripe-webhook.js via the service role,
-- which bypasses RLS by design.

-- =====================================================================
-- TODO — follow-up phases (each one its own migration / PR):
--
--   * fulfillment-pipeline:
--       admin UI (or background worker) transitions fulfillment_status
--       through preparing → ready → fulfilled. Likely needs a
--       fulfillment_events audit table + index on (fulfillment_status,
--       created_at) for the "today's queue" admin view.
--
--   * admin-notifications:
--       Slack/email/SMS to the bakery on stripe_orders insert. Probably a
--       database trigger calling a Supabase Edge Function via pg_net, or
--       a cron sweep over rows where notified_at is null.
--
--   * receipt-generation:
--       PDF + customer email. Stripe also emits its own receipts; decide
--       whether to suppress those or supplement with a branded version.
--
--   * inventory-management:
--       Decrement public.products stock on insert (transactional with the
--       order insert). Until that lands, we cannot prevent overselling on
--       limited-stock items.
--
--   * legacy-orders bridge:
--       Decide whether the place-order Edge Function flow stays alive or
--       is retired. If retired, write a migration that copies any
--       useful historical rows out of public.orders before dropping it.
-- =====================================================================
