export interface CashPosition {
  cashInHand: number; // Kas Tunai di Brankas
  bankBalance: number; // Saldo Rekening Giro Bank
  unpaidTaxes: number; // Saldo Pajak PPN/PPh Belum Disetor ke Kas Negara
}

export function validateCashPosition(
  pos: CashPosition
): {
  totalLiquidCash: number;
  isCashInHandExceeded: boolean; // Max Rp 10 Juta di Brankas
  hasOverdueTaxHolding: boolean; // Pajak belum disetor
  warnings: string[];
} {
  const totalLiquidCash = pos.cashInHand + pos.bankBalance;
  const isCashInHandExceeded = pos.cashInHand > 10000000;
  const hasOverdueTaxHolding = pos.unpaidTaxes > 0;
  const warnings: string[] = [];

  if (isCashInHandExceeded) {
    warnings.push(`Saldo kas tunai di brankas (${pos.cashInHand}) melebihi batas regulasi kas tunai maksimal Rp 10.000.000. Segera setor ke rekening bank sekolah.`);
  }

  if (hasOverdueTaxHolding) {
    warnings.push(`Terdapat saldo titipan pajak (${pos.unpaidTaxes}) yang belum disetor ke Kas Negara melalui e-Billing.`);
  }

  return {
    totalLiquidCash,
    isCashInHandExceeded,
    hasOverdueTaxHolding,
    warnings,
  };
}
