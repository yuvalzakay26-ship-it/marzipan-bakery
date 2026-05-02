-- =====================================================================
-- Seed reference data (categories + branches).
-- Product seeding lives in supabase/seed/products.sql so the schema
-- migration stays free of large data dumps.
-- =====================================================================

insert into public.categories (slug, name_he, name_en, sort_order) values
    ('rugelach',           'רוגלך',                  'Rugelach',           10),
    ('donuts',             'דונאטים',                'Donuts',             20),
    ('fridge-cakes',       'עוגות מקרר',             'Fridge Cakes',       30),
    ('tarts',              'טארטים',                 'Tarts',              40),
    ('round-parve-cakes',  'עוגות פרווה עגולות',     'Round Parve Cakes',  50),
    ('babka-cakes',        'עוגות בבקה',             'Babka Cakes',        60),
    ('hard-cookies',       'עוגיות יבשות',           'Hard Cookies',       70),
    ('bread',              'לחמים',                  'Bread',              80),
    ('dairy-pastries',     'מאפי חלב',               'Dairy Pastries',     90),
    ('hanukkah',           'חנוכה',                  'Hanukkah',          100),
    ('shavuot',            'שבועות',                 'Shavuot',           110)
on conflict (slug) do nothing;

insert into public.branches (slug, name_he, address_he, phone_e164, geo_lat, geo_lng, hours_json, accepts_pickup, accepts_delivery) values
    (
        'mahane-yehuda',
        'סניף השוק (המיתולוגי)',
        'אגריפס 44, שוק מחנה יהודה, ירושלים',
        '+97226232594',
        31.7855, 35.2118,
        '{
            "0": {"open":"05:00","close":"23:30"},
            "1": {"open":"05:00","close":"23:30"},
            "2": {"open":"05:00","close":"23:30"},
            "3": {"open":"05:00","close":"23:30"},
            "4": {"open":"05:00","close":"23:30"},
            "5": {"open":"05:00","close":"15:00"},
            "6": {"open":null,"close":null}
         }'::jsonb,
        true, false
    ),
    (
        'center-1',
        'סניף סנטר 1',
        'ירמיהו 43, קניון סנטר 1, ירושלים',
        '+97226523311',
        31.7949, 35.2097,
        '{
            "0": {"open":"08:00","close":"22:00"},
            "1": {"open":"08:00","close":"22:00"},
            "2": {"open":"08:00","close":"22:00"},
            "3": {"open":"08:00","close":"22:00"},
            "4": {"open":"08:00","close":"22:00"},
            "5": {"open":"07:00","close":"13:00"},
            "6": {"open":null,"close":null}
         }'::jsonb,
        true, false
    )
on conflict (slug) do nothing;
