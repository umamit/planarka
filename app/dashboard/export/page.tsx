"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useSchool } from "@/lib/context/SchoolContext";
import { createClient } from "@supabase/supabase-js";
import { formatRupiah } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RkasItem {
  code: string;
  name: string;
  initial: number;
  delta: number;
  final: number;
  snpCode: string;
}

export default function ExportDocumentsPage() {
  const { profile } = useSchool();
  const [isExporting, setIsExporting] = useState(false);
  const [items, setItems] = useState<RkasItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExportData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchExportData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data: dbItems } = await supabase
          .from("rkas_budget_items")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (dbItems) {
          setItems(dbItems.map((di: any) => ({
            code: di.account_code,
            name: di.activity_name,
            initial: Number(di.initial_budget) || 0,
            delta: Number(di.shifted_amount) || 0,
            final: Number(di.final_budget) || 0,
            snpCode: di.snp_code || "SNP-7",
          })));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);

    const dataHeader = [
      ["KODE REKENING", "NAMA KEGIATAN", "ANGGARAN AWAL", "PERGESERAN (+/-)", "ANGGARAN AKHIR"]
    ];

    const dataRows = items.map((it) => [
      it.code,
      it.name,
      it.initial,
      it.delta,
      it.final
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...dataHeader, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Simulasi_Pergeseran_BOS");
    XLSX.writeFile(wb, `Lembar_Kerja_Simulasi_BOS_${profile.schoolName || "Sekolah"}_${profile.fiscalYear}.xlsx`);
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    doc.setFontSize(13);
    doc.text("BERITA ACARA RAPAT PLENO PERGESERAN ANGGARAN BOS", 14, 20);
    doc.setFontSize(9.5);
    doc.text(`Tahun Anggaran ${profile.fiscalYear} - Sekolah: ${profile.schoolName} (NPSN: ${profile.npsn})`, 14, 27);
    doc.text(`Berdasarkan Permendikdasmen No. 8/2026 - ${profile.district || "Wilayah Kab. Pulau Taliabu"}`, 14, 33);

    const tableRows = items.map((it) => [
      it.code,
      it.name,
      formatRupiah(it.initial),
      (it.delta >= 0 ? "+" : "") + formatRupiah(it.delta),
      formatRupiah(it.final)
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [["Kode Rekening", "Kegiatan Belanja", "Awal (Rp)", "Pergeseran (Rp)", "Akhir (Rp)"]],
      body: tableRows.length > 0 ? tableRows : [["-", "Tidak ada data anggaran.", "Rp0", "Rp0", "Rp0"]],
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.text("Mengetahui,", 14, finalY);
    doc.text("Kepala Satuan Pendidikan,", 14, finalY + 8);
    doc.text("Ketua Komite Sekolah,", 80, finalY + 8);
    doc.text("Bendahara BOS,", 150, finalY + 8);

    doc.text(profile.headmasterName || "( ................................... )", 14, finalY + 30);
    doc.text(`NIP. ${profile.headmasterNip || "-"}`, 14, finalY + 35);

    doc.text("( ................................... )", 80, finalY + 30);
    doc.text("( ................................... )", 150, finalY + 30);

    doc.save(`Berita_Acara_Pergeseran_${profile.schoolName}.pdf`);
    setIsExporting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Mempersiapkan data ekspor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pusat Ekspor Dokumen Resmi & Berita Acara</h1>
        <p className="text-xs text-zinc-500 mt-1">Unduh Lembar Kerja Rapat Pleno format PDF & Excel Siap Cetak untuk Kepala Sekolah, Bendahara & Komite</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Berita Acara Rapat Pleno (PDF)</CardTitle>
                <CardDescription>Format formal dokumen kesepakatan komite sekolah bermaterai</CardDescription>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-600 leading-relaxed">
              Berkas ini memuat lembar persetujuan yang ditandatangani Kepala Sekolah, Bendahara, dan Ketua Komite untuk diserahkan ke Tim Manajemen BOS Dinas Pendidikan Kabupaten/Kota.
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-100 flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
              Cetak Berita Acara PDF
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Lembar Kerja Rincian Anggaran (Excel)</CardTitle>
                <CardDescription>Ekspor rincian pergeseran format spreadsheet untuk diunggah</CardDescription>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-600 leading-relaxed">
              Memudahkan penyalinan dan integrasi entri pergeseran akun belanja ke dalam aplikasi ARKAS resmi karena terstruktur berdasarkan baris kode rekening belanja BOSP.
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-100 flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FileSpreadsheet className="h-4 w-4 mr-1" />}
              Ekspor Lembar Kerja Excel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
