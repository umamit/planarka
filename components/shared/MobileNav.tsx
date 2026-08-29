"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, TrendingDown, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Pagu", icon: LayoutDashboard },
    { href: "/dashboard/pergeseran-anggaran", label: "Pergeseran", icon: ArrowLeftRight },
    { href: "/dashboard/realisasi-anggaran", label: "Realisasi", icon: TrendingDown },
    { href: "/dashboard/checklist-dokumen", label: "Checklist", icon: ClipboardList }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-200 bg-white/90 backdrop-blur-md block md:hidden shadow-lg">
      <div className="grid h-full grid-cols-4 mx-auto max-w-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </div>
    </nav>
  );
}
