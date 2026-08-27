"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const STORAGE_KEY = "planarka_school_profile_v1";

interface SchoolContextValue {
  profile: SchoolProfile;
  updateProfile: (updates: Partial<SchoolProfile>) => void;
  isProfileComplete: boolean;
}

const SchoolContext = createContext<SchoolContextValue>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  isProfileComplete: false,
});

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  const updateProfile = (updates: Partial<SchoolProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isProfileComplete = Boolean(
    profile.schoolName && profile.npsn && profile.headmasterName && profile.headmasterNip
  );

  return (
    <SchoolContext.Provider value={{ profile, updateProfile, isProfileComplete }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  return useContext(SchoolContext);
}
