"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { useSchool } from "@/lib/context/SchoolContext";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const { profile } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSuperadmin = profile.npsn === "00000000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      if (isSuperadmin) {
        setMessages([
          { role: "assistant", content: "Halo Superadmin! Saya adalah asisten analisis bisnis PLANARKA. Ada yang bisa saya bantu terkait statistik database sekolah terdaftar hari ini?" }
        ]);
      } else {
        setMessages([
          { role: "assistant", content: `Halo Bendahara/Kepala Sekolah! Saya asisten AI PLANARKA. Tanyakan apa saja tentang aturan penggunaan dana BOS (Juknis BOSP), batas honor, pajak belanja, atau tata cara pergeseran anggaran.` }
        ]);
      }
    }
  }, [isSuperadmin, messages.length]);

  // Fungsi pembantu untuk memproses aksi penginputan otomatis dari AI
  const processAIAction = async (replyText: string) => {
    if (!profile.npsn || isSuperadmin) return replyText;

    try {
      // Cari blok JSON di dalam teks respon AI
      const jsonStart = replyText.indexOf("{");
      const jsonEnd = replyText.lastIndexOf("}");
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = replyText.slice(jsonStart, jsonEnd + 1);
        const actionObj = JSON.parse(jsonStr);

        const { data: school } = await supabase
          .from("tenants_schools")
          .select("id")
          .eq("npsn", profile.npsn)
          .single();

        if (school) {
          if (actionObj.action === "ADD_BUDGET_ITEM" && actionObj.data) {
            const item = actionObj.data;
            
            // Insert ke Supabase
            const { error } = await supabase.from("rkas_budget_items").insert([
              {
                tenant_id: school.id,
                fiscal_year: profile.fiscalYear,
                snp_code: item.snpCode || "SNP-1",
                snp_name: "Standar Belanja",
                account_code: item.accountCode || "5.1.02.01",
                account_name: item.activityName,
                activity_name: item.activityName,
                initial_budget: Number(item.initialBudget) || 0,
                shifted_amount: 0,
                final_budget: Number(item.initialBudget) || 0,
              },
            ]);

            if (!error) {
              // Picu pembaruan visual di halaman simulator
              window.dispatchEvent(new Event("rkas_updated"));
              return replyText.slice(0, jsonStart) + `\n\n[Sistem AI]: Berhasil menambahkan kegiatan "${item.activityName}" sebesar Rp${Number(item.initialBudget).toLocaleString("id-ID")} ke database cloud.`;
            }
          } 
          
          else if (actionObj.action === "DELETE_BUDGET_ITEM" && actionObj.data) {
            const item = actionObj.data;

            // Hapus dari Supabase berdasarkan kecocokan nama uraian kegiatan (ilike)
            const { error } = await supabase
              .from("rkas_budget_items")
              .delete()
              .eq("tenant_id", school.id)
              .ilike("activity_name", `%${item.activityName}%`);

            if (!error) {
              window.dispatchEvent(new Event("rkas_updated"));
              return replyText.slice(0, jsonStart) + `\n\n[Sistem AI]: Berhasil menghapus kegiatan "${item.activityName}" dari database cloud.`;
            }
          }
        }
      }
    } catch (e) {
      console.error("Gagal memproses aksi otomatis AI:", e);
    }
    
    return replyText;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          npsn: profile.npsn
        })
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        // Jalankan pemrosesan aksi otomatis
        const processedReply = await processAIAction(data.reply);
        setMessages((prev) => [...prev, { role: "assistant", content: processedReply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error || "Gagal mendapatkan respon AI."}` }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Koneksi ke asisten AI terputus. Periksa jaringan Anda." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[360px] h-[450px] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="h-14 bg-zinc-900 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" />
              <div>
                <div className="text-xs font-semibold">PLANARKA AI Assistant</div>
                <div className="text-[10px] text-zinc-400 font-medium">Bertenaga Groq GPT-OSS-120B</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-zinc-900 text-white font-medium"
                      : "bg-white text-zinc-800 border border-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-zinc-400 border border-zinc-200 rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sedang menganalisis RKAS...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-150 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: tambahkan kegiatan spidol 150rb"
              className="flex-1 h-9 rounded-xl border border-zinc-200 px-3 text-xs focus:outline-none focus:border-zinc-900 font-medium"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
        title="Buka AI Assistant"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  );
}
