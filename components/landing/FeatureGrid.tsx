import React from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { 
  ArrowLeftRight, 
  BookOpen, 
  UserCheck, 
  Lock, 
  Receipt, 
  FileSpreadsheet 
} from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: ArrowLeftRight,
      title: "Simulator Pergeseran Pre-ARKAS",
      description: "Pengujian mutasi belanja real-time sebelum diajukan ke dinas/ARKAS 4. Dilengkapi fitur Zero-Balance Validator untuk mencegah saldo minus."
    },
    {
      icon: BookOpen,
      title: "Lembar Kerja Buku (CP 46/2025)",
      description: "Tabel pengadaan otomatis sesuai target 10% pagu wajib Juknis BOSP. Terintegrasi dengan katalog Penerbit Andi (Buku Siswa & Guru)."
    },
    {
      icon: UserCheck,
      title: "Validasi Honor Guru Non-ASN",
      description: "Pengunci otomatis batas honor Non-ASN maksimal 20% pagu (Sekolah Negeri) dan 40% pagu (Sekolah Swasta) sesuai Permendikdasmen No. 8/2026."
    },
    {
      icon: Lock,
      title: "Daya & Jasa Terkunci (12 Bulan)",
      description: "Proteksi anggaran rutin seperti listrik PLN, internet sekolah, air, dan langganan software agar tidak tergeser secara tidak sengaja."
    },
    {
      icon: Receipt,
      title: "Kalkulator Pajak & Rekonsiliasi Kas BKU",
      description: "Perhitungan PPN/PPh otomatis dan pengawasan batas kas tunai di brankas sekolah maksimal Rp 10.000.000 untuk kesiapan audit fisik."
    },
    {
      icon: FileSpreadsheet,
      title: "Ekspor Rapat Pleno & Excel ARKAS",
      description: "Cetak PDF Berita Acara Rapat Pleno Komite dan file Excel (.xlsx) dengan struktur kode rekening yang siap disalin ke ARKAS 4."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Solusi Perencanaan Lengkap & Otomatis
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
            Semua modul dirancang khusus untuk mempermudah tugas Kepala Sekolah, Tim Manajemen BOS, dan Bendahara dalam menyusun RKAS yang akurat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 transition-all hover:shadow-md border-zinc-200/90 bg-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-zinc-900">{item.title}</CardTitle>
                <CardDescription className="mt-2.5 text-xs leading-relaxed text-zinc-600">
                  {item.description}
                </CardDescription>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
