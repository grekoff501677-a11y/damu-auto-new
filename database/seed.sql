-- ============================================================
-- DAMU AUTO — Seed Data
-- ============================================================

-- Car Models
INSERT INTO car_models (brand, name, slug, year_from, year_to, sort_order) VALUES
  ('Geely', 'Monjaro',  'geely-monjaro',  2022, NULL, 1),
  ('Geely', 'Tugella',  'geely-tugella',  2019, NULL, 2),
  ('Geely', 'Preface',  'geely-preface',  2020, NULL, 3),
  ('Geely', 'Coolray',  'geely-coolray',  2019, NULL, 4),
  ('Li Auto', 'L7',     'li-auto-l7',     2023, NULL, 5),
  ('Li Auto', 'L9',     'li-auto-l9',     2022, NULL, 6);

-- Sample Product (Geely Original Oil 5W-30)
INSERT INTO products (name, slug, short_desc, description, category, oem_number, kaspi_url, specifications, is_featured)
VALUES (
  'Моторное масло Geely Original 5W-30 4L',
  'geely-oil-5w30-4l',
  'Оригинальное масло для двигателей Geely. Защита от износа, оптимальная текучесть при -30°C.',
  'Полностью синтетическое моторное масло, одобренное Geely для всех современных моделей...',
  'oil',
  '2304100XGW01A',
  'https://kaspi.kz/shop/p/...',
  '{"viscosity": "5W-30", "volume": "4L", "type": "Fully Synthetic", "standard": "API SN PLUS"}',
  TRUE
);

-- Maintenance Rules for Geely Monjaro (example)
INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT
  id,
  'Моторное масло',     'replace', 5000,  6,  '5W-30, 4L', 1
FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT
  id,
  'Воздушный фильтр',   'replace', 15000, 12, 'Оригинальный', 2
FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT
  id,
  'Салонный фильтр',    'replace', 10000, 12, 'Оригинальный', 3
FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT
  id,
  'Антифриз LEC II',    'inspect', 30000, 24, 'Концентрат, синий', 4
FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT
  id,
  'Тормозная жидкость', 'inspect', 40000, 24, 'DOT 4', 5
FROM car_models WHERE slug = 'geely-monjaro';
