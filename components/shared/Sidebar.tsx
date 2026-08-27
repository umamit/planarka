"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  DownloadCloud,
  Key,
  Landmark,
  Tv, 
  FileSpreadsheet 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ringkasan Pagu", icon: LayoutDashboard },
  { href: "/dashboard/kalkulator-buku", label: "Kalkulator Buku HET", icon: BookOpen },
  { href: "/dashboard/pergeseran-anggaran", label: "Simulasi Pergeseran", icon: ArrowLeftRight },
  { href: "/dashboard/validasi-honor", label: "Validasi Honor Guru", icon: UserCheck },
  { href: "/dashboard/daya-jasa-rutin", label: "Daya & Jasa Terkunci", icon: Zap },
  { href: "/dashboard/pbd-rapor", label: "PBD Rapor Pendidikan", icon: TrendingUp },
  { href: "/dashboard/bku-kas", label: "Rekonsiliasi Kas BKU", icon: Landmark },
  { href: "/dashboard/mitigasi-penalti", label: "Mitigasi Penalti PMK", icon: AlertTriangle },
  { href: "/dashboard/kalkulator-pajak", label: "Kalkulator Pajak", icon: Receipt },
  { href: "/dashboard/spjb-generator", label: "Generator SPJB / SPTJM", icon: FileCheck },
  { href: "/dashboard/surat-dinas", label: "Surat Pengantar Dinas", icon: Send },
  { href: "/dashboard/backup-restore", label: "Backup & Restore RKAS", icon: DownloadCloud },
  { href: "/dashboard/lisensi", label: "Lisensi Sekolah", icon: Key },
  { href: "/dashboard/pleno-presentasi", label: "Mode Rapat Pleno", icon: Tv },
  { href: "/dashboard/export", label: "Ekspor PDF & Excel", icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200 bg-zinc-50/50 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
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
