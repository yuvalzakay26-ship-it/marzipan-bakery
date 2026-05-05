-- =====================================================================
-- Populate products.legacy_id so the cart (which carries integer ids
-- from src/data/productsData.js) can resolve to UUID product rows.
--
-- The place-order Edge Function (supabase/functions/place-order) joins
-- on legacy_id when an item is submitted with `legacyId`. Until this
-- migration runs every cart item returns `product_unavailable` because
-- legacy_id is uniformly NULL in the seed.
--
-- Matching strategy: slug, not name_he.
--   - slug has a UNIQUE constraint (products_slug_key) → guaranteed 1:1.
--   - name_he is NOT unique. The Hanukkah seed uses suffixed names
--     ('פיסטוק חנוכה') that the frontend does not — and the unsuffixed
--     'פיסטוק' name collides with the donut row. Slug avoids the
--     collision (e.g. 'pistachio' vs 'pistachio-hanukkah').
--
-- Special cases:
--   - Frontend id 202 ('שוקולד חמה' at ₪120) has no seeded row. The
--     existing 'שוקולד חמה' row is the new variant at ₪65 → maps to
--     id 205. We INSERT a separate row for 202 so the legacy cart can
--     still place an order for the older variant.
--
-- The unique constraint on legacy_id is already declared in the
-- initial schema (`legacy_id int unique`) — no ALTER needed.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Bread
-- ---------------------------------------------------------------------
update public.products set legacy_id =   1 where slug = 'baguette-challah';
update public.products set legacy_id =   2 where slug = 'breads';

-- ---------------------------------------------------------------------
-- Donuts
-- ---------------------------------------------------------------------
update public.products set legacy_id =  10 where slug = 'alfajores';
update public.products set legacy_id =  11 where slug = 'cheese-crumb';
update public.products set legacy_id =  12 where slug = 'chocolate-crackers';
update public.products set legacy_id =  13 where slug = 'donut-edition';
update public.products set legacy_id =  14 where slug = 'ferrero';
update public.products set legacy_id =  15 where slug = 'kipul';
update public.products set legacy_id =  16 where slug = 'dulce-de-leche-cheese';
update public.products set legacy_id =  17 where slug = 'napoleon-cream';
update public.products set legacy_id =  18 where slug = 'oreo';
update public.products set legacy_id =  19 where slug = 'pistachio';
update public.products set legacy_id =  20 where slug = 'strawberry';
update public.products set legacy_id =  21 where slug = 'sweet-cream';

-- ---------------------------------------------------------------------
-- Fridge cakes
-- ---------------------------------------------------------------------
update public.products set legacy_id =  30 where slug = 'alfajores-cream';
update public.products set legacy_id =  31 where slug = 'cheese-berries';
update public.products set legacy_id =  32 where slug = 'kinder';
update public.products set legacy_id =  33 where slug = 'mozart';
update public.products set legacy_id =  34 where slug = 'pistachio-cream';
update public.products set legacy_id =  35 where slug = 'magnum';
update public.products set legacy_id =  36 where slug = 'bee-sting';
update public.products set legacy_id =  37 where slug = 'tiramisu';

-- ---------------------------------------------------------------------
-- Tarts
-- ---------------------------------------------------------------------
update public.products set legacy_id =  40 where slug = 'brownie-tart';
update public.products set legacy_id =  41 where slug = 'lemon-tart';
update public.products set legacy_id =  42 where slug = 'pistachio-tart';

-- ---------------------------------------------------------------------
-- Sweet dairy pastries (croissants)
-- ---------------------------------------------------------------------
update public.products set legacy_id = 101 where slug = 'croissant-milk-chocolate';
update public.products set legacy_id = 102 where slug = 'croissant-pistachio';
update public.products set legacy_id = 103 where slug = 'croissant-ferrero';
update public.products set legacy_id = 104 where slug = 'croissant-white-chocolate-pistachio';
update public.products set legacy_id = 105 where slug = 'croissant-box';
update public.products set legacy_id = 111 where slug = 'croissant-butter';

