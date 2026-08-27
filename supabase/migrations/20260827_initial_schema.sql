-- Migration: Smart BOS & RKAS Planner (Sekolah Pintar Suite)
-- Author: IBRA Digital Engineering
-- Description: Multi-tenant database schema with RLS for BOS Management

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: Tenants / Schools
CREATE TABLE IF NOT EXISTS tenants_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npsn VARCHAR(20) UNIQUE NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    education_level VARCHAR(10) NOT NULL CHECK (education_level IN ('SD', 'SMP')),
    district_name VARCHAR(100) NOT NULL DEFAULT 'Kabupaten Pulau Taliabu',
    province_name VARCHAR(100) NOT NULL DEFAULT 'Maluku Utara',
    het_zone INTEGER NOT NULL DEFAULT 5 CHECK (het_zone BETWEEN 1 AND 5),
    license_type VARCHAR(50) NOT NULL DEFAULT 'annual_premium',
    license_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (license_status IN ('active', 'trial', 'expired')),
    license_expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: User Profiles with Multi-Tenant Binding
CREATE TABLE IF NOT EXISTS users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'kepala_sekolah', 'bendahara')),
    phone_number VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table: BOS Allocations (Pagu Dana BOS per Sekolah)
CREATE TABLE IF NOT EXISTS bos_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    real_student_count INTEGER NOT NULL DEFAULT 0,
    unit_cost_per_student NUMERIC(15, 2) NOT NULL DEFAULT 0,
    bos_regular_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    bos_performance_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    silpa_previous_year NUMERIC(15, 2) NOT NULL DEFAULT 0,
    phase_1_allocation NUMERIC(15, 2) NOT NULL DEFAULT 0,
    phase_2_allocation NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, fiscal_year)
);

-- 4. Table: Master Books Catalog (Kurikulum Merdeka Kemendikbudristek)
CREATE TABLE IF NOT EXISTS books_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum VARCHAR(50) NOT NULL DEFAULT 'Kurikulum Merdeka',
    phase VARCHAR(10) NOT NULL CHECK (phase IN ('A', 'B', 'C', 'D')),
    class_grade INTEGER NOT NULL CHECK (class_grade BETWEEN 1 AND 9),
    subject_title VARCHAR(255) NOT NULL,
    book_type VARCHAR(50) NOT NULL CHECK (book_type IN ('Siswa', 'Guru')),
    publisher VARCHAR(100) NOT NULL DEFAULT 'Kemendikbudristek',
    het_zone_1 NUMERIC(12, 2) NOT NULL,
    het_zone_2 NUMERIC(12, 2) NOT NULL,
    het_zone_3 NUMERIC(12, 2) NOT NULL,
    het_zone_4 NUMERIC(12, 2) NOT NULL,
    het_zone_5 NUMERIC(12, 2) NOT NULL,
    isbn VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table: Book Procurement Items
CREATE TABLE IF NOT EXISTS book_procurement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    book_id UUID NOT NULL REFERENCES books_catalog(id) ON DELETE CASCADE,
    rombel_count INTEGER NOT NULL DEFAULT 1,
    student_count INTEGER NOT NULL DEFAULT 0,
    exemplar_needed INTEGER NOT NULL DEFAULT 0,
    het_applied NUMERIC(12, 2) NOT NULL,
    shipping_cost_per_item NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: RKAS Budget Items & Shifting Simulations
CREATE TABLE IF NOT EXISTS rkas_budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    snp_code VARCHAR(10) NOT NULL,
    snp_name VARCHAR(255) NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    activity_name TEXT NOT NULL,
    initial_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    shifted_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    final_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_non_asn_honor BOOLEAN NOT NULL DEFAULT FALSE,
    is_routine_utility BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Table: Honor Recipients Validation (Pasal 40 Permendikbudristek)
CREATE TABLE IF NOT EXISTS honor_recipients_validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    nuptk VARCHAR(30) NOT NULL,
    is_registered_dapodik BOOLEAN NOT NULL DEFAULT TRUE,
    is_non_asn BOOLEAN NOT NULL DEFAULT TRUE,
    has_certification_tpg BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_honor_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    months_count INTEGER NOT NULL DEFAULT 12,
    total_honor_annual NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tenants_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bos_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rkas_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_recipients_validation ENABLE ROW LEVEL SECURITY;
