-- Daftarkan akun master Superadmin langsung ke database cloud Supabase
INSERT INTO tenants_schools (npsn, school_name, education_level, district_name, province_name, het_zone, license_type, license_status, license_expiry_date)
VALUES (
  '00000000', 
  'Superadmin IBRA HQ', 
  'SD', 
  'IBRA Digital Engineering HQ', 
  'Maluku Utara', 
  5, 
  'district_enterprise', 
  'active', 
  '2099-12-31'
)
ON CONFLICT (npsn) 
DO UPDATE SET license_status = 'active';
