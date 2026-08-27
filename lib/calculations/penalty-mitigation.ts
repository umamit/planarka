export interface PenaltyMitigationParams {
  phase1Allocation: number;
  realizedExpensePhase1: number;
  currentBankBalance: number;
  reportSubmissionDate: string; // YYYY-MM-DD
}

export interface PenaltyMitigationResult {
  remainingPhase1Balance: number;
  remainingPercentage: number;
  isExcessiveBalance: boolean; // SiLPA > 20%
  isLateSubmission: boolean; // Terlambat lewat 31 Juli
  silpaDeductionAmount: number; // Potongan langsung sebesar sisa saldo jika sisa saldo diperhitungkan Kemenkeu
  latenessPenaltyRate: number; // 2%, 3%, 4% sesuai PMK
  latenessPenaltyAmount: number;
  totalDeductionAmount: number;
  recommendedDisbursementPhase2: number;
  actionAdvice: string[];
}

export function calculatePenaltyMitigation(
  params: PenaltyMitigationParams
): PenaltyMitigationResult {
  const { phase1Allocation, realizedExpensePhase1, reportSubmissionDate } = params;
  const remainingPhase1Balance = Math.max(0, phase1Allocation - realizedExpensePhase1);
  const remainingPercentage = phase1Allocation > 0 ? (remainingPhase1Balance / phase1Allocation) * 100 : 0;
  
  const isExcessiveBalance = remainingPercentage > 20;
  const submission = new Date(reportSubmissionDate);
  const deadlineJul = new Date(`${submission.getFullYear()}-07-31`);
  const deadlineAug = new Date(`${submission.getFullYear()}-08-31`);
  const deadlineSep = new Date(`${submission.getFullYear()}-09-30`);

  let latenessPenaltyRate = 0;
  const isLateSubmission = submission > deadlineJul;

  // Jenjang penalti keterlambatan PMK:
  // Lewat 31 Juli s.d Agustus: 2%
  // Lewat Agustus s.d September: 3%
  // Lewat September s.d Oktober: 4%
  if (submission > deadlineSep) {
    latenessPenaltyRate = 4;
  } else if (submission > deadlineAug) {
    latenessPenaltyRate = 3;
  } else if (submission > deadlineJul) {
    latenessPenaltyRate = 2;
  }

  const phase2Target = phase1Allocation;
  const latenessPenaltyAmount = (phase2Target * latenessPenaltyRate) / 100;
  
  // Sisa dana Tahap 1 yang belum terealisasi menjadi faktor pengurang penyaluran Tahap 2 jika melampaui ketentuan
  const silpaDeductionAmount = isExcessiveBalance ? (remainingPhase1Balance - (phase1Allocation * 0.2)) : 0;
  const totalDeductionAmount = latenessPenaltyAmount + silpaDeductionAmount;
  const recommendedDisbursementPhase2 = Math.max(0, phase2Target - totalDeductionAmount);

  const actionAdvice: string[] = [];
  if (isExcessiveBalance) {
    actionAdvice.push(`Sisa saldo Tahap 1 (${remainingPercentage.toFixed(1)}%) melebihi ambang batas toleransi 20%. Kelebihan saldo (${remainingPhase1Balance - phase1Allocation * 0.2}) berisiko diperhitungkan memotong penyaluran Tahap 2.`);
  }
  if (isLateSubmission) {
    actionAdvice.push(`Pelaporan melewati batas cut-off 31 Juli. Terkena penalti pemotongan keterlambatan PMK sebesar ${latenessPenaltyRate}% (${latenessPenaltyAmount}).`);
  }
  if (actionAdvice.length === 0) {
    actionAdvice.push("Status aman 100%. Saldo terserap optimal dan pelaporan tepat waktu untuk pencairan penuh Tahap 2.");
  }

  return {
    remainingPhase1Balance,
    remainingPercentage,
    isExcessiveBalance,
    isLateSubmission,
    silpaDeductionAmount,
    latenessPenaltyRate,
    latenessPenaltyAmount,
    totalDeductionAmount,
    recommendedDisbursementPhase2,
    actionAdvice,
  };
}
