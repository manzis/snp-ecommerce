-- SQL Migration for Orders Feature
-- Ensures tables exist and adds an RPC for atomic order creation.

-- 1. Ensure order_status enum includes all necessary statuses
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'failed');
    ELSE
        -- Add 'failed' if it doesn't exist
        BEGIN
            ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'failed';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 2. Ensure orders table exists with correct structure
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  mrp_amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  shipping_amount NUMERIC(10, 2) DEFAULT 0,
  status order_status DEFAULT 'pending' NOT NULL,
  shipping_address JSONB NOT NULL,
  contact_details JSONB NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure order_items table exists
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

-- 4. Create RPC for atomic order creation
CREATE OR REPLACE FUNCTION create_order_v1(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_mrp_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_shipping_address JSONB,
  p_contact_details JSONB,
  p_payment_method VARCHAR,
  p_items JSONB -- Array of {product_id, quantity, price, mrp, selected_size, selected_flavor}
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Insert the order
  INSERT INTO orders (
    user_id, total_amount, mrp_amount, discount_amount, 
    shipping_amount, status, shipping_address, contact_details, payment_method
  ) VALUES (
    p_user_id, p_total_amount, p_mrp_amount, p_discount_amount, 
    p_shipping_amount, 'pending', p_shipping_address, p_contact_details, p_payment_method
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

-- 5. RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Clear existing if needed or just use IF NOT EXISTS pattern in policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view items of their own orders" ON order_items;
CREATE POLICY "Users can view items of their own orders" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
