-- Migration: Add optional alt_phone and delivery_notes columns to user_addresses

ALTER TABLE user_addresses
ADD COLUMN IF NOT EXISTS alt_phone VARCHAR(50);

ALTER TABLE user_addresses
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

COMMENT ON COLUMN user_addresses.alt_phone IS 'Optional alternative phone number for delivery contact';
COMMENT ON COLUMN user_addresses.delivery_notes IS 'Optional delivery notes or special dropoff instructions';
