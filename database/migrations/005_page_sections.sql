-- ============================================================
-- Migration 005 — Home page section manager
-- Run this in Supabase SQL Editor.
-- ============================================================
-- Stores per-section order / visibility / editable texts for the
-- home page. The set of section_key values is fixed in code
-- (src/lib/page-sections.ts); this table only overrides their
-- order, visibility and text content. The site renders fine even
-- before this runs (code falls back to registry defaults) — the
-- table is what makes admin edits persist.

CREATE TABLE IF NOT EXISTS page_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page         TEXT NOT NULL DEFAULT 'home',
  section_key  TEXT NOT NULL,                 -- 'hero' | 'features' | 'maintenance' | 'originality' | 'lead_form'
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  config       JSONB NOT NULL DEFAULT '{}',   -- editable texts (overrides registry defaults)
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page, section_key)
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_sections" ON page_sections;
CREATE POLICY "public_read_sections" ON page_sections FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin_all_sections" ON page_sections;
CREATE POLICY "admin_all_sections" ON page_sections
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- keep updated_at fresh (re-uses the trigger fn from schema.sql)
DROP TRIGGER IF EXISTS page_sections_updated_at ON page_sections;
CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed the five home sections in their default order (config left empty
-- so the registry defaults apply until edited).
INSERT INTO page_sections (page, section_key, sort_order, is_visible) VALUES
  ('home', 'hero',        1, TRUE),
  ('home', 'features',    2, TRUE),
  ('home', 'maintenance', 3, TRUE),
  ('home', 'originality', 4, TRUE),
  ('home', 'lead_form',   5, TRUE)
ON CONFLICT (page, section_key) DO NOTHING;
