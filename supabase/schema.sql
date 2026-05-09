-- Supabase Schema Setup for eCommerce Platform
-- Note: Execute this in your Supabase SQL Editor to set up the tables.

-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 SELLERS TABLE
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3, 1) DEFAULT 0,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Core Search Details
  name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  
  -- Pricing & Stats
  original_price VARCHAR(50), 
  discounted_price VARCHAR(50),
  discount_percentage VARCHAR(20),
  rating NUMERIC(3, 1) DEFAULT 0,
  reviews_count VARCHAR(50),

  -- Stock Details
  stock_status VARCHAR(50) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'pre_order')),
  
  -- Media (Array of Image URLs)
  images JSONB DEFAULT '[]'::jsonb, 
  highlights JSONB DEFAULT '[]'::jsonb, 
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCT INFO TABLE
CREATE TABLE IF NOT EXISTS product_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  description TEXT,
  ingredients_image VARCHAR(1000),
  manufacture_info JSONB DEFAULT '{}'::jsonb,
  other_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCT SIZES TABLE
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_label VARCHAR(100) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCT FLAVOURS TABLE
CREATE TABLE IF NOT EXISTS product_flavours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  flavour_name VARCHAR(255) NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for lookup speed and SEO routing
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON sellers(slug);

-- RLS Configurations (Read-only setup)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_flavours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_info" ON product_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_flavours" ON product_flavours FOR SELECT USING (true);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  text TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL,
  image VARCHAR(1000),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PRODUCT QA TABLE
CREATE TABLE IF NOT EXISTS product_qa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for lookup speed
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_qa_product_id ON product_qa(product_id);

-- RLS Configurations
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access to product_qa" ON product_qa FOR SELECT USING (true);

-- 8. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_size VARCHAR(100),
  selected_flavor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id, selected_size, selected_flavor)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- 9. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  email TEXT,
  profession VARCHAR(255),
  dob DATE,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  addresses JSONB DEFAULT '[]'::jsonb,
  address_data JSONB, -- Consolidated primary address storage
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 9.1 PROFILE CREATION UTILITY (Deprecated Trigger for verified-only logic)
-- Profile creation is now handled in the application logic (AuthContext) 
-- to ensure only successfully logged-in/verified users get a profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger disabled to fulfill 'only create on successful login' requirement.
  -- Logic moved to ensureUserProfileExistsAction in addressActions.ts
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.2 AUTOMATIC ADDRESS SYNC TRIGGER
-- Syncs phone and contact details to profile when an address is saved
CREATE OR REPLACE FUNCTION public.sync_profile_from_address()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    phone = COALESCE(NEW.phone, phone),
    full_name = COALESCE(NEW.first_name || ' ' || NEW.last_name, full_name),
    email = COALESCE(NEW.email, email),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.5 USER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    pincode VARCHAR(50) NOT NULL,
    street VARCHAR(255) NOT NULL,
    area VARCHAR(255),
    address_line_1 TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    type VARCHAR(20) CHECK (type IN ('Home', 'Work', 'Other')) DEFAULT 'Home',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_address_saved ON public.user_addresses;
CREATE TRIGGER on_address_saved
  AFTER INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_address();

-- 10. ORDERS TABLE
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending', 'confirmed', 'processing', 'shipped', 'in_transit', 
        'out_for_delivery', 'delivered', 'shipment_arrived', 'returned', 'failed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  mrp_amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  shipping_amount NUMERIC(10, 2) DEFAULT 0,
  discount_on_mrp NUMERIC(10, 2) DEFAULT 0,
  coupon_discount NUMERIC(10, 2) DEFAULT 0,
  coupon_code VARCHAR(100),
  cod_fees NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  status order_status DEFAULT 'pending' NOT NULL,
  shipping_address JSONB NOT NULL,
  contact_details JSONB NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  carrier_name VARCHAR(100),
  tracking_number VARCHAR(100),
  status_updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  mrp NUMERIC(10, 2) NOT NULL,
  selected_size VARCHAR(100),
  selected_flavor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items of their own orders" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 12. RPC FUNCTIONS
CREATE OR REPLACE FUNCTION create_order_v2(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_mrp_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_discount_on_mrp NUMERIC,
  p_coupon_discount NUMERIC,
  p_coupon_code VARCHAR,
  p_cod_fees NUMERIC,
  p_tax_amount NUMERIC,
  p_shipping_address JSONB,
  p_contact_details JSONB,
  p_payment_method VARCHAR,
  p_items JSONB -- Array of {product_id, quantity, price, mrp, selected_size, selected_flavor}
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_initial_status order_status;
  v_status_updates JSONB;
BEGIN
  v_initial_status := (CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'confirmed' END)::order_status;
  
  -- Create the first status log
  v_status_updates := jsonb_build_array(
     jsonb_build_object(
        'status', v_initial_status,
        'message', 'Order placed successfully.',
        'date', (now() AT TIME ZONE 'Asia/Kathmandu')::text
     )
  );

  -- 1. Insert the order with extended pricing and updates
  INSERT INTO orders (
    user_id, total_amount, mrp_amount, discount_amount, 
    shipping_amount, discount_on_mrp, coupon_discount, 
    coupon_code, cod_fees, tax_amount,
    status, shipping_address, contact_details, payment_method, status_updates
  ) VALUES (
    p_user_id, p_total_amount, p_mrp_amount, p_discount_amount, 
    p_shipping_amount, p_discount_on_mrp, p_coupon_discount,
    p_coupon_code, p_cod_fees, p_tax_amount,
    v_initial_status, p_shipping_address, p_contact_details, p_payment_method, v_status_updates
  ) RETURNING id INTO v_order_id;

  -- 2. Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id, product_id, quantity, price, mrp, selected_size, selected_flavor
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      (v_item->>'mrp')::NUMERIC,
      v_item->>'selected_size',
      v_item->>'selected_flavor'
    );
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status order_status,
  p_message TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE orders
  SET 
    status = p_new_status,
    status_updates = status_updates || jsonb_build_object(
      'status', p_new_status,
      'message', p_message,
      'date', (now() AT TIME ZONE 'Asia/Kathmandu')::text
    )
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. STORAGE BUCKETS AND RLS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
