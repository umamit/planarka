export interface TaxCalculationResult {
  grossAmount: number;
  taxBase: number;
  ppnAmount: number; // 12% PPN UU HPP 2025/2026
  pph21Amount: number; // 5% NPWP / 6% non-NPWP
  pph22Amount: number; // 1.5% Belanja Barang
  pph23Amount: number; // 2% Jasa / Sewa
  netPayment: number;
}

export function calculateTax(
  grossAmount: number,
  type: "barang" | "jasa" | "honor_npwp" | "honor_non_npwp" | "buku"
): TaxCalculationResult {
  let ppnAmount = 0;
  let pph21Amount = 0;
  let pph22Amount = 0;
  let pph23Amount = 0;

  // Buku Pelajaran & Kitab Suci Bebas PPN (PPN 0%)
  if (type === "barang" && grossAmount >= 2000000) {
    ppnAmount = (grossAmount * 12) / 112;
    const taxBase = grossAmount - ppnAmount;
    pph22Amount = taxBase * 0.015;
  } else if (type === "jasa" && grossAmount >= 2000000) {
    ppnAmount = (grossAmount * 12) / 112;
    const taxBase = grossAmount - ppnAmount;
    pph23Amount = taxBase * 0.02;
  } else if (type === "honor_npwp") {
    pph21Amount = grossAmount * 0.05;
  } else if (type === "honor_non_npwp") {
    pph21Amount = grossAmount * 0.06;
  }

  const taxBase = grossAmount - ppnAmount;
  const netPayment = grossAmount - (ppnAmount + pph21Amount + pph22Amount + pph23Amount);

  return {
    grossAmount,
    taxBase,
    ppnAmount,
    pph21Amount,
    pph22Amount,
    pph23Amount,
    netPayment,
  };
}
