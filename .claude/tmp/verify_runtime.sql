create temp table _probe_result (probe text, outcome text, sqlstate text);

-- Probe A: authenticated cannot UPDATE products
do $$
declare sqlst text; out_outcome text; out_sqlstate text;
begin
    set local role authenticated;
    begin
        update public.products set is_sold_out = is_sold_out where false;
        out_outcome := 'UNEXPECTED_PASS'; out_sqlstate := null;
    exception when others then
        get stacked diagnostics sqlst = returned_sqlstate;
        out_outcome := 'REJECTED'; out_sqlstate := sqlst;
    end;
    reset role;
    insert into _probe_result values ('A.products_authenticated_update', out_outcome, out_sqlstate);
end $$;

-- Probe B: authenticated cannot UPDATE loyalty_points
do $$
declare sqlst text; out_outcome text; out_sqlstate text;
begin
    set local role authenticated;
    begin
        update public.customers set loyalty_points = loyalty_points where false;
        out_outcome := 'UNEXPECTED_PASS'; out_sqlstate := null;
    exception when others then
        get stacked diagnostics sqlst = returned_sqlstate;
        out_outcome := 'REJECTED'; out_sqlstate := sqlst;
    end;
    reset role;
    insert into _probe_result values ('B.customers_loyalty_points_update', out_outcome, out_sqlstate);
end $$;

-- Probe C: authenticated CAN target a whitelisted column at planner level
do $$
declare sqlst text; out_outcome text; out_sqlstate text;
begin
    set local role authenticated;
    begin
        update public.customers set name = name where false;
        out_outcome := 'GRANT_OK'; out_sqlstate := null;
    exception when others then
        get stacked diagnostics sqlst = returned_sqlstate;
        out_outcome := 'UNEXPECTED_REJECT'; out_sqlstate := sqlst;
    end;
    reset role;
    insert into _probe_result values ('C.customers_name_update', out_outcome, out_sqlstate);
end $$;

select * from _probe_result order by probe;
