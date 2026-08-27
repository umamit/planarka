# PLANARKA — Smart BOS & Pre-ARKAS Budget Simulator

**PLANARKA** (Planner ARKAS) adalah aplikasi web SaaS komersial bagian dari *Modul Premium Sekolah Pintar Suite* yang dikembangkan oleh **IBRA Digital Engineering**. Dirancang khusus untuk membantu Kepala Sekolah dan Bendahara BOS jenjang SD dan SMP dalam merencanakan, menghitung pengadaan buku Kurikulum Merdeka (HET Zonasi), dan menyimulasikan pergeseran anggaran secara akurat dan bebas dari temuan audit BPK/Inspektorat sebelum diinput ke ARKAS Kemendikbudristek.

---

## 🌟 Fitur Utama & Kepatuhan Regulasi (Permendikbudristek No. 63/2022 & 63/2023)

1. **Simulator Pergeseran Pre-ARKAS (Zero-Balance Validator)**:
   - Pengujian mutasi belanja real-time sebelum diajukan ke dinas/ARKAS.
   - Proteksi saldo anti-defisit/minus.
   - Validasi batas maksimal belanja honor guru Non-ASN (maksimal 50%).
2. **Kalkulator Pengadaan Buku Kurikulum Merdeka (Zonasi HET)**:
   - Database katalog buku resmi Fase A-D (Kelas 1-9) dengan HET Zona 1 s.d 5 + Estimasi Ongkir SIPLah.
   - Fleksibel riil sesuai asas otonom tanpa batasan kaku.
3. **Validasi 4 Syarat Sah Honor Guru Honorer (Pasal 40)**:
   - Memvalidasi status Non-ASN, keaktifan Dapodik, NUPTK resmi, dan non-sertifikasi TPG pencegah TGR.
4. **Mitigasi Penalti PMK Kemenkeu (PMK No. 204/PMK.07/2022)**:
   - Pengaman sisa saldo Tahap 1 (>20%) dan kalkulator denda keterlambatan pelaporan bertingkat (2%, 3%, 4%).
5. **Rekonsiliasi Kas BKU & Pengawasan Batas Brankas**:
   - Kontrol kas tunai di brankas maksimal Rp 10.000.000 untuk kesiapan audit fisik (Cash Opname) dan pengawasan pajak terutang.
6. **Generator Dokumen Legalitas PDF & Excel**:
   - Generator Surat Pertanggungjawaban Mutlak (SPJB/SPTJM) bermaterai Rp 10.000.
   - Generator Surat Permohonan Pengesahan Pergeseran ke Dinas Pendidikan (Kop Ganda Pemda + Sekolah).
   - Ekspor Berita Acara Rapat Pleno PDF & Lembar Kerja Excel (.xlsx) dengan struktur kode rekening ARKAS.
7. **Pusat Backup & Restore Offline-Ready**:
   - Autosave ke local storage dan unduh file cadangan mandiri (`.planarka.json`).
8. **Sistem Lisensi Komersial Multi-Tenant**:
   - Kunci lisensi unik per NPSN (`IBRA-BOS-2026-NPSN-XXXX`) untuk perlindungan SaaS tahunan.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Apple Human Interface Guidelines, Clean Neutral Styling)
- **Database & Auth**: [Supabase](https://supabase.com/) PostgreSQL with Row Level Security (RLS) Multi-Tenant
- **Icons**: [Lucide React](https://lucide.dev/) (Zero Unicode Emojis)
- **Export Engine**: `jspdf`, `jspdf-autotable`, `xlsx`

---

## 🛠️ Cara Menjalankan Lokal

```bash
# 1. Clone repository
git clone https://github.com/username/planarka.git
cd planarka

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev

# 4. Buka di browser
http://localhost:3000
```

---

## 📄 Hak Cipta & Lisensi

Hak Cipta & Desain Sistem &copy; 2026 **IBRA Digital Engineering**. Seluruh hak cipta dilindungi undang-undang.
