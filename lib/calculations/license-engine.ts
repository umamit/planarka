export interface SchoolLicense {
  npsn: string;
  schoolName: string;
  educationLevel: "SD" | "SMP";
  licenseType: "trial" | "annual_premium" | "district_enterprise";
  licenseKey: string;
  status: "active" | "expired" | "pending";
  validUntil: string;
  annualFee: number;
}

// Whitelist lisensi aktif — hanya sekolah yang terdaftar resmi di IBRA Digital Engineering
const ACTIVE_LICENSES: Record<string, string> = {
  "60200589": "IBRA-BOS-2026-60200589-0013", // SD Negeri 1 Bobong, Kab. Pulau Taliabu
  "00000000": "IBRA-SUPERADMIN-2026-HQ-9999", // Master Key Superadmin IBRA
};

export function generateLicenseKey(npsn: string, year: number = 2026): string {
  const salt = "IBRA";
  const checksum = (parseInt(npsn.slice(-4) || "1234", 10) * 17) % 10000;
  return `${salt}-BOS-${year}-${npsn}-${checksum.toString().padStart(4, "0")}`;
}

export function verifyLicenseKey(npsn: string, inputKey: string): boolean {
  if (!npsn || !inputKey) return false;
  const validKey = ACTIVE_LICENSES[npsn.trim()];
  if (!validKey) return false;
  return inputKey.trim() === validKey;
}
