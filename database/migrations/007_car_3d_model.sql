-- ============================================================
-- Migration 007 — Optional 3D model (GLB) per car
-- Run this in Supabase SQL Editor.
-- ============================================================
-- URL of an optimized .glb (Draco + WebP textures) shown in the
-- Maintenance Center instead of the wireframe when present.
-- Hosted in Supabase Storage (public bucket) or any CDN.

ALTER TABLE car_models ADD COLUMN IF NOT EXISTS model_3d_url TEXT;

-- Coolray: optimized 2.5 MB GLB (from a 59 MB source), Draco + WebP, on Cloudinary
UPDATE car_models
SET model_3d_url = 'https://res.cloudinary.com/djjcxxgfm/image/upload/v1781342661/coolray-opt_ajz4nc.glb'
WHERE slug = 'geely-coolray';

-- Monjaro: from a 67 MB FBX → geometry-only GLB, Draco-compressed to ~1 MB,
-- in Supabase Storage (public bucket "models")
UPDATE car_models
SET model_3d_url = 'https://ekrggwfddacgeolxtuwd.supabase.co/storage/v1/object/public/models/monjaro.glb'
WHERE slug = 'geely-monjaro';
