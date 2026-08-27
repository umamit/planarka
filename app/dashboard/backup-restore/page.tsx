"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  PlanarkaDraftState, 
  loadDraftLocally, 
  saveDraftLocally, 
  exportBackupJson 
} from "@/lib/storage/draft-storage";
import { DownloadCloud, UploadCloud, CheckCircle2, RotateCcw } from "lucide-react";

export default function BackupRestorePage() {
  const [draft, setDraft] = useState<PlanarkaDraftState | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const loaded = loadDraftLocally();
    if (!loaded) {
      saveDraftLocally({});
      setDraft(loadDraftLocally());
    } else {
      setDraft(loaded);
    }
  }, []);

  const handleExport = () => {
    if (draft) {
      exportBackupJson(draft);
      setStatusMessage("File backup (.planarka.json) berhasil diunduh.");
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          saveDraftLocally(parsed);
          setDraft(parsed);
          setStatusMessage("Data RKAS berhasil dipulihkan dari file backup.");
        } catch {
          setStatusMessage("Format file tidak valid.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pusat Backup & Pemulihan Data RKAS (Offline-Ready)</h1>
        <p className="text-xs text-zinc-500 mt-1">Penyelamat Perhitungan Saat Jaringan Internet Terputus dan Transfer Data Antar Perangkat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                <DownloadCloud className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Unduh Cadangan Lengkap (.json)</CardTitle>
                <CardDescription>Simpan seluruh konfigurasi simulasi RKAS ke file mandiri</CardDescription>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed">
              Mengekspor seluruh state pagu, pergeseran anggaran, data siswa Dapodik, dan pengaturan kop surat ke file terenkripsi untuk disimpan di flashdisk atau dikirim via WhatsApp ke Bendahara/Kepala Sekolah.
            </p>
          </div>
          <Button className="mt-6 w-full" variant="primary" onClick={handleExport}>
            <DownloadCloud className="h-4 w-4" />
            Unduh File Backup (.planarka.json)
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Pulihkan Data dari File Cadangan</CardTitle>
                <CardDescription>Muat kembali data simulasi yang telah disimpan sebelumnya</CardDescription>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed">
              Pilih file `.planarka.json` hasil backup dari komputer lain untuk langsung melanjutkan simulasi pergeseran anggaran tanpa perlu input ulang.
            </p>
          </div>
          <label className="mt-6 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-900 hover:bg-zinc-200">
            <UploadCloud className="h-4 w-4 mr-2" />
            Pilih File Backup (.json)
            <input type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
          </label>
        </Card>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {statusMessage}
        </div>
      )}
    </div>
  );
}
