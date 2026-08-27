"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { useSchool } from "@/lib/context/SchoolContext";

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

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set greeting awal berdasarkan role
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
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
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
      {/* Box Chat Dialog */}
      {isOpen && (
        <div className="mb-4 w-[360px] h-[450px] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="h-14 bg-zinc-900 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" />
              <div>
                <div className="text-xs font-semibold">PLANARKA AI Assistant</div>
                <div className="text-[10px] text-zinc-400 font-medium">Bertenaga Groq Llama 3</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Area Pesan Chat */}
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
                  <span>Sedang merumuskan jawaban...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Kirim */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-150 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda di sini..."
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

      {/* Tombol Bulat Melayang */}
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
