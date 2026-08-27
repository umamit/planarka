"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PaguConfigModalProps {
  studentCount: number;
  unitCost: number;
  silpa: number;
  bosKinerja: number;
  onSave: (students: number, cost: number, silpa: number, kinerja: number) => void;
}

export function PaguConfigModal({
  studentCount: initialStudents,
  unitCost: initialCost,
  silpa: initialSilpa,
  bosKinerja: initialKinerja,
  onSave,
}: PaguConfigModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [students, setStudents] = useState(initialStudents);
  const [cost, setCost] = useState(initialCost);
  const [silpa, setSilpa] = useState(initialSilpa);
  const [kinerja, setKinerja] = useState(initialKinerja);

  // Sinkronkan state lokal ketika data props berubah (data Supabase berhasil dimuat)
  useEffect(() => {
    setStudents(initialStudents);
    setCost(initialCost);
    setSilpa(initialSilpa);
    setKinerja(initialKinerja);
  }, [initialStudents, initialCost, initialSilpa, initialKinerja]);

  const handleSave = () => {
    onSave(students, cost, silpa, kinerja);
    setIsOpen(false);
  };

  const calculatedTotal = (students * cost) + silpa + kinerja;

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Ubah / Sesuaikan Parameter Pagu
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg shadow-xl space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base">Pengaturan Parameter Pagu Anggaran BOS</CardTitle>
              <CardDescription>Sesuaikan jumlah siswa riil, tarif wilayah, SiLPA, dan BOS Kinerja</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Jumlah Siswa Riil</label>
                <input
                  type="number"
                  value={students}
                  onChange={(e) => setStudents(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tarif BOS / Siswa (Rp)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">SiLPA Tahun Lalu (Rp)</label>
                <input
                  type="number"
                  value={silpa}
                  onChange={(e) => setSilpa(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">BOS Kinerja / Afirmasi (Rp)</label>
                <input
                  type="number"
                  value={kinerja}
                  onChange={(e) => setKinerja(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs flex justify-between items-center">
              <span className="text-zinc-600 font-medium">Estimasi Pagu Baru:</span>
              <span className="font-bold text-zinc-900 text-sm">{formatRupiah(calculatedTotal)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Simpan Perubahan Pagu
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
