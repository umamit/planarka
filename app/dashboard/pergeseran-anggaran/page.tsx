"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShiftItem, validateBudgetShift } from "@/lib/calculations/budget-shift";
import { ShiftMatrixTable } from "@/components/budget/ShiftMatrixTable";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { RotateCcw, AlertTriangle, Save, Loader2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_ITEMS: Omit<ShiftItem, "id">[] = [
  { snpCode: "SNP-3", accountCode: "5.2.05.01.01.0001", activityName: "Pengadaan Buku Teks Siswa Kurikulum Merdeka", initialBudget: 45000000, shiftDelta: 0, finalBudget: 45000000 },
  { snpCode: "SNP-5", accountCode: "5.1.02.02.01.0061", activityName: "Pemeliharaan & Pengecatan Ruang Kelas Ringan", initialBudget: 20000000, shiftDelta: 0, finalBudget: 20000000, isMaintenanceSarpras: true },
  { snpCode: "SNP-4", accountCode: "5.1.02.02.01.0026", activityName: "Honorarium Guru Honorer / Non-ASN (4 Orang)", initialBudget: 72000000, shiftDelta: 0, finalBudget: 72000000, isHonorNonAsn: true },
  { snpCode: "SNP-7", accountCode: "5.1.02.02.01.0014", activityName: "Langganan Akses Internet Sekolah 12 Bulan", initialBudget: 18000000, shiftDelta: 0, finalBudget: 18000000 },
];

export default function BudgetShiftSimulatorPage() {
  const { profile } = useSchool();
  const [items, setItems] = useState<ShiftItem[]>([]);
  const [totalPagu, setTotalPagu] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      // 1. Dapatkan tenant_id dari tabel tenants_schools
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        // 2. Ambil total pagu real dari database bos_allocations
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("bos_regular_total, bos_performance_total, silpa_previous_year")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          const paguReal = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
          setTotalPagu(paguReal);
        }

        // 3. Ambil data pergeseran anggaran dari rkas_budget_items
        const { data: dbItems } = await supabase
          .from("rkas_budget_items")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (dbItems && dbItems.length > 0) {
          const mappedItems: ShiftItem[] = dbItems.map((di: any) => ({
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
          setItems(mappedItems);
        } else {
          // Jika belum ada data pergeseran di database, buat data default di DB
          const inserts = DEFAULT_ITEMS.map((di) => ({
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            snp_code: di.snpCode,
            snp_name: di.snpCode === "SNP-3" ? "Standar Proses" : di.snpCode === "SNP-5" ? "Standar Sarpras" : di.snpCode === "SNP-4" ? "Standar Pendidik" : "Standar Pengelolaan",
            account_code: di.accountCode,
            account_name: di.activityName,
            activity_name: di.activityName,
            initial_budget: di.initialBudget,
            shifted_amount: di.shiftDelta,
            final_budget: di.finalBudget,
            is_non_asn_honor: di.isHonorNonAsn || false,
            is_routine_utility: di.isMaintenanceSarpras || false,
          }));

          const { data: newDbItems } = await supabase
            .from("rkas_budget_items")
            .insert(inserts)
            .select();

          if (newDbItems) {
            setItems(newDbItems.map((di: any) => ({
              id: di.id,
              snpCode: di.snp_code,
              accountCode: di.account_code,
              activityName: di.activity_name,
              initialBudget: Number(di.initial_budget),
              shiftDelta: Number(di.shifted_amount),
              finalBudget: Number(di.final_budget),
              isHonorNonAsn: di.is_non_asn_honor,
              isMaintenanceSarpras: di.is_routine_utility,
            })));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeltaChange = (id: string, newDelta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, shiftDelta: newDelta, finalBudget: item.initialBudget + newDelta }
          : item
      )
    );
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const promises = items.map((item) =>
        supabase
          .from("rkas_budget_items")
          .update({
            shifted_amount: item.shiftDelta,
            final_budget: item.finalBudget,
          })
          .eq("id", item.id)
      );

      await Promise.all(promises);
      alert("Pergeseran anggaran berhasil disimpan permanen ke database cloud!");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan ke database.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        shiftDelta: 0,
        finalBudget: it.initialBudget,
      }))
    );
  };

  const validation = validateBudgetShift(items, totalPagu);

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat data pergeseran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Simulator Pergeseran Anggaran (Pre-ARKAS)</h1>
          <p className="text-xs text-zinc-500 mt-1">Uji Keseimbangan (Zero-Balance), Batas 50% Honor, dan Anti-Defisit Sebelum Pengesahan Dinas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveToDatabase} disabled={saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1" />
            )}
            Simpan Perubahan ke Cloud
          </Button>
        </div>
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
            <CardDescription>Pagu Anggaran Sekolah</CardDescription>
            <Badge variant="default">Definitif</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalPagu)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Total Pagu Tersedia</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Pelanggaran Batas</CardDescription>
            <Badge variant={validation.warnings.length === 0 ? "success" : "danger"}>
              {validation.warnings.length === 0 ? "Aman" : "Ada Pelanggaran"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-bold mt-2">
            {validation.warnings.length === 0 ? (
              <span className="text-emerald-700">Lolos Verifikasi Juknis BOSP</span>
            ) : (
              <span className="text-rose-700">{validation.warnings.length} Temuan Kesalahan</span>
            )}
          </CardTitle>
        </Card>
      </div>

      {validation.warnings.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Verifikasi Gagal: Kesalahan Aturan Penganggaran Terdeteksi</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1">
            {validation.warnings.map((err: string, idx: number) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <ShiftMatrixTable items={items} onDeltaChange={handleDeltaChange} />
      </Card>
    </div>
  );
}
