import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-24 border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/50 via-white to-white">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 text-xs text-zinc-700 shadow-sm mb-6">
          <Badge variant="info" className="py-0.5 px-2 text-[10px]">
            PLANARKA 2026
          </Badge>
          <span className="font-medium text-zinc-600">Planner ARKAS & Pre-ARKAS Budget Simulator</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl leading-[1.15]">
          Simulasi Anggaran Sekolah & Pengadaan Buku <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-transparent">Presisi Tanpa Mis-Alokasi</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
          Platform perencanaan pra-ARKAS resmi untuk SD dan SMP. Dilengkapi Simulator Pergeseran Anggaran Zero-Balance, Lembar Kerja Buku CP 46/2025 Penerbit Andi, serta Validasi Honor Guru Honorer Sesuai Permendikdasmen No. 8/2026.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-11 px-6 shadow-md hover:shadow-lg transition-all gap-2">
              <span>Buka Simulator RKAS</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/kalkulator-buku" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full h-11 px-6 border-zinc-300 hover:bg-zinc-50 gap-2">
              <BookOpen className="h-4 w-4 text-zinc-700" />
              <span>Kalkulator Buku (CP 46/2025)</span>
            </Button>
          </Link>
        </div>

        {/* Feature Check List Highlights */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Sesuai Permendikdasmen No. 8/2026
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Batas Honor Negeri 20% / Swasta 40%
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Siap Salin ke ARKAS 4
          </span>
        </div>
      </div>
    </section>
  );
}
