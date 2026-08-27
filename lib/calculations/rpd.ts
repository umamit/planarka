// Kalkulasi RPD Bulanan (Rencana Penarikan Dana)
// Referensi: Juknis BOSP 2026 — distribusi penarikan dana per bulan

export const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export interface RpdItem {
  id: string;
  budgetItemId: string;
  snpCode: string;
  activityName: string;
  annualBudget: number;
  months: number[]; // index 0-11
}

/** Distribusi merata: bagi 11 bulan sama rata, sisa masuk bulan ke-12 */
export function distributeEvenly(annual: number): number[] {
  const base = Math.floor(annual / 12);
  const rem = annual - base * 12;
  return Array.from({ length: 12 }, (_, i) => (i === 11 ? base + rem : base));
}

/** Total satu baris (satu item, 12 bulan) */
export function rowTotal(months: number[]): number {
  return months.reduce((s, v) => s + v, 0);
}

/** Total per kolom bulan (sum semua item di bulan yang sama) */
export function colTotals(items: RpdItem[]): number[] {
  return Array.from({ length: 12 }, (_, m) =>
    items.reduce((s, it) => s + (it.months[m] || 0), 0)
  );
}
