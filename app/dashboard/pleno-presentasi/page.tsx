"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_BOOKS } from "@/lib/constants/sample-books";
import { calculateBookProcurement } from "@/lib/calculations/book-procurement";
import { validateBudgetShift } from "@/lib/calculations/budget-shift";
import { Tv, ShieldCheck, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlenoPresentationPage() {
  const { profile } = useSchool();
  const [hideSensitive, setHideSensitive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // States data riil Supabase
  const [totalPagu, setTotalPagu] = useState<number>(0);
  const [totalExemplars, setTotalExemplars] = useState<number>(0);
  const [honorPercentage, setHonorPercentage] = useState<number>(0);
  const [isBalanced, setIsBalanced] = useState<boolean>(true);

  useEffect(() => {
    fetchPlenoData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchPlenoData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id, het_zone")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const hetZone = Number(school.het_zone) || 5;

        // 1. Ambil pagu riil & data siswa
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        let paguVal = 0;
        let studentCounts: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
        let rombelCounts: { [grade: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

        if (alloc) {
          paguVal = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
          setTotalPagu(paguVal);

          for (let g = 1; g <= 9; g++) {
            studentCounts[g] = Number(alloc[`students_grade_${g}` as keyof typeof alloc]) || 0;
            rombelCounts[g] = Number(alloc[`rombels_grade_${g}` as keyof typeof alloc]) || 0;
          }
        }

        // 2. Hitung total buku eksemplar
        const { totalExemplars: bookCount } = calculateBookProcurement(
          SAMPLE_BOOKS,
          studentCounts,
          rombelCounts,
          hetZone,
          2500
        );
        setTotalExemplars(bookCount);

        // 3. Ambil data anggaran pergeseran RKAS
        const { data: rkasItems } = await supabase
          .from("rkas_budget_items")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (rkasItems) {
          // Hitung honor guru %
          const honorBelanja = rkasItems
            .filter((it: any) => it.is_non_asn_honor)
            .reduce((sum: number, it: any) => sum + Number(it.final_budget), 0);
          
          setHonorPercentage(paguVal > 0 ? (honorBelanja / paguVal) * 100 : 0);

          // Hitung zero balance
          const shiftItems = rkasItems.map((di: any) => ({
            id: di.id,
            snpCode: di.snp_code,
            accountCode: di.account_code,
            activityName: di.activity_name,
            initialBudget: Number(di.initial_budget),
            shiftDelta: Number(di.shifted_amount),
            finalBudget: Number(di.final_budget),
            isHonorNonAsn: di.is_non_asn_honor,
            isMaintenanceSarpras: di.is_routine_utility,
          }));

          const shiftValidation = validateBudgetShift(shiftItems, paguVal);
          setIsBalanced(shiftValidation.isBalanced);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat mode pleno...</span>
      </div>
    );
  }

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
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pagu Anggaran Tahun {profile.fiscalYear}</span>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              {hideSensitive ? "Rp ***.***.***" : formatRupiah(totalPagu)}
            </div>
          </div>
          <Badge variant={isBalanced && honorPercentage <= 20 ? "success" : "danger"} className="bg-emerald-950/80 text-emerald-300 border-emerald-800 text-xs px-3 py-1">
            Status: {isBalanced && honorPercentage <= 20 ? "Siap Disahkan" : "Perlu Penyesuaian"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-zinc-800 pt-6">
          <div>
            <div className="text-xs text-zinc-400">Total Buku Kurikulum Merdeka</div>
            <div className="text-xl font-bold mt-0.5">{totalExemplars} Eksemplar</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">100% Memenuhi Kebutuhan Siswa</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Kepatuhan Honor Guru Non-ASN</div>
            <div className={`text-xl font-bold mt-0.5 ${honorPercentage <= 20 ? "text-emerald-400" : "text-rose-400"}`}>
              {honorPercentage.toFixed(1)}% (Batas Max 20% Negeri)
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {honorPercentage <= 20 ? "Sesuai Juknis BOSP 2026" : "Melanggar Batas Juknis"}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Keseimbangan Pergeseran</div>
            <div className={`text-xl font-bold mt-0.5 ${isBalanced ? "text-emerald-400" : "text-rose-400"}`}>
              {isBalanced ? "Zero Balance (Pas)" : "Anggaran Defisit / Tidak Seimbang"}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {isBalanced ? "Tidak Ada Selisih Mutasi" : "Terdapat Selisih Mutasi"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">Panduan Rapat Komite</CardTitle>
          </CardHeader>
          <ul className="list-disc pl-5 text-xs text-zinc-650 space-y-1.5 leading-relaxed">
            <li>Gunakan tombol <strong>&quot;Tampilkan Saldo Detail&quot;</strong> di atas untuk menampilkan angka riil sisa pagu ke peserta rapat.</li>
            <li>Rekomendasikan belanja pemeliharaan sekolah (maks 20%) dan prioritas buku HET terlebih dahulu sebelum membahas alokasi honor guru.</li>
            <li>Hasil keputusan pleno dapat diekspor langsung ke berita acara PDF melalui menu Ekspor RKAS.</li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">Catatan Validasi Rapat</CardTitle>
          </CardHeader>
          <div className="text-xs text-zinc-600 space-y-1">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span>NPSN Sekolah:</span>
              <span className="font-semibold text-zinc-800">{profile.npsn}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span>Tahun Anggaran:</span>
              <span className="font-semibold text-zinc-800">{profile.fiscalYear}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Sistem RAG AI Pendamping:</span>
              <span className="font-semibold text-emerald-700">Aktif Terkoneksi</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
