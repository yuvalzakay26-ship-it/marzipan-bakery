-- =====================================================================
-- Marzipan Bakery — initial commerce schema (Phase 3 foundation).
--
-- Conventions (PROJECT_BRAIN §6, §8):
--   - All money columns are bigint (agorot, ₪0.01 precision). No floats.
--   - All timestamps are timestamptz. Stored UTC, rendered in Asia/Jerusalem.
--   - All phone numbers stored E.164 (e.g. +972501234567).
--   - All tables have id, created_at, updated_at; soft-delete via deleted_at
--     where data is auditable, hard-delete for ephemeral.
--   - RLS is enabled on every table — see 20260429000002_rls_policies.sql.
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive emails

-- ---------------------------------------------------------------------
-- Updated-at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end
$$;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.product_unit       as enum ('piece', 'kg', '100g', 'tray', 'box');
create type public.order_status       as enum ('pending', 'confirmed', 'preparing', 'ready', 'fulfilled', 'cancelled', 'refunded');
create type public.order_channel      as enum ('web', 'whatsapp', 'admin', 'phone');
create type public.fulfillment_type   as enum ('pickup', 'delivery');
create type public.payment_status     as enum ('unpaid', 'authorized', 'captured', 'refunded', 'failed');
create type public.payment_provider   as enum ('cardcom', 'tranzila', 'payplus', 'manual');
create type public.promotion_kind     as enum ('percent_off', 'amount_off', 'free_shipping', 'bundle_price');
create type public.user_role          as enum ('customer', 'staff', 'admin');

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
    id            uuid primary key default gen_random_uuid(),
    slug          text not null unique,
    name_he       text not null,
    name_en       text,
    sort_order    int  not null default 0,
    is_active     boolean not null default true,
    image_url     text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    deleted_at    timestamptz
);
create index categories_active_idx on public.categories(is_active) where deleted_at is null;
create trigger categories_set_updated_at before update on public.categories
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------
create table public.branches (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    name_he         text not null,
    name_en         text,
    address_he      text not null,
    phone_e164      text not null,
    geo_lat         numeric(10, 7),
    geo_lng         numeric(10, 7),
    -- hours_json shape:
    -- { "0": {"open":"05:00","close":"23:30"}, ..., "6": {"open":null,"close":null} }
    hours_json      jsonb not null,
    is_active       boolean not null default true,
    accepts_pickup  boolean not null default true,
    accepts_delivery boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    deleted_at      timestamptz,
    constraint phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$')
);
create trigger branches_set_updated_at before update on public.branches
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table public.products (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    category_id     uuid not null references public.categories(id) on delete restrict,
    name_he         text not null,
    name_en         text,
    description_he  text,
    description_en  text,
    price_agorot    bigint not null,                                -- 100 = ₪1.00
    unit            public.product_unit not null default 'piece',
    image_url       text,
    image_alt_he    text,
    kashrut         text,                                           -- "בד״ץ העדה החרדית"
    allergens       text[] not null default '{}',                   -- ['gluten','dairy','nuts',...]
    is_dairy        boolean not null default false,
    is_parve        boolean not null default false,
    is_gluten_free  boolean not null default false,
    is_active       boolean not null default true,
    is_sold_out     boolean not null default false,                 -- transient: today only
    sort_order      int not null default 0,
    legacy_id       int unique,                                     -- bridge to productsData.js ids
    metadata        jsonb not null default '{}'::jsonb,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    deleted_at      timestamptz,
    constraint price_non_negative check (price_agorot >= 0)
);
create index products_category_idx   on public.products(category_id) where deleted_at is null;
create index products_active_idx     on public.products(is_active) where deleted_at is null;
create index products_legacy_idx     on public.products(legacy_id) where legacy_id is not null;
create trigger products_set_updated_at before update on public.products
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- bundles  (e.g. "Shabbat box ₪149")
-- ---------------------------------------------------------------------
create table public.bundles (
    id                uuid primary key default gen_random_uuid(),
    slug              text not null unique,
    name_he           text not null,
    name_en           text,
    description_he    text,
    bundle_price_agorot bigint not null,
    image_url         text,
    is_active         boolean not null default true,
    available_from    timestamptz,
    available_until   timestamptz,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    deleted_at        timestamptz,
    constraint bundle_price_non_negative check (bundle_price_agorot >= 0)
);
create trigger bundles_set_updated_at before update on public.bundles
    for each row execute function public.set_updated_at();

create table public.bundle_items (
    id           uuid primary key default gen_random_uuid(),
    bundle_id    uuid not null references public.bundles(id) on delete cascade,
    product_id   uuid not null references public.products(id) on delete restrict,
    quantity     int not null default 1,
    constraint quantity_positive check (quantity > 0)
);
create index bundle_items_bundle_idx on public.bundle_items(bundle_id);

