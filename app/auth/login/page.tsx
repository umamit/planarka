"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, ShieldCheck, Lock, Building, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [npsn, setNpsn] = useState("60201829");
  const [role, setRole] = useState<"kepala_sekolah" | "bendahara">("kepala_sekolah");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect ke dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">PLANARKA</h1>
          <p className="text-xs text-zinc-500">
            Sistem Perencanaan BOS & Pre-ARKAS Simulator — by IBRA Digital Engineering
          </p>
        </div>

        <Card className="shadow-lg p-6 space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base">Masuk ke Dasbor Satuan Pendidikan</CardTitle>
            <CardDescription>Akses data perencanaan anggaran berbasis NPSN sekolah</CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">NPSN Sekolah (8 Digit)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  placeholder="Contoh: 60201829"
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 font-mono text-xs font-semibold focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Peran Pengguna</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("kepala_sekolah")}
                  className={`h-9 rounded-xl border text-xs font-medium transition-all ${
                    role === "kepala_sekolah"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Kepala Sekolah
                </button>
                <button
                  type="button"
                  onClick={() => setRole("bendahara")}
                  className={`h-9 rounded-xl border text-xs font-medium transition-all ${
                    role === "bendahara"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  Bendahara BOS
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Kata Sandi / Kunci Akses</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-xs focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <Button type="submit" className="w-full mt-4" size="md">
              <span>Masuk ke Simulator RKAS</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="border-t border-zinc-100 pt-3 text-center">
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-900 font-medium">
              Mode Akses Instan (Buka Simulator Langsung)
            </Link>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-[11px] text-zinc-400">
            Hak Cipta &copy; 2026 IBRA Digital Engineering. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
