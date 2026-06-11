-- ============================================================
-- Migration 003 — RLS security fixes (run in Supabase SQL Editor)
-- ============================================================
-- 1. product_compatibility / blog_post_products had RLS enabled but NO
--    write policies for authenticated → admin saves silently failed
--    (DELETE matched 0 rows, INSERT was rejected). Add admin policies.
-- 2. anon_insert_leads allowed anyone with the public anon key to insert
--    leads directly via Supabase REST, bypassing /api/leads validation,
--    rate-limit and consent check. The API route uses the service-role
--    client (bypasses RLS), so the anon policy is not needed at all.

-- 1a. Admin write access to product compatibility
DROP POLICY IF EXISTS "admin_all_compat" ON product_compatibility;
CREATE POLICY "admin_all_compat" ON product_compatibility
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 1b. Admin write access to blog post ↔ product links
DROP POLICY IF EXISTS "admin_all_blog_prods" ON blog_post_products;
CREATE POLICY "admin_all_blog_prods" ON blog_post_products
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. Leads: the only legitimate write path is /api/leads (service role)
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
