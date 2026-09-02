import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function FeatureGrid() {
  const steps = [
    {
      num: "01",
      title: "Pilih Jenis Sekolah & Pagu BOSP",
      desc: "Masukkan jumlah siswa dari Dapodik dan tentukan status sekolah (Negeri atau Swasta). Sistem otomatis mengunci rasio batas honorarium Non-ASN (20% untuk Negeri, 40% untuk Swasta)."
    },
    {
      num: "02",
      title: "Simulasi Pergeseran & Lembar Kerja Buku",
      desc: "Lakukan pengujian mutasi belanja dengan proteksi Zero-Balance agar saldo tidak minus. Gunakan lembar kerja buku CP 46/2025 untuk memastikan alokasi buku minimal 10% terpenuhi."
    },
    {
      num: "03",
      title: "Salin ke ARKAS 4 & Cetak Berita Acara",
      desc: "Ekspor lembar kerja ke Excel dengan susunan kode rekening ARKAS 4 yang pas untuk disalin ke aplikasi desktop pemerintah, serta cetak PDF Berita Acara Rapat Pleno."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">ALUR KERJA APLIKASI</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Tiga Langkah Sederhana Menyusun Pre-ARKAS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-zinc-300 block mb-3">{s.num}</span>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{s.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 font-normal">{s.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Otomatis Terverifikasi</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
