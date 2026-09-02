import React from "react";
import { ShieldCheck, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function RegulationsBanner() {
  const rules = [
    {
      reg: "Permendikdasmen No. 8/2026",
      topic: "Batas Honor Non-ASN Sekolah Negeri",
      limit: "Maksimal 20% Pagu",
      status: "Terkunci di Engine"
    },
    {
      reg: "Permendikdasmen No. 8/2026",
      topic: "Batas Honor Non-ASN Sekolah Swasta / PAUD",
      limit: "Maksimal 40% Pagu",
      status: "Terkunci di Engine"
    },
    {
      reg: "Permendikdasmen No. 8/2026",
      topic: "Kewajiban Pengadaan Buku HET",
      limit: "Minimum 10% Pagu",
      status: "Auto-Kalkulasi"
    },
    {
      reg: "Permendikbudristek No. 63/2023",
      topic: "Batas Pemeliharaan Sarpras Ringan",
      limit: "Maksimal 20% Pagu",
      status: "Peringatan Otomatis"
    },
    {
      reg: "PMK Kemenkeu",
      topic: "Batas Saldo Kas Tunai Brankas",
      limit: "Maksimal Rp 10.000.000",
      status: "Batas Cash Opname"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-zinc-200/80">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Standar Kepatuhan Regulasi Penuh</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              Mesin Validasi Hukum Regulasi BOSP
            </h2>
          </div>
          <p className="text-xs text-zinc-500 max-w-md">
            Mencegah potensi temuan saat diaudit oleh Inspektorat Daerah maupun Badan Pemeriksa Keuangan (BPK).
          </p>
        </div>

        {/* Table Regulation Overview */}
        <div className="overflow-x-auto w-full rounded-xl border border-zinc-200 shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-semibold">
                <th className="p-3.5">Dasar Hukum Regulasi</th>
                <th className="p-3.5">Pokok Aturan Penganggaran</th>
                <th className="p-3.5">Batas Anggaran</th>
                <th className="p-3.5 text-right">Proteksi PLANARKA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 font-medium">
              {rules.map((r, i) => (
                <tr key={i} className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">{r.reg}</td>
                  <td className="p-3.5 text-zinc-700">{r.topic}</td>
                  <td className="p-3.5 font-bold font-mono text-zinc-950">{r.limit}</td>
                  <td className="p-3.5 text-right">
                    <Badge variant="success" className="text-[10px]">
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
