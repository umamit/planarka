"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { verifyLicenseKey } from "@/lib/calculations/license-engine";
import { Key, CheckCircle2, AlertCircle } from "lucide-react";

export default function LicenseManagementPage() {
  const [npsn] = useState<string>("60201829");
  const [schoolName] = useState<string>("SD Negeri 1 Bobong");
  const [inputKey, setInputKey] = useState<string>("IBRA-BOS-2026-60201829-1093");
  const [isActivated, setIsActivated] = useState<boolean>(true);
  const [activationMessage, setActivationMessage] = useState<string>("");

  const handleActivate = () => {
    const isValid = verifyLicenseKey(npsn, inputKey);
    if (isValid) {
      setIsActivated(true);
      setActivationMessage("Lisensi Premium Berhasil Diaktifkan untuk Tahun Anggaran 2026.");
    } else {
      setIsActivated(false);
      setActivationMessage("Kunci lisensi tidak valid untuk NPSN ini. Hubungi IBRA Digital Engineering.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Aktivasi & Status Lisensi Komersial</h1>
        <p className="text-xs text-zinc-500 mt-1">Penguncian Hak Akses & Langganan Tahunan Sekolah Pintar Suite (IBRA Digital Engineering)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Langganan</CardDescription>
            <Badge variant={isActivated ? "success" : "danger"}>
              {isActivated ? "Aktif" : "Terkunci"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">
            {isActivated ? "Lisensi Premium" : "Trial / Terkunci"}
          </CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Berlaku s.d 31 Desember 2026</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>NPSN Terdaftar</CardDescription>
            <Badge variant="default">Verified</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1 font-mono">{npsn}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">{schoolName}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Jenis Lisensi</CardDescription>
            <Badge variant="default">Tier SD</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">Annual SD Tier</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">SNP-7 Legal BOS Compliant</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-zinc-900" />
            <CardTitle className="text-base">Input Kunci Lisensi Sekolah (License Key)</CardTitle>
          </div>
          <CardDescription>Masukkan kode lisensi resmi yang diterbitkan oleh IBRA Digital Engineering</CardDescription>
        </CardHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700">Kode Lisensi (Format: IBRA-BOS-2026-NPSN-XXXX)</label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-xs font-bold focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <Button variant="primary" onClick={handleActivate}>
            Verifikasi & Aktifkan Lisensi
          </Button>

          {activationMessage && (
            <div className={`rounded-xl border p-3 text-xs font-semibold flex items-center gap-2 ${
              isActivated ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
            }`}>
              {isActivated ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {activationMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
