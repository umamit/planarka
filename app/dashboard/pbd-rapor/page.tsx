"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { createClient } from "@supabase/supabase-js";
import { Edit3, Check, Loader2, Award, AlertTriangle, ShieldCheck } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PbdIndicator {
  id: string;
  indicatorCode: string;
  indicatorName: string;
  scoreValue: number;
  scoreStatus: "merah" | "kuning" | "hijau";
  recommendationText: string;
}

const DEFAULT_INDICATORS = [
  { code: "A.1", name: "Kemampuan Literasi Siswa", score: 60.5, status: "kuning", recommendation: "Peningkatan kualitas perpustakaan sekolah dan program literasi membaca 15 menit sebelum kelas." },
  { code: "A.2", name: "Kemampuan Numerasi Siswa", score: 45.2, status: "merah", recommendation: "Pelatihan guru metode pembelajaran matematika interaktif (Gasing) dan alat peraga numerasi dasar." },
  { code: "D.1", name: "Indeks Keamanan Satuan Pendidikan", score: 85.0, status: "hijau", recommendation: "Pemeliharaan program patroli keamanan sekolah dan sosialisasi pencegahan perundungan (bullying) rutin." },
  { code: "D.2", name: "Indeks Kebinekaan Sekolah", score: 72.8, status: "hijau", recommendation: "Pelaksanaan festival kebudayaan lokal sekolah dan proyek penguatan profil pelajar pancasila (P5)." },
];

export default function PbdRaporPage() {
  const { profile } = useSchool();
  const [indicators, setIndicators] = useState<PbdIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ scoreValue: 0, scoreStatus: "kuning" as "merah" | "kuning" | "hijau", recommendationText: "" });

  useEffect(() => {
    fetchRaporData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchRaporData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        // Tarik indikator dari Supabase
        const { data: dbIndicators } = await supabase
          .from("pbd_rapor_indicators")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (dbIndicators && dbIndicators.length > 0) {
          setIndicators(dbIndicators.map((di: any) => ({
            id: di.id,
            indicatorCode: di.indicator_code,
            indicatorName: di.indicator_name,
            scoreValue: Number(di.score_value) || 0,
            scoreStatus: di.score_status as "merah" | "kuning" | "hijau",
            recommendationText: di.recommendation_text || "",
          })));
        } else {
          // Inisialisasi data default ke database
          const inserts = DEFAULT_INDICATORS.map((di) => ({
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            indicator_code: di.code,
            indicator_name: di.name,
            score_value: di.score,
            score_status: di.status,
            recommendation_text: di.recommendation,
          }));

          const { data: newIndicators } = await supabase
            .from("pbd_rapor_indicators")
            .insert(inserts)
            .select();

          if (newIndicators) {
            setIndicators(newIndicators.map((di: any) => ({
              id: di.id,
              indicatorCode: di.indicator_code,
              indicatorName: di.indicator_name,
              scoreValue: Number(di.score_value),
              scoreStatus: di.score_status as "merah" | "kuning" | "hijau",
              recommendationText: di.recommendation_text,
            })));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: PbdIndicator) => {
    setEditId(item.id);
    setEditValues({
      scoreValue: item.scoreValue,
      scoreStatus: item.scoreStatus,
      recommendationText: item.recommendationText,
    });
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from("pbd_rapor_indicators")
        .update({
          score_value: editValues.scoreValue,
          score_status: editValues.scoreStatus,
          recommendation_text: editValues.recommendationText,
        })
        .eq("id", id);

      if (!error) {
        setIndicators((prev) =>
          prev.map((ind) =>
            ind.id === id
              ? { ...ind, scoreValue: editValues.scoreValue, scoreStatus: editValues.scoreStatus, recommendationText: editValues.recommendationText }
              : ind
          )
        );
        setEditId(null);
      } else {
        alert("Gagal memperbarui nilai rapor.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat Rapor Pendidikan PBD...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Perencanaan Berbasis Data (Rapor PBD)</h1>
        <p className="text-xs text-zinc-500 mt-1">Pemetaan Mutu Sekolah Berdasarkan Asesmen Nasional & Rencana Tindak Lanjut RKAS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicators.map((item) => {
          const isRed = item.scoreStatus === "merah";
          const isYellow = item.scoreStatus === "kuning";
          return (
            <Card key={item.id} className="relative">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-zinc-500">{item.indicatorCode} - {item.indicatorName}</CardDescription>
                <Badge variant={isRed ? "danger" : isYellow ? "warning" : "success"}>
                  {item.scoreStatus.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold mt-2">{item.scoreValue.toFixed(1)} / 100</CardTitle>
            </Card>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
              <th className="p-3 font-semibold w-16">Kode</th>
              <th className="p-3 font-semibold w-52">Indikator Mutu AN</th>
              <th className="p-3 font-semibold w-24">Skor Riil</th>
              <th className="p-3 font-semibold w-32">Status Rapor</th>
              <th className="p-3 font-semibold">Rekomendasi Tindak Lanjut Kegiatan BOSP</th>
              <th className="p-3 font-semibold text-right w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {indicators.map((item) => {
              const isEditing = editId === item.id;
              return (
                <tr key={item.id} className="hover:bg-zinc-50/50">
                  <td className="p-3 font-mono font-bold text-zinc-650">{item.indicatorCode}</td>
                  <td className="p-3 font-semibold text-zinc-900">{item.indicatorName}</td>
                  <td className="p-3 text-zinc-800">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.scoreValue}
                        onChange={(e) => setEditValues({ ...editValues, scoreValue: Number(e.target.value) })}
                        className="w-16 h-8 rounded-lg border border-zinc-200 px-2 focus:outline-none focus:border-zinc-900 font-mono font-bold"
                      />
                    ) : (
                      item.scoreValue.toFixed(1)
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={editValues.scoreStatus}
                        onChange={(e) => setEditValues({ ...editValues, scoreStatus: e.target.value as any })}
                        className="h-8 rounded-lg border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900 font-medium"
                      >
                        <option value="merah">MERAH</option>
                        <option value="kuning">KUNING</option>
                        <option value="hijau">HIJAU</option>
                      </select>
                    ) : (
                      <Badge variant={item.scoreStatus === "merah" ? "danger" : item.scoreStatus === "kuning" ? "warning" : "success"}>
                        {item.scoreStatus.toUpperCase()}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-zinc-600">
                    {isEditing ? (
                      <textarea
                        value={editValues.recommendationText}
                        onChange={(e) => setEditValues({ ...editValues, recommendationText: e.target.value })}
                        className="w-full min-h-[50px] p-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
                      />
                    ) : (
                      item.recommendationText
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={savingId === item.id}
                        className="text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors inline-flex"
                        title="Simpan"
                      >
                        {savingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-zinc-600 hover:bg-zinc-100 p-1.5 rounded-lg transition-colors inline-flex"
                        title="Edit Nilai"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
