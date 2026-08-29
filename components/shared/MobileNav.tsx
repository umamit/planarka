"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingDown, 
  ClipboardList, 
  Menu, 
  BookOpen, 
  Zap, 
  Landmark, 
  Receipt, 
  FileSpreadsheet, 
  Settings,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Pagu", icon: LayoutDashboard },
    { href: "/dashboard/pergeseran-anggaran", label: "Pergeseran", icon: ArrowLeftRight },
    { href: "/dashboard/realisasi-anggaran", label: "Realisasi", icon: TrendingDown },
    { href: "/dashboard/checklist-dokumen", label: "Checklist", icon: ClipboardList }
  ];

  const moreItems = [
    { href: "/dashboard/kalkulator-buku", label: "Kalkulator Buku HET", icon: BookOpen },
    { href: "/dashboard/daya-jasa-rutin", label: "Daya & Jasa Terkunci", icon: Zap },
    { href: "/dashboard/bku-kas", label: "Rekonsiliasi Kas BKU", icon: Landmark },
    { href: "/dashboard/kalkulator-pajak", label: "Kalkulator Pajak", icon: Receipt },
    { href: "/dashboard/export", label: "Ekspor PDF & Excel", icon: FileSpreadsheet },
    { href: "/dashboard/pengaturan", label: "Pengaturan Sekolah", icon: Settings },
  ];

  return (
    <>
      {/* Modal Dropdown Menu Lainnya khusus seluler */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs block md:hidden" onClick={() => setShowMoreMenu(false)}>
          <div 
            className="fixed bottom-20 left-4 right-4 z-50 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-4 max-h-[340px] overflow-y-auto space-y-1 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Navigasi Tambahan</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all duration-150",
                      isActive 
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-sm" 
                        : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-200 bg-white/90 backdrop-blur-md block md:hidden shadow-lg">
        <div className="grid h-full grid-cols-5 mx-auto max-w-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold transition-all duration-150"
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200 mb-0.5",
                    isActive 
                      ? "bg-zinc-900 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={isActive ? "text-zinc-950 font-bold" : "text-zinc-500 font-medium"}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Tombol Kelima (Menu Lainnya) */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold transition-all duration-150"
          >
            <div
              className={cn(
                "p-1.5 rounded-xl transition-all duration-200 mb-0.5",
                showMoreMenu 
                  ? "bg-zinc-900 text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Menu className="h-5 w-5" />
            </div>
            <span className={showMoreMenu ? "text-zinc-950 font-bold" : "text-zinc-500 font-medium"}>
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
