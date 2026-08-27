"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, KeyRound, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [npsn, setNpsn] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npsn: npsn.trim(), licenseKey: licenseKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal.");
        setLoading(false);
        return;
      }

      router.push(redirect);
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-zinc-700 block mb-1">NPSN Sekolah (8 Digit)</label>
        <input
          type="text"
          required
          maxLength={8}
          value={npsn}
          onChange={(e) => setNpsn(e.target.value)}
          placeholder="Contoh: 60200589"
          className="w-full h-10 rounded-xl border border-zinc-200 px-3 font-mono text-xs font-semibold focus:border-zinc-900 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-700 block mb-1">Kunci Lisensi PLANARKA</label>
        <input
          type="text"
          required
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="IBRA-BOS-2026-NPSN-XXXX"
          className="w-full h-10 rounded-xl border border-zinc-200 px-3 font-mono text-xs font-semibold focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Memverifikasi Lisensi..." : "Masuk ke Simulator RKAS"}
        {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/logo.png"
            alt="PLANARKA"
            width={72}
            height={72}
            className="mx-auto rounded-2xl object-contain"
            priority
          />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">PLANARKA</h1>
          <p className="text-xs text-zinc-500">Smart BOS & Pre-ARKAS Budget Simulator</p>
          <p className="text-[11px] text-zinc-400">by IBRA Digital Engineering</p>
        </div>

        <Card className="shadow-lg p-6 space-y-4">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-zinc-700" />
              <CardTitle className="text-base">Akses Berlisensi</CardTitle>
            </div>
            <CardDescription>Masukkan NPSN dan Kunci Lisensi resmi yang diterbitkan oleh IBRA Digital Engineering</CardDescription>
          </CardHeader>

          <Suspense fallback={<div className="text-xs text-zinc-400 py-4 text-center">Memuat form login...</div>}>
            <LoginForm />
          </Suspense>

          <div className="border-t border-zinc-100 pt-3 text-center">
            <p className="text-[11px] text-zinc-400">
              Belum memiliki lisensi? Hubungi IBRA Digital Engineering untuk aktivasi.
            </p>
          </div>
        </Card>

        <p className="text-center text-[11px] text-zinc-400">
          Hak Cipta &copy; 2026 IBRA Digital Engineering. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
