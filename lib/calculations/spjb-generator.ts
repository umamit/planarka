export interface SpjbData {
  schoolName: string;
  npsn: string;
  headmasterName: string;
  headmasterNip: string;
  fiscalYear: number;
  periodPhase: "Tahap 1" | "Tahap 2" | "Tahunan";
  totalReceived: number;
  totalSpent: number;
  remainingBalance: number;
}

export function validateSpjb(data: SpjbData): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!data.headmasterName || data.headmasterName.trim() === "") {
    warnings.push("Nama Kepala Sekolah wajib diisi sebagai pihak penanggung jawab mutlak.");
  }
  if (data.totalSpent > data.totalReceived) {
    warnings.push("Total belanja melampaui dana yang diterima (defisit pembukuan).");
  }
  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
