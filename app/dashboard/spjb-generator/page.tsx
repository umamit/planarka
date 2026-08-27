"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LetterheadLogoUpload } from "@/components/surat/LetterheadLogoUpload";
import { SpjbData, validateSpjb } from "@/lib/calculations/spjb-generator";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { FileCheck, Printer, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SpjbGeneratorPage() {
  const { profile } = useSchool();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SpjbData>({
    schoolName: "",
    npsn: "",
    headmasterName: "",
    headmasterNip: "",
    fiscalYear: 2026,
    periodPhase: "Tahap 1",
    totalReceived: 0,
    totalSpent: 0,
    remainingBalance: 0,
  });

  const [leftLogo, setLeftLogo] = useState<string | null>(null);
  const [rightLogo, setRightLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchSpjbDatabaseValues();
  }, [profile.npsn, profile.fiscalYear, data.periodPhase]);

  const fetchSpjbDatabaseValues = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("phase_1_allocation, phase_2_allocation")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        let received = 0;
        if (alloc) {
          received = data.periodPhase === "Tahap 1" 
            ? Number(alloc.phase_1_allocation) || 0 
            : Number(alloc.phase_2_allocation) || 0;
        }

        const { data: items } = await supabase
          .from("rkas_budget_items")
          .select("final_budget")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        let spent = 0;
        if (items) {
          spent = items.reduce((sum, item) => sum + Number(item.final_budget), 0);
        }

        setData((prev) => ({
          ...prev,
          schoolName: profile.schoolName || "",
          npsn: profile.npsn || "",
          headmasterName: profile.headmasterName || "",
          headmasterNip: profile.headmasterNip || "",
          fiscalYear: profile.fiscalYear || 2026,
          totalReceived: received,
          totalSpent: spent,
          remainingBalance: Math.max(0, received - spent),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const { isValid } = validateSpjb(data);

  const handlePrintSpjb = () => {
    const doc = new jsPDF();

    if (leftLogo) {
      try { doc.addImage(leftLogo, "PNG", 14, 10, 20, 20); } catch (e) {}
    }
    if (rightLogo) {
      try { doc.addImage(rightLogo, "PNG", 176, 10, 20, 20); } catch (e) {}
    }

    doc.setFontSize(11);
    doc.text("SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM / SPJB)", 105, 16, { align: "center" });
    doc.setFontSize(9.5);
    doc.text("PENGGUNAAN DANA BANTUAN OPERASIONAL SATUAN PENDIDIKAN (BOSP)", 105, 22, { align: "center" });
    doc.text(`TAHUN ANGGARAN ${data.fiscalYear}`, 105, 27, { align: "center" });
    doc.line(14, 32, 196, 32);

    doc.setFontSize(9.5);
    doc.text("Yang bertanda tangan di bawah ini:", 14, 40);
    doc.text(`Nama Kepala Sekolah  : ${data.headmasterName}`, 14, 46);
    doc.text(`NIP                 : ${data.headmasterNip}`, 14, 51);
    doc.text(`Nama Satuan Pendidikan: ${data.schoolName}`, 14, 56);
    doc.text(`NPSN                : ${data.npsn}`, 14, 61);

    const bodyText = `Menyatakan dengan sesungguhnya bahwa bertanggung jawab penuh atas penggunaan Dana BOS ${data.periodPhase} Tahun ${data.fiscalYear} dengan rincian penerimaan sebesar ${formatRupiah(data.totalReceived)}, realisasi belanja sebesar ${formatRupiah(data.totalSpent)}, dan sisa saldo sebesar ${formatRupiah(data.remainingBalance)}. Apabila di kemudian hari terdapat penyimpangan atau kerugian negara, saya bersedia bertanggung jawab secara administratif, perdata, maupun pidana sesuai peraturan perundang-undangan.`;

    const splitText = doc.splitTextToSize(bodyText, 180);
    doc.text(splitText, 14, 70);

    doc.text("Demikian pernyataan ini dibuat dengan sadar dan penuh tanggung jawab.", 14, 110);

    const dateToday = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const cityName = profile.address ? profile.address.split(",")[0].replace(/jl\.|jalan|no\.|gg\./gi, "").trim().split(" ").slice(-1)[0] : (profile.district.split(" ")[2] || "Taliabu");
    doc.text(`${cityName}, ${dateToday}`, 130, 125);
    doc.text("Kepala Satuan Pendidikan,", 130, 130);
    doc.text("Materai", 130, 145);
    doc.text("Rp 10.000", 130, 150);
    doc.text(data.headmasterName, 130, 165);
    doc.text(`NIP. ${data.headmasterNip}`, 130, 170);

    doc.save(`SPJB_${data.periodPhase}_${data.schoolName}.pdf`);
  };

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memproses dokumen SPJB...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pembuat SPTJM / SPJB Mutlak</h1>
        <p className="text-xs text-zinc-500 mt-1">Dokumen Legalitas Tanggung Jawab Mutlak Penggunaan Dana BOSP Bermaterai Rp10.000</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Pengaturan Periode & Bukti</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Periode Penyaluran BOSP</label>
                <select
                  value={data.periodPhase}
                  onChange={(e) => setData({ ...data, periodPhase: e.target.value as "Tahap 1" | "Tahap 2" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="Tahap 1">Tahap 1 (50%)</option>
                  <option value="Tahap 2">Tahap 2 (50%)</option>
                </select>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <label className="font-semibold text-zinc-700 block mb-2">Kop Surat Logo</label>
                <LetterheadLogoUpload
                  leftLogo={leftLogo}
                  rightLogo={rightLogo}
                  onLeftLogoChange={setLeftLogo}
                  onRightLogoChange={setRightLogo}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="space-y-6 h-full flex flex-col justify-between">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-zinc-700" />
                <CardTitle className="text-sm">Pratinjau Rincian Nilai SPJB (Data Asli Supabase)</CardTitle>
              </div>
              <CardDescription>Ringkasan realisasi penggunaan BOSP untuk dicetak ke berkas resmi</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-zinc-500 font-semibold block">Total Diterima (Pagu)</span>
                <span className="text-base font-bold text-zinc-900 block mt-1">{formatRupiah(data.totalReceived)}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-zinc-500 font-semibold block">Realisasi Penggunaan</span>
                <span className="text-base font-bold text-zinc-900 block mt-1">{formatRupiah(data.totalSpent)}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-zinc-500 font-semibold block">Sisa Saldo Kas</span>
                <span className="text-base font-bold text-zinc-900 block mt-1">{formatRupiah(data.remainingBalance)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                variant="primary"
                onClick={handlePrintSpjb}
                disabled={!isValid}
              >
                <Printer className="h-4 w-4 mr-1" />
                Unduh SPTJM / SPJB PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
