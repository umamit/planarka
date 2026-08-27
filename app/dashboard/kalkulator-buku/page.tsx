"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_BOOKS } from "@/lib/constants/sample-books";
import { HET_ZONES } from "@/lib/constants/het-zones";
import { calculateBookProcurement } from "@/lib/calculations/book-procurement";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Loader2, AlertTriangle } from "lucide-react";
import { DapodikUploader } from "@/components/shared/DapodikUploader";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BookProcurementPage() {
  const { profile } = useSchool();
  const [hetZone, setHetZone] = useState<number>(5); // Default Zona 5 Pulau Taliabu
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);

  // State siswa & rombel per kelas
  const [students, setStudents] = useState<{ [grade: number]: number }>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });
  const [rombels, setRombels] = useState<{ [grade: number]: number }>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });

  const [estimatedPagu, setEstimatedPagu] = useState<number>(0);

  useEffect(() => {
    fetchDapodikData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchDapodikData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id, het_zone")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        setHetZone(Number(school.het_zone) || 5);

        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          // Ambil pagu real
          const totalPaguVal = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
          setEstimatedPagu(totalPaguVal);

          // Map siswa & rombel
          const newStudents: { [grade: number]: number } = {};
          const newRombels: { [grade: number]: number } = {};

          for (let g = 1; g <= 9; g++) {
            newStudents[g] = Number(alloc[`students_grade_${g}` as keyof typeof alloc]) || 0;
            newRombels[g] = Number(alloc[`rombels_grade_${g}` as keyof typeof alloc]) || 0;
          }

          setStudents(newStudents);
          setRombels(newRombels);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDapodik = async (
    updatedStudents: { [grade: number]: number },
    updatedRombels: { [grade: number]: number }
  ) => {
    if (!profile.npsn) return;
    setAutoSaving(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        await supabase
          .from("bos_allocations")
          .upsert([
            {
              tenant_id: school.id,
              fiscal_year: profile.fiscalYear,
              students_grade_1: updatedStudents[1],
              students_grade_2: updatedStudents[2],
              students_grade_3: updatedStudents[3],
              students_grade_4: updatedStudents[4],
              students_grade_5: updatedStudents[5],
              students_grade_6: updatedStudents[6],
              students_grade_7: updatedStudents[7],
              students_grade_8: updatedStudents[8],
              students_grade_9: updatedStudents[9],
              rombels_grade_1: updatedRombels[1],
              rombels_grade_2: updatedRombels[2],
              rombels_grade_3: updatedRombels[3],
              rombels_grade_4: updatedRombels[4],
              rombels_grade_5: updatedRombels[5],
              rombels_grade_6: updatedRombels[6],
              rombels_grade_7: updatedRombels[7],
              rombels_grade_8: updatedRombels[8],
              rombels_grade_9: updatedRombels[9],
            },
          ], { onConflict: "tenant_id, fiscal_year" });
      }
    } catch (e) {
      console.error("Gagal auto-save Dapodik:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleStudentChange = (grade: number, value: number) => {
    const nextStudents = { ...students, [grade]: value };
    setStudents(nextStudents);
    handleUpdateDapodik(nextStudents, rombels);
  };

  const handleRombelChange = (grade: number, value: number) => {
    const nextRombels = { ...rombels, [grade]: value };
    setRombels(nextRombels);
    handleUpdateDapodik(students, nextRombels);
  };

  const handleDapodikParsed = ({ students: newStudents, rombels: newRombels }: any) => {
    setStudents(newStudents);
    setRombels(newRombels);
    handleUpdateDapodik(newStudents, newRombels);
  };

  const filteredBooks = phaseFilter === "ALL" 
    ? SAMPLE_BOOKS 
    : SAMPLE_BOOKS.filter((b) => b.phase === phaseFilter);

  const { items, totalProcurementCost, totalExemplars } = calculateBookProcurement(
    filteredBooks,
    students,
    rombels,
    hetZone,
    2500 // Ongkir flat SIPLah per buku
  );

  const bookPaguPercentage = estimatedPagu > 0 ? (totalProcurementCost / estimatedPagu) * 100 : 0;
  const isExceedingRecommendation = bookPaguPercentage > 20;

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat kalkulator buku HET...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kalkulator Pengadaan Buku HET (Kurikulum Merdeka)</h1>
          <p className="text-xs text-zinc-500 mt-1">Simulasi Kebutuhan Buku Siswa & Guru Sesuai Zonasi HET dan Estimasi Ongkos Kirim SIPLah</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
              Menyimpan perubahan otomatis...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardDescription>Total Anggaran Buku HET</CardDescription>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalProcurementCost)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Untuk {totalExemplars} Eksemplar (HET + Ongkir)</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Rasio Anggaran BOSP</CardDescription>
            <Badge variant={isExceedingRecommendation ? "warning" : "success"}>
              {isExceedingRecommendation ? "Saran >20%" : "Ideal (<20%)"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{bookPaguPercentage.toFixed(1)}%</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Total Pagu: {formatRupiah(estimatedPagu)}</p>
        </Card>

        <Card>
          <CardDescription>Zona HET Aktif</CardDescription>
          <CardTitle className="text-xl font-bold mt-1">Zona {hetZone}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">
            Wilayah HET: {HET_ZONES.find(z => z.zone === hetZone)?.description || "Maluku Utara"}
          </p>
        </Card>
      </div>

      {isExceedingRecommendation && (
        <Card className="border-amber-200 bg-amber-50/50 p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Peringatan Juknis: Belanja Buku Melampaui 20% Pagu</span>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Belanja buku Anda saat ini mencapai {bookPaguPercentage.toFixed(1)}% dari total pagu BOS. Meskipun pengadaan buku HET diperbolehkan sesuai kebutuhan riil, pastikan prioritas operasional sekolah dasar lainnya tetap tercukupi.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <DapodikUploader onDataParsed={handleDapodikParsed} />

          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-xs text-zinc-800">Ubah Jumlah Siswa & Rombel (Dapodik)</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                <div key={grade} className="grid grid-cols-3 gap-2 items-center text-xs">
                  <span className="font-semibold text-zinc-700">Kls {grade}</span>
                  <div>
                    <label className="text-[9px] text-zinc-400 block">Siswa</label>
                    <input
                      type="number"
                      value={students[grade]}
                      onChange={(e) => handleStudentChange(grade, Number(e.target.value))}
                      className="w-full h-8 rounded-lg border border-zinc-200 text-center font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 block">Rombel</label>
                    <input
                      type="number"
                      value={rombels[grade]}
                      onChange={(e) => handleRombelChange(grade, Number(e.target.value))}
                      className="w-full h-8 rounded-lg border border-zinc-200 text-center font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2">
            {["ALL", "A", "B", "C", "D"].map((phase) => (
              <Button
                key={phase}
                variant={phaseFilter === phase ? "primary" : "ghost"}
                size="sm"
                onClick={() => setPhaseFilter(phase)}
              >
                {phase === "ALL" ? "Semua Fase" : `Fase ${phase}`}
              </Button>
            ))}
          </div>

          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
                  <th className="p-3 font-semibold">Uraian Buku (Kurikulum Merdeka)</th>
                  <th className="p-3 font-semibold">Sasaran Kelas</th>
                  <th className="p-3 font-semibold">Harga HET</th>
                  <th className="p-3 font-semibold">Estimasi Ongkir</th>
                  <th className="p-3 font-semibold">Pemesanan</th>
                  <th className="p-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {items.map((item, idx) => (
                  <tr key={item.book.id || idx} className="hover:bg-zinc-50/50">
                    <td className="p-3">
                      <div className="font-semibold text-zinc-900">{item.book.subjectTitle}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Fase {item.book.phase} • {item.book.bookType}</div>
                    </td>
                    <td className="p-3 text-zinc-600 font-medium">Kelas {item.book.classGrade}</td>
                    <td className="p-3">{formatRupiah(item.hetUnitCost)}</td>
                    <td className="p-3">{formatRupiah(item.shippingUnitCost)}</td>
                    <td className="p-3 font-medium text-zinc-900">
                      {item.exemplarsNeeded} eks ({item.studentCount} siswa + {item.book.bookType === "Siswa" ? "0" : "1"} guru)
                    </td>
                    <td className="p-3 font-bold text-zinc-950 text-right">
                      {formatRupiah(item.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
