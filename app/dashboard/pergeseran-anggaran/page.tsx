"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShiftItem, validateBudgetShift } from "@/lib/calculations/budget-shift";
import { ShiftMatrixTable } from "@/components/budget/ShiftMatrixTable";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { RotateCcw, AlertTriangle, Save, Loader2, Plus, Trash2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BudgetShiftSimulatorPage() {
  const { profile } = useSchool();
  const [items, setItems] = useState<ShiftItem[]>([]);
  const [totalPagu, setTotalPagu] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Form Tambah Item
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    snpCode: "SNP-1",
    accountCode: "",
    activityName: "",
    initialBudget: 0,
    isHonorNonAsn: false,
    isMaintenanceSarpras: false,
  });

  useEffect(() => {
    fetchData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchData = async () => {
    if (!profile.npsn) return;
    setLoading(true);

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        // Ambil pagu real
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("bos_regular_total, bos_performance_total, silpa_previous_year")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          const paguReal = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
          setTotalPagu(paguReal);
        }

        // Ambil item RKAS
        const { data: dbItems } = await supabase
          .from("rkas_budget_items")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (dbItems) {
          const mappedItems: ShiftItem[] = dbItems.map((di: any) => ({
            id: di.id,
            snpCode: di.snp_code,
            accountCode: di.account_code,
            activityName: di.activity_name,
            initialBudget: Number(di.initial_budget),
            shiftDelta: Number(di.shifted_amount),
            finalBudget: Number(di.final_budget),
            isHonorNonAsn: di.is_non_asn_honor,
            isMaintenanceSarpras: di.is_routine_utility,
          }));
          setItems(mappedItems);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.accountCode || !newItem.activityName || !profile.npsn) return;

    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { error } = await supabase.from("rkas_budget_items").insert([
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            snp_code: newItem.snpCode,
            snp_name: newItem.snpCode === "SNP-3" ? "Standar Proses" : newItem.snpCode === "SNP-5" ? "Standar Sarpras" : newItem.snpCode === "SNP-4" ? "Standar Pendidik" : "Standar Lainnya",
            account_code: newItem.accountCode,
            account_name: newItem.activityName,
            activity_name: newItem.activityName,
            initial_budget: newItem.initialBudget,
            shifted_amount: 0,
            final_budget: newItem.initialBudget,
            is_non_asn_honor: newItem.isHonorNonAsn,
            is_routine_utility: newItem.isMaintenanceSarpras,
          },
        ]);

        if (!error) {
          setShowAddForm(false);
          setNewItem({
            snpCode: "SNP-1",
            accountCode: "",
            activityName: "",
            initialBudget: 0,
            isHonorNonAsn: false,
            isMaintenanceSarpras: false,
          });
          fetchData();
        } else {
          alert("Gagal menambahkan item anggaran.");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus item kegiatan anggaran ini?")) return;
    const { error } = await supabase.from("rkas_budget_items").delete().eq("id", id);
    if (!error) fetchData();
  };

  const handleDeltaChange = (id: string, newDelta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, shiftDelta: newDelta, finalBudget: item.initialBudget + newDelta }
          : item
      )
    );
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const promises = items.map((item) =>
        supabase
          .from("rkas_budget_items")
          .update({
            shifted_amount: item.shiftDelta,
            final_budget: item.finalBudget,
          })
          .eq("id", item.id)
      );

      await Promise.all(promises);
      alert("Pergeseran anggaran berhasil disimpan permanen ke database cloud!");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan ke database.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        shiftDelta: 0,
        finalBudget: it.initialBudget,
      }))
    );
  };

  const validation = validateBudgetShift(items, totalPagu);

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat data pergeseran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Simulator Pergeseran Anggaran (Pre-ARKAS)</h1>
          <p className="text-xs text-zinc-500 mt-1">Uji Keseimbangan (Zero-Balance), Batas 50% Honor, dan Anti-Defisit Sebelum Pengesahan Dinas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Kegiatan
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveToDatabase} disabled={saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1" />
            )}
            Simpan ke Cloud
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="space-y-4 max-w-xl">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">Tambah Rencana Kegiatan Anggaran Sekolah (RKAS)</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kode Akun Rekening</label>
                <input
                  type="text"
                  required
                  value={newItem.accountCode}
                  onChange={(e) => setNewItem({ ...newItem, accountCode: e.target.value })}
                  placeholder="Contoh: 5.2.05.01.01.0001"
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Standar Nasional Pendidikan (SNP)</label>
                <select
                  value={newItem.snpCode}
                  onChange={(e) => setNewItem({ ...newItem, snpCode: e.target.value })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  {["SNP-1", "SNP-2", "SNP-3", "SNP-4", "SNP-5", "SNP-6", "SNP-7", "SNP-8"].map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Nama Rencana Kegiatan (Uraian)</label>
              <input
                type="text"
                required
                value={newItem.activityName}
                onChange={(e) => setNewItem({ ...newItem, activityName: e.target.value })}
                placeholder="Contoh: Pengadaan Buku Teks Utama Kelas 1 Merdeka"
                className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Anggaran Awal (Rp)</label>
                <input
                  type="number"
                  required
                  value={newItem.initialBudget}
                  onChange={(e) => setNewItem({ ...newItem, initialBudget: Number(e.target.value) })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kategori Honor Guru?</label>
                <select
                  value={String(newItem.isHonorNonAsn)}
                  onChange={(e) => setNewItem({ ...newItem, isHonorNonAsn: e.target.value === "true" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="false">Bukan</option>
                  <option value="true">Ya (Honor Guru)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kategori Sarpras?</label>
                <select
                  value={String(newItem.isMaintenanceSarpras)}
                  onChange={(e) => setNewItem({ ...newItem, isMaintenanceSarpras: e.target.value === "true" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="false">Bukan</option>
                  <option value="true">Ya (Pemeliharaan)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm">
                Tambah Item
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Keseimbangan</CardDescription>
            <Badge variant={validation.isBalanced ? "success" : "danger"}>
              {validation.isBalanced ? "Balance" : "Tidak Seimbang"}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(validation.netDelta)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Selisih Bersih Mutasi</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Pagu Anggaran Sekolah</CardDescription>
            <Badge variant="default">Definitif</Badge>
          </div>
          <CardTitle className="text-xl font-bold mt-1">{formatRupiah(totalPagu)}</CardTitle>
          <p className="text-[11px] text-zinc-500 mt-1">Total Pagu Tersedia</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardDescription>Status Pelanggaran Batas</CardDescription>
            <Badge variant={validation.warnings.length === 0 ? "success" : "danger"}>
              {validation.warnings.length === 0 ? "Aman" : "Ada Pelanggaran"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-bold mt-2">
            {validation.warnings.length === 0 ? (
              <span className="text-emerald-700">Lolos Verifikasi Juknis BOSP</span>
            ) : (
              <span className="text-rose-700">{validation.warnings.length} Temuan Kesalahan</span>
            )}
          </CardTitle>
        </Card>
      </div>

      {validation.warnings.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Verifikasi Gagal: Kesalahan Aturan Penganggaran Terdeteksi</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1">
            {validation.warnings.map((err: string, idx: number) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Card>
      )}

      {items.length === 0 ? (
        <Card className="py-12 text-center text-xs text-zinc-400">
          Belum ada kegiatan anggaran yang didaftarkan. Gunakan tombol &quot;Tambah Kegiatan&quot; di atas untuk mulai.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ShiftMatrixTable items={items} onDeltaChange={handleDeltaChange} onDelete={handleDeleteItem} />
          
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end text-xs">
            <span className="text-zinc-500">Seluruh data disinkronisasi langsung ke Supabase Cloud.</span>
          </div>
        </Card>
      )}
    </div>
  );
}
