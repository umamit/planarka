export interface BosPaguCalculation {
  studentCount: number;
  unitCostPerStudent: number;
  bosRegular: number;
  bosPerformance: number;
  silpaPreviousYear: number;
  totalPagu: number;
  phase1Allocation: number;
  phase2Allocation: number;
  maxHonorBudget: number; // 20% max negeri / 40% max swasta (Permendikdasmen No. 8/2026)
  recommendedBookBudget: number; // 20% max
  maxMaintenanceBudget: number; // 20% max
}

export function calculateBosPagu(
  studentCount: number,
  unitCostPerStudent: number,
  bosPerformance: number = 0,
  silpaPreviousYear: number = 0
): BosPaguCalculation {
  const bosRegular = studentCount * unitCostPerStudent;
  const totalPagu = bosRegular + bosPerformance + silpaPreviousYear;
  
  // Penyaluran Tahap 1 (50%) dan Tahap 2 (50%) dari BOS Reguler + SiLPA masuk di Tahap 1
  const phase1Allocation = bosRegular * 0.5 + silpaPreviousYear;
  const phase2Allocation = bosRegular * 0.5;

  return {
    studentCount,
    unitCostPerStudent,
    bosRegular,
    bosPerformance,
    silpaPreviousYear,
    totalPagu,
    phase1Allocation,
    phase2Allocation,
    maxHonorBudget: totalPagu * 0.2,
    recommendedBookBudget: totalPagu * 0.2,
    maxMaintenanceBudget: totalPagu * 0.2,
  };
}
