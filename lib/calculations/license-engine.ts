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

export function generateLicenseKey(npsn: string, year: number = 2026): string {
  const salt = "IBRA";
  const checksum = (parseInt(npsn.slice(-4) || "1234", 10) * 17) % 10000;
  // Khusus untuk Superadmin, kita gunakan master key statis
  if (npsn === "00000000") {
    return "IBRA-SUPERADMIN-2026-HQ-9999";
  }
  return `${salt}-BOS-${year}-${npsn}-${checksum.toString().padStart(4, "0")}`;
}

export async function verifyLicenseKey(npsn: string, inputKey: string): Promise<boolean> {
  if (!npsn || !inputKey) return false;

  const cleanNpsn = npsn.trim();
  const cleanKey = inputKey.trim();

  // Ambil konfigurasi Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase API keys tidak dikonfigurasi.");
    return false;
  }

  // 100% Verifikasi Online melalui Database Cloud Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("tenants_schools")
      .select("npsn, license_status")
      .eq("npsn", cleanNpsn)
      .eq("license_status", "active")
      .single();

    if (!error && data) {
      // Verifikasi kunci lisensi berdasarkan rumus hash generateLicenseKey
      const expectedKey = generateLicenseKey(cleanNpsn);
      return cleanKey === expectedKey;
    }
  } catch (e) {
    console.error("Gagal melakukan verifikasi lisensi online:", e);
  }

  return false;
}
