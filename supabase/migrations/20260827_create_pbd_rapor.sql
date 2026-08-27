-- Buat tabel untuk menyimpan nilai rapor pendidikan (PBD) sekolah
CREATE TABLE IF NOT EXISTS pbd_rapor_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants_schools(id) ON DELETE CASCADE,
    fiscal_year INTEGER DEFAULT 2026,
    indicator_code VARCHAR(50) NOT NULL,
    indicator_name VARCHAR(255) NOT NULL,
    score_value NUMERIC DEFAULT 0,
    score_status VARCHAR(50) DEFAULT 'kuning', -- merah, kuning, hijau
    recommendation_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, fiscal_year, indicator_code)
);
