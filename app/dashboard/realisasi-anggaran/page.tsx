"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Plus, Receipt, AlertCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface BudgetRealizationItem {
  id: string;
  activityName: string;
  accountCode: string;
  finalBudget: number;
  realizedTotal: number;
}

export default function RealizationPage() {
  const { profile } = useSchool();
  const [items, setItems] = useState<BudgetRealizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<BudgetRealizationItem | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRealizationData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchRealizationData = async () => {
    if (!profile.npsn) return;
    setLoading(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const [{ data: budgetItems }, { data: realizations }] = await Promise.all([
          supabase.from("rkas_budget_items").select("*").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear),
          supabase.from("rkas_realizations").select("*").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear)
        ]);

        if (budgetItems) {
          const mapped = budgetItems.map((bi: any) => {
            const itemRealizations = realizations?.filter((r: any) => r.budget_item_id === bi.id) || [];
            const realizedTotal = itemRealizations.reduce((acc: number, cur: any) => acc + Number(cur.realized_amount), 0);
            return {
              id: bi.id,
              activityName: bi.activity_name,
              accountCode: bi.account_code,
              finalBudget: Number(bi.final_budget) || 0,
              realizedTotal
            };
          });
          setItems(mapped);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRealization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || amount <= 0 || submitting) return;

    // Proteksi agar realisasi tidak melebihi pagu tersisa
    const remaining = selectedItem.finalBudget - selectedItem.realizedTotal;
    if (amount > remaining) {
      alert("Error: Nominal realisasi tidak boleh melebihi sisa anggaran!");
      return;
    }

    setSubmitting(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { error } = await supabase.from("rkas_realizations").insert([
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            budget_item_id: selectedItem.id,
            realized_amount: amount,
            description: description || "Realisasi belanja"
          }
        ]);

        if (!error) {
          setSelectedItem(null);
          setAmount(0);
          setDescription("");
          fetchRealizationData();
        } else {
          alert("Gagal menyimpan realisasi: " + error.message);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const totalBudget = items.reduce((acc, it) => acc + it.finalBudget, 0);
  const totalRealized = items.reduce((acc, it) => acc + it.realizedTotal, 0);
  const pctTotal = totalBudget > 0 ? (totalRealized / totalBudget) * 100 : 0;

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat realisasi anggaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Realisasi Anggaran</h1>
        <p className="text-xs text-zinc-500 mt-1">Pantau dan catat nominal pengeluaran riil BOSP dari rencana kegiatan sekolah</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Rencana Anggaran</span>
          <div className="text-xl font-bold text-zinc-900">{formatRupiah(totalBudget)}</div>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Realisasi Belanja</span>
          <div className="text-xl font-bold text-emerald-700">{formatRupiah(totalRealized)}</div>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Persentase Serapan</span>
          <div className="text-xl font-bold text-zinc-900">{pctTotal.toFixed(1)}%</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
                <th className="p-3 font-semibold w-24">Kode Akun</th>
                <th className="p-3 font-semibold">Nama Kegiatan / Belanja</th>
                <th className="p-3 font-semibold text-right">Pagu RKAS</th>
                <th className="p-3 font-semibold text-right">Realisasi</th>
                <th className="p-3 font-semibold text-right">Sisa Saldo</th>
                <th className="p-3 font-semibold text-center w-36">Serapan</th>
                <th className="p-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80">
              {items.map((item) => {
                const remaining = item.finalBudget - item.realizedTotal;
                const pct = item.finalBudget > 0 ? (item.realizedTotal / item.finalBudget) * 100 : 0;
                return (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="p-3 font-mono text-[11px] text-zinc-500">{item.accountCode}</td>
                    <td className="p-3 font-semibold text-zinc-900">{item.activityName}</td>
                    <td className="p-3 text-right font-medium">{formatRupiah(item.finalBudget)}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{formatRupiah(item.realizedTotal)}</td>
                    <td className={`p-3 text-right font-bold ${remaining === 0 ? "text-zinc-400" : "text-zinc-800"}`}>
                      {formatRupiah(remaining)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedItem(item)}
                        disabled={remaining <= 0}
                        className="h-7 text-[10px]"
                      >
                        <Plus className="h-3 w-3 mr-0.5" /> Realisasi
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog Input Realisasi */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-5 space-y-4 shadow-2xl relative bg-white">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900">Input Realisasi Belanja</CardTitle>
              <CardDescription className="text-[11px] mt-0.5">{selectedItem.activityName}</CardDescription>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100 text-[11px] text-zinc-600 space-y-1">
              <div className="flex justify-between">
                <span>Pagu RKAS:</span>
                <span className="font-semibold">{formatRupiah(selectedItem.finalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Terealisasi:</span>
                <span className="font-semibold text-emerald-700">{formatRupiah(selectedItem.realizedTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200/80 pt-1 font-bold text-zinc-800">
                <span>Maks Sisa Saldo:</span>
                <span>{formatRupiah(selectedItem.finalBudget - selectedItem.realizedTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleAddRealization} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Nominal Pembelanjaan (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Contoh: 150000"
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 text-xs font-semibold focus:border-zinc-900 focus:outline-none"
                  max={selectedItem.finalBudget - selectedItem.realizedTotal}
                  min={1}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Keterangan / Nomor Nota (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembayaran Nota Kertas HVS Toko ATK Mandiri"
                  className="w-full h-16 rounded-xl border border-zinc-200 p-2.5 text-xs focus:border-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Simpan Realisasi"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
