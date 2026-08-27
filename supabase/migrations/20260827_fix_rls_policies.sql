-- 1. Matikan RLS atau buat policy public ALL untuk tabel rkas_budget_items
ALTER TABLE rkas_budget_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON rkas_budget_items;
DROP POLICY IF EXISTS "Allow public write access" ON rkas_budget_items;
DROP POLICY IF EXISTS "Allow public delete access" ON rkas_budget_items;

CREATE POLICY "Allow public access for all operations" ON rkas_budget_items
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 2. Terapkan kebijakan yang sama untuk tabel honor_recipients_validation
ALTER TABLE honor_recipients_validation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON honor_recipients_validation;
DROP POLICY IF EXISTS "Allow public write access" ON honor_recipients_validation;
DROP POLICY IF EXISTS "Allow public delete access" ON honor_recipients_validation;

CREATE POLICY "Allow public access for all validation operations" ON honor_recipients_validation
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
