"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PaguConfigModal } from "@/components/budget/PaguConfigModal";
import { calculateBosPagu } from "@/lib/calculations/bos-pagu";
import { saveDraftLocally } from "@/lib/storage/draft-storage";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { Building, Users, Wallet, ShieldAlert } from "lucide-react";

export default function DashboardOverviewPage() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [silpa, setSilpa] = useState<number>(0);
  const [bosKinerja, setBosKinerja] = useState<number>(0);

  const handleUpdatePagu = (students: number, cost: number, newSilpa: number, kinerja: number) => {
    setStudentCount(students);
    setUnitCost(cost);
    setSilpa(newSilpa);
    setBosKinerja(kinerja);
    saveDraftLocally({
      studentCount: students,
      silpa: newSilpa,
    });
  };

  const pagu = calculateBosPagu(studentCount, unitCost, bosKinerja, silpa);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dasbor Pagu Anggaran BOS</h1>
          <p className="text-xs text-zinc-500 mt-1">Simulasi Pagu Definitif dan Ambang Batas Regulasi Permendikbudristek No. 63/2023</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">Zona 5 - Maluku Utara (Taliabu)</Badge>
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
          <div className="text-[11px] text-zinc-500">Termasuk SiLPA: {formatRupiah(pagu.silpaPreviousYear)}</div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Penyaluran Tahap 1 (50%)</CardDescription>
              <Building className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold">{formatRupiah(pagu.phase1Allocation)}</CardTitle>
          </CardHeader>
          <div className="text-[11px] text-zinc-500">Reguler 50% + SiLPA Masuk</div>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Penyaluran Tahap 2 (50%)</CardDescription>
              <Building className="h-4 w-4 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-bold">{formatRupiah(pagu.phase2Allocation)}</CardTitle>
          </CardHeader>
          <div className="text-[11px] text-zinc-500">Target Pelaporan 31 Juli</div>
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
            <div className="text-xs font-semibold text-zinc-700">Maks. Honor Guru Non-ASN (Maks 50%)</div>
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
