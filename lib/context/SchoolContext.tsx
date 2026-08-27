"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

export interface SchoolProfile {
  schoolName: string;
  npsn: string;
  headmasterName: string;
  headmasterNip: string;
  address: string;
  district: string;
  province: string;
  fiscalYear: number;
  hetZone: number;
  educationLevel: "SD" | "SMP";
}

const DEFAULT_PROFILE: SchoolProfile = {
  schoolName: "",
  npsn: "",
  headmasterName: "",
  headmasterNip: "",
  address: "",
  district: "Dinas Pendidikan Kabupaten Pulau Taliabu",
  province: "Maluku Utara",
  fiscalYear: 2026,
  hetZone: 5,
  educationLevel: "SD",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SchoolContextValue {
  profile: SchoolProfile;
  updateProfile: (updates: Partial<SchoolProfile>) => Promise<boolean>;
  isProfileComplete: boolean;
  loading: boolean;
}

const SchoolContext = createContext<SchoolContextValue>({
  profile: DEFAULT_PROFILE,
  updateProfile: async () => false,
  isProfileComplete: false,
  loading: true,
});

// Helper untuk membaca NPSN dari cookie planarka_session di browser client
function getNpsnFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find((row) => row.startsWith("planarka_session="));
    if (!sessionCookie) return null;

    let base64Value = decodeURIComponent(sessionCookie.split("=")[1]);
    
    // Hapus tanda kutip pembungkus jika ada (Next.js cookie wrapper)
    if (base64Value.startsWith('"') && base64Value.endsWith('"')) {
      base64Value = base64Value.slice(1, -1);
    }
    
    const payload = JSON.parse(atob(base64Value));
    return payload.npsn || null;
  } catch (e) {
    console.error("Gagal parse cookie:", e);
    return null;
  }
}

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Ambil data profil dari Supabase saat render awal
  useEffect(() => {
    async function loadProfileFromSupabase() {
      const activeNpsn = getNpsnFromCookie();
      if (!activeNpsn) {
        setLoading(false);
        return;
      }

      // Bypass check untuk Superadmin
      if (activeNpsn === "00000000") {
        setProfile({
          ...DEFAULT_PROFILE,
          npsn: "00000000",
          schoolName: "Superadmin IBRA HQ",
          headmasterName: "IBRA Administrator",
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tenants_schools")
          .select("*")
          .eq("npsn", activeNpsn)
          .single();

        if (!error && data) {
          setProfile({
            npsn: data.npsn || activeNpsn,
            schoolName: data.school_name || "",
            educationLevel: data.education_level || "SD",
            district: data.district_name || "Dinas Pendidikan Kabupaten Pulau Taliabu",
            province: data.province_name || "Maluku Utara",
            hetZone: data.het_zone || 5,
            address: data.address || "",
            headmasterName: data.headmaster_name || "",
            headmasterNip: data.headmaster_nip || "",
            fiscalYear: 2026,
          });
        } else {
          // Jika belum ada baris di database (sekolah baru pertama login), set NPSN saja
          setProfile((prev) => ({ ...prev, npsn: activeNpsn }));
        }
      } catch (e) {
        console.error("Gagal load profil dari Supabase:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfileFromSupabase();
  }, []);

  const updateProfile = async (updates: Partial<SchoolProfile>): Promise<boolean> => {
    const activeNpsn = profile.npsn || getNpsnFromCookie();
    if (!activeNpsn) return false;

    // Untuk superadmin, tidak perlu simpan ke DB sekolah
    if (activeNpsn === "00000000") {
      setProfile((prev) => ({ ...prev, ...updates }));
      return true;
    }

    try {
      // Simpan seluruh data profil sekolah langsung ke database cloud Supabase
      const { error } = await supabase
        .from("tenants_schools")
        .update({
          school_name: updates.schoolName !== undefined ? updates.schoolName : profile.schoolName,
          education_level: updates.educationLevel !== undefined ? updates.educationLevel : profile.educationLevel,
          district_name: updates.district !== undefined ? updates.district : profile.district,
          province_name: updates.province !== undefined ? updates.province : profile.province,
          het_zone: updates.hetZone !== undefined ? updates.hetZone : profile.hetZone,
          headmaster_name: updates.headmasterName !== undefined ? updates.headmasterName : profile.headmasterName,
          headmaster_nip: updates.headmasterNip !== undefined ? updates.headmasterNip : profile.headmasterNip,
          address: updates.address !== undefined ? updates.address : profile.address,
        })
        .eq("npsn", activeNpsn);

      if (error) {
        console.error("Gagal mengupdate DB Supabase:", error.message);
        return false;
      }

      setProfile((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (e) {
      console.error("Gagal update profil:", e);
      return false;
    }
  };

  const isProfileComplete = Boolean(
    profile.schoolName && profile.npsn && profile.headmasterName && profile.headmasterNip
  );

  return (
    <SchoolContext.Provider value={{ profile, updateProfile, isProfileComplete, loading }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  return useContext(SchoolContext);
}
