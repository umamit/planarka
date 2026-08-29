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
  // === KODING & AKADEMIK KHUSUS ===
  {
    id: "b-code5",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 5,
    subjectTitle: "Coding & Kecerdasan Artifisial Kelas V (Buku Lolos SK) - Maria M. Sumakul",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 115500, 2: 115500, 3: 115500, 4: 115500, 5: 115500 },
  },
  {
    id: "b-code6",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 6,
    subjectTitle: "Koding & Kecerdasan Artifisial Kelas VI - Maria M. Sumakul",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 94000, 2: 94000, 3: 94000, 4: 94000, 5: 94000 },
  },

  // === KELAS 1 ===
  {
    id: "b-sd1-pai",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Pendidikan Agama Islam dan Budi Pekerti Kelas I - Sukamti",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 150000, 2: 150000, 3: 150000, 4: 150000, 5: 150000 },
  },
  {
    id: "b-sd1-pancasila",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Pancasila Kelas I - Armi",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 150000, 2: 150000, 3: 150000, 4: 150000, 5: 150000 },
  },
  {
    id: "b-sd1-indo",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Bahasa Indonesia Kelas I - Agus Sasono",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 160000, 2: 160000, 3: 160000, 4: 160000, 5: 160000 },
  },
  {
    id: "b-sd1-mat",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Matematika Kelas I - Dewi Indrapangastuti",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 160000, 2: 160000, 3: 160000, 4: 160000, 5: 160000 },
  },
  {
    id: "b-sd1-pjok",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "PJOK Aktif Kelas I - Muhammad Muhyi dkk",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 108000, 2: 108000, 3: 108000, 4: 108000, 5: 108000 },
  },
  {
    id: "b-sd1-music",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Seni Musik Kelas I - Surya Agung W. Mugiyo",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 90000, 2: 90000, 3: 90000, 4: 90000, 5: 90000 },
  },
  {
    id: "b-sd1-art",
    curriculum: "Kurikulum Merdeka",
    phase: "A",
    classGrade: 1,
    subjectTitle: "Seni Rupa Kelas I - Dita Novia Ramdhani",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 90000, 2: 90000, 3: 90000, 4: 90000, 5: 90000 },
  },

  // === KELAS 3 ===
  {
    id: "b-sd3-english",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 3,
    subjectTitle: "Bahasa Inggris Kelas III - Aulia Fitri Istiana",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 160000, 2: 160000, 3: 160000, 4: 160000, 5: 160000 },
  },
  {
    id: "b-sd3-ipas",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 3,
    subjectTitle: "IPAS Kelas III - Indah Slamet Budiarti",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 166000, 2: 166000, 3: 166000, 4: 166000, 5: 166000 },
  },
  {
    id: "b-sd3-pjok",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 3,
    subjectTitle: "PJOK Aktif Kelas III - Muhammad Muhyi dkk",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 121500, 2: 121500, 3: 121500, 4: 121500, 5: 121500 },
  },

  // === KELAS 4 ===
  {
    id: "b-sd4-pancasila",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Pancasila Kelas IV - Armi",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 160000, 2: 160000, 3: 160000, 4: 160000, 5: 160000 },
  },
  {
    id: "b-sd4-indo",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Bahasa Indonesia Kelas IV - Agus Sasono",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 172000, 2: 172000, 3: 172000, 4: 172000, 5: 172000 },
  },
  {
    id: "b-sd4-ipas",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "IPAS Kelas IV - Indah Slamet Budiarti",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 172000, 2: 172000, 3: 172000, 4: 172000, 5: 172000 },
  },
  {
    id: "b-sd4-mat",
    curriculum: "Kurikulum Merdeka",
    phase: "B",
    classGrade: 4,
    subjectTitle: "Matematika Kelas IV - Dewi Indrapangastuti",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 172000, 2: 172000, 3: 172000, 4: 172000, 5: 172000 },
  },

  // === PENDAMPING OSN & TKA ===
  {
    id: "b-osn-ipa",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 5,
    subjectTitle: "BTS Bahas Tuntas Soal OSN IPA SD/MI - Fitri Lianingsih",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 113000, 2: 113000, 3: 113000, 4: 113000, 5: 113000 },
  },
  {
    id: "b-tka-sd",
    curriculum: "Kurikulum Merdeka",
    phase: "C",
    classGrade: 6,
    subjectTitle: "TKA SD - Fitri Lianingsih, M.Si",
    bookType: "Siswa",
    publisher: "Penerbit Andi",
    hetZones: { 1: 201000, 2: 201000, 3: 201000, 4: 201000, 5: 201000 },
  }
];
