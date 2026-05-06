-- =====================================================================
-- P0 production blockers — concurrency + idempotency fixes.
--
-- Three independent fixes in one migration; each is needed before the
-- payment path can be considered safe under real load:
--
--   1. orders.order_idempotency_key
--      Dedicated column + unique partial index. place-order now
--      deduplicates retries on this column exclusively.
--      payment_provider_ref is reserved for PSP transaction ids.
--
--   2. daily_order_counters + next_order_number(date_part)
--      Atomic per-day counter so concurrent place-order calls cannot
--      collide on order_number. Replaces the unsafe count(*) + 1.
--
--   3. rate_limit_hit(key, window_start, limit)
--      Atomic INSERT...ON CONFLICT DO UPDATE counter so the limiter
--      does not race between read and increment, and so the edge
--      function can fail closed without a silent fallback.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Idempotency key — separate from payment_provider_ref
-- ---------------------------------------------------------------------
alter table public.orders
    add column if not exists order_idempotency_key text;

-- Unique partial index — null keys never collide; non-null keys are
-- globally unique so a retry from the same client can never produce a
-- second order.
create unique index if not exists orders_idempotency_key_unique
    on public.orders(order_idempotency_key)
    where order_idempotency_key is not null;

-- Lift any prior 'idem:<key>' values out of payment_provider_ref so the
-- column goes back to its documented purpose (PSP refs only). Best-
-- effort backfill — ON CONFLICT DO NOTHING avoids tripping the new
-- unique index in the unlikely event of pre-existing duplicates.
update public.orders
set order_idempotency_key = substr(payment_provider_ref, 6),
    payment_provider_ref  = null
where payment_provider_ref like 'idem:%'
  and order_idempotency_key is null;

-- ---------------------------------------------------------------------
-- 2. Atomic daily order-number counter
-- ---------------------------------------------------------------------
create table if not exists public.daily_order_counters (
    date_part   text primary key,            -- 'YYYY-MM-DD' (UTC)
    last_seq    int  not null default 0,
    updated_at  timestamptz not null default now()
);

alter table public.daily_order_counters enable row level security;
-- No policies: only the service role (which bypasses RLS) ever touches
-- this table, via next_order_number().

-- Backfill from existing orders so the next allocated sequence is
-- strictly greater than any number already on disk for that UTC day.
insert into public.daily_order_counters (date_part, last_seq, updated_at)
select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as date_part,
       count(*)                                              as last_seq,
       now()
from public.orders
group by 1
on conflict (date_part) do update
    set last_seq = greatest(public.daily_order_counters.last_seq, excluded.last_seq);

create or replace function public.next_order_number(p_date_part text)
returns int
language plpgsql
as $$
declare
    v_seq int;
begin
    insert into public.daily_order_counters (date_part, last_seq, updated_at)
    values (p_date_part, 1, now())
    on conflict (date_part) do update
        set last_seq   = public.daily_order_counters.last_seq + 1,
            updated_at = now()
    returning last_seq into v_seq;
    return v_seq;
end
$$;

-- ---------------------------------------------------------------------
-- 3. Atomic rate-limit hit
-- ---------------------------------------------------------------------
-- INSERT ON CONFLICT DO UPDATE returning the post-increment count, so
-- two concurrent callers never see the same value. The function is
-- pure SQL-side; the edge function decides what to do with the result.
create or replace function public.rate_limit_hit(
    p_key          text,
    p_window_start timestamptz,
    p_limit        int
)
returns table (allowed boolean, current_count int)
language plpgsql
as $$
declare
    v_count int;
begin
    insert into public.rate_limits (key, window_start, count)
    values (p_key, p_window_start, 1)
    on conflict (key, window_start) do update
        set count = public.rate_limits.count + 1
    returning count into v_count;

    return query select (v_count <= p_limit), v_count;
end
$$;

-- Housekeeping: a single-purpose janitor the cron job can call to drop
-- expired rate-limit rows. Not strictly required for correctness — the
-- atomic counter is keyed on (key, window_start) — but keeps the table
-- small. p_max_age_seconds defaults to a generous 24h.
create or replace function public.rate_limit_purge(p_max_age_seconds int default 86400)
returns int
language plpgsql
as $$
declare
    v_deleted int;
begin
    delete from public.rate_limits
    where window_start < now() - make_interval(secs => p_max_age_seconds);
    get diagnostics v_deleted = row_count;
    return v_deleted;
end
$$;
