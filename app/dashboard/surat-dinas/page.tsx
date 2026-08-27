"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LetterheadLogoUpload } from "@/components/surat/LetterheadLogoUpload";
import { useSchool } from "@/lib/context/SchoolContext";
import { Printer, FileText } from "lucide-react";
import jsPDF from "jspdf";

export default function DistrictLetterPage() {
  const { profile } = useSchool();
  const [letterNumber, setLetterNumber] = useState("421.2/084/SDN-01/BOB/2026");
  const [reason, setReason] = useState("");
  const [leftLogo, setLeftLogo] = useState<string | null>(null);
  const [rightLogo, setRightLogo] = useState<string | null>(null);

  const handlePrintLetter = () => {
    const doc = new jsPDF();

    // Render Kop Surat dengan Dual Logo jika diunggah
    if (leftLogo) {
      try {
        doc.addImage(leftLogo, "PNG", 14, 10, 22, 22);
      } catch (e) {
        console.error("Gagal load logo kiri:", e);
      }
    }

    if (rightLogo) {
      try {
        doc.addImage(rightLogo, "PNG", 174, 10, 22, 22);
      } catch (e) {
        console.error("Gagal load logo kanan:", e);
      }
    }

    doc.setFontSize(11);
    doc.text(`PEMERINTAH ${profile.province.toUpperCase()}`, 105, 14, { align: "center" });
    doc.text("DINAS PENDIDIKAN", 105, 19, { align: "center" });
    doc.setFontSize(13);
    doc.text((profile.schoolName || "NAMA SEKOLAH").toUpperCase(), 105, 25, { align: "center" });
    doc.setFontSize(8.5);
    doc.text(profile.address || "Alamat Sekolah", 105, 30, { align: "center" });
    doc.setLineWidth(0.8);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(10);
    doc.text(`Nomor   : ${letterNumber}`, 14, 44);
    doc.text("Lampiran: 1 (Satu) Berkas Lembar Kerja Simulasi", 14, 50);
    doc.text(`Perihal : Permohonan Pengesahan Pergeseran RKAS BOS ${profile.fiscalYear}`, 14, 56);

    doc.text("Kepada Yth.", 14, 66);
    doc.text(`Kepala ${profile.district}`, 14, 72);
    doc.text("di - Tempat", 14, 78);

    const body = `Dengan hormat, sehubungan dengan hasil kesepakatan Rapat Pleno Dewan Guru dan Komite Sekolah terkait penyesuaian rencana anggaran operasional sekolah, bersama ini kami mengajukan Permohonan Pengesahan Pergeseran Anggaran RKAS Dana BOS Tahun Anggaran ${profile.fiscalYear} dengan alasan pertimbangan: ${reason}.`;
    const splitBody = doc.splitTextToSize(body, 180);
    doc.text(splitBody, 14, 90);

    doc.text("Demikian surat permohonan ini kami sampaikan, atas perhatian dan persetujuan Bapak kami ucapkan terima kasih.", 14, 122);

    doc.text(`.............................. ${profile.fiscalYear}`, 130, 142);
    doc.text("Kepala Sekolah,", 130, 148);
    doc.text(profile.headmasterName || "Nama Kepala Sekolah", 130, 175);
    doc.text(`NIP. ${profile.headmasterNip || "-"}`, 130, 181);

    doc.save(`Surat_Pengantar_Dinas_${(profile.schoolName || "Sekolah").replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Generator Surat Permohonan Pengesahan ke Dinas</h1>
        <p className="text-xs text-zinc-500 mt-1">Dokumen Birokrasi Resmi Pengantar Usulan Pergeseran RKAS ke Dinas Pendidikan Kabupaten/Kota</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Pengaturan Kop Surat & Parameter Dokumen</CardTitle>
            <CardDescription>Unggah logo resmi Pemda (kiri) dan logo sekolah (kanan)</CardDescription>
          </CardHeader>

          <LetterheadLogoUpload
            leftLogo={leftLogo}
            rightLogo={rightLogo}
            onLeftLogoChange={setLeftLogo}
            onRightLogoChange={setRightLogo}
          />

          <div>
            <label className="text-xs font-semibold text-zinc-700">Nomor Surat Keluar Sekolah</label>
            <input
              type="text"
              value={letterNumber}
              onChange={(e) => setLetterNumber(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700">Alasan Pertimbangan Pergeseran</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 flex w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:outline-none"
            />
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-zinc-50/50">
          <div>
            <CardHeader className="p-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-900" />
                <CardTitle className="text-base">Pratinjau Tujuan Surat</CardTitle>
              </div>
              <CardDescription className="mt-1">Format resmi berkop ganda standar kedinasan</CardDescription>
            </CardHeader>
            <div className="mt-4 p-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 space-y-1">
              <div className="font-semibold text-zinc-900">{profile.district}</div>
              <div>Perihal: Permohonan Pengesahan Pergeseran RKAS {profile.fiscalYear}</div>
              <div className="text-[11px] text-zinc-500">
                Logo Terpasang: {leftLogo ? "Logo Kiri Aktif" : "Tanpa Logo Kiri"} | {rightLogo ? "Logo Kanan Aktif" : "Tanpa Logo Kanan"}
              </div>
            </div>
          </div>

          <Button className="mt-6 w-full" variant="primary" onClick={handlePrintLetter}>
            <Printer className="h-4 w-4" />
            Cetak Surat Permohonan Pengesahan (PDF)
          </Button>
        </Card>
      </div>
    </div>
  );
}
