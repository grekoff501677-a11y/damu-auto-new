-- ============================================================
-- DAMU AUTO — Seed Data
-- ============================================================

-- Car Models (Geely-only lineup)
INSERT INTO car_models (brand, name, slug, year_from, year_to, sort_order) VALUES
  ('Geely', 'Atlas',    'geely-atlas',    2018, NULL, 1),
  ('Geely', 'Monjaro',  'geely-monjaro',  2022, NULL, 2),
  ('Geely', 'Coolray',  'geely-coolray',  2019, NULL, 3),
  ('Geely', 'Okavango', 'geely-okavango', 2022, NULL, 4);

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

-- Maintenance Rules for Geely Monjaro (example, 10 000 km base intervals)
INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Моторное масло',     'replace', 10000,  6, '5W-30, 4L',          1 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Масляный фильтр',    'replace', 10000,  6, 'Original',           2 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Воздушный фильтр',   'replace', 20000, 12, 'Original бумажный',  3 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Салонный фильтр',    'replace', 20000, 12, 'Угольный PM2.5',     4 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Антифриз LEC II',    'inspect', 30000, 18, 'Концентрат, синий',  5 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Тормозная жидкость', 'replace', 50000, 30, 'DOT 4',              6 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Свечи зажигания',    'replace', 60000, 36, 'Iridium, зазор 0.9', 7 FROM car_models WHERE slug = 'geely-monjaro';

INSERT INTO maintenance_rules (car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, sort_order)
SELECT id, 'Масло АКПП / DCT',   'replace', 60000, 36, 'DCT Fluid, 6 л',     8 FROM car_models WHERE slug = 'geely-monjaro';
