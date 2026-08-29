"use client";

import React from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";

interface ChartsProps {
  totalPagu: number;
  rkasTotal: number;
  totalRealized: number;
}

export function DashboardCharts({ totalPagu, rkasTotal, totalRealized }: ChartsProps) {
  // 1. Data Donut Chart (Pagu Terpakai vs Sisa)
  const remainingPagu = Math.max(0, totalPagu - rkasTotal);
  const pieData = [
    { name: "RKAS Disusun", value: rkasTotal },
    { name: "Sisa Belum Dianggarkan", value: remainingPagu }
  ];
  const COLORS = ["#18181b", "#e4e4e7"]; // Zinc-900 dan Zinc-200

  // 2. Data Area Chart (Simulasi Tren Alokasi Serapan Tahunan - Dummy representation)
  const areaData = [
    { name: "Jan", Rencana: rkasTotal * 0.05, Realisasi: totalRealized * 0.05 },
    { name: "Mar", Rencana: rkasTotal * 0.20, Realisasi: totalRealized * 0.15 },
    { name: "Mei", Rencana: rkasTotal * 0.45, Realisasi: totalRealized * 0.35 },
    { name: "Jul", Rencana: rkasTotal * 0.60, Realisasi: totalRealized * 0.55 },
    { name: "Sep", Rencana: rkasTotal * 0.80, Realisasi: totalRealized * 0.70 },
    { name: "Nov", Rencana: rkasTotal, Realisasi: totalRealized }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Donut Chart */}
      <Card className="p-4 flex flex-col justify-between h-[280px]">
        <CardTitle className="text-xs font-bold text-zinc-700">Rasio Alokasi RKAS</CardTitle>
        <div className="flex-1 relative min-h-[160px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Disusun</span>
            <span className="text-sm font-black text-zinc-800">
              {totalPagu > 0 ? ((rkasTotal / totalPagu) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-[10px] text-zinc-500 font-semibold border-t border-zinc-100 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-sm" />
            <span>RKAS ({((rkasTotal / (totalPagu || 1)) * 100).toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-zinc-200 rounded-sm" />
            <span>Sisa ({((remainingPagu / (totalPagu || 1)) * 100).toFixed(0)}%)</span>
          </div>
        </div>
      </Card>

      {/* Area Chart */}
      <Card className="p-4 md:col-span-2 flex flex-col justify-between h-[280px]">
        <CardTitle className="text-xs font-bold text-zinc-700">Proyeksi Akumulasi Serapan Anggaran</CardTitle>
        <div className="flex-1 min-h-[160px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRencana" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27272a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#27272a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={9} tickFormatter={(val) => `Rp ${formatNumber(val / 1000000)}M`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: any) => [`Rp ${formatNumber(Number(value))}`, ""]} contentStyle={{ fontSize: "10px", borderRadius: "12px", border: "1px solid #e4e4e7" }} />
              <Area type="monotone" dataKey="Rencana" stroke="#27272a" strokeWidth={2} fillOpacity={1} fill="url(#colorRencana)" />
              <Area type="monotone" dataKey="Realisasi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-[10px] text-zinc-500 font-semibold border-t border-zinc-100 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-0.5 bg-zinc-800" />
            <span>Rencana (RKAS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-0.5 bg-emerald-500" />
            <span>Realisasi Belanja</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
