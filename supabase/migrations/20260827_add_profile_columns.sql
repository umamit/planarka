-- Add missing headmaster and address columns to tenants_schools for complete Supabase storage
ALTER TABLE tenants_schools 
ADD COLUMN IF NOT EXISTS headmaster_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS headmaster_nip VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT;
