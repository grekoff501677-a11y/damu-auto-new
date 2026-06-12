-- ============================================================
-- DAMU AUTO — Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. CAR MODELS
-- ============================================================
CREATE TABLE car_models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       TEXT NOT NULL,                        -- 'Geely'
  name        TEXT NOT NULL,                        -- 'Atlas' | 'Monjaro' | 'Coolray' | 'Okavango'
  full_name   TEXT GENERATED ALWAYS AS (brand || ' ' || name) STORED,
  slug        TEXT UNIQUE NOT NULL,                 -- 'geely-monjaro'
  year_from   SMALLINT,
  year_to     SMALLINT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  short_desc      TEXT,
  description     TEXT,
  category        TEXT NOT NULL,          -- 'oil' | 'filter' | 'fluid' | 'spark_plug' | 'other'
  oem_number      TEXT NOT NULL,          -- e.g. '2304100XGW01A' — critical for authenticity
  kaspi_url       TEXT NOT NULL,          -- direct product link on Kaspi.kz
  images          TEXT[] NOT NULL DEFAULT '{}',   -- Supabase Storage public URLs
  specifications  JSONB NOT NULL DEFAULT '{}',    -- { "viscosity": "5W-30", "volume": "4L" }
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUCT ↔ CAR MODEL COMPATIBILITY (many-to-many)
-- ============================================================
CREATE TABLE product_compatibility (
  product_id   UUID NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  car_model_id UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  notes        TEXT,                                   -- e.g. '2022–2024 only'
  PRIMARY KEY (product_id, car_model_id)
);

-- ============================================================
-- 4. BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,                   -- Markdown
  category        TEXT NOT NULL,                   -- 'update' | 'guide'
  cover_image     TEXT,
  -- Before/After slider images (for Original vs Counterfeit articles)
  before_image    TEXT,
  after_image     TEXT,
  before_label    TEXT DEFAULT 'Оригинал',
  after_label     TEXT DEFAULT 'Подделка',
  published       BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. BLOG POST ↔ PRODUCTS (embedded product widgets in articles)
-- ============================================================
CREATE TABLE blog_post_products (
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (blog_post_id, product_id)
);

-- ============================================================
-- 6. MAINTENANCE RULES (Calculator logic matrix)
-- ============================================================
CREATE TABLE maintenance_rules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_model_id   UUID NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name   TEXT NOT NULL,             -- fallback if product_id is null
  rule_type      TEXT NOT NULL,             -- 'replace' | 'inspect'
  interval_km    INT,                       -- e.g. 5000 (every 5 000 km)
  interval_months SMALLINT,                 -- e.g. 6 (every 6 months)
  spec_hint      TEXT,                      -- e.g. '5W-30, 4L' shown in checklist
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT maintenance_rules_type_check
    CHECK (rule_type IN ('replace', 'inspect'))
);

-- ============================================================
-- 7. LEADS (contact form → future CRM webhook)
-- ============================================================
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT,
  car_model   TEXT,                          -- self-reported car info
  source      TEXT NOT NULL DEFAULT 'website', -- 'website' | 'calculator' | 'product'
  status      TEXT NOT NULL DEFAULT 'new',   -- 'new' | 'contacted' | 'closed'
  metadata    JSONB NOT NULL DEFAULT '{}',   -- utm params, page URL, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT leads_status_check
    CHECK (status IN ('new', 'contacted', 'closed'))
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category     ON products(category);
CREATE INDEX idx_products_available    ON products(is_available);
CREATE INDEX idx_products_oem          ON products(oem_number);
CREATE INDEX idx_blog_posts_published  ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_category   ON blog_posts(category);
CREATE INDEX idx_maintenance_model     ON maintenance_rules(car_model_id);
CREATE INDEX idx_leads_status          ON leads(status, created_at DESC);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_products"    ON products            FOR SELECT USING (is_available = TRUE);
CREATE POLICY "public_read_car_models"  ON car_models          FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_compat"      ON product_compatibility FOR SELECT USING (TRUE);
CREATE POLICY "public_read_blog"        ON blog_posts          FOR SELECT USING (published = TRUE);
CREATE POLICY "public_read_blog_prods"  ON blog_post_products  FOR SELECT USING (TRUE);
CREATE POLICY "public_read_maintenance" ON maintenance_rules   FOR SELECT USING (TRUE);

-- Leads: NO anon insert policy — the only write path is /api/leads, which
-- uses the service-role client (bypasses RLS) and enforces validation,
-- rate-limit and RK consent. Admin reads/manages via authenticated session.
CREATE POLICY "admin_all_leads" ON leads
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Admin full access (authenticated users)
CREATE POLICY "admin_all_products"   ON products
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_all_car_models" ON car_models
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_all_blog"       ON blog_posts
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_all_maint"      ON maintenance_rules
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_all_compat"     ON product_compatibility
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_all_blog_prods" ON blog_post_products
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 8. PAGE SECTIONS (home-page section manager)
-- ============================================================
-- Per-section order / visibility / editable texts for the home page.
-- section_key values are fixed in code (src/lib/page-sections.ts).
-- section_key holds the block TYPE (may repeat for library blocks);
-- each row identified by id. is_system marks the 5 coded sections.
CREATE TABLE page_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page         TEXT NOT NULL DEFAULT 'home',
  section_key  TEXT NOT NULL,
  is_system    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
  config       JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sections" ON page_sections FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_sections" ON page_sections
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO page_sections (page, section_key, is_system, sort_order, is_visible) VALUES
  ('home', 'hero',        TRUE, 1, TRUE),
  ('home', 'features',    TRUE, 2, TRUE),
  ('home', 'maintenance', TRUE, 3, TRUE),
  ('home', 'originality', TRUE, 4, TRUE),
  ('home', 'lead_form',   TRUE, 5, TRUE);
