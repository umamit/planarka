"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSchool } from "@/lib/context/SchoolContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  ArrowLeftRight, 
  UserCheck, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Receipt, 
  FileCheck,
  Send,
  Key,
  Landmark,
  Tv, 
  FileSpreadsheet,
  Settings,
  CalendarDays,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useSchool();
  const isSuperadmin = profile.npsn === "00000000";

  // Menu jika profile sedang loading
  if (loading) {
    return (
      <aside className="w-64 border-r border-zinc-200 bg-zinc-50/50 p-4 min-h-[calc(100vh-4rem)]">
        <div className="text-[10px] text-zinc-400 font-medium text-center py-6">Memuat menu...</div>
      </aside>
    );
  }

  // Definisikan menu navigasi berdasarkan peran user
  const menuItems = isSuperadmin
    ? [
        { href: "/dashboard/lisensi", label: "Konsol Lisensi Sekolah", icon: Key },
        { href: "/dashboard/pengaturan", label: "Pengaturan Admin", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Ringkasan Pagu", icon: LayoutDashboard },
        { href: "/dashboard/kalkulator-buku", label: "Kalkulator Buku HET", icon: BookOpen },
        { href: "/dashboard/pergeseran-anggaran", label: "Simulasi Pergeseran", icon: ArrowLeftRight },
        { href: "/dashboard/validasi-honor", label: "Validasi Honor Guru", icon: UserCheck },
        { href: "/dashboard/daya-jasa-rutin", label: "Daya & Jasa Terkunci", icon: Zap },
        { href: "/dashboard/rpd-bulanan", label: "RPD Bulanan", icon: CalendarDays },
        { href: "/dashboard/realisasi-anggaran", label: "Realisasi Anggaran", icon: TrendingDown },
        { href: "/dashboard/checklist-dokumen", label: "Checklist Dokumen", icon: ClipboardList },
        // { href: "/dashboard/pbd-rapor", label: "PBD Rapor Pendidikan", icon: TrendingUp }, // Diaktifkan jika Dinas mensyaratkan PBD
        { href: "/dashboard/bku-kas", label: "Rekonsiliasi Kas BKU", icon: Landmark },
        { href: "/dashboard/mitigasi-penalti", label: "Mitigasi Penalti PMK", icon: AlertTriangle },
        { href: "/dashboard/kalkulator-pajak", label: "Kalkulator Pajak", icon: Receipt },
        { href: "/dashboard/spjb-generator", label: "Generator SPJB / SPTJM", icon: FileCheck },
        { href: "/dashboard/surat-dinas", label: "Surat Pengantar Dinas", icon: Send },
        { href: "/dashboard/lisensi", label: "Informasi Lisensi", icon: Key },
        { href: "/dashboard/pleno-presentasi", label: "Mode Rapat Pleno", icon: Tv },
        { href: "/dashboard/export", label: "Ekspor PDF & Excel", icon: FileSpreadsheet },
        { href: "/dashboard/pengaturan", label: "Pengaturan Sekolah", icon: Settings },
      ];

  return (
    <aside className="w-64 border-r border-zinc-200 bg-zinc-50/50 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
