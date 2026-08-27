"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils";
import { ShiftValidationResult } from "@/lib/calculations/budget-shift";

interface Props {
  totalPagu: number;
  validation: ShiftValidationResult;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function BudgetAllocationSummary({ totalPagu, validation }: Props) {
  const totalDialokasikan = validation.totalFinal;
  const sisaPagu = totalPagu - totalDialokasikan;
  const pctDialokasikan = totalPagu > 0 ? (totalDialokasikan / totalPagu) * 100 : 0;
  const sisaAman = sisaPagu >= 0;

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-800">Ringkasan Alokasi Anggaran RKAS</span>
        <Badge variant={sisaAman ? "success" : "danger"}>
          {sisaAman ? "Sisa Pagu Aman" : "Pagu Terlampaui"}
        </Badge>
      </div>

      {/* Progress total */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
          <span>Terpakai: {formatRupiah(totalDialokasikan)} ({pctDialokasikan.toFixed(1)}%)</span>
          <span className={`font-bold ${sisaAman ? "text-emerald-700" : "text-rose-600"}`}>
            Sisa: {formatRupiah(sisaPagu)}
          </span>
        </div>
        <ProgressBar value={totalDialokasikan} max={totalPagu} color={sisaAman ? "bg-zinc-800" : "bg-rose-500"} />
        <div className="text-[11px] text-zinc-400">
          Pagu Definitif: {formatRupiah(totalPagu)}
        </div>
      </div>

      {/* Breakdown kategori */}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-100">
        {/* Honor */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-600">Honor Non-ASN</span>
            <span className={`text-[10px] font-bold ${validation.isHonorValid ? "text-emerald-600" : "text-rose-600"}`}>
              {validation.honorPercentage.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            value={validation.honorTotal}
            max={totalPagu * (validation.honorLimit / 100)}
            color={validation.isHonorValid ? "bg-emerald-500" : "bg-rose-500"}
          />
          <div className="text-[10px] text-zinc-400">{formatRupiah(validation.honorTotal)} / Maks {validation.honorLimit}%</div>
        </div>

        {/* Buku */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-600">Pengadaan Buku</span>
            <span className={`text-[10px] font-bold ${validation.isBookMinimumMet ? "text-emerald-600" : "text-amber-600"}`}>
              {validation.bookPercentage.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            value={validation.bookTotal}
            max={totalPagu * 0.10}
            color={validation.isBookMinimumMet ? "bg-emerald-500" : "bg-amber-400"}
          />
          <div className="text-[10px] text-zinc-400">{formatRupiah(validation.bookTotal)} / Min 10%</div>
        </div>

        {/* Sarpras */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-600">Sarpras & Daya Jasa</span>
            <span className={`text-[10px] font-bold ${validation.isSarprasValid ? "text-emerald-600" : "text-amber-600"}`}>
              {validation.sarprasPercentage.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            value={validation.sarprasTotal}
            max={totalPagu * 0.20}
            color={validation.isSarprasValid ? "bg-emerald-500" : "bg-amber-400"}
          />
          <div className="text-[10px] text-zinc-400">{formatRupiah(validation.sarprasTotal)} / Maks 20%</div>
        </div>
      </div>
    </Card>
  );
}
