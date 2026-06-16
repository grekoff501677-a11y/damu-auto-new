-- ============================================================
-- Migration 008 — 3D maintenance node regions per car
-- Run this in Supabase SQL Editor.
-- ============================================================
-- Authored in the admin 3D editor: glowing particle-swarm regions tied to
-- bodyNode categories (engine/cooling/cabin/transmission/brakes). Stored in
-- the model's NORMALIZED space (same space Model3D centers+scales to), as an
-- array of { id, bodyNode, shape:'sphere'|'box', x,y,z, r OR sx,sy,sz }.
-- Empty array → Model3D falls back to generic bbox-fraction regions.

ALTER TABLE car_models ADD COLUMN IF NOT EXISTS model_3d_nodes JSONB NOT NULL DEFAULT '[]'::jsonb;
