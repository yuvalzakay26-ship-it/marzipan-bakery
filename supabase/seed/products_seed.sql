-- =====================================================================
-- Marzipan Bakery — full product catalog seed.
-- Source: src/data/productsData.js  (legacy static catalog)
-- Target: public.products
-- Schema: name, description, price, image_url, category_slug, is_popular, slug
--
-- Slugs are English-only (a-z, 0-9, dash) to keep /products/:slug URLs
-- stable and SEO-friendly. Keep these in sync with the slug migration.
--
-- Run this once in the Supabase SQL editor. Re-running will create
-- duplicate rows (no unique constraint on name+category in the live
-- schema) — clear the table first if you need to re-seed:
--   delete from public.products;
-- =====================================================================

INSERT INTO public.products
    (name, description, price, image_url, category_slug, is_popular, slug)
VALUES
    -- Rugelach
    ('רוגלך פרווה',                       NULL, 20, '/images/rugelach/106.jpg', 'rugelach', FALSE, 'rugelach-parve'),
    ('רוגלך פיסטוק ושוקולד לבן',          NULL, 25, '/images/rugelach/107.jpg', 'rugelach', FALSE, 'rugelach-pistachio-white-chocolate'),
    ('רוגלך פררו',                        NULL, 25, '/images/rugelach/108.jpg', 'rugelach', FALSE, 'rugelach-ferrero'),
    ('רוגלך שוקולד חלבי',                 NULL, 25, '/images/rugelach/109.jpg', 'rugelach', TRUE,  'rugelach-milk-chocolate'),
    ('רוגלך מיקס',                        NULL, 27, '/images/rugelach/110.jpg', 'rugelach', TRUE,  'rugelach-mix'),

    -- Sweet Dairy Pastries (croissants)
    ('קוראסון חמאה',                      NULL, 50, '/images/dairy-pastries/111.jpg', 'dairy-pastries', FALSE, 'croissant-butter'),
    ('קוראסון שוקולד חלבי',               NULL, 50, '/images/dairy-pastries/101.jpg', 'dairy-pastries', FALSE, 'croissant-milk-chocolate'),
    ('קוראסון פיסטוק',                    NULL, 50, '/images/dairy-pastries/102.jpg', 'dairy-pastries', FALSE, 'croissant-pistachio'),
    ('קוראסון פררו',                      NULL, 50, '/images/dairy-pastries/103.jpg', 'dairy-pastries', FALSE, 'croissant-ferrero'),
    ('קוראסון שוקולד לבן ופיסטוק',        NULL, 50, '/images/dairy-pastries/104.jpg', 'dairy-pastries', FALSE, 'croissant-white-chocolate-pistachio'),
    ('מארז קוראסונים',                    NULL, 50, '/images/dairy-pastries/105.jpg', 'dairy-pastries', FALSE, 'croissant-box'),

    -- Bread
    ('חלות באגט',                         NULL,  8, '/images/bread/1.jpg', 'bread', FALSE, 'baguette-challah'),
    ('לחמים',                             NULL, 15, '/images/bread/2.jpg', 'bread', FALSE, 'breads'),

    -- Donuts
    ('אלפחורס',                           NULL, 10, '/images/donuts/10.jpg', 'donuts', FALSE, 'alfajores'),
    ('פירורי גבינה',                      NULL, 10, '/images/donuts/11.jpg', 'donuts', FALSE, 'cheese-crumb'),
    ('שוקולד קראקרס',                     NULL, 10, '/images/donuts/12.jpg', 'donuts', FALSE, 'chocolate-crackers'),
    ('דונאט אדישן',                       NULL, 10, '/images/donuts/13.jpg', 'donuts', FALSE, 'donut-edition'),
    ('פררו',                              NULL, 10, '/images/donuts/14.jpg', 'donuts', FALSE, 'ferrero'),
    ('קיפול',                             NULL, 10, '/images/donuts/15.jpg', 'donuts', FALSE, 'kipul'),
    ('ריבת חלב גבינה',                    NULL, 10, '/images/donuts/16.jpg', 'donuts', FALSE, 'dulce-de-leche-cheese'),
    ('נפוליאון קרם',                      NULL, 10, '/images/donuts/17.jpg', 'donuts', FALSE, 'napoleon-cream'),
    ('אוראו',                             NULL, 10, '/images/donuts/18.jpg', 'donuts', FALSE, 'oreo'),
    ('פיסטוק',                            NULL, 10, '/images/donuts/19.jpg', 'donuts', FALSE, 'pistachio'),
    ('תות',                               NULL, 10, '/images/donuts/20.jpg', 'donuts', FALSE, 'strawberry'),
    ('שמנת מתוקה',                        NULL, 10, '/images/donuts/21.jpg', 'donuts', FALSE, 'sweet-cream'),

    -- Fridge Cakes
    ('קרם אלפחורס',                       NULL, 65, '/images/fridge-cakes/30.jpg', 'fridge-cakes', FALSE, 'alfajores-cream'),
    ('גבינה ופירות יער',                  NULL, 65, '/images/fridge-cakes/31.jpg', 'fridge-cakes', FALSE, 'cheese-berries'),
    ('קינדר',                             NULL, 65, '/images/fridge-cakes/32.jpg', 'fridge-cakes', FALSE, 'kinder'),
    ('מוצרט',                             NULL, 65, '/images/fridge-cakes/33.jpg', 'fridge-cakes', FALSE, 'mozart'),
    ('קרם פיסטוק',                        NULL, 65, '/images/fridge-cakes/34.jpg', 'fridge-cakes', FALSE, 'pistachio-cream'),
    ('מגנום',                             NULL, 65, '/images/fridge-cakes/35.jpg', 'fridge-cakes', FALSE, 'magnum'),
    ('עקיצה הדבורה',                      NULL, 65, '/images/fridge-cakes/36.jpg', 'fridge-cakes', FALSE, 'bee-sting'),
    ('טירמיסו',                           NULL, 65, '/images/fridge-cakes/37.jpg', 'fridge-cakes', FALSE, 'tiramisu'),

    -- Tarts
    ('טארט בראוניז',                      NULL, 35, '/images/tarts/40.jpg', 'tarts', FALSE, 'brownie-tart'),
    ('טארט לימון',                        NULL, 35, '/images/tarts/41.jpg', 'tarts', FALSE, 'lemon-tart'),
    ('טארט פיסטוק',                       NULL, 35, '/images/tarts/42.jpg', 'tarts', FALSE, 'pistachio-tart'),

    -- Round Parve Cakes
    ('מוס נוגט',                          NULL, 120, '/images/round-parve-cakes/201.jpg', 'round-parve-cakes', FALSE, 'nougat-mousse'),
    ('יער שחור',                          NULL,  65, '/images/round-parve-cakes/203.jpg', 'round-parve-cakes', FALSE, 'black-forest'),
    ('טופי',                              NULL,  65, '/images/round-parve-cakes/204.jpg', 'round-parve-cakes', FALSE, 'toffee'),
    ('שוקולד חמה',                        NULL,  65, '/images/round-parve-cakes/205.jpg', 'round-parve-cakes', FALSE, 'hot-chocolate'),
    ('מיקס עוגות',                        NULL,  80, '/images/round-parve-cakes/206.jpg', 'round-parve-cakes', FALSE, 'cake-mix'),

    -- Babka Cakes
    ('בובקט פרג',                         NULL, 25, '/images/babka-cakes/301.jpg', 'babka-cakes', FALSE, 'poppy-babka'),
    ('בובקט שוקולד',                      NULL, 25, '/images/babka-cakes/302.jpg', 'babka-cakes', FALSE, 'chocolate-babka'),

    -- Hard Cookies
    ('בישקוטים',                          NULL, 17, '/images/hard-cookies/401.jpg', 'hard-cookies', FALSE, 'biscotti'),
    ('אוזן עלים ללא סוכר',                NULL, 17, '/images/hard-cookies/402.jpg', 'hard-cookies', FALSE, 'palmier-sugar-free'),

    -- Hanukkah Collection
    ('תות קלאסי',         'הקלאסית והאהובה. מילוי ריבת תות איכותית ואבקת סוכר.',                              10, '/images/hanukkah/501.jpg', 'hanukkah', FALSE, 'classic-strawberry'),
    ('פררו רושה',         'במילוי נוגט עשיר, ציפוי שוקולד רושה ושברי אגוזי לוז קלויים.',                       10, '/images/hanukkah/502.jpg', 'hanukkah', FALSE, 'ferrero-rocher'),
    ('פיסטוק חנוכה',      'במילוי קרם פיסטוק אמיתי וציפוי שוקולד לבן עם שברי פיסטוק.',                          10, '/images/hanukkah/503.jpg', 'hanukkah', FALSE, 'pistachio-hanukkah'),
    ('אלפחורס חנוכה',     'במילוי ריבת חלב ארגנטינאית, ציפוי שוקולד לבן ועיטור קוקוס קלוי.',                    10, '/images/hanukkah/504.jpg', 'hanukkah', FALSE, 'alfajores-hanukkah'),
    ('אוראו חנוכה',       'במילוי קרם עוגיות וניל, ציפוי שוקולד לבן ושברי עוגיות אוראו פריכים.',                10, '/images/hanukkah/505.jpg', 'hanukkah', FALSE, 'oreo-hanukkah'),
    ('שוקולד קראקרס חנוכה','ציפוי שוקולד חלב קטיפתי עם שבבי וופל קראנצ''יים ומפתיעים.',                         10, '/images/hanukkah/506.jpg', 'hanukkah', FALSE, 'chocolate-crackers-hanukkah'),
    ('פירורי גבינה חנוכה', 'במילוי קרם גבינה עשיר וציפוי פירורי שטרויזל חמאתיים ופריכים.',                       10, '/images/hanukkah/507.jpg', 'hanukkah', FALSE, 'cheese-crumb-hanukkah'),
    ('ריבת חלב גבינה חנוכה','שילוב מושלם של מילוי גבינת שמנת וריבת חלב קרמלית מפנקת.',                          10, '/images/hanukkah/508.jpg', 'hanukkah', FALSE, 'dulce-de-leche-cheese-hanukkah'),
    ('נפוליאון קרם חנוכה', 'במילוי קרם וניל צרפתי, ציפוי קרמל שרוף ושכבות בצק עלים.',                            10, '/images/hanukkah/509.jpg', 'hanukkah', FALSE, 'napoleon-cream-hanukkah'),
    ('שמנת מתוקה חנוכה',   'סופגנייה פתוחה במילוי הר של קצפת שמנת מתוקה טרייה.',                                 10, '/images/hanukkah/510.jpg', 'hanukkah', FALSE, 'sweet-cream-hanukkah'),
    ('קיפול שוקולד',      'ציפוי שוקולד עשיר עם שברי שוקולד מקופלת מעל לחגיגה של מרקמים.',                       10, '/images/hanukkah/511.jpg', 'hanukkah', FALSE, 'chocolate-fold'),
    ('דונאט אדישן חנוכה',  'הסופגנייה המיוחדת שלנו במהדורה חגיגית ומוגבלת לחג החנוכה.',                          10, '/images/hanukkah/512.jpg', 'hanukkah', FALSE, 'donut-edition-hanukkah');
