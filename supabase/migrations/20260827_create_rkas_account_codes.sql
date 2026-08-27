-- 1. Buat Tabel Master Kode Rekening Belanja BOSP 2026
CREATE TABLE IF NOT EXISTS rkas_account_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    default_snp_code VARCHAR(20) DEFAULT 'SNP-5',
    is_honor_non_asn BOOLEAN DEFAULT false,
    is_maintenance_sarpras BOOLEAN DEFAULT false,
    is_book_procurement BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan RLS Policy agar dapat dibaca oleh publik secara online
ALTER TABLE rkas_account_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for account codes" ON rkas_account_codes;
CREATE POLICY "Allow public read access for account codes" ON rkas_account_codes
    FOR SELECT TO public USING (true);

-- 3. Isi Data Awal (Seeding) Kode Belanja Utama BOSP 2026
INSERT INTO rkas_account_codes (account_code, account_name, default_snp_code, is_honor_non_asn, is_maintenance_sarpras, is_book_procurement)
VALUES
    ('5.2.05.01.01.0001', 'Belanja Modal Aset Tetap Lainnya - Buku Teks Utama Kurikulum Merdeka', 'SNP-5', false, false, true),
    ('5.1.02.02.01.0026', 'Belanja Jasa Tenaga Kependidikan - Pembayaran Honorarium Guru Non-ASN', 'SNP-4', true, false, false),
    ('5.1.02.03.02.0035', 'Belanja Jasa Pemeliharaan Bangunan - Perawatan Ringan Ruang Kelas', 'SNP-5', false, true, false),
    ('5.1.02.02.01.0061', 'Belanja Langganan Daya dan Jasa - Air, Listrik, Telepon, Internet', 'SNP-7', false, true, false),
    ('5.1.02.01.01.0024', 'Belanja Alat/Bahan untuk Kegiatan Kantor - Alat Tulis Kantor (ATK)', 'SNP-6', false, false, false),
    ('5.2.02.10.02.0003', 'Belanja Modal Peralatan dan Mesin - Komputer, Laptop, Printer', 'SNP-5', false, true, false),
    ('5.1.02.01.01.0052', 'Belanja Bahan Habis Pakai Pembelajaran - Cetak dan Penggandaan Soal', 'SNP-1', false, false, false),
    ('5.1.02.02.01.0014', 'Belanja Jasa Penyelenggaraan Acara - Transportasi dan Konsumsi Guru', 'SNP-6', false, false, false),
    ('5.1.02.02.01.0062', 'Belanja Langganan Jasa Informasi - Hosting, Domain, Sewa Cloud Server Website Sekolah', 'SNP-7', false, true, false),
    ('5.1.02.03.02.0088', 'Belanja Jasa Pemeliharaan Aplikasi - Pemeliharaan Jasa IT & Maintenance Website Sekolah', 'SNP-7', false, true, false)
ON CONFLICT (account_code) DO NOTHING;
