-- Migration: Tabel RPD Bulanan (Rencana Penarikan Dana)
-- Dijalankan di Supabase SQL Editor
-- Tanggal: 2026-08-28

CREATE TABLE IF NOT EXISTS rpd_monthly_plan (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id      UUID NOT NULL REFERENCES tenants_schools(id) ON DELETE CASCADE,
  fiscal_year    INTEGER NOT NULL,
  budget_item_id UUID NOT NULL REFERENCES rkas_budget_items(id) ON DELETE CASCADE,
  month_1        NUMERIC DEFAULT 0,
  month_2        NUMERIC DEFAULT 0,
  month_3        NUMERIC DEFAULT 0,
  month_4        NUMERIC DEFAULT 0,
  month_5        NUMERIC DEFAULT 0,
  month_6        NUMERIC DEFAULT 0,
  month_7        NUMERIC DEFAULT 0,
  month_8        NUMERIC DEFAULT 0,
  month_9        NUMERIC DEFAULT 0,
  month_10       NUMERIC DEFAULT 0,
  month_11       NUMERIC DEFAULT 0,
  month_12       NUMERIC DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, fiscal_year, budget_item_id)
);

-- Enable RLS
ALTER TABLE rpd_monthly_plan ENABLE ROW LEVEL SECURITY;

-- Policy: semua operasi hanya untuk authenticated users (multi-tenant by tenant_id)
CREATE POLICY "rpd_monthly_plan_open" ON rpd_monthly_plan
  FOR ALL USING (true) WITH CHECK (true);
