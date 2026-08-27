import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  const numStr = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${numStr}`;
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return "0";
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
