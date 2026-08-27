"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils";
import { Tv, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function PlenoPresentationPage() {
  const [hideSensitive, setHideSensitive] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mode Presentasi Rapat Pleno (Layar Proyektor)</h1>
          <p className="text-xs text-zinc-500 mt-1">Tampilan Bersih & Aman Privasi untuk Rapat Bersama Dewan Guru & Komite Sekolah</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHideSensitive(!hideSensitive)}
        >
          {hideSensitive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {hideSensitive ? "Tampilkan Saldo Detail" : "Sembunyikan Privasi"}
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-900 text-white p-8 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pagu Anggaran Tahun 2026</span>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              {hideSensitive ? "Rp 278.***.***" : formatRupiah(278400000)}
            </div>
          </div>
          <Badge variant="success" className="bg-emerald-950/80 text-emerald-300 border-emerald-800 text-xs px-3 py-1">
            Status: Siap Disahkan
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-zinc-800 pt-6">
          <div>
            <div className="text-xs text-zinc-400">Total Buku Kurikulum Merdeka</div>
            <div className="text-xl font-bold mt-0.5">380 Eksemplar</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">100% Memenuhi Kebutuhan Siswa</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Kepatuhan Honor Guru Non-ASN</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">25.8% (Aman &lt; 50%)</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Semua Guru Memiliki NUPTK</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Keseimbangan Pergeseran</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">Zero Balance (Pas)</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Tidak Ada Akun Defisit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