-- ---------------------------------------------------------------------
-- Rugelach
-- ---------------------------------------------------------------------
update public.products set legacy_id = 106 where slug = 'rugelach-parve';
update public.products set legacy_id = 107 where slug = 'rugelach-pistachio-white-chocolate';
update public.products set legacy_id = 108 where slug = 'rugelach-ferrero';
update public.products set legacy_id = 109 where slug = 'rugelach-milk-chocolate';
update public.products set legacy_id = 110 where slug = 'rugelach-mix';

-- ---------------------------------------------------------------------
-- Round parve cakes
-- ---------------------------------------------------------------------
update public.products set legacy_id = 201 where slug = 'nougat-mousse';
update public.products set legacy_id = 203 where slug = 'black-forest';
update public.products set legacy_id = 204 where slug = 'toffee';
update public.products set legacy_id = 205 where slug = 'hot-chocolate';     -- ₪65 variant
update public.products set legacy_id = 206 where slug = 'cake-mix';

-- Frontend id 202: 'שוקולד חמה' at ₪120 (legacy roundParveCakes category).
-- Not in the seed; insert a sibling row so the legacy cart can resolve it.
insert into public.products
    (slug, category_id, name_he, price_agorot, unit, image_url, legacy_id)
values
    (
        'hot-chocolate-classic',
        (select id from public.categories where slug = 'round-parve-cakes'),
        'שוקולד חמה',
        12000,
        'piece',
        '/images/round-parve-cakes/202.jpg',
        202
    )
on conflict (slug) do update set legacy_id = excluded.legacy_id;

-- ---------------------------------------------------------------------
-- Babka cakes
-- ---------------------------------------------------------------------
update public.products set legacy_id = 301 where slug = 'poppy-babka';
update public.products set legacy_id = 302 where slug = 'chocolate-babka';

-- ---------------------------------------------------------------------
-- Hard cookies
-- ---------------------------------------------------------------------
update public.products set legacy_id = 401 where slug = 'biscotti';
update public.products set legacy_id = 402 where slug = 'palmier-sugar-free';

-- ---------------------------------------------------------------------
-- Hanukkah collection
-- Frontend names ('פיסטוק', 'אוראו', ...) collide with donut name_he,
-- so we MUST match by slug here.
-- ---------------------------------------------------------------------
update public.products set legacy_id = 501 where slug = 'classic-strawberry';
update public.products set legacy_id = 502 where slug = 'ferrero-rocher';
update public.products set legacy_id = 503 where slug = 'pistachio-hanukkah';
update public.products set legacy_id = 504 where slug = 'alfajores-hanukkah';
update public.products set legacy_id = 505 where slug = 'oreo-hanukkah';
update public.products set legacy_id = 506 where slug = 'chocolate-crackers-hanukkah';
update public.products set legacy_id = 507 where slug = 'cheese-crumb-hanukkah';
update public.products set legacy_id = 508 where slug = 'dulce-de-leche-cheese-hanukkah';
update public.products set legacy_id = 509 where slug = 'napoleon-cream-hanukkah';
update public.products set legacy_id = 510 where slug = 'sweet-cream-hanukkah';
update public.products set legacy_id = 511 where slug = 'chocolate-fold';
update public.products set legacy_id = 512 where slug = 'donut-edition-hanukkah';

-- ---------------------------------------------------------------------
-- Validation — abort the transaction if anything is unmapped.
-- ---------------------------------------------------------------------
do $$
declare
    null_count int;
    unmapped_slugs text;
begin
    select count(*) into null_count
    from public.products
    where legacy_id is null
      and deleted_at is null;

    if null_count > 0 then
        select string_agg(slug, ', ') into unmapped_slugs
        from public.products
        where legacy_id is null
          and deleted_at is null;
        raise exception
            'legacy_id seeding incomplete: % product(s) still NULL (%). Resolve manually before committing.',
            null_count, unmapped_slugs;
    end if;
end
$$;

commit;
