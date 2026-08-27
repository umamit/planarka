"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PBD_INDICATORS, PbdIndicator } from "@/lib/constants/pbd-indicators";
import { TrendingUp, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";

export default function PbdRaporPage() {
  const [indicators] = useState<PbdIndicator[]>(PBD_INDICATORS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Perencanaan Berbasis Data (PBD / Rapor Pendidikan)</h1>
        <p className="text-xs text-zinc-500 mt-1">Penyelarasan Pos Belanja Anggaran BOS untuk Membenahi Indikator Mutu Prioritas Sekolah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators.map((item) => {
          const isRed = item.scoreStatus === "merah";
          const isYellow = item.scoreStatus === "kuning";

          return (
            <Card key={item.code} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-500">{item.code}</span>
                  <Badge variant={isRed ? "danger" : isYellow ? "warning" : "success"}>
                    Skor: {item.scoreValue} ({item.scoreStatus.toUpperCase()})
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mt-2">{item.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{item.category}</p>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                    Rekomendasi Kegiatan Belanja BOS:
                  </div>
                  <p className="text-xs text-zinc-700 mt-1 leading-relaxed">{item.suggestedActivity}</p>
                  <div className="text-[11px] text-zinc-500 font-medium mt-2">Target Alokasi: {item.recommendedSnp}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
