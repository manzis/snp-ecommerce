-- Migration script to add status updates logging to the orders table

-- 1. Add new JSONB column to track all timeline updates
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status_updates JSONB DEFAULT '[]'::jsonb;

-- 2. Update the create_order_v2 RPC function to initialize the updates natively
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


-- 3. Create an RPC to safely append a status update for admins and users
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
