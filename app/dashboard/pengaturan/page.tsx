"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSchool } from "@/lib/context/SchoolContext";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, School, Settings, Users, Database } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PengaturanPage() {
  const { profile, updateProfile, isProfileComplete, loading: profileLoading } = useSchool();
  const [saved, setSaved] = useState(false);
  const [dbStats, setDbStats] = useState({ schoolsCount: 0, rkasCount: 0 });

  const [form, setForm] = useState({ ...profile });
  const isSuperadmin = profile.npsn === "00000000";

  React.useEffect(() => {
    setForm({ ...profile });
    if (isSuperadmin) {
      fetchStats();
    }
  }, [profile, isSuperadmin]);

  const fetchStats = async () => {
    try {
      const { count: schCount } = await supabase
        .from("tenants_schools")
        .select("id", { count: "exact", head: true });
        
      const { count: rkCount } = await supabase
        .from("rkas_budget_items")
        .select("id", { count: "exact", head: true });

      setDbStats({
        schoolsCount: schCount || 0,
        rkasCount: rkCount || 0,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const success = await updateProfile(form);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-semibold text-zinc-700 block mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key] || "")}
        onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        placeholder={placeholder}
        className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none placeholder:text-zinc-400 placeholder:font-normal"
      />
    </div>
  );

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat pengaturan...</span>
      </div>
    );
  }

  // 1. Tampilan Khusus Superadmin (Sembunyikan Form Sekolah)
  if (isSuperadmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pengaturan Admin Pusat</h1>
          <p className="text-xs text-zinc-500 mt-1">Konsol identitas pengembang dan pemantauan statistik database PLANARKA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-xl">
              <Users className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
              <CardDescription>Total Sekolah Terdaftar</CardDescription>
              <CardTitle className="text-2xl font-bold mt-0.5">{dbStats.schoolsCount - 1} Sekolah</CardTitle>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-xl">
              <Database className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
              <CardDescription>Total Rencana Anggaran (RKAS)</CardDescription>
              <CardTitle className="text-2xl font-bold mt-0.5">{dbStats.rkasCount} Kegiatan</CardTitle>
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <CardHeader className="p-0">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-zinc-700" />
              <CardTitle className="text-base">Identitas Developer (IBRA HQ)</CardTitle>
            </div>
            <CardDescription>Informasi resmi legalitas pengembang aplikasi PLANARKA</CardDescription>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block font-semibold">Nama Developer</span>
              <span className="text-zinc-900 font-bold block mt-1">IBRA Digital Engineering</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-semibold">Wilayah Operasional</span>
              <span className="text-zinc-900 font-bold block mt-1">Maluku Utara / Kab. Pulau Taliabu</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-semibold">Kontak Legal</span>
              <span className="text-zinc-900 font-bold block mt-1">shot.ann09@gmail.com</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-semibold">Hak Cipta Proyek</span>
              <span className="text-zinc-900 font-bold block mt-1">Proprietary - All Rights Reserved &copy; 2026</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Tampilan Sekolah Biasa
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
          {field("Nama Lengkap Sekolah", "schoolName", "text", "Contoh: SD Negeri 1 Bobong")}
          {field("NPSN (8 Digit)", "npsn", "text", "Contoh: 60200589")}
          {field("Nama Kepala Sekolah (beserta gelar)", "headmasterName", "text", "Contoh: Drs. H. Ahmad Yani, M.Pd")}
          {field("NIP Kepala Sekolah", "headmasterNip", "text", "Contoh: 197508172002121001")}
          {field("Alamat Sekolah", "address", "text", "Contoh: Jl. Trans Taliabu No. 24, Bobong")}
          {field("Nama Dinas Pendidikan Tujuan Surat", "district", "text", "Contoh: Dinas Pendidikan Kabupaten Pulau Taliabu")}
          {field("Provinsi", "province", "text", "Contoh: Maluku Utara")}
          {field("Tahun Anggaran", "fiscalYear", "number", "2026")}
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
