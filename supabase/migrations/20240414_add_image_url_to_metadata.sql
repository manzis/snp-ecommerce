-- Add image_url column to brands, categories, and sellers tables
-- Description: Enables rich UI dropdowns with logos/icons in the admin panel.

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Optional: Add comments to columns for clarity in Supabase UI
COMMENT ON COLUMN public.brands.image_url IS 'URL to the brand logo or representative image';
COMMENT ON COLUMN public.categories.image_url IS 'URL to the category icon or thumbnail';
COMMENT ON COLUMN public.sellers.image_url IS 'URL to the seller logo or profile image';
