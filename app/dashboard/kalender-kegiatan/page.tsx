"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSchool } from "@/lib/context/SchoolContext";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { CalendarRange, Search, Filter } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface CalendarEvent {
  id: string;
  activityName: string;
  accountCode: string;
  snpCode: string;
  monthlyAmount: number;
}

export default function CalendarPage() {
  const { profile } = useSchool();
  const [events, setEvents] = useState<Record<number, CalendarEvent[]>>({}); // Indexed by month 0-11
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSnp, setSelectedSnp] = useState<string>("ALL");

  useEffect(() => {
    fetchCalendarData();
  }, [profile.npsn, profile.fiscalYear]);

  const fetchCalendarData = async () => {
    if (!profile.npsn) return;
    setLoading(true);
    try {
      const { data: school } = await supabase
        .from("tenants_schools")
        .select("id")
        .eq("npsn", profile.npsn)
        .single();

      if (school) {
        const [{ data: budgetItems }, { data: rpdPlans }] = await Promise.all([
          supabase.from("rkas_budget_items").select("*").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear),
          supabase.from("rpd_monthly_plan").select("*").eq("tenant_id", school.id).eq("fiscal_year", profile.fiscalYear)
        ]);

        if (budgetItems && rpdPlans) {
          // Initialize month buckets
          const buckets: Record<number, CalendarEvent[]> = {};
          for (let i = 0; i < 12; i++) {
            buckets[i] = [];
          }

          // Distribute events
          rpdPlans.forEach((plan: any) => {
            const item = budgetItems.find((bi: any) => bi.id === plan.budget_item_id);
            if (item) {
              for (let i = 0; i < 12; i++) {
                const amount = Number(plan[`month_${i + 1}`]) || 0;
                if (amount > 0) {
                  buckets[i].push({
                    id: item.id,
                    activityName: item.activity_name,
                    accountCode: item.account_code,
                    snpCode: item.snp_code,
                    monthlyAmount: amount
                  });
                }
              }
            }
          });

          setEvents(buckets);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = (monthIdx: number) => {
    const monthEvents = events[monthIdx] || [];
    return monthEvents.filter((ev) => {
      const matchesSearch = ev.activityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ev.accountCode.includes(searchTerm);
      const matchesSnp = selectedSnp === "ALL" || ev.snpCode === selectedSnp;
      return matchesSearch && matchesSnp;
    });
  };

  if (loading && profile.npsn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        <span className="text-xs text-zinc-500 font-medium">Memproses jadwal kalender...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans">Kalender Kegiatan BOSP</h1>
          <p className="text-xs text-zinc-500 mt-1">Jadwal visual rencana kerja dan penarikan dana BOSP tahunan</p>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama kegiatan atau kode akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={selectedSnp}
            onChange={(e) => setSelectedSnp(e.target.value)}
            className="h-9 rounded-xl border border-zinc-200 bg-white px-2.5 text-xs focus:outline-none focus:border-zinc-900 font-semibold"
          >
            <option value="ALL">Semua Standar (SNP)</option>
            <option value="SNP-1">SNP-1 Standar Isi</option>
            <option value="SNP-2">SNP-2 Standar Proses</option>
            <option value="SNP-3">SNP-3 Standar Kompetensi</option>
            <option value="SNP-4">SNP-4 Standar Pendidik</option>
            <option value="SNP-5">SNP-5 Standar Sarpras</option>
            <option value="SNP-6">SNP-6 Standar Pengelolaan</option>
            <option value="SNP-7">SNP-7 Pembiayaan</option>
            <option value="SNP-8">SNP-8 Penilaian</option>
          </select>
        </div>
      </Card>

      {/* 12 Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MONTH_NAMES.map((name, idx) => {
          const monthEvents = getFilteredEvents(idx);
          const monthTotal = monthEvents.reduce((acc, ev) => acc + ev.monthlyAmount, 0);

          return (
            <Card key={idx} className="flex flex-col min-h-[250px] p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-2 mb-3">
                <span className="text-xs font-bold text-zinc-800">{name}</span>
                <Badge variant={monthTotal > 0 ? "info" : "default"} className="text-[9px] font-bold">
                  {formatRupiah(monthTotal)}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[180px] space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-200/80">
                {monthEvents.length === 0 ? (
                  <div className="text-[10px] text-zinc-400 italic text-center py-8">
                    Tidak ada kegiatan terjadwal
                  </div>
                ) : (
                  monthEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] space-y-1"
                    >
                      <div className="font-bold text-zinc-800 line-clamp-2" title={ev.activityName}>
                        {ev.activityName}
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-zinc-500 font-medium">
                        <span className="font-mono">{ev.accountCode}</span>
                        <span className="font-bold text-zinc-700">{formatRupiah(ev.monthlyAmount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
