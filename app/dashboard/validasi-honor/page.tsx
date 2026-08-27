"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { ShieldCheck, Plus, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HonorValidationPage() {
  const { profile } = useSchool();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    nuptk: "",
    isRegisteredDapodik: true,
    isNonAsn: true,
    hasCertificationTpg: false,
    monthlyHonor: 0,
    monthsCount: 12,
  });

  useEffect(() => {
    fetchTeachers();
  }, [profile.npsn]);

  const fetchTeachers = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data } = await supabase
          .from("honor_recipients_validation")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (data) setTeachers(data);
      }
    } catch (e) {
      console.error("Gagal memuat data guru:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !profile.npsn) return;

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        // Hitung total honor tahunan
        const totalHonor = newTeacher.monthlyHonor * newTeacher.monthsCount;

        // Validasi kriteria sah (Pasal 40)
        const isEligible = 
          newTeacher.isRegisteredDapodik && 
          newTeacher.isNonAsn && 
          !newTeacher.hasCertificationTpg && 
          Boolean(newTeacher.nuptk && newTeacher.nuptk.trim().length >= 10);

        const { error } = await supabase.from("honor_recipients_validation").insert([
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            teacher_name: newTeacher.name,
            nuptk: newTeacher.nuptk,
            is_registered_dapodik: newTeacher.isRegisteredDapodik,
            is_non_asn: newTeacher.isNonAsn,
            has_certification_tpg: newTeacher.hasCertificationTpg,
            monthly_honor_amount: newTeacher.monthlyHonor,
            months_count: newTeacher.monthsCount,
            total_honor_annual: totalHonor,
            is_eligible: isEligible,
          },
        ]);

        if (!error) {
          setShowAddForm(false);
          setNewTeacher({
            name: "",
            nuptk: "",
            isRegisteredDapodik: true,
            isNonAsn: true,
            hasCertificationTpg: false,
            monthlyHonor: 0,
            monthsCount: 12,
          });
          fetchTeachers();
        } else {
          alert("Gagal menambahkan guru: " + error.message);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Hapus data pendidik ini?")) return;
    const { error } = await supabase.from("honor_recipients_validation").delete().eq("id", id);
    if (!error) fetchTeachers();
  };

  // Kalkulasi Audit Ringkasan
  const totalEligibleHonor = teachers
    .filter((t) => t.is_eligible)
    .reduce((sum, t) => sum + Number(t.total_honor_annual), 0);

  const totalIneligibleHonor = teachers
    .filter((t) => !t.is_eligible)
    .reduce((sum, t) => sum + Number(t.total_honor_annual), 0);

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat data pendidik...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Validasi Kepatuhan Honor Guru Non-ASN</h1>
          <p className="text-xs text-zinc-500 mt-1">Pemeriksaan 4 Syarat Sah Pasal 40 Permendikbudristek No. 63/2022 (Pencegah Temuan TGR BPK)</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Pendidik
        </Button>
      </div>

      {showAddForm && (
        <Card className="space-y-4 max-w-xl">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">Tambah Data Penerima Honor</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Nama Pendidik</label>
                <input
                  type="text"
                  required
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                  placeholder="Nama Lengkap & Gelar"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">NUPTK (16 Digit)</label>
                <input
                  type="text"
                  value={newTeacher.nuptk}
                  onChange={(e) => setNewTeacher({ ...newTeacher, nuptk: e.target.value })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                  placeholder="Kosongkan jika belum ada"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Terdaftar Dapodik?</label>
                <select
                  value={String(newTeacher.isRegisteredDapodik)}
                  onChange={(e) => setNewTeacher({ ...newTeacher, isRegisteredDapodik: e.target.value === "true" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="true">Ya</option>
                  <option value="false">Tidak</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Status Kepegawaian</label>
                <select
                  value={String(newTeacher.isNonAsn)}
                  onChange={(e) => setNewTeacher({ ...newTeacher, isNonAsn: e.target.value === "true" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="true">Non-ASN (Honor)</option>
                  <option value="false">PNS / P3K</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Menerima TPG (Sertifikasi)?</label>
                <select
                  value={String(newTeacher.hasCertificationTpg)}
                  onChange={(e) => setNewTeacher({ ...newTeacher, hasCertificationTpg: e.target.value === "true" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="false">Belum</option>
                  <option value="true">Sudah</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Honor Per Bulan (Rp)</label>
                <input
                  type="number"
                  required
                  value={newTeacher.monthlyHonor}
                  onChange={(e) => setNewTeacher({ ...newTeacher, monthlyHonor: Number(e.target.value) })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Jumlah Bulan Aktif</label>
                <select
                  value={newTeacher.monthsCount}
                  onChange={(e) => setNewTeacher({ ...newTeacher, monthsCount: Number(e.target.value) })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900 font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>{m} Bulan</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Simpan Guru
              </Button>
            </div>
          </form>
        </Card>
      )}

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
        {teachers.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-400">Belum ada data pendidik yang didaftarkan.</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
                <th className="p-3 font-semibold">Nama Pendidik</th>
                <th className="p-3 font-semibold">NUPTK</th>
                <th className="p-3 font-semibold">Dapodik</th>
                <th className="p-3 font-semibold">Status ASN</th>
                <th className="p-3 font-semibold">Sertifikasi (TPG)</th>
                <th className="p-3 font-semibold">Honor / Thn</th>
                <th className="p-3 font-semibold">Hasil Audit</th>
                <th className="p-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/20">
                  <td className="p-3 font-semibold text-zinc-900">{t.teacher_name}</td>
                  <td className="p-3 font-mono text-[10px]">{t.nuptk || "TIDAK ADA NUPTK"}</td>
                  <td className="p-3">
                    <Badge variant={t.is_registered_dapodik ? "success" : "danger"}>
                      {t.is_registered_dapodik ? "Terdaftar" : "Tidak"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={t.is_non_asn ? "info" : "danger"}>
                      {t.is_non_asn ? "Non-ASN" : "PNS/P3K"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={!t.has_certification_tpg ? "success" : "danger"}>
                      {!t.has_certification_tpg ? "Belum" : "Sudah"}
                    </Badge>
                  </td>
                  <td className="p-3 font-semibold">{formatRupiah(t.total_honor_annual)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 font-semibold ${t.is_eligible ? "text-emerald-700" : "text-rose-700"}`}>
                      {t.is_eligible ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Sah / Aman
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" /> Temuan BPK!
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteTeacher(t.id)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
