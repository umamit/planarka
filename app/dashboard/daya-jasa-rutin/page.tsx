"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils";
import { Zap, Lock } from "lucide-react";

interface UtilityItem {
  id: string;
  name: string;
  monthlyCost: number;
  monthsCount: number;
  provider: string;
}

const INITIAL_UTILITIES: UtilityItem[] = [
  { id: "u-1", name: "Langganan Listrik PLN Sekolah", monthlyCost: 850000, monthsCount: 12, provider: "PT PLN (Persero)" },
  { id: "u-2", name: "Akses Internet Sekolah (Starlink / ISP)", monthlyCost: 1500000, monthsCount: 12, provider: "Provider Internet" },
  { id: "u-3", name: "Air Bersih / PDAM", monthlyCost: 300000, monthsCount: 12, provider: "PDAM Daerah" },
  { id: "u-4", name: "Langganan Aplikasi & Domain Sekolah", monthlyCost: 250000, monthsCount: 12, provider: "Cloud Provider" },
];

export default function FixedUtilityBudgetPage() {
  const [utilities] = useState<UtilityItem[]>(INITIAL_UTILITIES);

  const totalAnnualCost = utilities.reduce((acc, u) => acc + u.monthlyCost * u.monthsCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Alokasi Anggaran Daya & Jasa Terkunci (12 Bulan)</h1>
          <p className="text-xs text-zinc-500 mt-1">Penguncian Biaya Operasional Rutin Sekolah Agar Tidak Terpotong Pergeseran Insidental</p>
        </div>
        <Badge variant="default">
          <Lock className="h-3 w-3 inline mr-1" />
          Budget Lock Aktif
        </Badge>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>Total Dana Rutin Terkunci untuk 1 Tahun Anggaran</CardDescription>
            <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalAnnualCost)}</CardTitle>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
              <th className="p-3 font-semibold">Komponen Daya & Jasa</th>
              <th className="p-3 font-semibold">Penyedia / Rekanan</th>
              <th className="p-3 font-semibold">Biaya Bulanan</th>
              <th className="p-3 font-semibold">Durasi</th>
              <th className="p-3 font-semibold text-right">Alokasi 12 Bulan (Terkunci)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {utilities.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50/50">
                <td className="p-3 font-medium text-zinc-900">{u.name}</td>
                <td className="p-3 text-zinc-500">{u.provider}</td>
                <td className="p-3">{formatRupiah(u.monthlyCost)}</td>
                <td className="p-3">{u.monthsCount} Bulan</td>
                <td className="p-3 font-bold text-zinc-900 text-right">{formatRupiah(u.monthlyCost * u.monthsCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
