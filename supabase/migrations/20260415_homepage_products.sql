-- CREATE HOMEPAGE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS homepage_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR NOT NULL, -- 'popular_products', 'todays_deals', 'featured_products', 'best_selling'
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(section_key, product_id)
);

-- Indexing for fast lookups
CREATE INDEX IF NOT EXISTS idx_homepage_products_section ON homepage_products(section_key);

-- RLS Configurations
ALTER TABLE homepage_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to homepage products
CREATE POLICY "Allow public read access to homepage_products" ON homepage_products FOR SELECT USING (true);

-- Allow authenticated admins to manage homepage products
-- Note: Assuming auth.role() = 'authenticated' and we might have an admin check in the future.
-- For now, allowing all authenticated users (typical for dev setup) or can be restricted to specific emails/roles.
CREATE POLICY "Allow authenticated users to manage homepage_products" ON homepage_products FOR ALL USING (auth.role() = 'authenticated');
