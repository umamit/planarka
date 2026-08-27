<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Master Architecture & Knowledge Base: PLANARKA

## 1. Identitas Produk & Kepemilikan (Brand Architecture)
* **Nama Produk Utama**: **PLANARKA** (Planner ARKAS & Pre-ARKAS Budget Simulator).
* **Ekosistem**: Modul Premium Sekolah Pintar Suite.
* **Developer & Legal Owner**: **IBRA Digital Engineering**.
* **Hak Cipta**: Hak cipta kode sumber, UI, logika bisnis, dan arsitektur database melekat 100% pada IBRA Digital Engineering.

### Referensi Cadangan Nama Produk:
1. **Opsi 1: Standar Kedinasan & Pemerintahan**
   - **ARKAPINTAR**: Anggaran & Rencana Kegiatan Sekolah Pintar.
   - **BOSPRA / BOSPRATAMA**: BOS Perencanaan, Rekonsiliasi, dan Akurasi Utama.
   - **SIMAK BOS**: Sistem Informasi Manajemen Anggaran & Kepatuhan BOS.
2. **Opsi 2: SaaS Enterprise & Teknologi Tinggi**
   - **PLANARKA** (Terpilih): Planner ARKAS.
   - **KORASON**: Komputasi Rencana Anggaran Sekolah Online.
3. **Opsi 3: Ekosistem Keluarga Produk (IBRA Suite)**
   - **IBRA EduFinance**: Modul BOS & Pre-ARKAS Planner.
   - **IBRA RKAS Engine**: Mesin Validasi & Simulasi Anggaran Sekolah.

---

## 2. Tech Stack & Standar Rekayasa
* **Framework**: Next.js 15 (App Router, Server & Client Components).
* **Styling**: Tailwind CSS dengan standar estetika Apple Human Interface Guidelines (Enterprise Clean, Minimalist, White Neutral Borders, Zero Colored Border Strips).
* **Database & Auth**: Supabase PostgreSQL dengan Row Level Security (RLS) Multi-Tenant berbasis NPSN sekolah.
* **Icons**: Lucide React (Standard Web Icons).
* **Zero Unicode Emojis**: Dilarang keras menggunakan karakter emoji Unicode di seluruh codebase, UI, notifikasi, dan skrip.
* **Batas Panjang File**: Setiap file komponen, modul logika, konstanta, atau stylesheet wajib **<= 150 baris** (Single Responsibility Principle).

---

## 3. Modul Bisnis & Kepatuhan Regulasi (Permendikbudristek No. 63/2022 & 63/2023)
1. **Kalkulator Pagu & Penyaluran Bertahap**:
   - Pagu BOS Reguler = Siswa Riil x Satuan Biaya Wilayah (Default Zona 5 Kab. Pulau Taliabu/Maluku Utara).
   - Penyaluran Tahap 1 (50%) + SiLPA tahun lalu; Penyaluran Tahap 2 (50%).
2. **Kalkulator Pengadaan Buku HET Kurikulum Merdeka**:
   - Master katalog buku Fase A (Kls 1-2), B (Kls 3-4), C (Kls 5-6), D (Kls 7-9).
   - Zonasi HET 1 s.d 5 + Estimasi Ongkir SIPLah per eksemplar.
   - *Smart Guard Alert*: Peringatan dini jika belanja buku melampaui rekomendasi 20% pagu.
3. **Simulator Pergeseran Pre-ARKAS (Zero-Balance Validator)**:
   - Pengujian mutasi belanja real-time sebelum diajukan ke dinas/ARKAS.
   - Proteksi saldo anti-defisit/minus.
   - Validasi batas maksimal belanja honor guru Non-ASN (maksimal 50%).
4. **Validasi Honor Guru Honorer (Pasal 40)**:
   - Validasi 4 kriteria sah: Status Non-ASN, Aktif di Dapodik, Memiliki NUPTK resmi, dan Belum menerima sertifikasi TPG (Pencegah temuan TGR BPK).
5. **Daya & Jasa Terkunci (12 Bulan)**:
   - Penguncian anggaran rutin listrik PLN, internet sekolah, air, dan langganan software agar tidak tergeser.
6. **Mitigasi Penalti PMK Kemenkeu**:
   - Pengaman sisa saldo Tahap 1 (>20%) dan batas waktu pelaporan cut-off 31 Juli untuk mencegah pemotongan penyaluran Tahap 2.
7. **Rekonsiliasi Kas BKU & Pengawasan Batas Brankas**:
   - Kontrol kas tunai di brankas maksimal Rp 10.000.000 untuk kesiapan audit fisik (Cash Opname).
   - Pengawasan saldo titipan pajak PPN/PPh terutang.
8. **Generator SPJB / SPTJM Tanggung Jawab Mutlak**:
   - Dokumen legalitas PDF bermaterai Rp 10.000 bertanda tangan Kepala Sekolah sebagai syarat salur dana.
9. **Generator Surat Permohonan Pengesahan ke Dinas Pendidikan**:
   - Surat pengantar resmi ke Tim Manajemen BOS Dinas Pendidikan Kabupaten/Kota.
10. **Sistem Lisensi Komersial Multi-Tenant**:
    - Validasi kunci lisensi unik per NPSN (`IBRA-BOS-2026-NPSN-XXXX`) untuk langganan tahunan (Tier SD / SMP).
11. **Parsir Impor Dapodik**:
    - Ekstrak otomatis jumlah siswa dan rombel dari file unduhan Dapodik.
12. **Mode Presentasi Pleno (Proyektor)**:
    - Layar rapat komite sekolah dengan fitur penyembunyian saldo sensitif.
13. **Ekspor Lembar Kerja Pleno**:
    - PDF Berita Acara Rapat Pleno dan Excel (.xlsx) dengan struktur kode rekening ARKAS.
