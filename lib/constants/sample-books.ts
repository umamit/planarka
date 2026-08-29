export interface MasterBook {
  id: string;
  curriculum: string;
  phase: "A" | "B" | "C" | "D";
  classGrade: number;
  subjectTitle: string;
  bookType: "Siswa" | "Guru";
  publisher: string;
  hetZones: { [zone: number]: number };
}

export const SAMPLE_BOOKS: MasterBook[] = [
  // === FASE A (Kelas 1) ===
  {
    id: "b-sd1-ind-s",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Bahasa Indonesia: Aku Bisa! (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 21500, 2: 23600, 3: 25800, 4: 28000, 5: 31200 },
  },
  {
    id: "b-sd1-ind-g",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Buku Panduan Guru Bahasa Indonesia: Aku Bisa!",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 44000, 2: 48400, 3: 52800, 4: 57200, 5: 63800 },
  },
  {
    id: "b-sd1-mat-s",
    curriculum: "Kurriculum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Matematika untuk SD/MI Kelas I (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 19800, 2: 21700, 3: 23700, 4: 25700, 5: 28700 },
  },
  {
    id: "b-sd1-mat-g",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Buku Panduan Guru Matematika Kelas I",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 42000, 2: 46200, 3: 50400, 4: 54600, 5: 60900 },
  },

  // === FASE B (Kelas 4) ===
  {
    id: "b-sd4-ipas-s",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Ilmu Pengetahuan Alam dan Sosial (IPAS) (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 24500, 2: 26900, 3: 29400, 4: 31800, 5: 35500 },
  },
  {
    id: "b-sd4-ipas-g",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Buku Panduan Guru Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 52000, 2: 57200, 3: 62400, 4: 67600, 5: 75400 },
  },
  {
    id: "b-sd4-pancasila-s",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Pendidikan Pancasila Kelas IV (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 18500, 2: 20300, 3: 22200, 4: 24000, 5: 26800 },
  },
  {
    id: "b-sd4-pancasila-g",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Buku Panduan Guru Pendidikan Pancasila Kelas IV",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 41000, 2: 45100, 3: 49200, 4: 53300, 5: 59500 },
  },

  // === FASE C (Kelas 5) ===
  {
    id: "b-sd5-ipas-s",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 5,
    subjectTitle: "Ilmu Pengetahuan Alam dan Sosial (IPAS) Kelas V (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 26000, 2: 28600, 3: 31200, 4: 33800, 5: 37700 },
  },
  {
    id: "b-sd5-ipas-g",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 5,
    subjectTitle: "Buku Panduan Guru Ilmu Pengetahuan Alam dan Sosial (IPAS) Kelas V",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 54000, 2: 59400, 3: 64800, 4: 70200, 5: 78300 },
  },

  // === FASE D (Kelas 7) ===
  {
    id: "b-smp7-ipa-s",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Ilmu Pengetahuan Alam (IPA) Kelas VII (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 28500, 2: 31300, 3: 34200, 4: 37000, 5: 41300 },
  },
  {
    id: "b-smp7-ipa-g",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Buku Panduan Guru Ilmu Pengetahuan Alam (IPA) Kelas VII",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 58000, 2: 63800, 3: 69600, 4: 75400, 5: 84100 },
  },
  {
    id: "b-smp7-mat-s",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Matematika SMP Kelas VII (Buku Siswa)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 29000, 2: 31900, 3: 34800, 4: 37700, 5: 42000 },
  },
  {
    id: "b-smp7-mat-g",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Buku Panduan Guru Matematika SMP Kelas VII",
    bookType: "Guru",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 59000, 2: 64900, 3: 70800, 4: 76700, 5: 85600 },
  }
];
