import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
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
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 shadow-sm transition-all"
          >
            Buka Simulator
          </Link>
        </div>
      </div>
    </header>
  );
}
