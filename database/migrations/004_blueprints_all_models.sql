-- ============================================================
-- Migration 004 — Blueprints for Atlas / Coolray / Okavango
-- Run this in Supabase SQL Editor (after 002).
-- ============================================================
-- Hotspot positions are % of the image, placed on the actual
-- drawn components of each wireframe; refine in /admin/blueprints.

UPDATE car_models
SET blueprint_url = 'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781160649/Atlas_fqv4ft.svg',
    blueprint_nodes = '[
      {"id":"a1","x":30,"y":40,"bodyNode":"engine","label":"Двигатель"},
      {"id":"a2","x":18,"y":50,"bodyNode":"cooling","label":"Охлаждение"},
      {"id":"a3","x":53,"y":28,"bodyNode":"cabin","label":"Салон"},
      {"id":"a4","x":66,"y":52,"bodyNode":"transmission","label":"Трансмиссия"},
      {"id":"a5","x":53,"y":58,"bodyNode":"brakes","label":"Тормоза / подвеска"}
    ]'::jsonb
WHERE slug = 'geely-atlas';

UPDATE car_models
SET blueprint_url = 'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781162008/Coolray_New_nhihis.svg',
    blueprint_nodes = '[
      {"id":"c1","x":26,"y":46,"bodyNode":"engine","label":"Двигатель"},
      {"id":"c2","x":14,"y":53,"bodyNode":"cooling","label":"Охлаждение"},
      {"id":"c3","x":48,"y":29,"bodyNode":"cabin","label":"Салон"},
      {"id":"c4","x":31,"y":58,"bodyNode":"transmission","label":"Трансмиссия"},
      {"id":"c5","x":45,"y":60,"bodyNode":"brakes","label":"Тормоза / подвеска"}
    ]'::jsonb
WHERE slug = 'geely-coolray';

UPDATE car_models
SET blueprint_url = 'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781160649/Oka_pjltwh.svg',
    blueprint_nodes = '[
      {"id":"o1","x":32,"y":51,"bodyNode":"engine","label":"Двигатель"},
      {"id":"o2","x":14,"y":50,"bodyNode":"cooling","label":"Охлаждение"},
      {"id":"o3","x":52,"y":30,"bodyNode":"cabin","label":"Салон"},
      {"id":"o4","x":62,"y":57,"bodyNode":"transmission","label":"Трансмиссия"},
      {"id":"o5","x":52,"y":62,"bodyNode":"brakes","label":"Тормоза / подвеска"}
    ]'::jsonb
WHERE slug = 'geely-okavango';
