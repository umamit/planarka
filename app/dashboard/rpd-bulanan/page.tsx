"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RpdItem, distributeEvenly, colTotals } from "@/lib/calculations/rpd";
import { RpdTable } from "@/components/budget/RpdTable";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { Save, Loader2, RefreshCw } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function RpdBulananPage() {
  const { profile } = useSchool();
  const [items, setItems] = useState<RpdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolId, setSchoolId] = useState<string>("");

  useEffect(() => { fetchData(); }, [profile.npsn, profile.fiscalYear]);

  const fetchData = async () => {
    if (!profile.npsn) return;
    setLoading(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools").select("id").eq("npsn", profile.npsn).single();
      if (!school) return;
      setSchoolId(school.id);

      const [{ data: budgetItems }, { data: rpdPlans }] = await Promise.all([
        supabase.from("rkas_budget_items").select("*")
          .eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear),
        supabase.from("rpd_monthly_plan").select("*")
          .eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear),
      ]);

      if (budgetItems) {
        const mapped: RpdItem[] = budgetItems.map((bi: any) => {
          const plan = rpdPlans?.find((r: any) => r.budget_item_id === bi.id);
          const months = plan
            ? Array.from({ length: 12 }, (_, i) => Number(plan[`month_${i + 1}`]) || 0)
            : distributeEvenly(Number(bi.final_budget));
          return {
            id: bi.id,
            budgetItemId: bi.id,
            snpCode: bi.snp_code,
            activityName: bi.activity_name,
            annualBudget: Number(bi.final_budget),
            months,
          };
        });
        setItems(mapped);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCellChange = (idx: number, m: number, val: number) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const newMonths = [...it.months];
      newMonths[m] = val;
      return { ...it, months: newMonths };
    }));
  };

  const handleAutoDistribute = () => {
    setItems(prev => prev.map(it => ({ ...it, months: distributeEvenly(it.annualBudget) })));
  };

  const handleSave = async () => {
    if (!schoolId) return;
    setSaving(true);
    try {
      const upserts = items.map(it => ({
        tenant_id: schoolId,
        fiscal_year: profile.fiscalYear,
        budget_item_id: it.budgetItemId,
        month_1: it.months[0],  month_2: it.months[1],  month_3: it.months[2],
        month_4: it.months[3],  month_5: it.months[4],  month_6: it.months[5],
        month_7: it.months[6],  month_8: it.months[7],  month_9: it.months[8],
        month_10: it.months[9], month_11: it.months[10], month_12: it.months[11],
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from("rpd_monthly_plan")
        .upsert(upserts, { onConflict: "tenant_id,fiscal_year,budget_item_id" });
      if (error) alert("Gagal simpan RPD: " + error.message);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const totals = colTotals(items);
  const grandTotal = totals.reduce((s, v) => s + v, 0);
  const totalAnnual = items.reduce((s, it) => s + it.annualBudget, 0);
  const isBalanced = grandTotal === totalAnnual;

  if (loading && profile.npsn) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      <span className="text-xs text-zinc-500 font-medium">Memuat RPD bulanan...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Rencana Penarikan Dana (RPD) Bulanan
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Distribusi anggaran RKAS per bulan sebagai dasar pencairan dana BOS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isBalanced ? "success" : "warning"}>
            {isBalanced ? "Terdistribusi Penuh" : "Belum Balance"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleAutoDistribute}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Distribusi Merata
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving}
            className="relative overflow-hidden bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-300 shadow-md group"
          >
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Menyimpan...</>
            ) : (
              <>
                {/* Shimmer light effect overlay */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
                <Save className="h-3.5 w-3.5 mr-1 relative z-10" />
                <span className="relative z-10">Simpan RPD</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Total Anggaran Tahunan</CardDescription>
            <CardTitle className="text-lg">{formatRupiah(totalAnnual)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Total RPD Terdistribusi</CardDescription>
            <CardTitle className={`text-lg ${isBalanced ? "text-emerald-700" : "text-amber-600"}`}>
              {formatRupiah(grandTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Selisih Belum Terdistribusi</CardDescription>
            <CardTitle className={`text-lg ${isBalanced ? "text-emerald-700" : "text-rose-600"}`}>
              {formatRupiah(totalAnnual - grandTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-xs text-zinc-400">
          Belum ada item RKAS. Tambahkan kegiatan di menu Simulasi Pergeseran terlebih dahulu.
        </Card>
      ) : (
        <RpdTable items={items} onCellChange={handleCellChange} />
      )}
    </div>
  );
}
