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

export function generateLicenseKey(npsn: string, year: number = 2026): string {
  const salt = "IBRA";
  const checksum = (parseInt(npsn.slice(-4) || "1234", 10) * 17) % 10000;
  return `${salt}-BOS-${year}-${npsn}-${checksum.toString().padStart(4, "0")}`;
}

export function verifyLicenseKey(npsn: string, inputKey: string): boolean {
  if (!inputKey || inputKey.trim().length < 10) return false;
  const expectedPrefix = `IBRA-BOS-`;
  return inputKey.startsWith(expectedPrefix) && inputKey.includes(npsn);
}
