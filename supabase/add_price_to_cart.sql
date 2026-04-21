-- Migration: Add price columns to cart_items for persistence
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);

-- Update existing items to have a fallback price from their products (one-time cleanup)
UPDATE public.cart_items ci
SET 
  price = CAST(REPLACE(REPLACE(p.discounted_price, 'Rs.', ''), ',', '') AS NUMERIC),
  original_price = CAST(REPLACE(REPLACE(p.original_price, 'Rs.', ''), ',', '') AS NUMERIC)
FROM public.products p
WHERE ci.product_id = p.id AND ci.price IS NULL;

-- Standardize constraints
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_bundle_unique;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_bundle_unique 
UNIQUE (user_id, product_id, selected_size, selected_flavor, bundle_id, bundle_discount);
