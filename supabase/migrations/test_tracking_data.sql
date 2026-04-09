/* 
   SNP Store - Schema-Correct Tracking Test Data
   This script inserts a dummy order into the 'orders' table.
   Note: Replace YOUR_USER_ID_HERE with a valid user UUID from your auth.users table.
*/

DO $$ 
DECLARE 
    v_order_id UUID := gen_random_uuid();
    -- Replace with a valid user ID from your auth.users table if known,
    -- otherwise this script might fail if RLS is strict.
    v_user_id UUID := (SELECT id FROM auth.users LIMIT 1); 
BEGIN
    -- 1. Insert into orders
    INSERT INTO public.orders (
        id,
        user_id, 
        total_amount, 
        mrp_amount, 
        discount_amount, 
        shipping_amount, 
        status, 
        shipping_address, 
        contact_details, 
        payment_method,
        status_updates,
        carrier_name,
        tracking_number
    ) VALUES (
        v_order_id,
        v_user_id,
        5000.00,
        5500.00,
        500.00,
        0.00,
        'in_transit',
        '{"address": "Test Street 123", "city": "Mumbai"}'::jsonb,
        '{"phone": "9876543210", "email": "test@example.com"}'::jsonb,
        'UPI',
        '[
            {"status": "PENDING", "message": "Order placed successfully. Waiting for warehouse confirmation.", "date": "2024-04-09T08:00:00Z"},
            {"status": "CONFIRMED", "message": "Order confirmed by warehouse. Preparing for dispatch.", "date": "2024-04-09T09:30:00Z"},
            {"status": "PROCESSING", "message": "Product has been packed and quality checked.", "date": "2024-04-09T11:00:00Z"},
            {"status": "SHIPPED", "message": "Package handed over to BlueDart at Mumbai Hub.", "date": "2024-04-09T14:45:00Z"},
            {"status": "IN_TRANSIT", "message": "Package is currently in transit to your local distribution center.", "date": "2024-04-09T18:20:00Z"}
        ]'::jsonb,
        'BlueDart Pro',
        'SNP-TRK-987654321'
    );

    -- 2. Insert into order_items (to provide the "title" and "image" the UI expects)
    INSERT INTO public.order_items (
        order_id,
        quantity,
        price,
        mrp,
        selected_size,
        selected_flavor
    ) VALUES (
        v_order_id,
        1,
        5000.00,
        5500.00,
        '5 lbs',
        'Chocolate'
    );

    RAISE NOTICE 'Order inserted with ID: %', v_order_id;
END $$;
