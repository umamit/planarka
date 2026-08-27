export interface ShiftItem {
  id: string;
  snpCode: string;
  accountCode: string;
  activityName: string;
  initialBudget: number;
  shiftDelta: number; // Positif (tambah) atau Negatif (kurang)
  finalBudget: number;
  isHonorNonAsn?: boolean;
  isMaintenanceSarpras?: boolean;
}

export interface ShiftValidationResult {
  totalInitial: number;
  totalShifted: number;
  totalFinal: number;
  netDelta: number; // Wajib 0 untuk balance
  isBalanced: boolean;
  honorTotal: number;
  honorPercentage: number;
  isHonorValid: boolean; // Max 50%
  sarprasTotal: number;
  sarprasPercentage: number;
  isSarprasValid: boolean; // Rekomendasi Max 20%
  hasDeficitItem: boolean;
  deficitItems: ShiftItem[];
  warnings: string[];
}

export function validateBudgetShift(
  items: ShiftItem[],
  totalPagu: number
): ShiftValidationResult {
  let totalInitial = 0;
  let totalShifted = 0;
  let totalFinal = 0;
  let honorTotal = 0;
  let sarprasTotal = 0;
  const deficitItems: ShiftItem[] = [];
  const warnings: string[] = [];

  items.forEach((item) => {
    const finalBudget = item.initialBudget + item.shiftDelta;
    totalInitial += item.initialBudget;
    totalShifted += item.shiftDelta;
    totalFinal += finalBudget;

    if (finalBudget < 0) {
      deficitItems.push({ ...item, finalBudget });
      warnings.push(`Akun ${item.accountCode} (${item.activityName}) mengalami defisit anggaran.`);
    }

    if (item.isHonorNonAsn) {
      honorTotal += finalBudget;
    }

    if (item.isMaintenanceSarpras) {
      sarprasTotal += finalBudget;
    }
  });

  const netDelta = totalFinal - totalInitial;
  const isBalanced = netDelta === 0;
  
  const honorPercentage = totalPagu > 0 ? (honorTotal / totalPagu) * 100 : 0;
  const isHonorValid = honorPercentage <= 50;

  const sarprasPercentage = totalPagu > 0 ? (sarprasTotal / totalPagu) * 100 : 0;
  const isSarprasValid = sarprasPercentage <= 20;

  if (!isBalanced) {
    warnings.push(`Pergeseran belum balance. Selisih bersih: ${netDelta > 0 ? "+" : ""}${netDelta}`);
  }

  if (!isHonorValid) {
    warnings.push(`Alokasi honor Non-ASN (${honorPercentage.toFixed(1)}%) melampaui batas maksimal 50% pagu BOS.`);
  }

  if (!isSarprasValid) {
    warnings.push(`Rekomendasi Juknis: Belanja pemeliharaan Sarpras (${sarprasPercentage.toFixed(1)}%) sebaiknya tidak melebihi 20% dari total pagu BOS.`);
  }

  return {
    totalInitial,
    totalShifted,
    totalFinal,
    netDelta,
    isBalanced,
    honorTotal,
    honorPercentage,
    isHonorValid,
    sarprasTotal,
    sarprasPercentage,
    isSarprasValid,
    hasDeficitItem: deficitItems.length > 0,
    deficitItems,
    warnings,
  };
}
