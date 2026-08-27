"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSchool } from "@/lib/context/SchoolContext";
import { CheckCircle2, School } from "lucide-react";

export default function PengaturanPage() {
  const { profile, updateProfile, isProfileComplete } = useSchool();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <div>
      <label className="text-xs font-semibold text-zinc-700 block mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pengaturan Profil Sekolah</h1>
          <p className="text-xs text-zinc-500 mt-1">Data ini digunakan otomatis di seluruh modul: SPJB, Surat Dinas, Lisensi, dan Ekspor Dokumen</p>
        </div>
        {isProfileComplete && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            Profil Lengkap
          </div>
        )}
      </div>

      <Card className="space-y-4">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2">
            <School className="h-5 w-5 text-zinc-700" />
            <CardTitle className="text-base">Identitas Satuan Pendidikan</CardTitle>
          </div>
          <CardDescription>Isi sesuai data resmi di Dapodik dan SK Kepala Sekolah</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("Nama Lengkap Sekolah", "schoolName")}
          {field("NPSN (8 Digit)", "npsn")}
          {field("Nama Kepala Sekolah (beserta gelar)", "headmasterName")}
          {field("NIP Kepala Sekolah", "headmasterNip")}
          {field("Alamat Sekolah", "address")}
          {field("Nama Dinas Pendidikan Tujuan Surat", "district")}
          {field("Provinsi", "province")}
          {field("Tahun Anggaran", "fiscalYear", "number")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Jenjang Sekolah</label>
            <select
              value={form.educationLevel}
              onChange={(e) => setForm({ ...form, educationLevel: e.target.value as "SD" | "SMP" })}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
            >
              <option value="SD">SD (Sekolah Dasar)</option>
              <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Zona HET Buku (1-5)</label>
            <select
              value={form.hetZone}
              onChange={(e) => setForm({ ...form, hetZone: Number(e.target.value) })}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
            >
              {[1,2,3,4,5].map(z => <option key={z} value={z}>Zona {z}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="primary" onClick={handleSave}>
            Simpan Profil Sekolah
          </Button>
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Tersimpan
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
