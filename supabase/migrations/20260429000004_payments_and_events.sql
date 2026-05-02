-- =====================================================================
-- Payments + webhook events.
--
-- Adds:
--   - orders.payment_session_id        (PSP "low-profile" / hosted-checkout id)
--   - orders.payment_authorized_at     (3DS / pre-auth timestamp)
--   - orders.payment_captured_at       (money actually moved)
--   - orders.payment_failure_reason    (last failed-payment human-readable error)
-- New table:
--   - payment_events                   (append-only webhook log, idempotency keyed
--                                       by (provider, provider_event_id))
--
-- Order rule:
--   "Unpaid orders never auto-confirm." Anything that requires online payment
--   must transition pending → confirmed only when payment_status = 'captured'.
--   This is enforced in code (payment-webhook + admin) and asserted at the DB
--   level via a check that bans (status = 'confirmed' AND payment_status = 'unpaid')
--   for web-channel orders. Phone/admin orders are exempt because the bakery
--   often takes payment on pickup for those.
-- =====================================================================

-- ---------------------------------------------------------------------
-- orders: payment columns
-- ---------------------------------------------------------------------
alter table public.orders
    add column if not exists payment_session_id    text,
    add column if not exists payment_authorized_at timestamptz,
    add column if not exists payment_captured_at   timestamptz,
    add column if not exists payment_failure_reason text;

create index if not exists orders_payment_session_idx
    on public.orders(payment_session_id) where payment_session_id is not null;
create index if not exists orders_payment_status_idx
    on public.orders(payment_status);

-- Web-channel orders cannot be 'confirmed' while still 'unpaid'. The bakery
-- never auto-confirms an unpaid web order. Phone/admin/whatsapp channels
-- still allow pay-on-pickup, so they are exempt.
alter table public.orders
    drop constraint if exists web_orders_paid_before_confirmed;
alter table public.orders
    add constraint web_orders_paid_before_confirmed check (
        not (channel = 'web'
             and status in ('confirmed','preparing','ready','fulfilled')
             and payment_status = 'unpaid')
    );

-- ---------------------------------------------------------------------
-- payment_events — append-only webhook log
-- ---------------------------------------------------------------------
create table if not exists public.payment_events (
    id                  bigserial primary key,
    order_id            uuid references public.orders(id) on delete set null,
    provider            public.payment_provider not null,
    -- The PSP's own event id. Cardcom uses LowProfileCode + InternalDealNumber;
    -- Tranzila uses TranzilaTK; PayPlus uses transaction_uid. We store the
    -- canonical "deal number" or equivalent as a string. Combined with provider
    -- this gives us a globally unique key for idempotent replay.
    provider_event_id   text not null,
    kind                text not null,                 -- 'authorized' | 'captured' | 'failed' | 'refunded' | 'pending'
    amount_agorot       bigint,
    signature_ok        boolean not null,
    raw_payload         jsonb not null,
    received_at         timestamptz not null default now(),
    processed_at        timestamptz,
    note                text,
    constraint payment_events_amount_non_neg check (amount_agorot is null or amount_agorot >= 0),
    constraint payment_events_unique_provider_event unique (provider, provider_event_id)
);
create index if not exists payment_events_order_idx       on public.payment_events(order_id);
create index if not exists payment_events_received_at_idx on public.payment_events(received_at desc);

alter table public.payment_events enable row level security;

-- Admin-only read; writes happen exclusively under the service role inside
-- the payment-webhook Edge Function.
create policy payment_events_admin_read
    on public.payment_events for select
    using (public.is_admin());
