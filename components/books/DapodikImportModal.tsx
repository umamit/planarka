"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseDapodikMock, DapodikGradeSummary } from "@/lib/calculations/dapodik-parser";
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";

interface DapodikImportModalProps {
  onDataImported: (grades: { [grade: number]: number }, rombels: { [grade: number]: number }) => void;
}

export function DapodikImportModal({ onDataImported }: DapodikImportModalProps) {
  const [isImported, setIsImported] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);

  const handleSimulateUpload = () => {
    const data = parseDapodikMock("Rekap_Dapodik_SDN1_Bobong_2026.xlsx");
    setImportedData(data);
    setIsImported(true);

    const gradeStudents: { [g: number]: number } = {};
    const gradeRombels: { [g: number]: number } = {};
    data.grades.forEach((g) => {
      gradeStudents[g.grade] = g.totalStudents;
      gradeRombels[g.grade] = g.rombelCount;
    });
    onDataImported(gradeStudents, gradeRombels);
  };

  return (
    <Card className="border-dashed border-2 border-zinc-300 bg-zinc-50/50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-200 text-zinc-900 mb-3">
        <UploadCloud className="h-6 w-6" />
      </div>
      <CardTitle className="text-sm">Impor Otomatis Data Siswa & Rombel dari Dapodik</CardTitle>
      <CardDescription className="text-xs mt-1">Unggah file rekapitulasi Dapodik (.xlsx / .csv) tanpa perlu input kelas manual</CardDescription>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={handleSimulateUpload}>
          <FileSpreadsheet className="h-4 w-4" />
          Pilih / Unggah File Dapodik (.xlsx)
        </Button>
      </div>

      {isImported && importedData && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 text-left flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Berhasil ekstrak data: <strong>{importedData.totalAllStudents} Siswa</strong> ({importedData.totalAllRombels} Rombel)</span>
          </div>
          <Badge variant="success">Sinkron Dapodik</Badge>
        </div>
      )}
    </Card>
  );
}
