export interface SnpComponent {
  code: string;
  name: string;
  description: string;
  category: "operasional" | "modal" | "jasa";
}

export const SNP_COMPONENTS: SnpComponent[] = [
  { code: "SNP-1", name: "Standar Kompetensi Lulusan", description: "Pengembangan kompetensi & asesmen siswa", category: "operasional" },
  { code: "SNP-2", name: "Standar Isi", description: "Penyusunan kurikulum & silabus operasional sekolah", category: "operasional" },
  { code: "SNP-3", name: "Standar Proses", description: "Pengadaan buku teks & perlengkapan pembelajaran", category: "modal" },
  { code: "SNP-4", name: "Standar Pendidik & Tendik", description: "Peningkatan mutu guru & honor Non-ASN", category: "jasa" },
  { code: "SNP-5", name: "Standar Sarana & Prasarana", description: "Pemeliharaan sarpras ringan & langganan internet", category: "operasional" },
  { code: "SNP-6", name: "Standar Pengelolaan", description: "Operasional manajemen BOS & evaluasi program", category: "operasional" },
  { code: "SNP-7", name: "Standar Pembiayaan", description: "Daya dan jasa (Listrik, Air, Kebersihan)", category: "operasional" },
  { code: "SNP-8", name: "Standar Penilaian Pendidikan", description: "Asesmen Nasional, Ujian Sekolah & Rapor", category: "operasional" },
];
