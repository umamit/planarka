"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { calculateTax } from "@/lib/calculations/tax-calculator";
import { formatRupiah } from "@/lib/utils";
import { Receipt, Info } from "lucide-react";

export default function TaxCalculatorPage() {
  const [amount, setAmount] = useState<number>(5550000);
  const [taxType, setTaxType] = useState<"barang" | "jasa" | "honor_npwp" | "honor_non_npwp" | "buku">("barang");
  const [ppnRate, setPpnRate] = useState<number>(12); // Default 12% sesuai UU HPP 2025/2026

  const tax = calculateTax(amount, taxType, ppnRate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kalkulator Pajak Belanja Sekolah (BOS)</h1>
        <p className="text-xs text-zinc-500 mt-1">Perhitungan Otomatis Pajak PPN & PPh 21/22/23 Sesuai Ketentuan Bendahara Pengeluaran (Dinamis)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Input Nilai Transaksi Belanja</CardTitle>
            <CardDescription>Masukkan nilai bruto kwitansi atau tagihan penyedia</CardDescription>
          </CardHeader>

          <div>
            <label className="text-xs font-semibold text-zinc-700">Nominal Transaksi (Bruto)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700">Jenis Belanja / Objek Pajak</label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as any)}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
            >
              <option value="barang">Belanja Barang / ATK / Bahan Praktik (&gt; Rp 2 Juta Kena PPN & PPh 22)</option>
              <option value="jasa">Belanja Jasa / Perbaikan / Sewa (&gt; Rp 2 Juta Kena PPN & PPh 23)</option>
              <option value="honor_npwp">Honorarium Narasumber / Guru Honorer (Ber-NPWP: PPh 21 5%)</option>
              <option value="honor_non_npwp">Honorarium Narasumber / Guru Honorer (Tanpa NPWP: PPh 21 6%)</option>
              <option value="buku">Buku Pelajaran Kurikulum Merdeka (Bebas PPN 0%)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700">Tarif PPN (%)</label>
            <input
              type="number"
              value={ppnRate}
              onChange={(e) => setPpnRate(Math.max(0, Number(e.target.value)))}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold focus:border-zinc-900 focus:outline-none"
              min="0"
              max="100"
            />
          </div>
        </Card>

        {/* Results */}
        <Card className="space-y-3 bg-zinc-50/50">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Rincian Potongan & Pembayaran Bersih</CardTitle>
            <CardDescription>Nominal yang harus dibayarkan ke rekanan & disetor ke kas negara</CardDescription>
          </CardHeader>

          <div className="divide-y divide-zinc-200 text-xs">
            <div className="flex justify-between py-2">
              <span className="text-zinc-600">Nilai Bruto Tagihan:</span>
              <span className="font-semibold">{formatRupiah(tax.grossAmount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-600">Potongan PPN ({ppnRate}%):</span>
              <span className="font-semibold text-rose-600">{formatRupiah(tax.ppnAmount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-600">Potongan PPh (21/22/23):</span>
              <span className="font-semibold text-rose-600">{formatRupiah(tax.pph21Amount + tax.pph22Amount + tax.pph23Amount)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold text-zinc-900 pt-3">
              <span>Dibayarkan ke Penyedia (Netto):</span>
              <span className="text-emerald-700">{formatRupiah(tax.netPayment)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
