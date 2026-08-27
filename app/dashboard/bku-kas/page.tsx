"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { validateCashPosition } from "@/lib/calculations/cash-validator";
import { formatRupiah } from "@/lib/utils";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function BkuCashPage() {
  const [cashInHand, setCashInHand] = useState<number>(6500000);
  const [bankBalance, setBankBalance] = useState<number>(38200000);
  const [unpaidTaxes, setUnpaidTaxes] = useState<number>(0);

  const result = validateCashPosition({ cashInHand, bankBalance, unpaidTaxes });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Rekonsiliasi Kas BKU & Pengawasan Batas Brankas</h1>
        <p className="text-xs text-zinc-500 mt-1">Pencegah Temuan Audit Pemeriksaan Fisik Kas (Cash Opname) dan Pajak Terutang BPK/Inspektorat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Kas Tunai di Brankas</CardDescription>
            <Badge variant={result.isCashInHandExceeded ? "danger" : "success"}>
              {result.isCashInHandExceeded ? "Melebihi Batas" : "Maks Rp 10 Jt"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(cashInHand)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Batas Regulasi Tunai Sekolah</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Saldo Rekening Giro Bank</CardDescription>
            <Badge variant="default">Giro BOSP</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(bankBalance)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Sesuai Rekening Koran Bank</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Titipan Pajak Belum Setor</CardDescription>
            <Badge variant={result.hasOverdueTaxHolding ? "danger" : "success"}>
              {result.hasOverdueTaxHolding ? "Wajib Setor" : "Nihil"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(unpaidTaxes)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Wajib Nol pada Akhir Bulan</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Input Nilai Kas Fisik Saat Cash Opname</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Saldo Kas Tunai di Brankas</label>
            <input
              type="number"
              value={cashInHand}
              onChange={(e) => setCashInHand(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Saldo Giro Bank BOSP</label>
            <input
              type="number"
              value={bankBalance}
              onChange={(e) => setBankBalance(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">Pajak PPN/PPh Belum Disetor</label>
            <input
              type="number"
              value={unpaidTaxes}
              onChange={(e) => setUnpaidTaxes(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {result.warnings.length > 0 ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-1 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              Peringatan Kepatuhan Audit Kas:
            </div>
            <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
              {result.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center gap-2 text-xs font-semibold text-emerald-800 mt-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Posisi kas tunai dan perbankan memenuhi standar tata kelola keuangan negara.
          </div>
        )}
      </Card>
    </div>
  );
}
