export interface PbdIndicator {
  code: string;
  name: string;
  category: string;
  scoreStatus: "merah" | "kuning" | "hijau";
  scoreValue: number;
  recommendedSnp: string;
  suggestedActivity: string;
}

export const PBD_INDICATORS: PbdIndicator[] = [
  {
    code: "A.1",
    name: "Kemampuan Literasi",
    category: "Capaian Hasil Belajar",
    scoreStatus: "kuning",
    scoreValue: 58.4,
    recommendedSnp: "SNP-3",
    suggestedActivity: "Pengadaan Buku Bacaan Non-Teks Literasi dan Penguatan Pojok Baca",
  },
  {
    code: "A.2",
    name: "Kemampuan Numerasi",
    category: "Capaian Hasil Belajar",
    scoreStatus: "merah",
    scoreValue: 42.1,
    recommendedSnp: "SNP-4",
    suggestedActivity: "Pelatihan Guru Terkait Penggunaan Alat Peraga & Pembelajaran Matematika Kontekstual",
  },
  {
    code: "D.4",
    name: "Iklim Keamanan Sekolah (Anti-Perundungan)",
    category: "Kualitas Proses Belajar",
    scoreStatus: "hijau",
    scoreValue: 78.5,
    recommendedSnp: "SNP-1",
    suggestedActivity: "Penyelenggaraan Kegiatan Roots Anti-Perundungan & Kampanye Sekolah Ramah Anak",
  },
  {
    code: "D.8",
    name: "Iklim Kebinekaan",
    category: "Kualitas Proses Belajar",
    scoreStatus: "kuning",
    scoreValue: 62.0,
    recommendedSnp: "SNP-2",
    suggestedActivity: "Festival Seni Budaya dan Proyek Penguatan Profil Pelajar Pancasila (P5)",
  },
];
