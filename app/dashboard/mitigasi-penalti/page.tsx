"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { calculatePenaltyMitigation } from "@/lib/calculations/penalty-mitigation";
import { formatRupiah } from "@/lib/utils";

export default function PenaltyMitigationPage() {
  const [phase1Allocation, setPhase1Allocation] = useState<number>(0);
  const [realized, setRealized] = useState<number>(0);
  const [reportDate, setReportDate] = useState<string>("2026-07-25");

  const result = calculatePenaltyMitigation({
    phase1Allocation,
    realizedExpensePhase1: realized,
    currentBankBalance: phase1Allocation - realized,
    reportSubmissionDate: reportDate,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mitigasi Penalti Penyaluran Tahap 2 (PMK No. 204/PMK.07/2022)</h1>
        <p className="text-xs text-zinc-500 mt-1">Kalkulator Pengaman SiLPA Tahap 1 dan Simulasi Jenjang Penalti Keterlambatan Cut-Off 31 Juli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Sisa Saldo Belum Terserap</CardDescription>
            <Badge variant={result.isExcessiveBalance ? "danger" : "success"}>
              {result.remainingPercentage.toFixed(1)}% / 20%
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(result.remainingPhase1Balance)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Toleransi Sisa Saldo: Maks 20%</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Total Estimasi Potongan PMK</CardDescription>
            <Badge variant={result.totalDeductionAmount > 0 ? "danger" : "success"}>
              {result.latenessPenaltyRate > 0 ? `Penalti ${result.latenessPenaltyRate}%` : "Tanpa Denda"}
            </Badge>
          </div>
          <CardTitle className={`text-xl font-bold mt-1 ${result.totalDeductionAmount > 0 ? "text-rose-600" : "text-zinc-900"}`}>
            {formatRupiah(result.totalDeductionAmount)}
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Pengurang Dana Salur Tahap 2</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Estimasi Bersih Salur Tahap 2</CardDescription>
            <Badge variant="default">Cair Riil</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(result.recommendedDisbursementPhase2)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Estimasi Masuk Rekening Sekolah</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Parameter Simulasi Serapan & Waktu Pelaporan</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Pagu Penyaluran Tahap 1</label>
            <input
              type="number"
              value={phase1Allocation}
              onChange={(e) => setPhase1Allocation(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Realisasi Belanja Tahap 1</label>
            <input
              type="number"
              value={realized}
              onChange={(e) => setRealized(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Tanggal Rencana Pelaporan</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 mt-4">
          <div className="text-xs font-bold text-zinc-800">Rekomendasi Tindakan Mitigasi PMK:</div>
          <ul className="list-disc list-inside text-xs text-zinc-600 mt-2 space-y-1">
            {result.actionAdvice.map((advice, idx) => (
              <li key={idx}>{advice}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
