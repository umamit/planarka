import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { BrandFooter } from "@/components/shared/BrandFooter";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle2, 
  Receipt 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="info" className="mb-4">
            Modul Premium Sekolah Pintar Suite 2026
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
            Perencanaan Dana BOS & RKAS Lebih Presisi, Cepat, dan Bebas Temuan BPK
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 sm:text-lg leading-relaxed">
            Aplikasi simulator pergeseran anggaran, kalkulator pengadaan buku zonasi HET Kurikulum Merdeka, dan validator regulasi pra-ARKAS dirancang khusus untuk Kepala Sekolah dan Bendahara SD/SMP se-Indonesia.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Buka Simulator RKAS
              </Button>
            </Link>
            <Link href="/dashboard/kalkulator-buku" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Hitung Pengadaan Buku HET
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="bg-zinc-50/50 py-16 border-y border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Dirancang Berdasarkan Regulasi Resmi Permendikbudristek
            </h2>
            <p className="mt-2 text-xs text-zinc-500 max-w-xl mx-auto">
              Menghilangkan risiko kesalahan input di ARKAS dan menjamin kepatuhan audit inspektorat daerah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Kalkulator Buku HET Kurikulum Merdeka</CardTitle>
              <CardDescription className="mt-2 leading-relaxed">
                Perhitungan otomatis berdasarkan rombel dan jumlah siswa per fase (A-D) lengkap dengan HET Zona 1 s.d 5 dan guard batas 20% pagu.
              </CardDescription>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Simulator Pergeseran Pre-ARKAS</CardTitle>
              <CardDescription className="mt-2 leading-relaxed">
                Uji keseimbangan pergeseran anggaran secara real-time, validasi batas 20% honor guru non-ASN (negeri) / 40% (swasta) sesuai Juknis BOSP 2026, dan pencegahan akun minus sebelum pengesahan dinas.
              </CardDescription>
            </Card>

            <Card>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Ekspor Berita Acara & Excel ARKAS</CardTitle>
              <CardDescription className="mt-2 leading-relaxed">
                Hasilkan dokumen PDF Berita Acara Rapat Pleno bertanda tangan dan lembar kerja Excel siap input ke aplikasi ARKAS Kemendikbud.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
}
