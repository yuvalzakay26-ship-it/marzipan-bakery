-- =====================================================================
-- P1 security hardening.
--
--   1. customers_self_update privilege escalation — column-level grants
--      on `authenticated` so loyalty / referral / accounting fields are
--      immutable from the client even though the existing RLS policy
--      lets the customer touch their own row.
--
--   2. Lock down direct admin product writes — drop the RLS policy that
--      let `authenticated` admins update products from the browser. All
--      writes must now flow through the admin-products Edge Function,
--      which runs under the service role and emits audit_log entries.
--
--   3. Notification trigger error isolation — wrap the order-status
--      notification trigger in EXCEPTION WHEN OTHERS so a notifications
--      insert failure can never roll back the order transaction.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. customers — column-level update grants
--
-- Previously: customers_self_update RLS allowed any column to be set as
-- long as auth_user_id = auth.uid(). A logged-in customer could PATCH
-- their own loyalty_points / loyalty_tier / total_orders / total_spent
-- / referred_by directly from the browser — full privilege escalation
-- on accounting + loyalty state.
--
-- Now: the `authenticated` Postgres role only holds UPDATE on the
-- columns a customer is allowed to self-edit. Postgres rejects writes
-- to any other column before RLS even runs — fail-closed and not
-- bypassable from the client.
--
--   service_role bypasses RLS *and* GRANTs, so place-order, the payment
--   webhook, and the loyalty engine continue to write everything.
--   Admin writes to non-whitelisted columns must now go through an
--   Edge Function under the service role.
-- ---------------------------------------------------------------------
revoke update on table public.customers from authenticated;

grant update (
    name,
    email,
    birthday_md,
    marketing_opt_in,
    marketing_sms_opt_in,
    marketing_whatsapp_opt_in
) on table public.customers to authenticated;

-- The recompute trigger fires on orders changes. When an admin updates
-- an order from the browser, the trigger runs as `authenticated`, which
-- no longer has UPDATE on the loyalty/totals columns. Run the helper as
-- SECURITY DEFINER so the recompute keeps working under any caller.
alter function public.customers_recompute_totals(uuid) security definer;
alter function public.customers_increment_points(uuid, bigint) security definer;

-- ---------------------------------------------------------------------
-- 2. products — drop the direct admin write policy
--
-- Browser-side admin updates bypass our audit trail. Drop the RLS
-- policy so direct UPDATE/INSERT/DELETE on products from any
-- non-service-role caller fails closed; admin product writes flow
-- through the admin-products Edge Function instead, which emits an
-- audit_log row for every change.
--
-- Read policies stay in place: anon sees the public catalog,
-- staff/admin see all rows including drafts.
-- ---------------------------------------------------------------------
drop policy if exists products_admin_write on public.products;

-- ---------------------------------------------------------------------
-- 3. notification trigger — error isolation
--
-- orders_status_notification used to insert directly into notifications
-- with no exception handler, so any failure (constraint violation,
-- missing branch row, transient error) would roll back the entire
-- orders UPDATE transaction. Order lifecycle changes must survive
-- notification failures unconditionally.
-- ---------------------------------------------------------------------
create or replace function public.orders_status_notification()
returns trigger language plpgsql as $$
declare
    branch_name text;
    cust_phone  text;
    cust_id     uuid;
begin
    if tg_op = 'UPDATE' and old.status = new.status then
        return new;
    end if;

    begin
        select b.name_he into branch_name from public.branches b where b.id = new.branch_id;
        cust_phone := new.contact_phone_e164;
        cust_id    := new.customer_id;

        if new.status = 'ready' then
            perform public.enqueue_notification(
                cust_id, new.id, 'sms', 'ready_for_pickup', cust_phone,
                format('מרציפן · ההזמנה %s מוכנה לאיסוף ב%s. נעבור עליה כשתגיעו.',
                       new.order_number, coalesce(branch_name, 'סניף')),
                now(),
                format('ready_for_pickup:%s', new.id)
            );
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
    exception when others then
        -- Notifications are best-effort. Log and continue so the order
        -- transaction commits even if the queue insert blows up.
        raise warning 'orders_status_notification suppressed: % / %', sqlstate, sqlerrm;
    end;

    return new;
end $$;
