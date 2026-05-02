-- =====================================================================
-- Retention + automation layer.
--
-- Adds:
--   - customers       : birthday, loyalty (points, tier, totals), opt-ins,
--                       referral code + referred_by
--   - notifications   : queue table for SMS/WhatsApp messages
--   - loyalty_events  : append-only ledger of point movements
--   - referrals       : referrer ↔ referee with redeemed_at + dual rewards
--   - abandoned_checkouts : carts that started but never placed an order
--   - campaigns       : scheduled marketing sends + their measured results
--   - customer_favorites : top-N most-ordered products per customer
--
-- Conventions follow PROJECT_BRAIN §6/§8: agorot bigints, timestamptz,
-- E.164 phones, RLS on every table, soft-delete via deleted_at where
-- auditable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
    create type public.loyalty_tier as enum ('bronze', 'silver', 'gold', 'legend');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.notification_channel as enum ('sms', 'whatsapp', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.notification_status as enum ('pending', 'sent', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.notification_kind as enum (
        'order_received',
        'payment_approved',
        'ready_for_pickup',
        'pickup_reminder',
        'birthday_reward',
        'milestone_reward',
        'friday_challah',
        'holiday_preorder',
        'comeback_30d',
        'abandoned_checkout',
        'referral_reward',
        'admin_custom'
    );
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.referral_status as enum ('pending', 'redeemed', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.campaign_kind as enum (
        'friday_challah',
        'holiday_preorder',
        'comeback_30d',
        'abandoned_checkout',
        'birthday_sweep',
        'admin_custom'
    );
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.campaign_status as enum ('scheduled', 'running', 'completed', 'paused', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
    create type public.loyalty_event_kind as enum (
        'order_earned',
        'redeem_birthday',
        'redeem_milestone',
        'redeem_promo',
        'admin_adjustment',
        'expire'
    );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- customers — extend with retention fields
-- ---------------------------------------------------------------------
alter table public.customers
    add column if not exists birthday_md          text,                    -- "MM-DD" (no year, privacy-preserving)
    add column if not exists loyalty_points       bigint not null default 0,
    add column if not exists loyalty_tier         public.loyalty_tier not null default 'bronze',
    add column if not exists total_orders         int not null default 0,
    add column if not exists total_spent_agorot   bigint not null default 0,
    add column if not exists marketing_sms_opt_in      boolean not null default false,
    add column if not exists marketing_whatsapp_opt_in boolean not null default false,
    add column if not exists referral_code        text unique,
    add column if not exists referred_by          uuid references public.customers(id) on delete set null,
    add column if not exists last_seen_at         timestamptz;

create index if not exists customers_referral_code_idx on public.customers(referral_code) where referral_code is not null;
create index if not exists customers_tier_idx          on public.customers(loyalty_tier);
create index if not exists customers_last_order_idx    on public.customers(last_order_at);
create index if not exists customers_birthday_idx      on public.customers(birthday_md) where birthday_md is not null;

alter table public.customers
    drop constraint if exists birthday_md_format;
alter table public.customers
    add  constraint birthday_md_format check (birthday_md is null or birthday_md ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$');

-- ---------------------------------------------------------------------
-- Generate a 6-char referral code (uppercase alnum, no easily-confused chars).
-- ---------------------------------------------------------------------
create or replace function public.generate_referral_code()
returns text language plpgsql as $$
declare
    chars  text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no 0/O/I/1/L
    code   text;
    tries  int := 0;
begin
    loop
        code := '';
        for i in 1..6 loop
            code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
        end loop;
        exit when not exists (select 1 from public.customers where referral_code = code);
        tries := tries + 1;
        if tries > 12 then raise exception 'referral_code_collision'; end if;
    end loop;
    return code;
end $$;

-- Auto-assign on customer insert if not provided.
create or replace function public.customers_assign_referral()
returns trigger language plpgsql as $$
begin
    if new.referral_code is null then
        new.referral_code := public.generate_referral_code();
    end if;
    return new;
end $$;

drop trigger if exists customers_referral_code_trigger on public.customers;
create trigger customers_referral_code_trigger
    before insert on public.customers
    for each row execute function public.customers_assign_referral();

-- Backfill any existing customer rows.
update public.customers set referral_code = public.generate_referral_code()
 where referral_code is null;

-- ---------------------------------------------------------------------
-- Maintain customers.total_orders + total_spent_agorot from orders.
-- We only count orders that actually got paid (or a non-web channel that
-- moved past pending — bakery's manual confirm acts as a proxy for paid).
-- ---------------------------------------------------------------------
create or replace function public.customers_recompute_totals(_customer_id uuid)
returns void language sql as $$
    update public.customers c set
        total_orders        = sub.cnt,
        total_spent_agorot  = sub.sum,
        last_order_at       = sub.last_at,
        loyalty_tier        = case
            when sub.cnt >= 30 then 'legend'::public.loyalty_tier
            when sub.cnt >= 15 then 'gold'::public.loyalty_tier
            when sub.cnt >=  5 then 'silver'::public.loyalty_tier
            else 'bronze'::public.loyalty_tier
        end
    from (
        select
            count(*)                                as cnt,
            coalesce(sum(o.total_agorot), 0)        as sum,
            max(o.created_at)                       as last_at
        from public.orders o
        where o.customer_id = _customer_id
          and (o.payment_status = 'captured' or o.channel != 'web')
          and o.status != 'cancelled'
    ) sub
    where c.id = _customer_id;
$$;

create or replace function public.orders_after_change_recompute_customer()
returns trigger language plpgsql as $$
begin
    if tg_op = 'DELETE' then
        perform public.customers_recompute_totals(old.customer_id);
    else
        perform public.customers_recompute_totals(new.customer_id);
    end if;
    return null;
end $$;

drop trigger if exists orders_recompute_customer on public.orders;
create trigger orders_recompute_customer
    after insert or update of payment_status, status, total_agorot or delete
    on public.orders
    for each row execute function public.orders_after_change_recompute_customer();

-- ---------------------------------------------------------------------
-- notifications — outbound message queue
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
    id                 uuid primary key default gen_random_uuid(),
    customer_id        uuid references public.customers(id) on delete set null,
    order_id           uuid references public.orders(id)    on delete set null,
    campaign_id        uuid,                                 -- nullable; FK below
    channel            public.notification_channel not null,
    kind               public.notification_kind    not null,
    -- Recipient is denormalized in case the customer row is removed later.
    to_phone_e164      text not null,
    body               text not null,
    extra              jsonb not null default '{}'::jsonb,
    -- Scheduling / delivery
    scheduled_for      timestamptz not null default now(),
    earliest_send_at   timestamptz,                          -- Shabbat-shifted target
    sent_at            timestamptz,
    status             public.notification_status not null default 'pending',
    failure_reason     text,
    attempts           int not null default 0,
    -- Idempotency: triggers must use a stable key so re-runs are safe.
    idempotency_key    text unique,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now(),
    constraint phone_e164_format check (to_phone_e164 ~ '^\+[1-9][0-9]{6,14}$')
);

create index if not exists notifications_pending_idx
    on public.notifications(scheduled_for)
    where status = 'pending';
create index if not exists notifications_customer_idx on public.notifications(customer_id);
create index if not exists notifications_order_idx    on public.notifications(order_id);
create index if not exists notifications_kind_idx     on public.notifications(kind);

create trigger notifications_set_updated_at before update on public.notifications
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- loyalty_events — append-only ledger
-- ---------------------------------------------------------------------
create table if not exists public.loyalty_events (
    id           bigserial primary key,
    customer_id  uuid not null references public.customers(id) on delete cascade,
    order_id     uuid references public.orders(id) on delete set null,
    kind         public.loyalty_event_kind not null,
    points_delta bigint not null,
    note         text,
    created_at   timestamptz not null default now()
);
create index if not exists loyalty_events_customer_idx on public.loyalty_events(customer_id, created_at desc);
create index if not exists loyalty_events_order_idx    on public.loyalty_events(order_id);

-- ---------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------
create table if not exists public.referrals (
    id                  uuid primary key default gen_random_uuid(),
    referrer_id         uuid not null references public.customers(id) on delete cascade,
    -- The referee may not exist in customers yet at click-time. We capture
    -- the phone first and link the customer once they place a paid order.
    referee_phone_e164  text,
    referee_id          uuid references public.customers(id) on delete set null,
    status              public.referral_status not null default 'pending',
    referee_promo_id    uuid references public.promotions(id) on delete set null,
    referrer_promo_id   uuid references public.promotions(id) on delete set null,
    redeemed_at         timestamptz,
    expires_at          timestamptz,
    created_at          timestamptz not null default now(),
    constraint referrals_phone_e164_format check (
        referee_phone_e164 is null or referee_phone_e164 ~ '^\+[1-9][0-9]{6,14}$'
    )
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
create index if not exists referrals_referee_idx  on public.referrals(referee_id) where referee_id is not null;
create unique index if not exists referrals_referee_phone_pending_uidx
    on public.referrals(referee_phone_e164)
    where status = 'pending' and referee_phone_e164 is not null;

-- ---------------------------------------------------------------------
-- abandoned_checkouts
-- ---------------------------------------------------------------------
create table if not exists public.abandoned_checkouts (
    id              uuid primary key default gen_random_uuid(),
    customer_id     uuid references public.customers(id) on delete set null,
    phone_e164      text,
    name            text,
    items           jsonb not null,                          -- [{id|productId, name, qty, priceAgorot}]
    total_agorot    bigint not null default 0,
    branch_id       uuid references public.branches(id) on delete set null,
    recovered_order_id uuid references public.orders(id) on delete set null,
    notified_at     timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint abandoned_phone_e164_format check (
        phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$'
    )
);
create index if not exists abandoned_phone_idx
    on public.abandoned_checkouts(phone_e164) where phone_e164 is not null;
create index if not exists abandoned_pending_idx
    on public.abandoned_checkouts(created_at)
    where recovered_order_id is null and notified_at is null;

create trigger abandoned_set_updated_at before update on public.abandoned_checkouts
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------
create table if not exists public.campaigns (
    id                 uuid primary key default gen_random_uuid(),
    kind               public.campaign_kind  not null,
    status             public.campaign_status not null default 'scheduled',
    title              text not null,
    body_template      text not null,
    audience_filter    jsonb not null default '{}'::jsonb,
    scheduled_for      timestamptz,
    last_run_at        timestamptz,
    sent_count         int not null default 0,
    converted_count    int not null default 0,
    revenue_agorot     bigint not null default 0,
    created_by         uuid references auth.users(id) on delete set null,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now(),
    deleted_at         timestamptz
);
create index if not exists campaigns_status_idx    on public.campaigns(status);
create index if not exists campaigns_scheduled_idx on public.campaigns(scheduled_for) where status = 'scheduled';

create trigger campaigns_set_updated_at before update on public.campaigns
    for each row execute function public.set_updated_at();

alter table public.notifications
    drop constraint if exists notifications_campaign_fk;
alter table public.notifications
    add  constraint notifications_campaign_fk
         foreign key (campaign_id) references public.campaigns(id) on delete set null;

-- ---------------------------------------------------------------------
-- customer_favorites — refreshed lazily by the loyalty engine
-- ---------------------------------------------------------------------
create table if not exists public.customer_favorites (
    customer_id     uuid not null references public.customers(id) on delete cascade,
    product_id      uuid not null references public.products(id)  on delete cascade,
    times_ordered   int not null default 1,
    last_ordered_at timestamptz not null default now(),
    primary key (customer_id, product_id)
);
create index if not exists customer_favorites_customer_idx
    on public.customer_favorites(customer_id, times_ordered desc);

-- ---------------------------------------------------------------------
-- RLS — every table on; customers self-read where appropriate; admin all.
-- ---------------------------------------------------------------------
alter table public.notifications        enable row level security;
alter table public.loyalty_events       enable row level security;
alter table public.referrals            enable row level security;
alter table public.abandoned_checkouts  enable row level security;
alter table public.campaigns            enable row level security;
alter table public.customer_favorites   enable row level security;

-- notifications: customer can read their own; admin all.
drop policy if exists notifications_self_read on public.notifications;
create policy notifications_self_read
    on public.notifications for select
    using (customer_id = public.current_customer_id());

drop policy if exists notifications_admin_read on public.notifications;
create policy notifications_admin_read
    on public.notifications for select
    using (public.is_staff_or_admin());

drop policy if exists notifications_admin_write on public.notifications;
create policy notifications_admin_write
    on public.notifications for all
    using (public.is_admin())
    with check (public.is_admin());

-- loyalty_events: customer self-read of their ledger; admin all.
drop policy if exists loyalty_events_self_read on public.loyalty_events;
create policy loyalty_events_self_read
    on public.loyalty_events for select
    using (customer_id = public.current_customer_id());

drop policy if exists loyalty_events_admin_read on public.loyalty_events;
create policy loyalty_events_admin_read
    on public.loyalty_events for select
    using (public.is_staff_or_admin());

drop policy if exists loyalty_events_admin_write on public.loyalty_events;
create policy loyalty_events_admin_write
    on public.loyalty_events for all
    using (public.is_admin())
    with check (public.is_admin());

-- referrals: only the referrer (self) reads their own row; admin all.
drop policy if exists referrals_self_read on public.referrals;
create policy referrals_self_read
    on public.referrals for select
    using (referrer_id = public.current_customer_id() or referee_id = public.current_customer_id());

drop policy if exists referrals_admin_write on public.referrals;
create policy referrals_admin_write
    on public.referrals for all
    using (public.is_admin())
    with check (public.is_admin());

-- abandoned_checkouts: admin only.
drop policy if exists abandoned_admin_read on public.abandoned_checkouts;
create policy abandoned_admin_read
    on public.abandoned_checkouts for select
    using (public.is_staff_or_admin());

drop policy if exists abandoned_admin_write on public.abandoned_checkouts;
create policy abandoned_admin_write
    on public.abandoned_checkouts for all
    using (public.is_admin())
    with check (public.is_admin());

-- campaigns: admin only.
drop policy if exists campaigns_admin_read on public.campaigns;
create policy campaigns_admin_read
    on public.campaigns for select
    using (public.is_staff_or_admin());

drop policy if exists campaigns_admin_write on public.campaigns;
create policy campaigns_admin_write
    on public.campaigns for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- DB-level enqueue helper. Called by triggers when an order transitions to
-- a status that warrants a customer notification (ready_for_pickup, etc).
-- This keeps the trigger code small + safe (no provider calls in triggers).
-- ---------------------------------------------------------------------
create or replace function public.enqueue_notification(
    _customer_id uuid,
    _order_id    uuid,
    _channel     public.notification_channel,
    _kind        public.notification_kind,
    _to_phone    text,
    _body        text,
    _scheduled   timestamptz,
    _idem_key    text
) returns void language plpgsql as $$
begin
    insert into public.notifications (
        customer_id, order_id, channel, kind, to_phone_e164,
        body, scheduled_for, earliest_send_at, idempotency_key, status
    ) values (
        _customer_id, _order_id, _channel, _kind, _to_phone,
        _body, _scheduled, _scheduled, _idem_key, 'pending'
    )
    on conflict (idempotency_key) do nothing;
end $$;

-- ---------------------------------------------------------------------
-- Trigger: when an order moves into 'ready' or 'fulfilled', enqueue the
-- right customer-facing message. We render the body inline (no template
-- engine in plpgsql) — close enough to the templates.ts strings to keep
-- voice consistent.
-- ---------------------------------------------------------------------
create or replace function public.orders_status_notification()
returns trigger language plpgsql as $$
declare
    branch_name text;
    cust_phone  text;
    cust_id     uuid;
    fname       text;
begin
    if tg_op = 'UPDATE' and old.status = new.status then
        return new;
    end if;

    select b.name_he into branch_name from public.branches b where b.id = new.branch_id;
    cust_phone := new.contact_phone_e164;
    cust_id    := new.customer_id;
    fname      := split_part(coalesce(new.contact_name, ''), ' ', 1);

    if new.status = 'ready' then
        perform public.enqueue_notification(
            cust_id, new.id, 'sms', 'ready_for_pickup', cust_phone,
            format('מרציפן · ההזמנה %s מוכנה לאיסוף ב%s. נעבור עליה כשתגיעו.',
                   new.order_number, coalesce(branch_name, 'סניף')),
            now(),
            format('ready_for_pickup:%s', new.id)
        );
        -- 30-minute reminder is only useful when the customer chose a slot.
        if new.pickup_at is not null and new.pickup_at > now() + interval '30 minutes' then
            perform public.enqueue_notification(
                cust_id, new.id, 'sms', 'pickup_reminder', cust_phone,
                format('תזכורת · האיסוף שלכם ב%s בעוד 30 דקות. הזמנה %s.',
                       coalesce(branch_name, 'סניף'), new.order_number),
                new.pickup_at - interval '30 minutes',
                format('pickup_reminder:%s', new.id)
            );
        end if;
    end if;

    return new;
end $$;

drop trigger if exists orders_status_notification_trigger on public.orders;
create trigger orders_status_notification_trigger
    after insert or update of status on public.orders
    for each row execute function public.orders_status_notification();

-- ---------------------------------------------------------------------
-- Atomic loyalty-points increment used by awardOrderPoints. Avoids a
-- read-modify-write race when multiple webhook deliveries land concurrently.
-- ---------------------------------------------------------------------
create or replace function public.customers_increment_points(_customer_id uuid, _delta bigint)
returns void language sql as $$
    update public.customers
       set loyalty_points = loyalty_points + _delta
     where id = _customer_id;
$$;

-- ---------------------------------------------------------------------
-- Atomic batch claim for the notifications queue.
-- The send-notifications Edge Function calls this to grab a batch of due
-- pending rows in one shot. UPDATE with a subquery + RETURNING gives us
-- "select-then-claim" without a race window.
-- ---------------------------------------------------------------------
create or replace function public.claim_pending_notifications(_now timestamptz, _limit int)
returns setof public.notifications
language sql as $$
    update public.notifications n
       set attempts = attempts + 1,
           updated_at = now()
     where n.id in (
         select id from public.notifications
          where status = 'pending'
            and earliest_send_at <= _now
            and attempts < 5
          order by scheduled_for asc
          limit _limit
          for update skip locked
     )
    returning *;
$$;

-- customer_favorites: customer self-read; admin all.
drop policy if exists favorites_self_read on public.customer_favorites;
create policy favorites_self_read
    on public.customer_favorites for select
    using (customer_id = public.current_customer_id());

drop policy if exists favorites_admin_write on public.customer_favorites;
create policy favorites_admin_write
    on public.customer_favorites for all
    using (public.is_admin())
    with check (public.is_admin());
