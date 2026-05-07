create temp table _probe2 (probe text, outcome text, detail text);

-- Pick an existing product to use as the RLS target
do $$
declare
    target_id   uuid;
    rows_hit    int;
    err_state   text;
    out_outcome text;
    out_detail  text;
begin
    select id into target_id from public.products where deleted_at is null limit 1;
    if target_id is null then
        insert into _probe2 values ('A.products_authenticated_update', 'SKIPPED', 'no products in table');
        return;
    end if;

    set local role authenticated;
    perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    begin
        with upd as (
            update public.products set sort_order = sort_order where id = target_id returning 1
        )
        select count(*) into rows_hit from upd;
        out_outcome := case when rows_hit = 0 then 'BLOCKED_BY_RLS' else 'BYPASSED_RLS' end;
        out_detail  := format('rows_updated=%s target=%s', rows_hit, target_id);
    exception when others then
        get stacked diagnostics err_state = returned_sqlstate;
        out_outcome := 'ERROR';
        out_detail  := format('sqlstate=%s', err_state);
    end;
    reset role;
    insert into _probe2 values ('A.products_authenticated_update', out_outcome, out_detail);
end $$;

-- Same test with a real customer row for column-grant verification
do $$
declare
    target_id   uuid;
    err_state   text;
    out_outcome text;
    out_detail  text;
begin
    select id into target_id from public.customers limit 1;
    if target_id is null then
        insert into _probe2 values ('B.customers_loyalty_points_update', 'SKIPPED', 'no customers');
        return;
    end if;

    set local role authenticated;
    begin
        update public.customers set loyalty_points = loyalty_points where id = target_id;
        out_outcome := 'BYPASSED_GRANT';
        out_detail  := 'planner accepted update on loyalty_points (FAIL)';
    exception when others then
        get stacked diagnostics err_state = returned_sqlstate;
        out_outcome := 'BLOCKED_BY_GRANT';
        out_detail  := format('sqlstate=%s', err_state);
    end;
    reset role;
    insert into _probe2 values ('B.customers_loyalty_points_update', out_outcome, out_detail);
end $$;

select * from _probe2 order by probe;
