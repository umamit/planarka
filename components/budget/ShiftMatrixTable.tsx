import React from "react";
import { ShiftItem } from "@/lib/calculations/budget-shift";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRupiah } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface ShiftMatrixTableProps {
  items: ShiftItem[];
  onDeltaChange: (id: string, newDelta: number) => void;
  onDelete?: (id: string) => void;
}

export function ShiftMatrixTable({ items, onDeltaChange, onDelete }: ShiftMatrixTableProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
            <th className="p-3 font-semibold">SNP & Kode Akun</th>
            <th className="p-3 font-semibold">Nama Kegiatan / Pos Belanja</th>
            <th className="p-3 font-semibold">Anggaran Awal</th>
            <th className="p-3 font-semibold">Nilai Pergeseran (+/-)</th>
            <th className="p-3 font-semibold">Anggaran Akhir</th>
            <th className="p-3 font-semibold">Status</th>
            {onDelete && <th className="p-3 font-semibold text-right">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/80">
          {items.map((item) => {
            const isDeficit = item.finalBudget < 0;
            return (
              <tr key={item.id} className="hover:bg-zinc-50/50">
                <td className="p-3 font-mono text-[11px]">
                  <span className="font-semibold text-zinc-900">{item.snpCode}</span>
                  <span className="block text-zinc-400">{item.accountCode}</span>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-zinc-900">{item.activityName}</div>
                  {item.volume !== undefined && item.unitPrice !== undefined && item.unitPrice > 0 && (
                    <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                      Rincian: {item.volume} {item.unit || "Paket"} x {formatRupiah(item.unitPrice)}
                    </div>
                  )}
                </td>
                <td className="p-3">{formatRupiah(item.initialBudget)}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={item.shiftDelta}
                    onChange={(e) => onDeltaChange(item.id, Number(e.target.value))}
                    className="w-32 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold focus:border-zinc-900 focus:outline-none"
                  />
                </td>
                <td className={`p-3 font-bold ${isDeficit ? "text-rose-600" : "text-zinc-900"}`}>
                  {formatRupiah(item.finalBudget)}
                </td>
                <td className="p-3">
                  {isDeficit ? (
                    <Badge variant="danger">Defisit</Badge>
                  ) : item.shiftDelta !== 0 ? (
                    <Badge variant="warning">Bergeser</Badge>
                  ) : (
                    <Badge variant="default">Tetap</Badge>
                  )}
                </td>
                {onDelete && (
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex"
                      title="Hapus Kegiatan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
