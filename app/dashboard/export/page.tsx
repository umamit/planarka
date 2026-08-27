"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileText, FileSpreadsheet, Printer, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ExportDocumentsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = () => {
    setIsExporting(true);
    const data = [
      ["KODE REKENING", "NAMA KEGIATAN", "ANGGARAN AWAL", "PERGESERAN (+/-)", "ANGGARAN AKHIR"],
      ["5.2.05.01.01.0001", "Pengadaan Buku Teks Kurikulum Merdeka", 45000000, -5000000, 40000000],
      ["5.1.02.02.01.0061", "Pemeliharaan Gedung Ringan", 20000000, 5000000, 25000000],
      ["5.1.02.02.01.0026", "Honor Guru Non-ASN", 72000000, 0, 72000000],
      ["5.1.02.02.01.0014", "Langganan Internet 12 Bulan", 18000000, 0, 18000000],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Simulasi_Pergeseran_BOS");
    XLSX.writeFile(wb, "Lembar_Kerja_Simulasi_BOS_2026.xlsx");
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("BERITA ACARA RAPAT PLENO PERGESERAN ANGGARAN BOS", 14, 20);
    doc.setFontSize(10);
    doc.text("Tahun Anggaran 2026 - Wilayah Kabupaten Pulau Taliabu", 14, 28);
    doc.text("Berdasarkan Permendikbudristek No. 63/2022 & No. 63/2023", 14, 34);

    (doc as any).autoTable({
      startY: 42,
      head: [["Kode Rekening", "Kegiatan Belanja", "Awal (Rp)", "Pergeseran (Rp)", "Akhir (Rp)"]],
      body: [
        ["5.2.05.01.01.0001", "Buku Teks Siswa Merdeka", "45.000.000", "-5.000.000", "40.000.000"],
        ["5.1.02.02.01.0061", "Pemeliharaan Ruang Ringan", "20.000.000", "+5.000.000", "25.000.000"],
        ["5.1.02.02.01.0026", "Honor Guru Non-ASN", "72.000.000", "0", "72.000.000"],
        ["5.1.02.02.01.0014", "Langganan Internet 12 Bulan", "18.000.000", "0", "18.000.000"],
      ],
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Mengetahui,", 14, finalY);
    doc.text("Kepala Sekolah", 14, finalY + 10);
    doc.text("Ketua Komite Sekolah", 80, finalY + 10);
    doc.text("Bendahara BOS", 150, finalY + 10);

    doc.text("( ................................... )", 14, finalY + 35);
    doc.text("( ................................... )", 80, finalY + 35);
    doc.text("( ................................... )", 150, finalY + 35);

    doc.save("Berita_Acara_Pergeseran_BOS_2026.pdf");
    setIsExporting(false);
  };

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
                <CardTitle className="text-base">Berita Acara Pleno & Lampiran (PDF)</CardTitle>
                <CardDescription>Format dokumen legal resmi bertanda tangan</CardDescription>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed">
              Dokumen PDF siap cetak mencakup tabel matriks pergeseran anggaran awal vs akhir, persentase kepatuhan 8 SNP, serta kolom tanda tangan sah 3 pilar sekolah (Kepala Sekolah, Bendahara, dan Komite).
            </p>
          </div>
          <Button className="mt-6 w-full" variant="primary" onClick={handleExportPdf} disabled={isExporting}>
            <Printer className="h-4 w-4" />
            Cetak Dokumen PDF Pleno
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Lembar Kerja Kompatibel ARKAS (Excel .xlsx)</CardTitle>
                <CardDescription>Format tabel perhitungan siap impor/input data</CardDescription>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-4 leading-relaxed">
              File Excel (.xlsx) dengan struktur kode rekening standar Permendagri 90 dan pemetaan 8 Standar Nasional Pendidikan untuk mempermudah operator saat penginputan ke aplikasi ARKAS Kemendikbudristek.
            </p>
          </div>
          <Button className="mt-6 w-full" variant="secondary" onClick={handleExportExcel} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4" />
            Ekspor Lembar Kerja (.xlsx)
          </Button>
        </Card>
      </div>
    </div>
  );
}
