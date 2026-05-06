-- =====================================================================
-- Marzipan Bakery — full product catalog seed (NEW SCHEMA).
-- Source of truth: src/data/productsData.js
-- Target: public.products (post-rebuild schema with name_he, price_agorot,
--         category_id FK, legacy_id, etc.).
--
-- Prerequisites:
--   1. Migrations 20260429000001..20260429000004 + 20260430000001 applied
--      (schema + categories seeded by 20260429000003).
--   2. public.products is empty.
--
-- Idempotent: re-running clears and re-inserts. Safe before any orders
-- exist (orders.product_id FK with on delete restrict — once orders are
-- placed, do NOT re-run this file).
--
-- Pricing: price_agorot is integer agorot (1 ₪ = 100 agorot).
-- Image paths: /images/<category>/<legacy_id>.jpg matches the asset
-- layout the static SPA already serves.
-- =====================================================================

begin;

delete from public.products;

insert into public.products
    (slug, category_id, name_he, price_agorot, unit, image_url,
     legacy_id, is_active, sort_order, metadata)
values
    -- ---------------------------------------------------------------------
    -- Bread (legacy_id 1, 2)
    -- ---------------------------------------------------------------------
    ('baguette-challah',                   (select id from public.categories where slug = 'bread'),              'חלות באגט',                       800,  'piece', '/images/bread/1.jpg',                          1, true,  10, '{"tags":["shabbat-staple"]}'::jsonb),
    ('breads',                             (select id from public.categories where slug = 'bread'),              'לחמים',                           1500, 'piece', '/images/bread/2.jpg',                          2, true,  20, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Donuts (legacy_id 10..21)
    -- ---------------------------------------------------------------------
    ('alfajores',                          (select id from public.categories where slug = 'donuts'),             'אלפחורס',                         1000, 'piece', '/images/donuts/10.jpg',                       10, true, 100, '{"tags":[]}'::jsonb),
    ('cheese-crumb',                       (select id from public.categories where slug = 'donuts'),             'פירורי גבינה',                   1000, 'piece', '/images/donuts/11.jpg',                       11, true, 110, '{"tags":[]}'::jsonb),
    ('chocolate-crackers',                 (select id from public.categories where slug = 'donuts'),             'שוקולד קראקרס',                  1000, 'piece', '/images/donuts/12.jpg',                       12, true, 120, '{"tags":[]}'::jsonb),
    ('donut-edition',                      (select id from public.categories where slug = 'donuts'),             'דונאט אדישן',                    1000, 'piece', '/images/donuts/13.jpg',                       13, true, 130, '{"tags":[]}'::jsonb),
    ('ferrero',                            (select id from public.categories where slug = 'donuts'),             'פררו',                            1000, 'piece', '/images/donuts/14.jpg',                       14, true, 140, '{"tags":[]}'::jsonb),
    ('kipul',                              (select id from public.categories where slug = 'donuts'),             'קיפול',                           1000, 'piece', '/images/donuts/15.jpg',                       15, true, 150, '{"tags":[]}'::jsonb),
    ('dulce-de-leche-cheese',              (select id from public.categories where slug = 'donuts'),             'ריבת חלב גבינה',                 1000, 'piece', '/images/donuts/16.jpg',                       16, true, 160, '{"tags":[]}'::jsonb),
    ('napoleon-cream',                     (select id from public.categories where slug = 'donuts'),             'נפוליאון קרם',                   1000, 'piece', '/images/donuts/17.jpg',                       17, true, 170, '{"tags":[]}'::jsonb),
    ('oreo',                               (select id from public.categories where slug = 'donuts'),             'אוראו',                           1000, 'piece', '/images/donuts/18.jpg',                       18, true, 180, '{"tags":[]}'::jsonb),
    ('pistachio',                          (select id from public.categories where slug = 'donuts'),             'פיסטוק',                          1000, 'piece', '/images/donuts/19.jpg',                       19, true, 190, '{"tags":[]}'::jsonb),
    ('strawberry',                         (select id from public.categories where slug = 'donuts'),             'תות',                             1000, 'piece', '/images/donuts/20.jpg',                       20, true, 200, '{"tags":[]}'::jsonb),
    ('sweet-cream',                        (select id from public.categories where slug = 'donuts'),             'שמנת מתוקה',                     1000, 'piece', '/images/donuts/21.jpg',                       21, true, 210, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Fridge cakes (legacy_id 30..37)
    -- ---------------------------------------------------------------------
    ('alfajores-cream',                    (select id from public.categories where slug = 'fridge-cakes'),       'קרם אלפחורס',                    6500, 'piece', '/images/fridge-cakes/30.jpg',                 30, true, 300, '{"tags":[]}'::jsonb),
    ('cheese-berries',                     (select id from public.categories where slug = 'fridge-cakes'),       'גבינה ופירות יער',              6500, 'piece', '/images/fridge-cakes/31.jpg',                 31, true, 310, '{"tags":[]}'::jsonb),
    ('kinder',                             (select id from public.categories where slug = 'fridge-cakes'),       'קינדר',                           6500, 'piece', '/images/fridge-cakes/32.jpg',                 32, true, 320, '{"tags":[]}'::jsonb),
    ('mozart',                             (select id from public.categories where slug = 'fridge-cakes'),       'מוצרט',                           6500, 'piece', '/images/fridge-cakes/33.jpg',                 33, true, 330, '{"tags":[]}'::jsonb),
    ('pistachio-cream',                    (select id from public.categories where slug = 'fridge-cakes'),       'קרם פיסטוק',                     6500, 'piece', '/images/fridge-cakes/34.jpg',                 34, true, 340, '{"tags":[]}'::jsonb),
    ('magnum',                             (select id from public.categories where slug = 'fridge-cakes'),       'מגנום',                           6500, 'piece', '/images/fridge-cakes/35.jpg',                 35, true, 350, '{"tags":[]}'::jsonb),
    ('bee-sting',                          (select id from public.categories where slug = 'fridge-cakes'),       'עקיצה הדבורה',                  6500, 'piece', '/images/fridge-cakes/36.jpg',                 36, true, 360, '{"tags":[]}'::jsonb),
    ('tiramisu',                           (select id from public.categories where slug = 'fridge-cakes'),       'טירמיסו',                         6500, 'piece', '/images/fridge-cakes/37.jpg',                 37, true, 370, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Tarts (legacy_id 40..42)
    -- ---------------------------------------------------------------------
    ('brownie-tart',                       (select id from public.categories where slug = 'tarts'),              'טארט בראוניז',                   3500, 'piece', '/images/tarts/40.jpg',                        40, true, 400, '{"tags":[]}'::jsonb),
    ('lemon-tart',                         (select id from public.categories where slug = 'tarts'),              'טארט לימון',                     3500, 'piece', '/images/tarts/41.jpg',                        41, true, 410, '{"tags":[]}'::jsonb),
    ('pistachio-tart',                     (select id from public.categories where slug = 'tarts'),              'טארט פיסטוק',                    3500, 'piece', '/images/tarts/42.jpg',                        42, true, 420, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Sweet dairy pastries / croissants (legacy_id 101..105, 111)
    -- Frontend ids: 111,101,102,103,104,105 — all priced ₪50/kg.
    -- ---------------------------------------------------------------------
    ('croissant-milk-chocolate',           (select id from public.categories where slug = 'dairy-pastries'),     'קוראסון שוקולד חלבי',          5000, 'kg',    '/images/dairy-pastries/101.jpg',             101, true, 1010, '{"tags":[]}'::jsonb),
    ('croissant-pistachio',                (select id from public.categories where slug = 'dairy-pastries'),     'קוראסון פיסטוק',                5000, 'kg',    '/images/dairy-pastries/102.jpg',             102, true, 1020, '{"tags":[]}'::jsonb),
    ('croissant-ferrero',                  (select id from public.categories where slug = 'dairy-pastries'),     'קוראסון פררו',                  5000, 'kg',    '/images/dairy-pastries/103.jpg',             103, true, 1030, '{"tags":[]}'::jsonb),
    ('croissant-white-chocolate-pistachio',(select id from public.categories where slug = 'dairy-pastries'),     'קוראסון שוקולד לבן ופיסטוק',  5000, 'kg',    '/images/dairy-pastries/104.jpg',             104, true, 1040, '{"tags":[]}'::jsonb),
    ('croissant-box',                      (select id from public.categories where slug = 'dairy-pastries'),     'מארז קוראסונים',                5000, 'kg',    '/images/dairy-pastries/105.jpg',             105, true, 1050, '{"tags":[]}'::jsonb),
    ('croissant-butter',                   (select id from public.categories where slug = 'dairy-pastries'),     'קוראסון חמאה',                  5000, 'kg',    '/images/dairy-pastries/111.jpg',             111, true, 1110, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Rugelach (legacy_id 106..110)
    -- ---------------------------------------------------------------------
    ('rugelach-parve',                     (select id from public.categories where slug = 'rugelach'),           'רוגלך פרווה',                    2000, 'piece', '/images/rugelach/106.jpg',                   106, true, 1060, '{"tags":["shabbat-staple"]}'::jsonb),
    ('rugelach-pistachio-white-chocolate', (select id from public.categories where slug = 'rugelach'),           'רוגלך פיסטוק ושוקולד לבן',    2500, 'piece', '/images/rugelach/107.jpg',                   107, true, 1070, '{"tags":["family-favorite"]}'::jsonb),
    ('rugelach-ferrero',                   (select id from public.categories where slug = 'rugelach'),           'רוגלך פררו',                    2500, 'piece', '/images/rugelach/108.jpg',                   108, true, 1080, '{"tags":[]}'::jsonb),
    ('rugelach-milk-chocolate',            (select id from public.categories where slug = 'rugelach'),           'רוגלך שוקולד חלבי',            2500, 'piece', '/images/rugelach/109.jpg',                   109, true, 1090, '{"tags":["iconic"],"is_popular":true}'::jsonb),
    ('rugelach-mix',                       (select id from public.categories where slug = 'rugelach'),           'רוגלך מיקס',                     2700, 'piece', '/images/rugelach/110.jpg',                   110, true, 1100, '{"tags":["bestseller"],"is_popular":true}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Round parve cakes (legacy_id 201..206, plus 202 hot-chocolate-classic)
    -- ---------------------------------------------------------------------
    ('nougat-mousse',                      (select id from public.categories where slug = 'round-parve-cakes'),  'מוס נוגט',                        12000, 'piece', '/images/round-parve-cakes/201.jpg',           201, true, 2010, '{"tags":[]}'::jsonb),
    ('hot-chocolate-classic',              (select id from public.categories where slug = 'round-parve-cakes'),  'שוקולד חמה',                     12000, 'piece', '/images/round-parve-cakes/202.jpg',           202, true, 2020, '{"tags":[],"variant":"classic"}'::jsonb),
    ('black-forest',                       (select id from public.categories where slug = 'round-parve-cakes'),  'יער שחור',                        6500,  'piece', '/images/round-parve-cakes/203.jpg',           203, true, 2030, '{"tags":[]}'::jsonb),
    ('toffee',                             (select id from public.categories where slug = 'round-parve-cakes'),  'טופי',                            6500,  'piece', '/images/round-parve-cakes/204.jpg',           204, true, 2040, '{"tags":[]}'::jsonb),
    ('hot-chocolate',                      (select id from public.categories where slug = 'round-parve-cakes'),  'שוקולד חמה',                     6500,  'piece', '/images/round-parve-cakes/205.jpg',           205, true, 2050, '{"tags":[],"variant":"new"}'::jsonb),
    ('cake-mix',                           (select id from public.categories where slug = 'round-parve-cakes'),  'מיקס עוגות',                     8000,  'piece', '/images/round-parve-cakes/206.jpg',           206, true, 2060, '{"tags":[]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Babka cakes (legacy_id 301..302)
    -- ---------------------------------------------------------------------
    ('poppy-babka',                        (select id from public.categories where slug = 'babka-cakes'),        'בובקט פרג',                      2500, 'piece', '/images/babka-cakes/301.jpg',                301, true, 3010, '{"tags":["family-favorite"],"is_popular":true}'::jsonb),
    ('chocolate-babka',                    (select id from public.categories where slug = 'babka-cakes'),        'בובקט שוקולד',                  2500, 'piece', '/images/babka-cakes/302.jpg',                302, true, 3020, '{"tags":["family-favorite"],"is_popular":true}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Hard cookies (legacy_id 401..402)
    -- ---------------------------------------------------------------------
    ('biscotti',                           (select id from public.categories where slug = 'hard-cookies'),       'בישקוטים',                        1700, 'piece', '/images/hard-cookies/401.jpg',               401, true, 4010, '{"tags":[]}'::jsonb),
    ('palmier-sugar-free',                 (select id from public.categories where slug = 'hard-cookies'),       'אוזן עלים ללא סוכר',           1700, 'piece', '/images/hard-cookies/402.jpg',               402, true, 4020, '{"tags":["no-sugar"]}'::jsonb),

    -- ---------------------------------------------------------------------
    -- Hanukkah collection (legacy_id 501..512)
    -- Names suffixed with " חנוכה" so name_he stays unique even though
    -- the frontend Hanukkah array reuses base donut names.
    -- ---------------------------------------------------------------------
    ('classic-strawberry',                 (select id from public.categories where slug = 'hanukkah'),           'תות קלאסי',                      1000, 'piece', '/images/donuts/20.jpg',                      501, true, 5010, '{"tags":["hanukkah"],"description_he":"הקלאסית והאהובה. מילוי ריבת תות איכותית ואבקת סוכר."}'::jsonb),
    ('ferrero-rocher',                     (select id from public.categories where slug = 'hanukkah'),           'פררו רושה',                      1000, 'piece', '/images/donuts/14.jpg',                      502, true, 5020, '{"tags":["hanukkah"],"description_he":"במילוי נוגט עשיר, ציפוי שוקולד רושה ושברי אגוזי לוז קלויים."}'::jsonb),
    ('pistachio-hanukkah',                 (select id from public.categories where slug = 'hanukkah'),           'פיסטוק חנוכה',                   1000, 'piece', '/images/donuts/19.jpg',                      503, true, 5030, '{"tags":["hanukkah"],"description_he":"במילוי קרם פיסטוק אמיתי וציפוי שוקולד לבן עם שברי פיסטוק."}'::jsonb),
    ('alfajores-hanukkah',                 (select id from public.categories where slug = 'hanukkah'),           'אלפחורס חנוכה',                 1000, 'piece', '/images/donuts/10.jpg',                      504, true, 5040, '{"tags":["hanukkah"],"description_he":"במילוי ריבת חלב ארגנטינאית, ציפוי שוקולד לבן ועיטור קוקוס קלוי."}'::jsonb),
    ('oreo-hanukkah',                      (select id from public.categories where slug = 'hanukkah'),           'אוראו חנוכה',                    1000, 'piece', '/images/donuts/18.jpg',                      505, true, 5050, '{"tags":["hanukkah"],"description_he":"במילוי קרם עוגיות וניל, ציפוי שוקולד לבן ושברי עוגיות אוראו פריכים."}'::jsonb),
    ('chocolate-crackers-hanukkah',        (select id from public.categories where slug = 'hanukkah'),           'שוקולד קראקרס חנוכה',           1000, 'piece', '/images/donuts/12.jpg',                      506, true, 5060, '{"tags":["hanukkah"],"description_he":"ציפוי שוקולד חלב קטיפתי עם שבבי וופל קראנצ''יים ומפתיעים."}'::jsonb),
    ('cheese-crumb-hanukkah',              (select id from public.categories where slug = 'hanukkah'),           'פירורי גבינה חנוכה',           1000, 'piece', '/images/donuts/11.jpg',                      507, true, 5070, '{"tags":["hanukkah"],"description_he":"במילוי קרם גבינה עשיר וציפוי פירורי שטרויזל חמאתיים ופריכים."}'::jsonb),
    ('dulce-de-leche-cheese-hanukkah',     (select id from public.categories where slug = 'hanukkah'),           'ריבת חלב גבינה חנוכה',         1000, 'piece', '/images/donuts/16.jpg',                      508, true, 5080, '{"tags":["hanukkah"],"description_he":"שילוב מושלם של מילוי גבינת שמנת וריבת חלב קרמלית מפנקת."}'::jsonb),
    ('napoleon-cream-hanukkah',            (select id from public.categories where slug = 'hanukkah'),           'נפוליאון קרם חנוכה',           1000, 'piece', '/images/donuts/17.jpg',                      509, true, 5090, '{"tags":["hanukkah"],"description_he":"במילוי קרם וניל צרפתי, ציפוי קרמל שרוף ושכבות בצק עלים."}'::jsonb),
    ('sweet-cream-hanukkah',               (select id from public.categories where slug = 'hanukkah'),           'שמנת מתוקה חנוכה',              1000, 'piece', '/images/donuts/21.jpg',                      510, true, 5100, '{"tags":["hanukkah"],"description_he":"סופגנייה פתוחה במילוי הר של קצפת שמנת מתוקה טרייה."}'::jsonb),
    ('chocolate-fold',                     (select id from public.categories where slug = 'hanukkah'),           'קיפול שוקולד',                  1000, 'piece', '/images/donuts/15.jpg',                      511, true, 5110, '{"tags":["hanukkah"],"description_he":"ציפוי שוקולד עשיר עם שברי שוקולד מקופלת מעל לחגיגה של מרקמים."}'::jsonb),
    ('donut-edition-hanukkah',             (select id from public.categories where slug = 'hanukkah'),           'דונאט אדישן חנוכה',             1000, 'piece', '/images/donuts/13.jpg',                      512, true, 5120, '{"tags":["hanukkah"],"description_he":"הסופגנייה המיוחדת שלנו במהדורה חגיגית ומוגבלת לחג החנוכה."}'::jsonb);

-- ---------------------------------------------------------------------
-- Sanity checks — abort the transaction if seed is incomplete.
-- ---------------------------------------------------------------------
do $$
declare
    n_total      int;
    n_with_legacy int;
    n_no_category int;
begin
    select count(*) into n_total from public.products;
    select count(*) into n_with_legacy from public.products where legacy_id is not null;
    select count(*) into n_no_category from public.products where category_id is null;

    if n_total <> 58 then
        raise exception 'expected 58 product rows, got %', n_total;
    end if;
    if n_with_legacy <> 58 then
        raise exception 'every seeded product must have a legacy_id, got %/%', n_with_legacy, n_total;
    end if;
    if n_no_category > 0 then
        raise exception '% product(s) have NULL category_id — categories not seeded?', n_no_category;
    end if;
end
$$;

commit;
