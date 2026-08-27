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
  // Fase A (SD Kelas 1 & 2)
  {
    id: "b-a1-ind",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Bahasa Indonesia: Aku Bisa!",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 21500, 2: 23600, 3: 25800, 4: 28000, 5: 31200 },
  },
  {
    id: "b-a1-mat",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Matematika untuk SD/MI Kelas I",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 19800, 2: 21700, 3: 23700, 4: 25700, 5: 28700 },
  },
  {
    id: "b-a2-ind",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 2,
    subjectTitle: "Bahasa Indonesia: Keluargaku Unik",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 22000, 2: 24200, 3: 26400, 4: 28600, 5: 31900 },
  },
  // Fase B (SD Kelas 3 & 4)
  {
    id: "b-b4-ipas",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 24500, 2: 26900, 3: 29400, 4: 31800, 5: 35500 },
  },
  {
    id: "b-b4-ppkn",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Pendidikan Pancasila dan Kewarganegaraan",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 18500, 2: 20300, 3: 22200, 4: 24000, 5: 26800 },
  },
  // Fase C (SD Kelas 5 & 6)
  {
    id: "b-c5-ipas",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 5,
    subjectTitle: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 26000, 2: 28600, 3: 31200, 4: 33800, 5: 37700 },
  },
  // Fase D (SMP Kelas 7, 8, 9)
  {
    id: "b-d7-ipa",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Ilmu Pengetahuan Alam (IPA) SMP Kelas VII",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 28500, 2: 31300, 3: 34200, 4: 37000, 5: 41300 },
  },
  {
    id: "b-d7-mat",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "Matematika SMP Kelas VII",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 29000, 2: 31900, 3: 34800, 4: 37700, 5: 42000 },
  },
  {
    id: "b-d7-eng",
    curriculum: "Kurikulum Merdeka",
    phase: "D",
    classGrade: 7,
    subjectTitle: "English for Nusantara SMP/MTs Class VII",
    bookType: "Siswa",
    publisher: "Kemendikbudristek",
    hetZones: { 1: 27000, 2: 29700, 3: 32400, 4: 35100, 5: 39100 },
  },
];
