-- 1. Remove duplicate items keeping only the most recently updated one
DELETE FROM public.cart_items a
USING public.cart_items b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.product_id = b.product_id
  AND COALESCE(a.selected_size, 'none') = COALESCE(b.selected_size, 'none')
  AND COALESCE(a.selected_flavor, 'none') = COALESCE(b.selected_flavor, 'none')
  AND COALESCE(a.bundle_id, 'none') = COALESCE(b.bundle_id, 'none');

-- 2. Update existing NULL bundle_ids to a standard string
UPDATE public.cart_items SET bundle_id = 'standard' WHERE bundle_id IS NULL;

-- 3. Make bundle_id NOT NULL with a default of 'standard'
ALTER TABLE public.cart_items ALTER COLUMN bundle_id SET DEFAULT 'standard';
UPDATE public.cart_items SET bundle_id = 'standard' WHERE bundle_id IS NULL; -- double check
ALTER TABLE public.cart_items ALTER COLUMN bundle_id SET NOT NULL;

-- 4. Recreate the Unique Constraint (this will now work perfectly for 'standard' items)
ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_bundle_unique;

ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_selected_size_selected_flavor_key;

ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_bundle_unique 
UNIQUE (user_id, product_id, selected_size, selected_flavor, bundle_id);
