"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LetterheadLogoUpload } from "@/components/surat/LetterheadLogoUpload";
import { useSchool } from "@/lib/context/SchoolContext";
import { Printer, FileText } from "lucide-react";
import jsPDF from "jspdf";

export default function DistrictLetterPage() {
  const { profile } = useSchool();
  const [letterNumber, setLetterNumber] = useState("421.2/084/SDN/2026");
  const [reason, setReason] = useState("");
  const [leftLogo, setLeftLogo] = useState<string | null>(null);
  const [rightLogo, setRightLogo] = useState<string | null>(null);

  // Buat inisial nomor surat otomatis berdasarkan nama sekolah
  useEffect(() => {
    if (profile.schoolName) {
      const words = profile.schoolName.toUpperCase().split(" ");
      const abbreviation = words.map((w) => w.substring(0, 3)).join("-");
      setLetterNumber(`421.2/084/${abbreviation}/${profile.fiscalYear}`);
    }
  }, [profile]);

  const handlePrintLetter = () => {
    const doc = new jsPDF();

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PEMERINTAH KABUPATEN PULAU TALIABU", 105, 14, { align: "center" });
    
    // DINAS PENDIDIKAN (tanpa garis bawah)
    doc.setFontSize(12);
    doc.text("DINAS PENDIDIKAN", 105, 19, { align: "center" });

    doc.setFontSize(13);
    doc.text((profile.schoolName || "SD NEGERI BOBONG").toUpperCase(), 105, 26, { align: "center" });
    
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(8);
    doc.text(`Alamat: ${profile.address || "Jln. Mansur Sou, Desa Wayo, Kec. Taliabu Barat Kode Pos 97794"} | Website: sdnegeribobong.sch.id`, 105, 31, { align: "center" });
    
    doc.setLineWidth(0.8);
    doc.line(14, 34, 196, 34);

    doc.setFontSize(10);
    doc.text(`Nomor   : ${letterNumber}`, 14, 44);
    doc.text("Lampiran: 1 (Satu) Berkas Lembar Kerja Simulasi", 14, 50);
    doc.text(`Perihal : Permohonan Pengesahan Pergeseran RKAS BOS ${profile.fiscalYear}`, 14, 56);

    doc.text("Kepada Yth.", 14, 66);
    doc.text(`Kepala ${profile.district}`, 14, 72);
    doc.text("di - Tempat", 14, 78);

    const body = `Dengan hormat, sehubungan dengan hasil kesepakatan Rapat Pleno Dewan Guru dan Komite Sekolah terkait penyesuaian rencana anggaran operasional sekolah, bersama ini kami mengajukan Permohonan Pengesahan Pergeseran Anggaran RKAS Dana BOS Tahun Anggaran ${profile.fiscalYear} dengan alasan pertimbangan: ${reason || "penyelarasan kebutuhan belanja operasional tahunan sekolah"}.`;
    const splitBody = doc.splitTextToSize(body, 180);
    doc.text(splitBody, 14, 90);

    doc.text("Demikian surat permohonan pengesahan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.", 14, 130);

    const dateToday = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const cityName = profile.address ? profile.address.split(",")[0].replace(/jl\.|jalan|no\.|gg\./gi, "").trim().split(" ").slice(-1)[0] : (profile.district.split(" ")[2] || "Taliabu");
    doc.text(`${cityName}, ${dateToday}`, 130, 155);
    doc.text("Kepala Satuan Pendidikan,", 130, 160);
    doc.text(profile.headmasterName || "( ................................... )", 130, 185);
    doc.text(`NIP. ${profile.headmasterNip || "-"}`, 130, 190);

    doc.save(`Surat_Permohonan_Pengesahan_${profile.schoolName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Surat Pengantar Dinas Pendidikan</h1>
        <p className="text-xs text-zinc-500 mt-1">Pembuat Surat Pengantar Resmi Pengesahan RKAS ke Tim Manajemen BOS Dinas Pendidikan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-sm">Metadata Surat Dinas</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Nomor Surat Dinas</label>
                <input
                  type="text"
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Alasan Pengajuan Pergeseran</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: penyesuaian belanja buku HET Fase A dan pemeliharaan atap ruang kelas yang rusak."
                  className="w-full min-h-[90px] p-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
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
                <FileText className="h-5 w-5 text-zinc-700" />
                <CardTitle className="text-sm">Pratinjau Draft Surat Pengantar Resmi</CardTitle>
              </div>
              <CardDescription>Dokumen pengantar dinas otomatis menggunakan profil satuan pendidikan</CardDescription>
            </CardHeader>

            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-150 font-mono text-[10px] text-zinc-700 space-y-4 max-w-2xl">
              <div className="text-center font-bold border-b border-zinc-300 pb-2">
                <div>PEMERINTAH KABUPATEN PULAU TALIABU</div>
                <div className="text-xs my-0.5">DINAS PENDIDIKAN</div>
                <div className="text-sm font-extrabold">{profile.schoolName.toUpperCase() || "SD NEGERI BOBONG"}</div>
                <div className="italic font-normal text-[9px] text-zinc-500 mt-1">Alamat: {profile.address || "Jln. Mansur Sou, Desa Wayo, Kec. Taliabu Barat Kode Pos 97794"} | Website: sdnegeribobong.sch.id</div>
              </div>

              <div className="space-y-1">
                <div>Nomor   : {letterNumber}</div>
                <div>Lampiran: 1 (Satu) Berkas Lembar Kerja Simulasi</div>
                <div>Perihal : Permohonan Pengesahan Pergeseran RKAS BOS {profile.fiscalYear}</div>
              </div>

              <div className="space-y-1">
                <div>Kepada Yth.</div>
                <div className="font-bold">Kepala {profile.district}</div>
                <div>di - Tempat</div>
              </div>

              <div className="leading-relaxed">
                Dengan hormat, sehubungan dengan hasil kesepakatan Rapat Pleno Dewan Guru dan Komite Sekolah terkait penyesuaian rencana anggaran operasional sekolah, bersama ini kami mengajukan Permohonan Pengesahan Pergeseran Anggaran RKAS Dana BOS Tahun Anggaran {profile.fiscalYear} dengan alasan pertimbangan: {reason || "penyelarasan kebutuhan belanja operasional tahunan sekolah"}.
              </div>

              <div className="flex justify-end pt-4">
                <div className="text-right space-y-8 w-48">
                  <div>
                    <div>Taliabu, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                    <div>Kepala Satuan Pendidikan</div>
                  </div>
                  <div>
                    <div className="font-bold underline">{profile.headmasterName || "-"}</div>
                    <div>NIP. {profile.headmasterNip || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <Button
                variant="primary"
                onClick={handlePrintLetter}
                disabled={!reason.trim()}
              >
                <Printer className="h-4 w-4 mr-1" />
                Cetak Surat Pengantar PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
