"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PLANARKA Logo"
            width={40}
            height={40}
            className="rounded-xl object-contain"
            priority
          />
          <div>
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">PLANARKA</span>
            <span className="block text-[10px] font-medium text-zinc-500">by IBRA Digital Engineering</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Permendikbudristek 63/2023 Compliant</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 h-9 rounded-xl border border-zinc-200 px-4 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
