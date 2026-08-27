"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShiftItem, validateBudgetShift } from "@/lib/calculations/budget-shift";
import { ShiftMatrixTable } from "@/components/budget/ShiftMatrixTable";
import { formatRupiah } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";

const INITIAL_ITEMS: ShiftItem[] = [
  { id: "item-1", snpCode: "SNP-3", accountCode: "5.2.05.01.01.0001", activityName: "Pengadaan Buku Teks Siswa Kurikulum Merdeka", initialBudget: 45000000, shiftDelta: -5000000, finalBudget: 40000000 },
  { id: "item-2", snpCode: "SNP-5", accountCode: "5.1.02.02.01.0061", activityName: "Pemeliharaan & Pengecatan Ruang Kelas Ringan", initialBudget: 20000000, shiftDelta: 5000000, finalBudget: 25000000, isMaintenanceSarpras: true },
  { id: "item-3", snpCode: "SNP-4", accountCode: "5.1.02.02.01.0026", activityName: "Honorarium Guru Honorer / Non-ASN (4 Orang)", initialBudget: 72000000, shiftDelta: 0, finalBudget: 72000000, isHonorNonAsn: true },
  { id: "item-4", snpCode: "SNP-7", accountCode: "5.1.02.02.01.0014", activityName: "Langganan Akses Internet Sekolah 12 Bulan", initialBudget: 18000000, shiftDelta: 0, finalBudget: 18000000 },
];

export default function BudgetShiftSimulatorPage() {
  const [items, setItems] = useState<ShiftItem[]>(INITIAL_ITEMS);
  const totalPagu = 278400000;
  const validation = validateBudgetShift(items, totalPagu);

  const handleDeltaChange = (id: string, newDelta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, shiftDelta: newDelta, finalBudget: item.initialBudget + newDelta }
          : item
      )
    );
  };

  const handleReset = () => {
    setItems(INITIAL_ITEMS.map((it) => ({ ...it, shiftDelta: 0, finalBudget: it.initialBudget })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Simulator Pergeseran Anggaran (Pre-ARKAS)</h1>
          <p className="text-xs text-zinc-500 mt-1">Uji Keseimbangan (Zero-Balance), Batas 50% Honor, dan Anti-Defisit Sebelum Pengesahan Dinas</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Simulasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Keseimbangan</CardDescription>
            <Badge variant={validation.isBalanced ? "success" : "danger"}>
              {validation.isBalanced ? "Balance" : "Tidak Seimbang"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(validation.netDelta)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Selisih Bersih Mutasi</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Porsi Honor Guru Non-ASN</CardDescription>
            <Badge variant={validation.isHonorValid ? "success" : "warning"}>
              {validation.honorPercentage.toFixed(1)}% / 50%
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(validation.honorTotal)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Batas Maks: {formatRupiah(totalPagu * 0.5)}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Integritas Saldo Akun</CardDescription>
            <Badge variant={validation.hasDeficitItem ? "danger" : "success"}>
              {validation.hasDeficitItem ? "Ada Defisit" : "Positif"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{items.length} Akun Belanja</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Anti-Defisit Guard Aktif</p>
        </Card>
      </div>

      {validation.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Catatan Pra-Validasi ARKAS:
          </div>
          <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
            {validation.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}

      <ShiftMatrixTable items={items} onDeltaChange={handleDeltaChange} />
    </div>
  );
}
