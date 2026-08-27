"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LetterheadLogoUpload } from "@/components/surat/LetterheadLogoUpload";
import { SpjbData, validateSpjb } from "@/lib/calculations/spjb-generator";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { FileCheck, Printer } from "lucide-react";
import jsPDF from "jspdf";

export default function SpjbGeneratorPage() {
  const { profile } = useSchool();
  const [data, setData] = useState<SpjbData>({
    schoolName: profile.schoolName || "SD Negeri 1 Bobong",
    npsn: profile.npsn || "60200589",
    headmasterName: profile.headmasterName || "Husnita Usman, S.Pd., M.Pd.",
    headmasterNip: profile.headmasterNip || "19820514 200801 2 015",
    fiscalYear: profile.fiscalYear || 2026,
    periodPhase: "Tahap 1",
    totalReceived: 0,
    totalSpent: 0,
    remainingBalance: 0,
  });
  const [leftLogo, setLeftLogo] = useState<string | null>(null);
  const [rightLogo, setRightLogo] = useState<string | null>(null);

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
    doc.text("Yang bertanda tangan di bawah ini:", 14, 42);
    doc.text(`Nama                  : ${data.headmasterName}`, 14, 49);
    doc.text(`NIP                   : ${data.headmasterNip}`, 14, 55);
    doc.text(`Jabatan               : Kepala Sekolah`, 14, 61);
    doc.text(`Nama Satuan Pendidikan: ${data.schoolName} (NPSN: ${data.npsn})`, 14, 67);

    const bodyText = `Menyatakan dengan sesungguhnya bahwa bertanggung jawab penuh atas penggunaan Dana BOS ${data.periodPhase} Tahun ${data.fiscalYear} dengan rincian penerimaan sebesar ${formatRupiah(data.totalReceived)}, realisasi belanja sebesar ${formatRupiah(data.totalSpent)}, dan sisa saldo sebesar ${formatRupiah(data.remainingBalance)}. Apabila di kemudian hari terdapat penyimpangan atau kerugian negara, saya bersedia bertanggung jawab secara administratif, perdata, maupun pidana sesuai peraturan perundang-undangan.`;

    const splitText = doc.splitTextToSize(bodyText, 180);
    doc.text(splitText, 14, 78);

    doc.text("Bobong, .............................. 2026", 130, 120);
    doc.text("Kepala Satuan Pendidikan,", 130, 126);
    doc.text("(Materai Rp 10.000)", 130, 140);
    doc.text(data.headmasterName, 130, 155);
    doc.text(`NIP. ${data.headmasterNip}`, 130, 161);

    doc.save(`SPJB_BOS_${data.schoolName.replace(/\s+/g, "_")}_${data.fiscalYear}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Generator SPJB / SPTJM Tanggung Jawab Mutlak</h1>
        <p className="text-xs text-zinc-500 mt-1">Dokumen Hukum Wajib Bermaterai Rp 10.000 untuk Syarat Pencairan BOS Tahap 2 & Audit Inspektorat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Pengaturan Logo Kop & Identitas Kepala Sekolah</CardTitle>
          </CardHeader>

          <LetterheadLogoUpload
            leftLogo={leftLogo}
            rightLogo={rightLogo}
            onLeftLogoChange={setLeftLogo}
            onRightLogoChange={setRightLogo}
          />

          <div>
            <label className="text-xs font-semibold text-zinc-700">Nama Lengkap Kepala Sekolah</label>
            <input
              type="text"
              value={data.headmasterName}
              onChange={(e) => setData({ ...data, headmasterName: e.target.value })}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700">NIP Kepala Sekolah</label>
            <input
              type="text"
              value={data.headmasterNip}
              onChange={(e) => setData({ ...data, headmasterNip: e.target.value })}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold focus:outline-none"
            />
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-zinc-50/50">
          <div>
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-zinc-900" />
                <CardTitle className="text-base">Pratinjau Legalitas Dokumen SPJB</CardTitle>
              </div>
              <CardDescription className="mt-1">Pernyataan kesanggupan audit administrasi, perdata, dan pidana</CardDescription>
            </CardHeader>

            <div className="mt-4 space-y-2 text-xs text-zinc-600 bg-white p-4 rounded-xl border border-zinc-200">
              <div className="flex justify-between"><span>Penerimaan Dana:</span><span className="font-semibold">{formatRupiah(data.totalReceived)}</span></div>
              <div className="flex justify-between"><span>Realisasi Belanja:</span><span className="font-semibold text-emerald-700">{formatRupiah(data.totalSpent)}</span></div>
              <div className="flex justify-between"><span>Sisa Saldo Kas:</span><span className="font-semibold text-amber-700">{formatRupiah(data.remainingBalance)}</span></div>
            </div>
          </div>

          <Button className="mt-6 w-full" variant="primary" onClick={handlePrintSpjb} disabled={!isValid}>
            <Printer className="h-4 w-4" />
            Cetak Dokumen SPJB Resmi (PDF)
          </Button>
        </Card>
      </div>
    </div>
  );
}
