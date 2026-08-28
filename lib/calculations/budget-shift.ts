// Batas regulasi berdasarkan Permendikdasmen No. 8 Tahun 2026 (Juknis BOSP 2026)
export const HONOR_LIMIT_NEGERI = 20;   // Maks 20% untuk sekolah negeri
export const HONOR_LIMIT_SWASTA = 40;   // Maks 40% untuk sekolah swasta/PAUD
export const SARPRAS_LIMIT = 20;        // Rekomendasi maks 20%
export const BUKU_MINIMUM = 10;         // Wajib minimal 10% pagu untuk buku

export interface ShiftItem {
  id: string;
  snpCode: string;
  accountCode: string;
  activityName: string;
  volume?: number;
  unit?: string;
  unitPrice?: number;
  initialBudget: number;
  shiftDelta: number; // Positif (tambah) atau Negatif (kurang)
  finalBudget: number;
  isHonorNonAsn?: boolean;
  isMaintenanceSarpras?: boolean;
  isBookProcurement?: boolean;
}

export interface ShiftValidationResult {
  totalInitial: number;
  totalShifted: number;
  totalFinal: number;
  netDelta: number;
  isBalanced: boolean;
  honorTotal: number;
  honorPercentage: number;
  honorLimit: number;         // Batas dinamis: 20% negeri / 40% swasta
  isHonorValid: boolean;
  sarprasTotal: number;
  sarprasPercentage: number;
  isSarprasValid: boolean;
  bookTotal: number;
  bookPercentage: number;
  isBookMinimumMet: boolean;  // Wajib >= 10% pagu
  hasDeficitItem: boolean;
  deficitItems: ShiftItem[];
  warnings: string[];
}

export function validateBudgetShift(
  items: ShiftItem[],
  totalPagu: number,
  isNegeri: boolean = true   // Default: sekolah negeri
): ShiftValidationResult {
  let totalInitial = 0;
  let totalShifted = 0;
  let totalFinal = 0;
  let honorTotal = 0;
  let sarprasTotal = 0;
  let bookTotal = 0;
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

    if (item.isHonorNonAsn) honorTotal += finalBudget;
    if (item.isMaintenanceSarpras) sarprasTotal += finalBudget;
    if (item.isBookProcurement) bookTotal += finalBudget;
  });

  const netDelta = totalFinal - totalInitial;
  const isBalanced = netDelta === 0;

  const honorLimit = isNegeri ? HONOR_LIMIT_NEGERI : HONOR_LIMIT_SWASTA;
  const honorPercentage = totalPagu > 0 ? (honorTotal / totalPagu) * 100 : 0;
  const isHonorValid = honorPercentage <= honorLimit;

  const sarprasPercentage = totalPagu > 0 ? (sarprasTotal / totalPagu) * 100 : 0;
  const isSarprasValid = sarprasPercentage <= SARPRAS_LIMIT;

  const bookPercentage = totalPagu > 0 ? (bookTotal / totalPagu) * 100 : 0;
  const isBookMinimumMet = bookPercentage >= BUKU_MINIMUM;

  if (!isBalanced) {
    warnings.push(`Pergeseran belum balance. Selisih bersih: ${netDelta > 0 ? "+" : ""}${netDelta}`);
  }

  if (!isHonorValid) {
    const jenis = isNegeri ? "Negeri" : "Swasta";
    warnings.push(
      `[Pelanggaran Juknis BOSP 2026] Alokasi honor Non-ASN (${honorPercentage.toFixed(1)}%) melampaui batas maksimal ${honorLimit}% pagu untuk sekolah ${jenis} (Permendikdasmen No. 8/2026).`
    );
  }

  if (!isSarprasValid) {
    warnings.push(
      `Rekomendasi Juknis: Belanja Sarpras (${sarprasPercentage.toFixed(1)}%) melebihi rekomendasi 20% pagu BOS.`
    );
  }

  if (!isBookMinimumMet && totalPagu > 0) {
    warnings.push(
      `[Peringatan] Alokasi pengadaan buku (${bookPercentage.toFixed(1)}%) belum memenuhi kewajiban minimal 10% pagu BOS (Juknis BOSP 2026).`
    );
  }

  return {
    totalInitial,
    totalShifted,
    totalFinal,
    netDelta,
    isBalanced,
    honorTotal,
    honorPercentage,
    honorLimit,
    isHonorValid,
    sarprasTotal,
    sarprasPercentage,
    isSarprasValid,
    bookTotal,
    bookPercentage,
    isBookMinimumMet,
    hasDeficitItem: deficitItems.length > 0,
    deficitItems,
    warnings,
  };
}
