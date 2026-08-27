"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { validateCashPosition } from "@/lib/calculations/cash-validator";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Landmark, Wallet, AlertTriangle, Save, Loader2, CheckCircle2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CashPositionPage() {
  const { profile } = useSchool();
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [unpaidTaxes, setUnpaidTaxes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSaveCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.npsn) return;
    setSaving(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { error } = await supabase
          .from("bos_allocations")
          .upsert([
            {
              tenant_id: school.id,
              fiscal_year: profile.fiscalYear,
              cash_in_hand: cashInHand,
              bank_balance: bankBalance,
              unpaid_taxes: unpaidTaxes,
            },
          ], { onConflict: "tenant_id, fiscal_year" });

        if (!error) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          alert("Gagal menyimpan saldo kas.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Rekonsiliasi & Pengawasan Kas BKU</h1>
        <p className="text-xs text-zinc-500 mt-1">Audit Kepatuhan Batas Kas Tunai Maksimal Rp10.000.000 (Kesiapan Audit Fisik Cash Opname)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Input */}
        <div className="lg:col-span-1">
          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Input Saldo Buku Kas Umum (BKAS)</CardTitle>
              <CardDescription>Sesuaikan saldo kas per hari ini di database cloud</CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveCash} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Saldo Tunai di Brankas (Rp)</label>
                <input
                  type="number"
                  required
                  value={cashInHand}
                  onChange={(e) => setCashInHand(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Saldo Rekening Bank Sekolah (Rp)</label>
                <input
                  type="number"
                  required
                  value={bankBalance}
                  onChange={(e) => setBankBalance(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Pajak Titipan Belum Disetor (Rp)</label>
                <input
                  type="number"
                  required
                  value={unpaidTaxes}
                  onChange={(e) => setUnpaidTaxes(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  Simpan Saldo Kas
                </Button>
                {saved && (
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Kolom Kanan: Hasil Audit */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <CardDescription>Batas Kas Tunai (Maksimal)</CardDescription>
                <Badge variant={!result.isCashInHandExceeded ? "success" : "danger"}>
                  {!result.isCashInHandExceeded ? "Aman" : "Temuan Audit!"}
                </Badge>
              </div>
              <CardTitle className={`text-xl font-bold mt-1 ${!result.isCashInHandExceeded ? "text-zinc-950" : "text-rose-600"}`}>
                {formatRupiah(cashInHand)} / Rp10.000.000
              </CardTitle>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <CardDescription>Total Likuiditas Kas Sekolah</CardDescription>
                <Badge variant="default">Total BKU</Badge>
              </div>
              <CardTitle className="text-xl font-bold mt-1">{formatRupiah(result.totalLiquidCash)}</CardTitle>
            </Card>
          </div>

          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Rekomendasi Hasil Pengawasan Kas</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                !result.isCashInHandExceeded ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {!result.isCashInHandExceeded ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Buku Kas Tunai Sesuai Standar</div>
                      <p className="mt-1 text-[11px]">
                        Kas tunai di brankas sekolah terkontrol di bawah batas maksimal Rp10.000.000. Kondisi ini sangat ideal dan siap menghadapi audit fisik/cash opname sewaktu-waktu oleh BPK.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Peringatan: Kas Tunai Melebihi Batas</div>
                      <p className="mt-1 text-[11px]">
                        Penyimpanan uang tunai di brankas melebihi batas maksimal Rp10.000.000 sangat berisiko memicu temuan audit kepatuhan kas. Harap segera setorkan sisa uang ke rekening bank sekolah.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {result.hasOverdueTaxHolding && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[11px]">Tunggakan Setoran Pajak Terdeteksi: {formatRupiah(unpaidTaxes)}</div>
                    <p className="text-[10px] mt-0.5">Harap segera setor PPN/PPh terutang ke kas negara sebelum melewati masa jatuh tempo pajak untuk menghindari denda administrasi pajak.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
