-- Analytics and Marketing Schema for SNP Store

-- 1. PRODUCT VIEWS TRACKING
CREATE TABLE IF NOT EXISTS product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- For tracking anonymous views
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast aggregation by product and time
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

-- 2. SEARCH HISTORY TRACKING
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    normalized_query TEXT, -- Keyword for grouping (lowercase, trimmed)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    results_count INTEGER DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_search_history_normalized ON search_history(normalized_query);
CREATE INDEX IF NOT EXISTS idx_search_history_at ON search_history(searched_at);

-- 3. MARKETING CAMPAIGNS
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'whatsapp',
    template_name TEXT,
    recipient_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AGGREGATED VIEWS FOR PERFORMANCE

-- Most Viewed Products (Last 30 Days)
CREATE OR REPLACE VIEW view_top_products_30d AS
SELECT 
    p.id, 
    p.name, 
    p.slug,
    p.images->>0 as thumbnail,
    COUNT(pv.id) as view_count
FROM products p
JOIN product_views pv ON p.id = pv.product_id
WHERE pv.viewed_at > (now() - interval '30 days')
GROUP BY p.id
ORDER BY view_count DESC;

-- Trending Searches
CREATE OR REPLACE VIEW view_trending_searches AS
SELECT 
    normalized_query as keyword, 
    COUNT(*) as search_count,
    MAX(searched_at) as last_searched
FROM search_history
WHERE searched_at > (now() - interval '7 days')
GROUP BY normalized_query
ORDER BY search_count DESC;

-- RLS CONFIGURATIONS
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can view analytics data
CREATE POLICY "Admin only select product_views" ON product_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin only select search_history" ON search_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admin only manage marketing" ON marketing_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Public can insert views/searches (via secure edge functions or actions)
CREATE POLICY "Public insert views" ON product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert searches" ON search_history FOR INSERT WITH CHECK (true);
