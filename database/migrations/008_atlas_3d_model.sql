-- ============================================================
-- Migration 008 — High-detail 3D model for Geely Atlas
-- Source: Tripo-generated GLB, texture-stripped, no simplify/decimate.
-- Geometry preserved for maximum wireframe detail, then Draco-compressed.
-- ============================================================

ALTER TABLE car_models ADD COLUMN IF NOT EXISTS model_3d_url TEXT;

UPDATE car_models
SET model_3d_url = 'https://ekrggwfddacgeolxtuwd.supabase.co/storage/v1/object/public/models/atlas.glb'
WHERE slug = 'geely-atlas';
