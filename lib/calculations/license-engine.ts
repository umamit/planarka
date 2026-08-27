import { createClient } from "@supabase/supabase-js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Whitelist lokal tetap disimpan sebagai cadangan (offline fallback)
const LOCAL_LICENSES: Record<string, string> = {
  "60200589": "IBRA-BOS-2026-60200589-0013", // SD Negeri 1 Bobong, Kab. Pulau Taliabu
  "00000000": "IBRA-SUPERADMIN-2026-HQ-9999", // Master Key Superadmin IBRA
};

export function generateLicenseKey(npsn: string, year: number = 2026): string {
  const salt = "IBRA";
  const checksum = (parseInt(npsn.slice(-4) || "1234", 10) * 17) % 10000;
  return `${salt}-BOS-${year}-${npsn}-${checksum.toString().padStart(4, "0")}`;
}

export async function verifyLicenseKey(npsn: string, inputKey: string): Promise<boolean> {
  if (!npsn || !inputKey) return false;

  const cleanNpsn = npsn.trim();
  const cleanKey = inputKey.trim();

  // 1. Bypass check untuk Superadmin secara lokal agar superadmin selalu bisa masuk
  if (cleanNpsn === "00000000" && cleanKey === LOCAL_LICENSES["00000000"]) {
    return true;
  }

  // 2. Coba cek ke Database Supabase
  try {
    const { data, error } = await supabase
      .from("tenants_schools")
      .select("npsn, license_status")
      .eq("npsn", cleanNpsn)
      .eq("license_status", "active")
      .single();

    if (!error && data) {
      // Generate expected key untuk validasi hash agar aman dari tampering
      const expectedKey = generateLicenseKey(cleanNpsn);
      return cleanKey === expectedKey;
    }
  } catch (e) {
    console.error("Gagal verifikasi via Supabase:", e);
  }

  // 3. Fallback ke Whitelist Lokal jika offline atau gagal koneksi database
  const validLocalKey = LOCAL_LICENSES[cleanNpsn];
  return cleanKey === validLocalKey;
}
