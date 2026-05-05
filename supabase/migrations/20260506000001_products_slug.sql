-- =====================================================================
-- Products: SEO-friendly English-only slug column.
--
-- Slugs are URL-safe (a-z, 0-9, dash) so /products/:slug routing is
-- stable regardless of browser percent-encoding behavior. Slugs are
-- assigned per-product by name to keep them human-readable rather than
-- derived from row id.
--
-- The drop preserves idempotency: an earlier revision of this migration
-- created `products_slug_unique` (partial index over Hebrew-derived
-- slugs). We replace it with `products_slug_key` covering the new
-- English values.
-- =====================================================================

alter table public.products
    add column if not exists slug text;

-- Rugelach
update public.products set slug = 'rugelach-parve'                    where name = 'רוגלך פרווה';
update public.products set slug = 'rugelach-pistachio-white-chocolate' where name = 'רוגלך פיסטוק ושוקולד לבן';
update public.products set slug = 'rugelach-ferrero'                  where name = 'רוגלך פררו';
update public.products set slug = 'rugelach-milk-chocolate'           where name = 'רוגלך שוקולד חלבי';
update public.products set slug = 'rugelach-mix'                      where name = 'רוגלך מיקס';

-- Sweet Dairy Pastries (croissants)
update public.products set slug = 'croissant-butter'                  where name = 'קוראסון חמאה';
update public.products set slug = 'croissant-milk-chocolate'          where name = 'קוראסון שוקולד חלבי';
update public.products set slug = 'croissant-pistachio'               where name = 'קוראסון פיסטוק';
update public.products set slug = 'croissant-ferrero'                 where name = 'קוראסון פררו';
update public.products set slug = 'croissant-white-chocolate-pistachio' where name = 'קוראסון שוקולד לבן ופיסטוק';
update public.products set slug = 'croissant-box'                     where name = 'מארז קוראסונים';

-- Bread
update public.products set slug = 'baguette-challah'                  where name = 'חלות באגט';
update public.products set slug = 'breads'                            where name = 'לחמים';

-- Donuts
update public.products set slug = 'alfajores'                         where name = 'אלפחורס';
update public.products set slug = 'cheese-crumb'                      where name = 'פירורי גבינה';
update public.products set slug = 'chocolate-crackers'                where name = 'שוקולד קראקרס';
update public.products set slug = 'donut-edition'                     where name = 'דונאט אדישן';
update public.products set slug = 'ferrero'                           where name = 'פררו';
update public.products set slug = 'kipul'                             where name = 'קיפול';
update public.products set slug = 'dulce-de-leche-cheese'             where name = 'ריבת חלב גבינה';
update public.products set slug = 'napoleon-cream'                    where name = 'נפוליאון קרם';
update public.products set slug = 'oreo'                              where name = 'אוראו';
update public.products set slug = 'pistachio'                         where name = 'פיסטוק';
update public.products set slug = 'strawberry'                        where name = 'תות';
update public.products set slug = 'sweet-cream'                       where name = 'שמנת מתוקה';

-- Fridge Cakes
update public.products set slug = 'alfajores-cream'                   where name = 'קרם אלפחורס';
update public.products set slug = 'cheese-berries'                    where name = 'גבינה ופירות יער';
update public.products set slug = 'kinder'                            where name = 'קינדר';
update public.products set slug = 'mozart'                            where name = 'מוצרט';
update public.products set slug = 'pistachio-cream'                   where name = 'קרם פיסטוק';
update public.products set slug = 'magnum'                            where name = 'מגנום';
update public.products set slug = 'bee-sting'                         where name = 'עקיצה הדבורה';
update public.products set slug = 'tiramisu'                          where name = 'טירמיסו';

-- Tarts
update public.products set slug = 'brownie-tart'                      where name = 'טארט בראוניז';
update public.products set slug = 'lemon-tart'                        where name = 'טארט לימון';
update public.products set slug = 'pistachio-tart'                    where name = 'טארט פיסטוק';

-- Round Parve Cakes
update public.products set slug = 'nougat-mousse'                     where name = 'מוס נוגט';
update public.products set slug = 'black-forest'                      where name = 'יער שחור';
update public.products set slug = 'toffee'                            where name = 'טופי';
update public.products set slug = 'hot-chocolate'                     where name = 'שוקולד חמה';
update public.products set slug = 'cake-mix'                          where name = 'מיקס עוגות';

-- Babka Cakes
update public.products set slug = 'poppy-babka'                       where name = 'בובקט פרג';
update public.products set slug = 'chocolate-babka'                   where name = 'בובקט שוקולד';

-- Hard Cookies
update public.products set slug = 'biscotti'                          where name = 'בישקוטים';
update public.products set slug = 'palmier-sugar-free'                where name = 'אוזן עלים ללא סוכר';

-- Hanukkah Collection
update public.products set slug = 'classic-strawberry'                where name = 'תות קלאסי';
update public.products set slug = 'ferrero-rocher'                    where name = 'פררו רושה';
update public.products set slug = 'pistachio-hanukkah'                where name = 'פיסטוק חנוכה';
update public.products set slug = 'alfajores-hanukkah'                where name = 'אלפחורס חנוכה';
update public.products set slug = 'oreo-hanukkah'                     where name = 'אוראו חנוכה';
update public.products set slug = 'chocolate-crackers-hanukkah'       where name = 'שוקולד קראקרס חנוכה';
update public.products set slug = 'cheese-crumb-hanukkah'             where name = 'פירורי גבינה חנוכה';
update public.products set slug = 'dulce-de-leche-cheese-hanukkah'    where name = 'ריבת חלב גבינה חנוכה';
update public.products set slug = 'napoleon-cream-hanukkah'           where name = 'נפוליאון קרם חנוכה';
update public.products set slug = 'sweet-cream-hanukkah'              where name = 'שמנת מתוקה חנוכה';
update public.products set slug = 'chocolate-fold'                    where name = 'קיפול שוקולד';
update public.products set slug = 'donut-edition-hanukkah'            where name = 'דונאט אדישן חנוכה';

drop index if exists products_slug_unique;

create unique index if not exists products_slug_key
    on public.products (slug);
