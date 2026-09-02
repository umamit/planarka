import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, KeyRound } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-16 md:py-20 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Mulai Perencanaan RKAS & Dana BOS Sekarang
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
          Tingkatkan akurasi penyusunan anggaran sekolah Anda, hindari defisit saldo, dan pastikan seluruh pengeluaran mematuhi regulasi BOSP terbaru.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-11 px-6 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold gap-2">
              <span>Masuk Workspace Planner</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full h-11 px-6 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white gap-2">
              <KeyRound className="h-4 w-4 text-zinc-400" />
              <span>Portal Lisensi Lisensial</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
