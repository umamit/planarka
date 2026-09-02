import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-900">PLANARKA 2026</span>
            <span className="text-zinc-300">•</span>
            <span>Update Regulasi Permendikdasmen No. 8/2026</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl leading-tight">
            Perencanaan Dana BOS & Pre-ARKAS Tanpa Risiko Mis-Alokasi
          </h1>
          <p className="mt-5 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Simulator pergeseran anggaran sekolah, kalkulator pengadaan buku Kurikulum Merdeka (CP 46/2025), dan validator batas honor guru Non-ASN sebelum diajukan ke dinas pendidikan.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-11 px-6 font-medium gap-2">
                <span>Mulai Perencanaan Sekolah</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/kalkulator-buku" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-11 px-6 border-zinc-300 text-zinc-800 hover:bg-zinc-50 gap-2">
                <FileSpreadsheet className="h-4 w-4 text-zinc-600" />
                <span>Lembar Kerja Buku (Penerbit Andi)</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Real App Preview Mockup Container */}
        <div className="mt-12 rounded-xl border border-zinc-200 bg-zinc-900 p-2 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-950/80 rounded-t-lg">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 mx-auto">planarka.uk/dashboard/pergeseran-anggaran</span>
          </div>

          <div className="bg-zinc-950 p-4 sm:p-6 text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-bold text-white block">SD NEGERI BOBONG — TALIABU BARAT</span>
                <span className="text-[10px] text-zinc-400 font-mono">Pagu BOSP 2026: Rp 353.280.000 (315 Siswa)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Honor Non-ASN: 18.2% (Aman &lt;20%)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Zero-Balance: Balance
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-zinc-300">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">BELANJA BUKU (CP 46/2025)</span>
                <span className="text-sm font-bold text-white mt-1 block">Rp 35.328.000</span>
                <span className="text-[9px] text-emerald-400 mt-1 block">10.0% Pagu Wajib (Terpenuhi)</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">HONOR GURU NON-ASN</span>
                <span className="text-sm font-bold text-white mt-1 block">Rp 64.296.000</span>
                <span className="text-[9px] text-zinc-400 mt-1 block">Permendikdasmen No. 8/2026</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">DAYA & JASA RUTIN (PLN/WIFI)</span>
                <span className="text-sm font-bold text-white mt-1 block">Rp 18.000.000</span>
                <span className="text-[9px] text-amber-400 mt-1 block">Terkunci 12 Bulan</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
