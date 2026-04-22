-- Add email and address_data columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_data JSONB;

-- Comment on columns for clarity
COMMENT ON COLUMN profiles.email IS 'Primary contact email for the profile';
COMMENT ON COLUMN profiles.address_data IS 'Default shipping address metadata (street, area, city, pincode, etc.)';
