-- SQL Migration to add tracking carrier details to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
