"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_BOOKS } from "@/lib/constants/sample-books";
import { HET_ZONES, DEFAULT_HET_ZONE } from "@/lib/constants/het-zones";
import { calculateBookProcurement } from "@/lib/calculations/book-procurement";
import { DapodikImportModal } from "@/components/books/DapodikImportModal";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { CheckCircle2, Info } from "lucide-react";

export default function BookProcurementCalculatorPage() {
  const [hetZone, setHetZone] = useState<number>(DEFAULT_HET_ZONE);
  const [shippingUnit] = useState<number>(2500);
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");

  const [students, setStudents] = useState<{ [grade: number]: number }>({ 1: 32, 2: 30, 4: 28, 5: 35, 7: 64 });
  const [rombels, setRombels] = useState<{ [grade: number]: number }>({ 1: 1, 2: 1, 4: 1, 5: 1, 7: 2 });

  const handleDapodikData = (newStudents: { [grade: number]: number }, newRombels: { [grade: number]: number }) => {
    setStudents(newStudents);
    setRombels(newRombels);
  };

  const filteredBooks = phaseFilter === "ALL" 
    ? SAMPLE_BOOKS 
    : SAMPLE_BOOKS.filter((b) => b.phase === phaseFilter);

  const { items, totalProcurementCost, totalExemplars } = calculateBookProcurement(
    filteredBooks,
    students,
    rombels,
    hetZone,
    shippingUnit
  );

  const estimatedPagu = 278400000;
  const bookPaguPercentage = (totalProcurementCost / estimatedPagu) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kalkulator Pengadaan Buku Kurikulum Merdeka</h1>
          <p className="text-xs text-zinc-500 mt-1">Kalkulasi Fleksibel Berbasis Kebutuhan Riil Siswa Sesuai Permendikbudristek No. 63/2022 & 63/2023</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-700">Zona HET:</label>
          <select
            value={hetZone}
            onChange={(e) => setHetZone(Number(e.target.value))}
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 focus:outline-none"
          >
            {HET_ZONES.map((z) => (
              <option key={z.zone} value={z.zone}>{z.name} - {z.description}</option>
            ))}
          </select>
        </div>
      </div>

      <DapodikImportModal onDataImported={handleDapodikData} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardDescription>Total Kebutuhan Buku</CardDescription>
          <CardTitle className="text-xl font-bold mt-1">{formatNumber(totalExemplars)} Eksemplar</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Buku Teks Siswa & Panduan Guru</p>
        </Card>
        <Card>
          <CardDescription>Total Anggaran Belanja Buku</CardDescription>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalProcurementCost)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">HET Zona {hetZone} + Estimasi Ongkir SIPLah</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Porsi Terhadap Total Pagu BOS</CardDescription>
            <Badge variant="success">Bebas Plafon</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{bookPaguPercentage.toFixed(1)}% dari Pagu</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Sesuai Kebutuhan Riil Rombel</p>
        </Card>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-zinc-700 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-600 leading-relaxed">
          <strong className="text-zinc-900 font-semibold block mb-0.5">Penjelasan Regulasi Belanja Buku (Permendikbudristek No. 63/2022 & 63/2023):</strong>
          Pada Juknis BOSP terbaru, <strong>tidak ada lagi batasan maksimal 20% yang kaku</strong> untuk belanja buku teks. Sekolah diberikan fleksibilitas penuh (prinsip fleksibel dan otonom) untuk membelanjakan buku sesuai kebutuhan riil siswa/rombel hingga terpenuhi rasio 1 siswa 1 buku teks utama. Batasan 20% pada versi regulasi lama kini hanya menjadi angka referensi historis.
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
              <th className="p-3 font-semibold">Judul Buku & Mata Pelajaran</th>
              <th className="p-3 font-semibold">Fase / Kelas</th>
              <th className="p-3 font-semibold">Kebutuhan</th>
              <th className="p-3 font-semibold">HET Zona {hetZone}</th>
              <th className="p-3 font-semibold text-right">Total Anggaran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {items.map((item) => (
              <tr key={item.book.id} className="hover:bg-zinc-50/50">
                <td className="p-3 font-medium text-zinc-900">{item.book.subjectTitle}</td>
                <td className="p-3"><Badge>Fase {item.book.phase} (Kls {item.book.classGrade})</Badge></td>
                <td className="p-3 font-semibold">{item.exemplarsNeeded} Eks</td>
                <td className="p-3">{formatRupiah(item.hetUnitCost)}</td>
                <td className="p-3 font-bold text-zinc-900 text-right">{formatRupiah(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
