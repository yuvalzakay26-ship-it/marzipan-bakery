-- Post-deploy schema verification probes.
with checks as (
    select 'P1.products_admin_write_dropped' as name,
        not exists (
            select 1 from pg_policies
            where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_write'
        ) as pass
    union all
    select 'P1.customers_authenticated_update_whitelist',
        (
            select coalesce(string_agg(column_name, ',' order by column_name), '')
            from information_schema.column_privileges
            where grantee = 'authenticated'
              and table_schema = 'public'
              and table_name = 'customers'
              and privilege_type = 'UPDATE'
        ) = 'birthday_md,email,marketing_opt_in,marketing_sms_opt_in,marketing_whatsapp_opt_in,name'
    union all
    select 'P1.customers_recompute_totals_security_definer',
        (select prosecdef from pg_proc where proname = 'customers_recompute_totals' limit 1)
    union all
    select 'P1.customers_increment_points_security_definer',
        (select prosecdef from pg_proc where proname = 'customers_increment_points' limit 1)
    union all
    select 'P1.orders_status_notification_has_exception',
        (select pg_get_functiondef(oid) ilike '%exception when others%' from pg_proc where proname = 'orders_status_notification' limit 1)
    union all
    select 'P0.orders_order_idempotency_key_column',
        exists (
            select 1 from information_schema.columns
            where table_schema = 'public' and table_name = 'orders' and column_name = 'order_idempotency_key'
        )
    union all
    select 'P0.orders_idempotency_key_unique_index',
        exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'orders_idempotency_key_unique')
    union all
    select 'P0.daily_order_counters_table',
        exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'daily_order_counters')
    union all
    select 'P0.next_order_number_function',
        exists (select 1 from pg_proc where proname = 'next_order_number')
    union all
    select 'P0.rate_limit_hit_function',
        exists (select 1 from pg_proc where proname = 'rate_limit_hit')
    union all
    select 'audit_log_table_exists',
        exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'audit_log')
)
select name, pass, case when pass then 'OK' else 'FAIL' end as result
from checks
order by name;
