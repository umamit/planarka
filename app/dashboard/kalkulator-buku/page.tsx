"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_BOOKS } from "@/lib/constants/sample-books";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Sparkles, Check, RefreshCw } from "lucide-react";
import { useSchool } from "@/lib/context/SchoolContext";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BookProcurementPage() {
  const { profile } = useSchool();
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [totalPagu, setTotalPagu] = useState<number>(293260000); // Default Pagu acuan (sehingga 10% = 29.326.000)

  // Map untuk menyimpan kuantitas (exemplar) pesanan buku: id_buku -> jumlah_eks
  const [quantities, setQuantities] = useState<{ [bookId: string]: number }>({});

  // Preset data pesanan riil dari Surat Pesanan SDN Bobong
  const presetBobong: { [bookId: string]: number } = {
    "b-code5": 7,
    "b-code6": 7,
    "b-sd1-pjok": 6,
    "b-sd1-art": 6,
    "b-sd3-english": 8,
    "b-sd3-ipas": 7,
    "b-sd3-pjok": 7,
    "b-sd4-pancasila": 7,
    "b-sd4-indo": 7,
    "b-sd4-ipas": 7,
    "b-sd4-mat": 7,
    "b-osn-ipa": 7,
    "b-tka-sd": 3
  };

  useEffect(() => {
    fetchSavedData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchSavedData = async () => {
    if (!profile.npsn) return;
    setLoading(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        // Ambil pagu anggaran BOSP
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear)
          .single();

        if (alloc) {
          const totalPaguVal = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
          if (totalPaguVal > 0) {
            setTotalPagu(totalPaguVal);
          }
        }

        // Ambil kuantitas pesanan buku yang tersimpan
        const { data: savedBooks } = await supabase
          .from("bos_book_procurements")
          .select("book_id, quantity")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (savedBooks && savedBooks.length > 0) {
          const loadedQuantities: { [bookId: string]: number } = {};
          savedBooks.forEach((item) => {
            loadedQuantities[item.book_id] = item.quantity;
          });
          setQuantities(loadedQuantities);
        } else {
          // Default load preset Bobong
          setQuantities(presetBobong);
        }
      }
    } catch (e) {
      console.error(e);
      setQuantities(presetBobong);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuantity = async (bookId: string, qty: number) => {
    const nextQuantities = { ...quantities, [bookId]: qty };
    setQuantities(nextQuantities);

    if (!profile.npsn) return;
    setAutoSaving(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        await supabase.from("bos_book_procurements").upsert(
          {
            tenant_id: school.id,
            fiscal_year: profile.fiscalYear,
            book_id: bookId,
            quantity: qty,
          },
          { onConflict: "tenant_id, fiscal_year, book_id" }
        );
      }
    } catch (e) {
      console.error("Gagal menyimpan kuantitas buku:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  const applyPresetBobong = async () => {
    setQuantities(presetBobong);
    if (!profile.npsn) return;
    setAutoSaving(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const insertData = Object.entries(presetBobong).map(([bookId, qty]) => ({
          tenant_id: school.id,
          fiscal_year: profile.fiscalYear,
          book_id: bookId,
          quantity: qty,
        }));

        await supabase.from("bos_book_procurements").upsert(insertData, {
          onConflict: "tenant_id, fiscal_year, book_id",
        });
      }
    } catch (e) {
      console.error("Gagal menerapkan preset:", e);
    } finally {
      setAutoSaving(false);
    }
  };

  // Kalkulasi Total Belanja & Eks
  let totalBelanjaBuku = 0;
  let totalExemplars = 0;

  const tableRows = SAMPLE_BOOKS.map((book) => {
    const qty = quantities[book.id] || 0;
    const price = book.hetZones[5] || 0; // Lock Zona 5 Taliabu
    const subtotal = qty * price;

    totalBelanjaBuku += subtotal;
    totalExemplars += qty;

    return {
      book,
      qty,
      price,
      subtotal,
      isCustom: false
    };
  });

  // State untuk buku custom tambahan (Buku Guru, dll)
  const [customRows, setCustomRows] = useState<Array<{
    id: string;
    subjectTitle: string;
    classGrade: number;
    price: number;
    qty: number;
  }>>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newGrade, setNewGrade] = useState(1);
  const [newPrice, setNewPrice] = useState<number>(150000);
  const [newQty, setNewQty] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState(false);

  // Ambil data custom yang tersimpan di awal
  useEffect(() => {
    fetchCustomBooks();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchCustomBooks = async () => {
    if (!profile.npsn) return;
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const { data: savedCustoms } = await supabase
          .from("bos_book_custom_entries")
          .select("*")
          .eq("tenant_id", school.id)
          .eq("fiscal_year", profile.fiscalYear);

        if (savedCustoms) {
          setCustomRows(savedCustoms.map(c => ({
            id: c.id,
            subjectTitle: c.subject_title,
            classGrade: c.class_grade,
            price: c.price,
            qty: c.quantity
          })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomBook = async () => {
    if (!newTitle.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newRow = {
      id: newId,
      subjectTitle: newTitle,
      classGrade: newGrade,
      price: newPrice,
      qty: newQty
    };

    const nextCustoms = [...customRows, newRow];
    setCustomRows(nextCustoms);
    setNewTitle("");
    setShowAddForm(false);

    if (!profile.npsn) return;
    setAutoSaving(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        await supabase.from("bos_book_custom_entries").insert({
          id: newId,
          tenant_id: school.id,
          fiscal_year: profile.fiscalYear,
          subject_title: newRow.subjectTitle,
          class_grade: newRow.classGrade,
          price: newRow.price,
          quantity: newRow.qty
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleUpdateCustomQty = async (id: string, qty: number) => {
    const nextCustoms = customRows.map(r => r.id === id ? { ...r, qty } : r);
    setCustomRows(nextCustoms);

    if (!profile.npsn) return;
    setAutoSaving(true);
    try {
      await supabase
        .from("bos_book_custom_entries")
        .update({ quantity: qty })
        .eq("id", id);
    } catch (e) {
      console.error(e);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    const nextCustoms = customRows.filter(r => r.id !== id);
    setCustomRows(nextCustoms);

    if (!profile.npsn) return;
    setAutoSaving(true);
    try {
      await supabase
        .from("bos_book_custom_entries")
        .delete()
        .eq("id", id);
    } catch (e) {
      console.error(e);
    } finally {
      setAutoSaving(false);
    }
  };

  // Tambahkan baris custom ke kalkulasi total
  customRows.forEach((r) => {
    const subtotal = r.qty * r.price;
    totalBelanjaBuku += subtotal;
    totalExemplars += r.qty;
  });

  const target10Persen = totalPagu * 0.1;
  const selisihAnggaran = totalBelanjaBuku - target10Persen;
  const rasioBelanja = totalPagu > 0 ? (totalBelanjaBuku / totalPagu) * 100 : 0;

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memuat kalkulator lembar kerja buku...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Lembar Kerja Pengadaan Buku (CP 46/2025)</h1>
          <p className="text-xs text-zinc-500 mt-1">Estimasi pengadaan otomatis bersasarkan target minimal 10% pagu anggaran sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
              Menyimpan ke database...
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={applyPresetBobong} className="gap-1.5 text-zinc-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Muat Preset SDN Bobong
          </Button>
        </div>
      </div>

      {/* Grid Dashboard Info Anggaran Buku */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardDescription>Total Pagu BOSP</CardDescription>
          <div className="mt-1.5">
            <input
              type="number"
              value={totalPagu}
              onChange={(e) => setTotalPagu(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Masukkan total pagu untuk menghitung rasio</p>
        </Card>

        <Card className="p-4">
          <CardDescription>Target Minimal 10% Buku</CardDescription>
          <CardTitle className="text-lg font-bold mt-1 text-zinc-900">{formatRupiah(target10Persen)}</CardTitle>
          <p className="text-[10px] text-zinc-500 mt-1">Batas wajib Juknis BOSP 2026</p>
        </Card>

        <Card className="p-4">
          <CardDescription>Total Belanja Buku Saat Ini</CardDescription>
          <CardTitle className="text-lg font-bold mt-1 text-zinc-900">{formatRupiah(totalBelanjaBuku)}</CardTitle>
          <p className="text-[10px] text-zinc-500 mt-1">Rasio: {rasioBelanja.toFixed(1)}% ({totalExemplars} eks)</p>
        </Card>

        <Card className="p-4">
          <CardDescription>Status / Selisih Batas 10%</CardDescription>
          <div className="mt-1 flex items-center gap-1.5">
            {totalBelanjaBuku >= target10Persen ? (
              <Badge variant="success" className="text-xs">Terpenuhi (10%+)</Badge>
            ) : (
              <Badge variant="warning" className="text-xs">Di bawah 10%</Badge>
            )}
          </div>
          <p className={`text-[10px] mt-1 font-medium ${selisihAnggaran >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {selisihAnggaran >= 0 ? `Kelebihan: +${formatRupiah(selisihAnggaran)}` : `Kurang: ${formatRupiah(selisihAnggaran)}`}
          </p>
        </Card>
      </div>

      {/* Spreadsheet / Lembar Kerja Buku */}
      <Card className="p-0 overflow-hidden border border-zinc-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-semibold">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Judul Buku (Penerbit Andi - CP 46/2025)</th>
                <th className="p-3 w-28 text-center">Sasaran Kelas</th>
                <th className="p-3 w-32 text-right">Harga Satuan (Zona 5)</th>
                <th className="p-3 w-28 text-center">Jumlah Pesanan (Eks)</th>
                <th className="p-3 w-36 text-right">Nominal Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 font-medium">
              {tableRows.map((row, index) => (
                <tr key={row.book.id} className="hover:bg-zinc-50/50">
                  <td className="p-3 text-center text-zinc-400 font-mono">{index + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold text-zinc-800">{row.book.subjectTitle}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Andi Offset • CP 46/2025</div>
                  </td>
                  <td className="p-3 text-center text-zinc-600">Kelas {row.book.classGrade}</td>
                  <td className="p-3 text-right font-mono text-zinc-700">{formatRupiah(row.price)}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="0"
                      value={row.qty || ""}
                      onChange={(e) => handleSaveQuantity(row.book.id, Number(e.target.value))}
                      className="w-16 h-8 text-center rounded-md border border-zinc-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3 text-right font-bold text-zinc-900 font-mono">
                    {formatRupiah(row.subtotal)}
                  </td>
                </tr>
              ))}

              {/* Buku Custom Tambahan */}
              {customRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-zinc-50/50 bg-amber-50/20">
                  <td className="p-3 text-center text-zinc-400 font-mono">{tableRows.length + index + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold text-amber-900">{row.subjectTitle}</div>
                    <div className="text-[10px] text-amber-600 mt-0.5 flex items-center gap-1.5">
                      <span>Buku Tambahan</span>
                      <button onClick={() => handleDeleteCustom(row.id)} className="text-rose-600 hover:underline">Hapus</button>
                    </div>
                  </td>
                  <td className="p-3 text-center text-zinc-600">Kelas {row.classGrade}</td>
                  <td className="p-3 text-right font-mono text-zinc-700">{formatRupiah(row.price)}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="0"
                      value={row.qty || ""}
                      onChange={(e) => handleUpdateCustomQty(row.id, Number(e.target.value))}
                      className="w-16 h-8 text-center rounded-md border border-zinc-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </td>
                  <td className="p-3 text-right font-bold text-zinc-900 font-mono">
                    {formatRupiah(row.qty * row.price)}
                  </td>
                </tr>
              ))}

              {/* Form Input Tambah Buku Baru */}
              {showAddForm ? (
                <tr className="bg-zinc-50 border-t border-zinc-200">
                  <td className="p-3 text-center text-zinc-400 font-mono">*</td>
                  <td className="p-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Masukkan Judul Buku Guru / Judul Lainnya..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-8 px-2 rounded border border-zinc-200 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={handleAddCustomBook}>Simpan Buku</Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Batal</Button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(Number(e.target.value))}
                      className="h-8 rounded border border-zinc-200 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>Kelas {g}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-24 h-8 text-right px-2 rounded border border-zinc-200 font-mono"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={newQty}
                      onChange={(e) => setNewQty(Number(e.target.value))}
                      className="w-12 h-8 text-center rounded border border-zinc-200 font-mono"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-400">-</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="p-3">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
                    >
                      + Tambah Buku Guru / Buku Custom Baru
                    </button>
                  </td>
                </tr>
              )}

              <tr className="bg-zinc-50/80 font-bold border-t-2 border-zinc-300">
                <td colSpan={4} className="p-3 text-right text-zinc-700 text-xs">TOTAL BELANJA BUKU:</td>
                <td className="p-3 text-center font-mono text-zinc-900 text-xs">{totalExemplars} eks</td>
                <td className="p-3 text-right font-mono text-zinc-950 text-sm">{formatRupiah(totalBelanjaBuku)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

