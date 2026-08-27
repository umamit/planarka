"use client";

import React from "react";
import { RpdItem, MONTHS_ID, rowTotal, colTotals } from "@/lib/calculations/rpd";
import { formatRupiah } from "@/lib/utils";

interface Props {
  items: RpdItem[];
  onCellChange: (itemIndex: number, monthIndex: number, value: number) => void;
}

export function RpdTable({ items, onCellChange }: Props) {
  const totals = colTotals(items);
  const grandTotal = totals.reduce((s, v) => s + v, 0);
  const totalAnnual = items.reduce((s, it) => s + it.annualBudget, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full text-[10px] border-collapse" style={{ minWidth: "1400px" }}>
        <thead>
          <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
            <th className="p-2 text-left font-semibold w-16 sticky left-0 bg-zinc-50/90">SNP</th>
            <th className="p-2 text-left font-semibold min-w-[200px] sticky left-16 bg-zinc-50/90">Kegiatan</th>
            <th className="p-2 text-right font-semibold min-w-[100px] border-r border-zinc-200">Tahunan</th>
            {MONTHS_ID.map(m => (
              <th key={m} className="p-2 text-center font-semibold min-w-[78px]">{m}</th>
            ))}
            <th className="p-2 text-right font-semibold min-w-[100px] border-l border-zinc-200">Total RPD</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item, idx) => {
            const total = rowTotal(item.months);
            const diff = total - item.annualBudget;
            const statusColor = diff === 0 ? "text-emerald-700" : diff > 0 ? "text-rose-600" : "text-amber-600";
            return (
              <tr key={item.id} className="hover:bg-zinc-50/40">
                <td className="p-2 font-mono text-zinc-500 sticky left-0 bg-white text-[10px]">{item.snpCode}</td>
                <td className="p-2 font-semibold text-zinc-900 sticky left-16 bg-white truncate max-w-[200px]" title={item.activityName}>
                  {item.activityName}
                </td>
                <td className="p-2 text-right font-bold text-zinc-700 border-r border-zinc-100">
                  {formatRupiah(item.annualBudget)}
                </td>
                {item.months.map((val, m) => (
                  <td key={m} className="p-1">
                    <input
                      type="number"
                      value={val}
                      min={0}
                      onChange={(e) => onCellChange(idx, m, Number(e.target.value))}
                      className="w-full h-7 rounded-md border border-zinc-200 px-1 text-right font-mono text-[10px] focus:outline-none focus:border-zinc-800 bg-white"
                    />
                  </td>
                ))}
                <td className={`p-2 text-right font-bold border-l border-zinc-100 ${statusColor}`}>
                  {formatRupiah(total)}
                  {diff !== 0 && (
                    <div className="text-[9px] font-normal opacity-70">
                      {diff > 0 ? `+${formatRupiah(diff)}` : `-${formatRupiah(Math.abs(diff))}`}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-900 text-white text-[10px] font-bold">
            <td className="p-2 sticky left-0 bg-zinc-900" colSpan={2}>Total Per Bulan</td>
            <td className="p-2 text-right border-r border-zinc-700">{formatRupiah(totalAnnual)}</td>
            {totals.map((t, i) => (
              <td key={i} className="p-2 text-right">{formatRupiah(t)}</td>
            ))}
            <td className="p-2 text-right border-l border-zinc-700">{formatRupiah(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
