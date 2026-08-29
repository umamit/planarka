"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PaguConfigModal } from "@/components/budget/PaguConfigModal";
import { calculateBosPagu } from "@/lib/calculations/bos-pagu";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Building, Users, Wallet, ShieldAlert } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardOverviewPage() {
  const { profile } = useSchool();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [silpa, setSilpa] = useState<number>(0);
  const [bosKinerja, setBosKinerja] = useState<number>(0);
  const [rkasTotal, setRkasTotal] = useState<number>(0);
  const [totalRealized, setTotalRealized] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Ambil data pagu terdaftar di database Supabase
  useEffect(() => {
    async function fetchPagu() {
      if (!profile.npsn) return;
      setLoading(true);

      try {
        // 1. Dapatkan tenant_id dari tabel tenants_schools
        const { data: school, error: schoolErr } = await supabase
          .from("tenants_schools")
          .select("id")
          .eq("npsn", profile.npsn)
          .single();

        if (!schoolErr && school) {
          // 2. Dapatkan record alokasi BOS di tabel bos_allocations
          const { data: alloc, error: allocErr } = await supabase
            .from("bos_allocations")
            .select("*")
            .eq("tenant_id", school.id)
            .eq("fiscal_year", profile.fiscalYear)
            .single();

          if (!allocErr && alloc) {
            setStudentCount(Number(alloc.real_student_count) || 0);
            setUnitCost(Number(alloc.unit_cost_per_student) || 0);
            setSilpa(Number(alloc.silpa_previous_year) || 0);
            setBosKinerja(Number(alloc.bos_performance_total) || 0);
          }

          // 3. Dapatkan RKAS dan Realisasi
          const [{ data: budgetItems }, { data: realizations }] = await Promise.all([
            supabase.from("rkas_budget_items").select("final_budget").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear),
            supabase.from("rkas_realizations").select("realized_amount").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear)
          ]);

          if (budgetItems) {
            const rkasSum = budgetItems.reduce((acc, cur) => acc + Number(cur.final_budget), 0);
            setRkasTotal(rkasSum);
          }
          if (realizations) {
            const realSum = realizations.reduce((acc, cur) => acc + Number(cur.realized_amount), 0);
            setTotalRealized(realSum);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data pagu dari Supabase:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchPagu();
  }, [profile.npsn, profile.fiscalYear]);

  const handleUpdatePagu = async (students: number, cost: number, newSilpa: number, kinerja: number) => {
    setStudentCount(students);
    setUnitCost(cost);
    setSilpa(newSilpa);
    setBosKinerja(kinerja);

    if (!profile.npsn) return;

    try {
      // 1. Dapatkan tenant_id dari tabel tenants_schools
      const { data: school, error: schoolErr } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (!schoolErr && school) {
        // Hitung pembagian alokasi
        const regularTotal = students * cost;
        const phase1 = (regularTotal * 0.5) + newSilpa;
        const phase2 = regularTotal * 0.5;

        // 2. Simpan atau update ke tabel bos_allocations
        const { error } = await supabase.from("bos_allocations").upsert([
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            real_student_count: students,
            unit_cost_per_student: cost,
            bos_regular_total: regularTotal,
            bos_performance_total: kinerja,
            silpa_previous_year: newSilpa,
            phase_1_allocation: phase1,
            phase_2_allocation: phase2,
          },
        ], { onConflict: "tenant_id, fiscal_year" });

        if (error) {
          console.error("Gagal update data pagu di database:", error.message);
        }
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data pagu ke Supabase:", e);
    }
  };

  const pagu = calculateBosPagu(studentCount, unitCost, bosKinerja, silpa);

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat dasbor anggaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dasbor Pagu Anggaran BOS</h1>
          <p className="text-xs text-zinc-500 mt-1">Simulasi Pagu Definitif dan Ambang Batas Regulasi Permendikdasmen No. 8/2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">Zona {profile.hetZone} - {profile.province} ({profile.district.split(" ")[2] || "Taliabu"})</Badge>
          <PaguConfigModal
            studentCount={studentCount}
            unitCost={unitCost}
            silpa={silpa}
            bosKinerja={bosKinerja}
            onSave={handleUpdatePagu}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Pagu Definitif</CardDescription>
              <Wallet className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold">{formatRupiah(pagu.totalPagu)}</CardTitle>
          </CardHeader>
          <div className="px-6 pb-4 space-y-1 text-[10px] text-zinc-500 border-t border-zinc-100 pt-2 mt-1">
            <div className="flex justify-between">
              <span>Tahap 1 (50% + SiLPA):</span>
              <span className="font-semibold text-zinc-700">{formatRupiah(pagu.phase1Allocation)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tahap 2 (50%):</span>
              <span className="font-semibold text-zinc-700">{formatRupiah(pagu.phase2Allocation)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Pagu Terpakai di RKAS</CardDescription>
              <Building className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold">{formatRupiah(rkasTotal)}</CardTitle>
          </CardHeader>
          <div className="text-[11px] text-zinc-500">
            Progress RKAS: {pagu.totalPagu > 0 ? ((rkasTotal / pagu.totalPagu) * 100).toFixed(0) : 0}% disusun
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Realisasi Belanja Riil</CardDescription>
              <Building className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold text-emerald-700">{formatRupiah(totalRealized)}</CardTitle>
          </CardHeader>
          <div className="text-[11px] text-zinc-500">
            Progress Serapan: {rkasTotal > 0 ? ((totalRealized / rkasTotal) * 100).toFixed(0) : 0}% terpakai
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Jumlah Siswa Riil</CardDescription>
              <Users className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold">{formatNumber(pagu.studentCount)} Siswa</CardTitle>
          </CardHeader>
          <div className="text-[11px] text-zinc-500">Tarif: {formatRupiah(pagu.unitCostPerStudent)} / Siswa</div>
        </Card>
      </div>

      {/* Progress Bars Visual Card */}
      <Card className="p-4 space-y-4">
        <CardTitle className="text-sm font-bold text-zinc-800">Visualisasi Penggunaan Dana BOSP</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-zinc-700">
              <span>RKAS disusun vs Pagu</span>
              <span>{pagu.totalPagu > 0 ? ((rkasTotal / pagu.totalPagu) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-800 rounded-full transition-all duration-300" 
                style={{ width: `${pagu.totalPagu > 0 ? Math.min((rkasTotal / pagu.totalPagu) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-400">Target penyusunan: Rp {formatNumber(pagu.totalPagu)}</div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-zinc-700">
              <span>Dana Terpakai (Realisasi) vs RKAS</span>
              <span>{rkasTotal > 0 ? ((totalRealized / rkasTotal) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                style={{ width: `${rkasTotal > 0 ? Math.min((totalRealized / rkasTotal) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-400">Total rencana belanja disusun: Rp {formatNumber(rkasTotal)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-zinc-700" />
            Ambang Batas Pengamanan Regulasi (Pre-ARKAS Guards)
          </CardTitle>
          <CardDescription>Batas maksimal & alokasi prioritas pembelanjaan berdasarkan Juknis BOSP Terbaru</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
            <div className="text-xs font-semibold text-zinc-700">Maks. Honor Guru Non-ASN (Maks 20%)</div>
            <div className="text-lg font-bold text-zinc-900 mt-1">{formatRupiah(pagu.maxHonorBudget)}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Wajib terdaftar NUPTK & Dapodik (Pasal 40)</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
            <div className="text-xs font-semibold text-zinc-700">Belanja Buku Teks Utama (Bebas Plafon)</div>
            <div className="text-lg font-bold text-zinc-900 mt-1">Fleksibel Riil</div>
            <p className="text-[11px] text-zinc-500 mt-1">Prioritas pemenuhan rasio 1 Siswa 1 Buku</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
            <div className="text-xs font-semibold text-zinc-700">Maks. Pemeliharaan Sarpras (Maks 20%)</div>
            <div className="text-lg font-bold text-zinc-900 mt-1">{formatRupiah(pagu.maxMaintenanceBudget)}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Khusus perawatan ringan (Dilarang rehab berat)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
