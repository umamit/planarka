"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HonorTeacher, validateHonorTeachers } from "@/lib/calculations/honor-validator";
import { formatRupiah } from "@/lib/utils";

const INITIAL_TEACHERS: HonorTeacher[] = [
  { id: "t-1", name: "Siti Rahmawati, S.Pd", nuptk: "84729104829104", isRegisteredDapodik: true, isNonAsn: true, hasCertificationTpg: false, monthlyHonor: 1500000, monthsCount: 12 },
  { id: "t-2", name: "Ahmad Fauzi, S.Pd", nuptk: "19283746501928", isRegisteredDapodik: true, isNonAsn: true, hasCertificationTpg: false, monthlyHonor: 1500000, monthsCount: 12 },
  { id: "t-3", name: "Budi Santoso", nuptk: "", isRegisteredDapodik: true, isNonAsn: true, hasCertificationTpg: false, monthlyHonor: 1200000, monthsCount: 12 },
  { id: "t-4", name: "Nurhaliza, S.Pd", nuptk: "56473829102938", isRegisteredDapodik: true, isNonAsn: true, hasCertificationTpg: true, monthlyHonor: 1500000, monthsCount: 12 },
];

export default function HonorValidationPage() {
  const [teachers] = useState<HonorTeacher[]>(INITIAL_TEACHERS);
  const { results, totalEligibleHonor, totalIneligibleHonor } = validateHonorTeachers(teachers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Validasi Kepatuhan Honor Guru Non-ASN</h1>
        <p className="text-xs text-zinc-500 mt-1">Pemeriksaan 4 Syarat Sah Pasal 40 Permendikbudristek No. 63/2022 (Pencegah Temuan TGR BPK)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Total Honor Sah / Eligible</CardDescription>
            <Badge variant="success">Boleh Dibayar</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalEligibleHonor)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Memenuhi NUPTK, Dapodik & Non-TPG</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Total Honor Berisiko Temuan / Ineligible</CardDescription>
            <Badge variant="danger">Dilarang BOS</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1 text-rose-600">{formatRupiah(totalIneligibleHonor)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Berpotensi Tuntutan Ganti Rugi</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
              <th className="p-3 font-semibold">Nama Pendidik</th>
              <th className="p-3 font-semibold">NUPTK</th>
              <th className="p-3 font-semibold">Dapodik</th>
              <th className="p-3 font-semibold">Status ASN</th>
              <th className="p-3 font-semibold">Sertifikasi (TPG)</th>
              <th className="p-3 font-semibold">Honor / Thn</th>
              <th className="p-3 font-semibold text-right">Hasil Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {results.map(({ teacher, isEligible, annualTotal, ineligibilityReasons }) => (
              <tr key={teacher.id} className="hover:bg-zinc-50/50">
                <td className="p-3 font-medium text-zinc-900">{teacher.name}</td>
                <td className="p-3 font-mono">{teacher.nuptk || <span className="text-rose-500 font-sans italic">Belum Ada</span>}</td>
                <td className="p-3">{teacher.isRegisteredDapodik ? "Terdaftar" : "Tidak"}</td>
                <td className="p-3">{teacher.isNonAsn ? "Non-ASN" : "ASN/PPPK"}</td>
                <td className="p-3">{teacher.hasCertificationTpg ? "Ya (TPG)" : "Belum"}</td>
                <td className="p-3 font-semibold">{formatRupiah(annualTotal)}</td>
                <td className="p-3 text-right">
                  {isEligible ? (
                    <Badge variant="success">Eligible</Badge>
                  ) : (
                    <div className="space-y-0.5">
                      <Badge variant="danger">Tidak Sah</Badge>
                      <span className="block text-[10px] text-rose-600 font-medium">{ineligibilityReasons[0]}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