-- ---------------------------------------------------------------------
-- customers (linked 1:1 with auth.users via auth_user_id when authed;
-- guest checkouts allowed with phone-only identity)
-- ---------------------------------------------------------------------
create table public.customers (
    id                  uuid primary key default gen_random_uuid(),
    auth_user_id        uuid unique references auth.users(id) on delete set null,
    phone_e164          text not null unique,
    name                text,
    email               citext,
    marketing_opt_in    boolean not null default false,
    notes               text,                                       -- internal notes (admin only)
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    last_order_at       timestamptz,
    constraint phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$')
);
create index customers_auth_user_idx on public.customers(auth_user_id);
create trigger customers_set_updated_at before update on public.customers
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
create table public.orders (
    id                    uuid primary key default gen_random_uuid(),
    -- Human-readable order number (e.g. "MZ-2026-04-29-001"). Generated by
    -- the place-order Edge Function so we can guarantee monotonic per-day.
    order_number          text not null unique,
    customer_id           uuid not null references public.customers(id) on delete restrict,
    branch_id             uuid not null references public.branches(id) on delete restrict,
    channel               public.order_channel    not null default 'web',
    fulfillment           public.fulfillment_type not null default 'pickup',
    status                public.order_status     not null default 'pending',

    -- Money snapshot — never recompute from current product prices.
    subtotal_agorot       bigint not null,
    discount_agorot       bigint not null default 0,
    delivery_fee_agorot   bigint not null default 0,
    total_agorot          bigint not null,

    -- Customer-supplied details snapshot (so admin sees what they typed).
    contact_name          text not null,
    contact_phone_e164    text not null,
    delivery_address      text,
    pickup_time_text      text,                                     -- free-form ("מחר בבוקר") for v1
    pickup_at             timestamptz,                              -- structured slot when known
    promo_code            text,
    customer_notes        text,
    admin_notes           text,

    -- Payment
    payment_status        public.payment_status   not null default 'unpaid',
    payment_provider      public.payment_provider,
    payment_provider_ref  text,                                     -- PSP transaction id

    -- Lifecycle
    confirmed_at          timestamptz,
    fulfilled_at          timestamptz,
    cancelled_at          timestamptz,
    cancellation_reason   text,

    -- WhatsApp fallback bookkeeping — when channel='whatsapp', this stores
    -- the message URL so admin can re-open the conversation.
    whatsapp_message_url  text,

    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now(),
    constraint subtotal_non_negative      check (subtotal_agorot >= 0),
    constraint total_non_negative         check (total_agorot >= 0),
    constraint discount_non_negative      check (discount_agorot >= 0),
    constraint delivery_fee_non_negative  check (delivery_fee_agorot >= 0),
    constraint phone_e164_format          check (contact_phone_e164 ~ '^\+[1-9][0-9]{6,14}$')
);
create index orders_customer_idx     on public.orders(customer_id);
create index orders_branch_idx       on public.orders(branch_id);
create index orders_status_idx       on public.orders(status);
create index orders_created_at_idx   on public.orders(created_at desc);
create trigger orders_set_updated_at before update on public.orders
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- order_items — line-level snapshot. NEVER joins back to live products
-- for price; price is frozen at purchase time.
-- ---------------------------------------------------------------------
create table public.order_items (
    id                   uuid primary key default gen_random_uuid(),
    order_id             uuid not null references public.orders(id) on delete cascade,
    product_id           uuid references public.products(id) on delete set null,
    bundle_id            uuid references public.bundles(id) on delete set null,
    -- snapshot fields (never trust live data for historical orders)
    name_he_snapshot     text not null,
    unit_snapshot        public.product_unit not null default 'piece',
    quantity             int not null,
    unit_price_agorot    bigint not null,
    line_total_agorot    bigint not null,
    constraint qty_positive       check (quantity > 0),
    constraint unit_price_non_neg check (unit_price_agorot >= 0),
    constraint line_total_non_neg check (line_total_agorot >= 0),
    constraint product_or_bundle  check (
        (product_id is not null and bundle_id is null) or
        (product_id is null and bundle_id is not null)
    )
);
create index order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- promotions
-- ---------------------------------------------------------------------
create table public.promotions (
    id                  uuid primary key default gen_random_uuid(),
    code                text not null unique,
    kind                public.promotion_kind not null,
    -- For percent_off: value 1500 = 15.00% (basis points).
    -- For amount_off / bundle_price: value is agorot.
    value               bigint not null,
    min_subtotal_agorot bigint not null default 0,
    max_uses            int,
    used_count          int not null default 0,
    starts_at           timestamptz,
    ends_at             timestamptz,
    is_active           boolean not null default true,
    notes               text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    constraint value_non_negative check (value >= 0)
);
create trigger promotions_set_updated_at before update on public.promotions
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- audit_log — append-only, written by Edge Functions for sensitive ops
-- (price changes, refunds, role grants).
-- ---------------------------------------------------------------------
create table public.audit_log (
    id           bigserial primary key,
    actor_id     uuid,                                              -- auth.users.id
    actor_role   public.user_role,
    action       text not null,                                     -- 'product.price_change', 'order.refund', ...
    target_type  text not null,                                     -- 'product','order','customer'
    target_id    uuid,
    diff         jsonb,                                             -- {before:{...}, after:{...}}
    request_id   text,
    ip_address   inet,
    created_at   timestamptz not null default now()
);
create index audit_log_target_idx     on public.audit_log(target_type, target_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

-- ---------------------------------------------------------------------
-- rate_limits — token-bucket-ish counter per (key, window). Used by
-- Edge Functions; not exposed to clients via RLS (admin read only).
-- ---------------------------------------------------------------------
create table public.rate_limits (
    key            text not null,
    window_start   timestamptz not null,
    count          int not null default 1,
    primary key (key, window_start)
);
create index rate_limits_window_idx on public.rate_limits(window_start);

-- ---------------------------------------------------------------------
-- Helpers used by RLS policies.
-- ---------------------------------------------------------------------

-- Returns true if the JWT carries the admin role (set on auth.users.raw_app_meta_data).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
    select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
as $$
    select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'), false)
$$;

-- Returns the customer.id linked to the current auth user, if any.
create or replace function public.current_customer_id()
returns uuid
language sql
stable
as $$
    select id from public.customers where auth_user_id = auth.uid() limit 1
$$;
