export interface DapodikGradeSummary {
  grade: number;
  rombelCount: number;
  maleStudents: number;
  femaleStudents: number;
  totalStudents: number;
}

export function parseDapodikMock(fileName: string): {
  schoolName: string;
  npsn: string;
  grades: DapodikGradeSummary[];
  totalAllStudents: number;
  totalAllRombels: number;
} {
  const grades: DapodikGradeSummary[] = [
    { grade: 1, rombelCount: 1, maleStudents: 16, femaleStudents: 16, totalStudents: 32 },
    { grade: 2, rombelCount: 1, maleStudents: 14, femaleStudents: 16, totalStudents: 30 },
    { grade: 3, rombelCount: 1, maleStudents: 15, femaleStudents: 14, totalStudents: 29 },
    { grade: 4, rombelCount: 1, maleStudents: 13, femaleStudents: 15, totalStudents: 28 },
    { grade: 5, rombelCount: 1, maleStudents: 18, femaleStudents: 17, totalStudents: 35 },
    { grade: 6, rombelCount: 1, maleStudents: 17, femaleStudents: 15, totalStudents: 32 },
  ];

  const totalAllStudents = grades.reduce((acc, g) => acc + g.totalStudents, 0);
  const totalAllRombels = grades.reduce((acc, g) => acc + g.rombelCount, 0);

  return {
    schoolName: "SD Negeri 1 Bobong",
    npsn: "60200589",
    grades,
    totalAllStudents,
    totalAllRombels,
  };
}
