"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { calculatePenaltyMitigation } from "@/lib/calculations/penalty-mitigation";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PenaltyMitigationPage() {
  const { profile } = useSchool();
  const [phase1Allocation, setPhase1Allocation] = useState<number>(0);
  const [realized, setRealized] = useState<number>(0);
  const [reportDate, setReportDate] = useState<string>("2026-07-25");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchData = async () => {
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
          .select("phase_1_allocation")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          setPhase1Allocation(Number(alloc.phase_1_allocation) || 0);
        }

        const { data: items } = await supabase
          .from("rkas_budget_items")
          .select("final_budget")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (items) {
          const totalSpent = items.reduce((sum, item) => sum + Number(item.final_budget), 0);
          setRealized(totalSpent);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sesuaikan input parameter dan penamaan return dari calculatePenaltyMitigation
  const result = calculatePenaltyMitigation({
    phase1Allocation,
    realizedExpensePhase1: realized,
    currentBankBalance: 0,
    reportSubmissionDate: reportDate,
  });

  const isPenaltyFree = result.latenessPenaltyRate === 0 && !result.isExcessiveBalance;

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat data mitigasi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Analisis Mitigasi Penalti PMK (BOSP Tahap 2)</h1>
        <p className="text-xs text-zinc-500 mt-1">Estimasi Potongan Penyaluran Dana BOS Berdasarkan Aturan Pelaporan Tiered PMK Kemenkeu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Penyaluran Tahap 1</CardDescription>
            <Badge variant="default">Realisasi</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(phase1Allocation)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Alokasi BOSP Diterima</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Realisasi Pembelanjaan</CardDescription>
            <Badge variant={!result.isExcessiveBalance ? "success" : "danger"}>
              {!result.isExcessiveBalance ? "Memenuhi Batas (>80%)" : "Kurang (<80%)"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(realized)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">
            Realisasi: {(100 - result.remainingPercentage).toFixed(1)}% dari Tahap 1
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Estimasi Nilai Potongan</CardDescription>
            <Badge variant={result.latenessPenaltyRate === 0 ? "success" : "danger"}>
              {result.latenessPenaltyRate === 0 ? "Bebas Sanksi" : `Potong ${result.latenessPenaltyRate}%`}
            </Badge>
          </div>
          <CardTitle className={`text-xl font-bold mt-1 ${result.totalDeductionAmount > 0 ? "text-rose-600" : "text-zinc-950"}`}>
            {formatRupiah(result.totalDeductionAmount)}
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Sanksi Keterlambatan & Sisa Saldo</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Uji Simulasi Tanggal Pelaporan</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tanggal Submit Laporan BOSP</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 text-[10.5px] leading-relaxed text-zinc-500 space-y-1">
                <div className="font-bold text-zinc-700">Aturan Potongan PMK 204:</div>
                <div>• S.d 31 Juli: 0% (Bebas Potongan)</div>
                <div>• 1 Agustus - 31 Agustus: Potong 2%</div>
                <div>• 1 September - 30 September: Potong 3%</div>
                <div>• 1 Oktober - 31 Oktober: Potong 4%</div>
                <div className="text-rose-600 font-semibold">• Lewat 31 Oktober: Penyaluran Tahap 2 DIBATALKAN (Hangus)</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-zinc-700" />
                Rekomendasi & Hasil Audit Keuangan PMK
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs leading-relaxed text-zinc-650">
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
                isPenaltyFree ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {isPenaltyFree ? (
                  <>
                    <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Status Aman / Patuh Regulasi</div>
                      <p className="mt-1 leading-relaxed text-[11px]">
                        Selamat! Realisasi belanja Anda telah melebihi batas minimal 80% alokasi Tahap 1, dan tanggal pelaporan disubmit sebelum batas waktu. Dana Tahap 2 disalurkan utuh 100%.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Peringatan: Kerugian Anggaran Terdeteksi</div>
                      <p className="mt-1 leading-relaxed text-[11px]">
                        Sekolah Anda terancam kehilangan/potongan dana BOS sebesar <span className="font-bold">{formatRupiah(result.totalDeductionAmount)}</span>. Segera lakukan penyerapan anggaran hingga minimal 80% dan laporkan sebelum tenggat waktu PMK.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-zinc-700">Rencana Aksi Sekolah (Action Items):</div>
                <ul className="list-disc pl-5 space-y-1 text-zinc-600 leading-relaxed">
                  <li>Pastikan penyerapan dana BOS minimal mencapai Rp{(phase1Allocation * 0.8).toLocaleString("id-ID")} sebelum melakukan pelaporan.</li>
                  <li>Submit laporan realisasi penggunaan BOSP Anda sebelum tanggal 31 Juli 2026 pukul 23.59 WIB.</li>
                  <li>Jika penyerapan lambat, koordinasikan dengan komite untuk percepatan belanja buku teks atau pemeliharaan ringan sarpras sekolah.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
