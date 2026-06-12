-- ============================================================
-- Migration 006 — Page constructor: addable blocks
-- Run AFTER 005 in Supabase SQL Editor.
-- ============================================================
-- Turns the fixed 5-section model into a list of blocks:
--  • section_key now holds the block TYPE (may repeat — several
--    'text' blocks can coexist), each row identified by its id;
--  • is_system marks the five coded interactive sections (single
--    instance, cannot be added/deleted via the admin);
--  • the UNIQUE(page, section_key) constraint is dropped so the
--    admin can add multiple library blocks of the same type.

ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE page_sections SET is_system = TRUE
WHERE section_key IN ('hero', 'features', 'maintenance', 'originality', 'lead_form');

-- drop the uniqueness on (page, section_key) — name from migration 005
ALTER TABLE page_sections DROP CONSTRAINT IF EXISTS page_sections_page_section_key_key;
