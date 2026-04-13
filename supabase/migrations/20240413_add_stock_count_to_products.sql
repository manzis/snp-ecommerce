-- Migration: Add stock_count to products table for inventory tracking
-- Created: 2024-04-13

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;

-- Optional: Comment on the column for documentation
COMMENT ON COLUMN products.stock_count IS 'Primary inventory count for simple products or summary count.';
