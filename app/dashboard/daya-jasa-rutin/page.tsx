"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Zap, Lock, Edit3, Check, Loader2, Plus, Trash2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UtilityItem {
  id: string;
  name: string;
  monthlyCost: number;
  monthsCount: number;
  provider: string;
}

const DEFAULT_UTILITIES = [
  { name: "Langganan Listrik PLN Sekolah", monthlyCost: 0, provider: "-" },
  { name: "Akses Internet Sekolah (Starlink / ISP)", monthlyCost: 0, provider: "-" },
  { name: "Air Bersih / PDAM", monthlyCost: 0, provider: "-" },
  { name: "Langganan Aplikasi & Domain Sekolah", monthlyCost: 0, provider: "-" },
];

export default function FixedUtilityBudgetPage() {
  const { profile } = useSchool();
  const [utilities, setUtilities] = useState<UtilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ monthlyCost: 0, provider: "" });

  // State Form Tambah Komponen Baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUtility, setNewUtility] = useState({ name: "", monthlyCost: 0, provider: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUtilities();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchUtilities = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data: dbItems } = await supabase
          .from("rkas_budget_items")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .eq("is_routine_utility", true);

        if (dbItems && dbItems.length > 0) {
          setUtilities(dbItems.map((di: any) => ({
            id: di.id,
            name: di.activity_name,
            monthlyCost: Math.round(Number(di.initial_budget) / 12),
            monthsCount: 12,
            provider: di.account_name || "-",
          })));
        } else {
          const inserts = DEFAULT_UTILITIES.map((du) => ({
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            snp_code: "SNP-7",
            snp_name: "Standar Pengelolaan",
            account_code: "5.1.02.02.01",
            account_name: du.provider,
            activity_name: du.name,
            initial_budget: du.monthlyCost * 12,
            shifted_amount: 0,
            final_budget: du.monthlyCost * 12,
            is_routine_utility: true,
          }));

          const { data: newItems } = await supabase
            .from("rkas_budget_items")
            .insert(inserts)
            .select();

          if (newItems) {
            setUtilities(newItems.map((di: any) => ({
              id: di.id,
              name: di.activity_name,
              monthlyCost: Math.round(Number(di.initial_budget) / 12),
              monthsCount: 12,
              provider: di.account_name,
            })));
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUtility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUtility.name || !profile.npsn) return;
    setAdding(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const annualCost = newUtility.monthlyCost * 12;

        const { error } = await supabase.from("rkas_budget_items").insert([
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            snp_code: "SNP-7",
            snp_name: "Standar Pengelolaan",
            account_code: "5.1.02.02.01",
            account_name: newUtility.provider || "-",
            activity_name: newUtility.name,
            initial_budget: annualCost,
            shifted_amount: 0,
            final_budget: annualCost,
            is_routine_utility: true,
          },
        ]);

        if (!error) {
          setShowAddForm(false);
          setNewUtility({ name: "", monthlyCost: 0, provider: "" });
          fetchUtilities();
        } else {
          alert("Gagal menambahkan komponen daya & jasa.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUtility = async (id: string) => {
    if (!confirm("Hapus komponen daya & jasa terkunci ini?")) return;
    const { error } = await supabase.from("rkas_budget_items").delete().eq("id", id);
    if (!error) fetchUtilities();
  };

  const startEdit = (item: UtilityItem) => {
    setEditId(item.id);
    setEditValues({ monthlyCost: item.monthlyCost, provider: item.provider });
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const annualBudget = editValues.monthlyCost * 12;

      const { error } = await supabase
        .from("rkas_budget_items")
        .update({
          initial_budget: annualBudget,
          final_budget: annualBudget,
          account_name: editValues.provider,
        })
        .eq("id", id);

      if (!error) {
        setUtilities((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, monthlyCost: editValues.monthlyCost, provider: editValues.provider }
              : u
          )
        );
        setEditId(null);
      } else {
        alert("Gagal memperbarui anggaran.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const totalAnnualCost = utilities.reduce((acc, u) => acc + u.monthlyCost * u.monthsCount, 0);

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat anggaran daya & jasa...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Alokasi Anggaran Daya & Jasa Terkunci (12 Bulan)</h1>
          <p className="text-xs text-zinc-500 mt-1">Penguncian Biaya Operasional Rutin Sekolah Agar Tidak Terpotong Pergeseran Insidental</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Layanan
          </Button>
          <Badge variant="default" className="w-fit h-7">
            <Lock className="h-3 w-3 inline mr-1" />
            Budget Lock Aktif
          </Badge>
        </div>
      </div>

      {showAddForm && (
        <Card className="max-w-md p-4 space-y-3">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">Tambah Komponen Daya & Jasa Rutin</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddUtility} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Pilihan Cepat Layanan (Template)</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "listrik") {
                    setNewUtility({ name: "Langganan Daya Listrik PLN", provider: "PT PLN (Persero)", monthlyCost: 350000 });
                  } else if (val === "internet") {
                    setNewUtility({ name: "Langganan Jasa Internet Wifi Sekolah", provider: "PT Telkom / Indihome", monthlyCost: 450000 });
                  } else if (val === "air") {
                    setNewUtility({ name: "Penyediaan Air Bersih Sekolah", provider: "PDAM", monthlyCost: 150000 });
                  } else if (val === "sampah") {
                    setNewUtility({ name: "Pengelolaan & Pembuangan Sampah Rutin", provider: "Kelurahan / Swadaya", monthlyCost: 750000 });
                  }
                }}
                className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900 font-semibold mb-3"
              >
                <option value="">Pilih dari Template Layanan BOSP...</option>
                <option value="listrik">Daya Listrik PLN</option>
                <option value="internet">Akses Internet Wifi (Telkom)</option>
                <option value="air">Air Bersih (PDAM)</option>
                <option value="sampah">Kebersihan & Sampah Rutin</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Nama Layanan Rutin</label>
              <input
                type="text"
                required
                value={newUtility.name}
                onChange={(e) => setNewUtility({ ...newUtility, name: e.target.value })}
                placeholder="Contoh: Honor Tenaga Kebersihan Sekolah"
                className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Nama Penyedia / Rekanan</label>
                <input
                  type="text"
                  required
                  value={newUtility.provider}
                  onChange={(e) => setNewUtility({ ...newUtility, provider: e.target.value })}
                  placeholder="Contoh: Koperasi Sekolah / Mandiri"
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Biaya Bulanan (Rp)</label>
                <input
                  type="number"
                  required
                  value={newUtility.monthlyCost}
                  onChange={(e) => setNewUtility({ ...newUtility, monthlyCost: Number(e.target.value) })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? "Menambahkan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>Total Dana Rutin Terkunci untuk 1 Tahun Anggaran</CardDescription>
            <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalAnnualCost)}</CardTitle>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-700">
              <th className="p-3 font-semibold">Komponen Daya & Jasa</th>
              <th className="p-3 font-semibold">Penyedia / Rekanan</th>
              <th className="p-3 font-semibold">Biaya Bulanan</th>
              <th className="p-3 font-semibold">Durasi</th>
              <th className="p-3 font-semibold">Alokasi 12 Bulan (Terkunci)</th>
              <th className="p-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80">
            {utilities.map((item) => {
              const isEditing = editId === item.id;
              return (
                <tr key={item.id} className="hover:bg-zinc-50/50">
                  <td className="p-3 font-semibold text-zinc-900">{item.name}</td>
                  <td className="p-3 text-zinc-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.provider}
                        onChange={(e) => setEditValues({ ...editValues, provider: e.target.value })}
                        className="w-full h-8 rounded-lg border border-zinc-200 px-2 focus:outline-none focus:border-zinc-900 font-medium"
                      />
                    ) : (
                      item.provider
                    )}
                  </td>
                  <td className="p-3 text-zinc-800">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.monthlyCost}
                        onChange={(e) => setEditValues({ ...editValues, monthlyCost: Number(e.target.value) })}
                        className="w-28 h-8 rounded-lg border border-zinc-200 px-2 focus:outline-none focus:border-zinc-900 font-mono font-bold"
                      />
                    ) : (
                      formatRupiah(item.monthlyCost)
                    )}
                  </td>
                  <td className="p-3 text-zinc-500 font-medium">{item.monthsCount} Bulan</td>
                  <td className="p-3 font-bold text-zinc-950">
                    {formatRupiah(item.monthlyCost * item.monthsCount)}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {isEditing ? (
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={savingId === item.id}
                        className="text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors inline-flex"
                        title="Simpan"
                      >
                        {savingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="text-zinc-600 hover:bg-zinc-100 p-1.5 rounded-lg transition-colors inline-flex"
                          title="Edit Biaya"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUtility(item.id)}
                          className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
