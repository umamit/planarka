"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { generateLicenseKey } from "@/lib/calculations/license-engine";
import { createClient } from "@supabase/supabase-js";
import { Key, CheckCircle2, Plus, Trash2, ShieldCheck, Clipboard } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LicenseManagementPage() {
  const { profile, loading: profileLoading } = useSchool();
  const isSuperadmin = profile.npsn === "00000000";

  // State untuk Superadmin
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSchool, setNewSchool] = useState({
    npsn: "",
    schoolName: "",
    educationLevel: "SD",
    hetZone: 5,
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch daftar sekolah jika login sebagai Superadmin
  useEffect(() => {
    if (isSuperadmin) {
      fetchSchools();
    }
  }, [isSuperadmin]);

  const fetchSchools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tenants_schools")
      .select("*")
      .neq("npsn", "00000000")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSchools(data);
    }
    setLoading(false);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.npsn || !newSchool.schoolName) return;

    // Generate Kunci Lisensi secara otomatis menggunakan engine
    const licenseKey = generateLicenseKey(newSchool.npsn);

    const { error } = await supabase.from("tenants_schools").insert([
      {
        npsn: newSchool.npsn,
        school_name: newSchool.schoolName,
        education_level: newSchool.educationLevel,
        het_zone: newSchool.hetZone,
        license_type: "annual_premium",
        license_status: "active",
      },
    ]);

    if (!error) {
      setSuccessMsg(`Sekolah berhasil terdaftar! Kunci Lisensi: ${licenseKey}`);
      setNewSchool({ npsn: "", schoolName: "", educationLevel: "SD", hetZone: 5 });
      fetchSchools();
      setTimeout(() => setSuccessMsg(""), 10000);
    } else {
      alert("Gagal mendaftarkan sekolah. Kemungkinan NPSN sudah terdaftar.");
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sekolah ini dan menonaktifkan lisensinya?")) return;

    const { error } = await supabase.from("tenants_schools").delete().eq("id", id);
    if (!error) {
      fetchSchools();
    } else {
      alert("Gagal menghapus sekolah.");
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memverifikasi status lisensi...</span>
      </div>
    );
  }

  // 1. Tampilan Khusus Superadmin
  if (isSuperadmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Konsol Lisensi Superadmin</h1>
            <p className="text-xs text-zinc-500 mt-1">Kelola pendaftaran sekolah klien, buat kunci lisensi otomatis, dan blokir akses secara real-time</p>
          </div>
          <Badge className="bg-zinc-900 text-white flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            IBRA Superadmin
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Form Registrasi */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-base">Daftarkan Sekolah Baru</CardTitle>
                <CardDescription>Lisensi premium akan dibuat otomatis setelah sekolah didaftarkan</CardDescription>
              </CardHeader>

              <form onSubmit={handleAddSchool} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">NPSN Sekolah (8 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={newSchool.npsn}
                    onChange={(e) => setNewSchool({ ...newSchool, npsn: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
                    placeholder="Contoh: 60200589"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={newSchool.schoolName}
                    onChange={(e) => setNewSchool({ ...newSchool, schoolName: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-xs font-medium focus:border-zinc-900 focus:outline-none"
                    placeholder="Contoh: SD Negeri 1 Bobong"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">Jenjang</label>
                    <select
                      value={newSchool.educationLevel}
                      onChange={(e) => setNewSchool({ ...newSchool, educationLevel: e.target.value })}
                      className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-2 text-xs font-medium focus:border-zinc-900 focus:outline-none"
                    >
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">Zona HET</label>
                    <select
                      value={newSchool.hetZone}
                      onChange={(e) => setNewSchool({ ...newSchool, hetZone: Number(e.target.value) })}
                      className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-2 text-xs font-medium focus:border-zinc-900 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((z) => (
                        <option key={z} value={z}>Zona {z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full flex items-center justify-center gap-1">
                  <Plus className="h-4 w-4" /> Daftarkan Sekolah
                </Button>
              </form>

              {successMsg && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800 font-mono break-all space-y-1">
                  <div className="font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Berhasil!</div>
                  <div>{successMsg}</div>
                </div>
              )}
            </Card>
          </div>

          {/* Kolom Kanan: Daftar Sekolah Terdaftar */}
          <div className="lg:col-span-2">
            <Card className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-base">Sekolah Terdaftar & Status Lisensi</CardTitle>
                <CardDescription>Daftar seluruh klien aktif di database cloud Supabase</CardDescription>
              </CardHeader>

              {loading ? (
                <div className="text-center py-8 text-xs text-zinc-400">Mengambil data lisensi...</div>
              ) : schools.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">Belum ada sekolah terdaftar di database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-500 font-semibold">
                        <th className="py-2">Sekolah / NPSN</th>
                        <th className="py-2">Lisensi (License Key)</th>
                        <th className="py-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {schools.map((sch) => {
                        const generatedKey = generateLicenseKey(sch.npsn);
                        return (
                          <tr key={sch.id} className="hover:bg-zinc-50/50">
                            <td className="py-3 pr-2">
                              <div className="font-semibold text-zinc-800">{sch.school_name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">NPSN: {sch.npsn} | {sch.education_level} | Zona {sch.het_zone}</div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-700 select-all font-semibold">
                                  {generatedKey}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(generatedKey)}
                                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                                  title="Salin Kunci Lisensi"
                                >
                                  <Clipboard className="h-3.5 w-3.5" />
                                </button>
                                {copiedKey === generatedKey && (
                                  <span className="text-[9px] text-emerald-600 font-semibold">Tersalin</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteSchool(sch.id)}
                                className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex items-center"
                                title="Hapus Lisensi & Sekolah"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 2. Tampilan Standard (Untuk Sekolah Biasa)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Status Lisensi Sekolah</h1>
        <p className="text-xs text-zinc-500 mt-1">Informasi status langganan dan hak akses fitur premium PLANARKA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Langganan</CardDescription>
            <Badge variant="success">Aktif</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">Lisensi Premium</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Aktif untuk Tahun Anggaran {profile.fiscalYear || 2026}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>NPSN Satuan Pendidikan</CardDescription>
            <Badge variant="default">Terverifikasi</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1 font-mono">{profile.npsn || "Belum Set"}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">{profile.schoolName || "Atur di Pengaturan Sekolah"}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Tipe Hak Akses</CardDescription>
            <Badge variant="default">Tier {profile.educationLevel || "SD"}</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">Annual {profile.educationLevel || "SD"} Tier</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Akses Penuh Fitur Pre-ARKAS Simulator</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-0">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-zinc-900" />
            <CardTitle className="text-base">Informasi Lisensi Aktif</CardTitle>
          </div>
          <CardDescription>Kunci Lisensi tersimpan di sistem pengaman lokal browser Anda.</CardDescription>
        </CardHeader>
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mt-4 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase">Kunci Lisensi Terpasang</div>
          <div className="font-mono text-xs text-zinc-800 font-bold select-all break-all">
            {generateLicenseKey(profile.npsn || "60200589")}
          </div>
        </div>
      </Card>
    </div>
  );
}
