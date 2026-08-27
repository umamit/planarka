"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShiftItem, validateBudgetShift } from "@/lib/calculations/budget-shift";
import { ShiftMatrixTable } from "@/components/budget/ShiftMatrixTable";
import { BudgetAllocationSummary } from "@/components/budget/BudgetAllocationSummary";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { RotateCcw, AlertTriangle, Loader2, Plus } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);



export default function BudgetShiftSimulatorPage() {
  const { profile } = useSchool();
  const [items, setItems] = useState<ShiftItem[]>([]);
  const [totalPagu, setTotalPagu] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);

  // State Form Tambah Item
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    snpCode: "SNP-1",
    accountCode: "",
    activityName: "",
    initialBudget: 0,
    isHonorNonAsn: false,
    isMaintenanceSarpras: false,
    isBookProcurement: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi pencarian online ke database Supabase
  const searchAccountCodes = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/references/account-codes?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.data) {
        setSearchResults(json.data);
      }
    } catch (e) {
      console.error("Gagal melakukan pencarian kode rekening:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Efek Debounce untuk pencarian online (jeda 400ms setelah mengetik)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput.trim()) {
        searchAccountCodes(searchInput);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchData();

    // Listen to AI-powered inputs to automatically refresh tables
    window.addEventListener("rkas_updated", fetchData);
    return () => {
      window.removeEventListener("rkas_updated", fetchData);
    };
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
            isBookProcurement: di.is_book_procurement,
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
    if (!newItem.accountCode || !newItem.activityName || !profile.npsn || isSubmitting) return;

    setIsSubmitting(true);
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
            is_book_procurement: newItem.isBookProcurement || false,
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
            isBookProcurement: false,
          });
          setSearchInput("");
          setSearchResults([]);
          fetchData();
        } else {
          alert("Gagal menambahkan item anggaran: " + error.message);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus item kegiatan anggaran ini?")) return;
    const { error } = await supabase.from("rkas_budget_items").delete().eq("id", id);
    if (!error) fetchData();
  };

  const handleDeltaChange = async (id: string, newDelta: number) => {
    // 1. Update status UI lokal instan agar cepat
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, shiftDelta: newDelta, finalBudget: item.initialBudget + newDelta }
          : item
      )
    );

    // 2. Simpan otomatis di background ke Supabase
    setAutoSaving(true);
    try {
      const targetItem = items.find((it) => it.id === id);
      if (targetItem) {
        await supabase
          .from("rkas_budget_items")
          .update({
            shifted_amount: newDelta,
            final_budget: targetItem.initialBudget + newDelta,
          })
          .eq("id", id);
      }
    } catch (e) {
      console.error("Gagal auto-save delta:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset semua pergeseran anggaran kembali ke 0?")) return;
    setLoading(true);
    try {
      const promises = items.map((item) =>
        supabase
          .from("rkas_budget_items")
          .update({
            shifted_amount: 0,
            final_budget: item.initialBudget,
          })
          .eq("id", item.id)
      );
      await Promise.all(promises);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };



  const isNegeri = !profile.schoolName.toLowerCase().includes("swasta");
  const validation = validateBudgetShift(items, totalPagu, isNegeri);

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
          <p className="text-xs text-zinc-500 mt-1">Uji Keseimbangan (Zero-Balance), Batas 20% Honor Negeri / 40% Swasta, dan Anti-Defisit Sebelum Pengesahan Dinas</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-[11px] text-zinc-400 font-medium mr-2 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
              Menyimpan otomatis ke cloud...
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Kegiatan
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Pergeseran
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="max-w-2xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm">Tambah Rencana Kegiatan Anggaran Sekolah (RKAS)</CardTitle>
          </CardHeader>
          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div className="relative">
              <label className="font-semibold text-zinc-700 block mb-1">Cari Kegiatan BOSP Online (Katalog BOSP/SIPD 2026)</label>
              <input
                type="text"
                placeholder="Ketik kata kunci... (contoh: buku, honor, listrik, internet, atk)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-9 rounded-xl border border-zinc-200 px-3 focus:outline-none focus:border-zinc-900 font-medium"
              />
              {isSearching && (
                <div className="absolute right-3 top-7">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewItem({
                          ...newItem,
                          accountCode: res.account_code,
                          activityName: res.account_name,
                          snpCode: res.default_snp_code || "SNP-5",
                          isHonorNonAsn: res.is_honor_non_asn,
                          isMaintenanceSarpras: res.is_maintenance_sarpras,
                          isBookProcurement: res.is_book_procurement,
                        });
                        setSearchInput(res.account_name);
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-50 rounded-lg transition-colors flex flex-col gap-0.5"
                    >
                      <span className="font-semibold text-zinc-900">{res.account_name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{res.account_code} • {res.default_snp_code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kode Akun Rekening (Terisi Otomatis)</label>
                <input
                  type="text"
                  placeholder="Contoh: 5.2.05.01.01.0001"
                  value={newItem.accountCode}
                  onChange={(e) => setNewItem({ ...newItem, accountCode: e.target.value })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 focus:outline-none focus:border-zinc-900 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Standar Nasional Pendidikan (SNP)</label>
                <select
                  value={newItem.snpCode}
                  onChange={(e) => setNewItem({ ...newItem, snpCode: e.target.value })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="SNP-1">SNP-1 (Standar Kompetensi Lulusan)</option>
                  <option value="SNP-2">SNP-2 (Standar Isi)</option>
                  <option value="SNP-3">SNP-3 (Standar Proses)</option>
                  <option value="SNP-4">SNP-4 (Standar Pendidik & Tendik)</option>
                  <option value="SNP-5">SNP-5 (Standar Sarana & Prasarana)</option>
                  <option value="SNP-6">SNP-6 (Standar Pengelolaan)</option>
                  <option value="SNP-7">SNP-7 (Standar Pembiayaan)</option>
                  <option value="SNP-8">SNP-8 (Standar Penilaian Pendidikan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Nama Rencana Kegiatan (Uraian)</label>
              <input
                type="text"
                placeholder="Contoh: Pengadaan Buku Teks Utama Kelas 1 Merdeka"
                value={newItem.activityName}
                onChange={(e) => setNewItem({ ...newItem, activityName: e.target.value })}
                className="w-full h-9 rounded-xl border border-zinc-200 px-3 focus:outline-none focus:border-zinc-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Anggaran Awal (Rp)</label>
                <input
                  type="number"
                  value={newItem.initialBudget}
                  onChange={(e) => setNewItem({ ...newItem, initialBudget: Number(e.target.value) })}
                  className="w-full h-9 rounded-xl border border-zinc-200 px-3 focus:outline-none focus:border-zinc-900 font-bold"
                  min="0"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kategori Honor Guru?</label>
                <select
                  value={newItem.isHonorNonAsn ? "Honor" : "Bukan"}
                  onChange={(e) => setNewItem({ ...newItem, isHonorNonAsn: e.target.value === "Honor" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="Bukan">Bukan Belanja Honor</option>
                  <option value="Honor">Belanja Honor Guru Non-ASN (Pasal 40)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Kategori Sarpras?</label>
                <select
                  value={newItem.isMaintenanceSarpras ? "Sarpras" : "Bukan"}
                  onChange={(e) => setNewItem({ ...newItem, isMaintenanceSarpras: e.target.value === "Sarpras" })}
                  className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2 focus:outline-none focus:border-zinc-900"
                >
                  <option value="Bukan">Bukan Pemeliharaan</option>
                  <option value="Sarpras">Daya / Pemeliharaan Sarpras Sekolah</option>
                </select>
              </div>
            </div>

             <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="flex items-center gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                    Menyimpan...
                  </>
                ) : (
                  "Tambah Item"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <BudgetAllocationSummary totalPagu={totalPagu} validation={validation} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold">Status Keseimbangan</span>
            <Badge variant={validation.isBalanced ? "success" : "danger"}>
              {validation.isBalanced ? "Balance" : "Selisih"}
            </Badge>
          </div>
          <div className="text-xl font-bold tracking-tight text-zinc-950">
            {formatRupiah(validation.netDelta)}
          </div>
          <p className="text-[10px] text-zinc-400">Selisih Bersih Mutasi</p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold">Pagu Anggaran Sekolah</span>
            <Badge variant="default">Definitif</Badge>
          </div>
          <div className="text-xl font-bold tracking-tight text-zinc-950">
            {formatRupiah(totalPagu)}
          </div>
          <p className="text-[10px] text-zinc-400">Total Pagu Tersedia</p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold">Batas Honor Guru</span>
            <Badge variant={validation.isHonorValid ? "success" : "danger"}>
              {validation.isHonorValid ? "Aman" : "Melanggar"}
            </Badge>
          </div>
          <div className={`text-base font-bold mt-1 ${validation.isHonorValid ? "text-emerald-700" : "text-rose-600"}`}>
            {validation.honorPercentage.toFixed(1)}% (Max {validation.honorLimit}%)
          </div>
          <p className="text-[10px] text-zinc-400">Rasio Belanja Guru Non-ASN</p>
        </Card>

        <Card className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-semibold">Batas Belanja Sarpras</span>
            <Badge variant={validation.isSarprasValid ? "success" : "warning"}>
              {validation.isSarprasValid ? "Aman" : "Saran >20%"}
            </Badge>
          </div>
          <div className={`text-base font-bold mt-1 ${validation.isSarprasValid ? "text-emerald-700" : "text-amber-600"}`}>
            {validation.sarprasPercentage.toFixed(1)}% (Saran 20%)
          </div>
          <p className="text-[10px] text-zinc-400">Pemeliharaan Ringan Sarpras</p>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-xs text-zinc-400">
          Belum ada kegiatan anggaran yang didaftarkan. Gunakan tombol &quot;Tambah Kegiatan&quot; di atas untuk mulai.
        </Card>
      ) : (
        <div className="space-y-2">
          {validation.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Catatan Evaluasi Kepatuhan Juknis:
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validation.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <ShiftMatrixTable
            items={items}
            onDeltaChange={handleDeltaChange}
            onDelete={handleDeleteItem}
          />
        </div>
      )}
    </div>
  );
}
