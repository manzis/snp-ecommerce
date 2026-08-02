-- Create sales_offers table
CREATE TABLE IF NOT EXISTS public.sales_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    banner_image TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('AMOUNT', 'PERCENTAGE')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sales_offers_products table (Many-to-Many junction)
CREATE TABLE IF NOT EXISTS public.sales_offers_products (
    sale_id UUID NOT NULL REFERENCES public.sales_offers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (sale_id, product_id)
);

-- Enable RLS
ALTER TABLE public.sales_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_offers_products ENABLE ROW LEVEL SECURITY;

-- Policies for sales_offers
CREATE POLICY "Enable read access for all users" ON public.sales_offers
    FOR SELECT USING (true);

CREATE POLICY "Enable full access for authenticated users only" ON public.sales_offers
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for sales_offers_products
CREATE POLICY "Enable read access for all users" ON public.sales_offers_products
    FOR SELECT USING (true);

CREATE POLICY "Enable full access for authenticated users only" ON public.sales_offers_products
    FOR ALL USING (auth.role() = 'authenticated');

-- Create an index for quick lookup of active sales
CREATE INDEX idx_sales_offers_active_ends_at ON public.sales_offers (is_active, ends_at);
CREATE INDEX idx_sales_offers_products_product_id ON public.sales_offers_products (product_id);
