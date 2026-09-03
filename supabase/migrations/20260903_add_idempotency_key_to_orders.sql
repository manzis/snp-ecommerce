-- Migration script to add idempotency_key support to orders table for preventing duplicate orders

-- 1. Add idempotency_key column to orders table if not exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);

-- 2. Create index on idempotency_key for fast lookup and deduplication
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 3. Update create_order_v3 RPC function to accept p_idempotency_key and avoid duplicate creation
CREATE OR REPLACE FUNCTION create_order_v3(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_mrp_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_discount_on_mrp NUMERIC,
  p_coupon_discount NUMERIC,
  p_coupon_code VARCHAR,
  p_bundle_discount NUMERIC DEFAULT 0,
  p_cod_fees NUMERIC DEFAULT 0,
  p_tax_amount NUMERIC DEFAULT 0,
  p_shipping_address JSONB DEFAULT '{}'::jsonb,
  p_contact_details JSONB DEFAULT '{}'::jsonb,
  p_payment_method VARCHAR DEFAULT 'COD',
  p_payment_screenshot_url TEXT DEFAULT NULL,
  p_payment_remarks TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb,
  p_idempotency_key VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_initial_status order_status;
  v_status_updates JSONB;
BEGIN
  -- Idempotency check: Return existing order ID if matching idempotency_key already exists
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF v_order_id IS NOT NULL THEN
      RETURN v_order_id;
    END IF;
  END IF;

  v_initial_status := (CASE WHEN LOWER(p_payment_method) = 'cod' THEN 'pending' ELSE 'confirmed' END)::order_status;
  
  -- Create the first status log
  v_status_updates := jsonb_build_array(
     jsonb_build_object(
        'status', v_initial_status,
        'message', 'Order placed successfully.',
        'date', (now() AT TIME ZONE 'Asia/Kathmandu')::text
     )
  );

  -- 1. Insert the order with pricing breakdowns, payment details, and idempotency key
  INSERT INTO orders (
    user_id, total_amount, mrp_amount, discount_amount, 
    shipping_amount, discount_on_mrp, coupon_discount, 
    coupon_code, bundle_discount, cod_fees, tax_amount,
    status, shipping_address, contact_details, payment_method,
    payment_screenshot_url, payment_remarks, status_updates, idempotency_key
  ) VALUES (
    p_user_id, p_total_amount, p_mrp_amount, p_discount_amount, 
    p_shipping_amount, p_discount_on_mrp, p_coupon_discount,
    p_coupon_code, COALESCE(p_bundle_discount, 0), p_cod_fees, p_tax_amount,
    v_initial_status, p_shipping_address, p_contact_details, p_payment_method,
    p_payment_screenshot_url, p_payment_remarks, v_status_updates, p_idempotency_key
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
