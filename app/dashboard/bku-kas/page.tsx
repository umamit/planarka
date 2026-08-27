"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { validateCashPosition } from "@/lib/calculations/cash-validator";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Landmark, Wallet, AlertTriangle, Loader2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CashPositionPage() {
  const { profile } = useSchool();
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [unpaidTaxes, setUnpaidTaxes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    fetchCashData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchCashData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("cash_in_hand, bank_balance, unpaid_taxes")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          setCashInHand(Number(alloc.cash_in_hand) || 0);
          setBankBalance(Number(alloc.bank_balance) || 0);
          setUnpaidTaxes(Number(alloc.unpaid_taxes) || 0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCash = async (cHand: number, bBal: number, uTax: number) => {
    if (!profile.npsn) return;
    setAutoSaving(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        await supabase
          .from("bos_allocations")
          .upsert([
            {
              tenant_id: school.id,
              fiscal_year: profile.fiscalYear,
              cash_in_hand: cHand,
              bank_balance: bBal,
              unpaid_taxes: uTax,
            },
          ], { onConflict: "tenant_id, fiscal_year" });
      }
    } catch (e) {
      console.error("Gagal auto-save BKU:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleCashInHandChange = (val: number) => {
    setCashInHand(val);
    handleUpdateCash(val, bankBalance, unpaidTaxes);
  };

  const handleBankBalanceChange = (val: number) => {
    setBankBalance(val);
    handleUpdateCash(cashInHand, val, unpaidTaxes);
  };

  const handleUnpaidTaxesChange = (val: number) => {
    setUnpaidTaxes(val);
    handleUpdateCash(cashInHand, bankBalance, val);
  };

  const result = validateCashPosition({ cashInHand, bankBalance, unpaidTaxes });

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat buku kas umum...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Rekonsiliasi & Pengawasan Kas BKU</h1>
          <p className="text-xs text-zinc-500 mt-1">Audit Kepatuhan Batas Kas Tunai Maksimal Rp10.000.000 (Kesiapan Audit Fisik Cash Opname)</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
              Menyimpan perubahan otomatis...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Input Saldo Buku Kas Umum (BKAS)</CardTitle>
              <CardDescription>Sesuaikan saldo kas per hari ini di database cloud</CardDescription>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Saldo Tunai di Brankas (Rp)</label>
                <input
                  type="number"
                  required
                  value={cashInHand}
                  onChange={(e) => handleCashInHandChange(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Saldo Rekening Bank Sekolah (Rp)</label>
                <input
                  type="number"
                  required
                  value={bankBalance}
                  onChange={(e) => handleBankBalanceChange(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Pajak Titipan Belum Disetor (Rp)</label>
                <input
                  type="number"
                  required
                  value={unpaidTaxes}
                  onChange={(e) => handleUnpaidTaxesChange(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-6">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-zinc-700" />
                <CardTitle className="text-sm">Audit Posisi Likuiditas & Kepatuhan Kas</CardTitle>
              </div>
              <CardDescription>Pemeriksaan saldo riil dan batasan regulasi cash opname kas sekolah</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-semibold block">Total Kas Likuid</span>
                  <span className="text-base font-bold text-zinc-900 block mt-0.5">{formatRupiah(result.totalLiquidCash)}</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-zinc-200/50 flex items-center justify-center text-zinc-600">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-semibold block">Pajak Terutang</span>
                  <span className="text-base font-bold text-zinc-900 block mt-0.5">{formatRupiah(unpaidTaxes)}</span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-zinc-200/50 flex items-center justify-center text-zinc-600">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Kepatuhan Kas Brankas (&lt; Rp10jt):</span>
                <Badge variant={result.isCashInHandExceeded ? "danger" : "success"}>
                  {result.isCashInHandExceeded ? "Melebihi Batas" : "Patuhi Aturan"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-zinc-500">Tunggakan Setoran Pajak:</span>
                <Badge variant={result.hasOverdueTaxHolding ? "warning" : "success"}>
                  {result.hasOverdueTaxHolding ? "Ada Tunggakan" : "Lunas / Bersih"}
                </Badge>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Pemberitahuan Audit BKU:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {result.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
