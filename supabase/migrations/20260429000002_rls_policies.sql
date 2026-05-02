-- =====================================================================
-- Row-Level Security policies.
--
-- Rule of thumb:
--   - Public, anonymous reads:   categories, products, branches, bundles
--                                (only rows where is_active and not deleted).
--   - Customer self-service:     own customer row, own orders, own order_items.
--   - Staff/admin:               full read; admin gets full write via
--                                Edge Functions (anon/auth roles never write
--                                to orders directly — they call place-order).
--   - Service role bypasses RLS by default.
-- =====================================================================

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.branches       enable row level security;
alter table public.bundles        enable row level security;
alter table public.bundle_items   enable row level security;
alter table public.customers      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.promotions     enable row level security;
alter table public.audit_log      enable row level security;
alter table public.rate_limits    enable row level security;

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create policy categories_public_read
    on public.categories for select
    using (deleted_at is null and is_active = true);

create policy categories_admin_read_all
    on public.categories for select
    using (public.is_staff_or_admin());

create policy categories_admin_write
    on public.categories for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create policy products_public_read
    on public.products for select
    using (deleted_at is null and is_active = true);

create policy products_admin_read_all
    on public.products for select
    using (public.is_staff_or_admin());

create policy products_admin_write
    on public.products for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------
create policy branches_public_read
    on public.branches for select
    using (deleted_at is null and is_active = true);

create policy branches_admin_write
    on public.branches for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- bundles + bundle_items
-- ---------------------------------------------------------------------
create policy bundles_public_read
    on public.bundles for select
    using (
        deleted_at is null
        and is_active = true
        and (available_from is null or available_from <= now())
        and (available_until is null or available_until >= now())
    );

create policy bundles_admin_write
    on public.bundles for all
    using (public.is_admin())
    with check (public.is_admin());

create policy bundle_items_public_read
    on public.bundle_items for select
    using (
        exists (
            select 1 from public.bundles b
            where b.id = bundle_items.bundle_id
              and b.deleted_at is null
              and b.is_active = true
        )
    );

create policy bundle_items_admin_write
    on public.bundle_items for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- customers
--
-- - Anon cannot read customer rows. Edge Functions use the service role.
-- - An authenticated customer can read AND update their own row only.
-- - Staff/admin can read all; admin can write all.
-- ---------------------------------------------------------------------
create policy customers_self_read
    on public.customers for select
    using (auth_user_id = auth.uid());

create policy customers_self_update
    on public.customers for update
    using (auth_user_id = auth.uid())
    with check (auth_user_id = auth.uid());

create policy customers_staff_read
    on public.customers for select
    using (public.is_staff_or_admin());

create policy customers_admin_write
    on public.customers for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- orders
--
-- Customers never INSERT directly — the place-order Edge Function does it
-- with the service role. They can SELECT their own rows; they cannot
-- update or delete.
-- ---------------------------------------------------------------------
create policy orders_self_read
    on public.orders for select
    using (customer_id = public.current_customer_id());

create policy orders_staff_read
    on public.orders for select
    using (public.is_staff_or_admin());

create policy orders_admin_write
    on public.orders for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------
create policy order_items_self_read
    on public.order_items for select
    using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and o.customer_id = public.current_customer_id()
        )
    );

create policy order_items_staff_read
    on public.order_items for select
    using (public.is_staff_or_admin());

create policy order_items_admin_write
    on public.order_items for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- promotions
--
-- We do NOT expose promotion definitions publicly (would leak active codes).
-- Validation is performed server-side inside place-order. Staff/admin can read.
-- ---------------------------------------------------------------------
create policy promotions_staff_read
    on public.promotions for select
    using (public.is_staff_or_admin());

create policy promotions_admin_write
    on public.promotions for all
    using (public.is_admin())
    with check (public.is_admin());

-- ---------------------------------------------------------------------
-- audit_log — admin read-only via API; writes happen in Edge Functions
-- under the service role.
-- ---------------------------------------------------------------------
create policy audit_log_admin_read
    on public.audit_log for select
    using (public.is_admin());

-- ---------------------------------------------------------------------
-- rate_limits — admin read-only.
-- ---------------------------------------------------------------------
create policy rate_limits_admin_read
    on public.rate_limits for select
    using (public.is_admin());
