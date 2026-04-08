-- Migration script to add detailed pricing fields to the orders table
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to the orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_on_mrp NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS cod_fees NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;

-- 2. Update the create_order_v1 RPC function to handle these fields
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
BEGIN
  -- 1. Insert the order with extended pricing fields
  INSERT INTO orders (
    user_id, total_amount, mrp_amount, discount_amount, 
    shipping_amount, discount_on_mrp, coupon_discount, 
    coupon_code, cod_fees, tax_amount,
    status, shipping_address, contact_details, payment_method
  ) VALUES (
    p_user_id, p_total_amount, p_mrp_amount, p_discount_amount, 
    p_shipping_amount, p_discount_on_mrp, p_coupon_discount,
    p_coupon_code, p_cod_fees, p_tax_amount,
    (CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'confirmed' END)::order_status, p_shipping_address, p_contact_details, p_payment_method
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
