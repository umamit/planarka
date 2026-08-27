import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { messages, npsn } = await request.json();
    const groqApiKey = process.env.GROQ_API_KEY || "";

    if (!groqApiKey) {
      return NextResponse.json({ error: "API Key Groq belum dikonfigurasi di server." }, { status: 500 });
    }

    const activeNpsn = npsn ? npsn.trim() : "00000000";
    const isSuperadmin = activeNpsn === "00000000";

    let systemPrompt = "";

    if (isSuperadmin) {
      const { count: schCount } = await supabase.from("tenants_schools").select("id", { count: "exact", head: true });
      const { count: rkCount } = await supabase.from("rkas_budget_items").select("id", { count: "exact", head: true });

      systemPrompt = `Anda adalah AI Business Analyst untuk aplikasi PLANARKA dikembangkan oleh IBRA Digital Engineering.
Peran Anda adalah membantu Superadmin dalam menganalisis data lisensi sekolah klien dan performa bisnis.
Data database Supabase saat ini:
- Jumlah sekolah terdaftar: ${schCount ? schCount - 1 : 0} sekolah (tidak termasuk akun superadmin).
- Jumlah rencana kegiatan anggaran (RKAS) tersimpan di cloud: ${rkCount || 0} item kegiatan.

Jawablah dengan gaya profesional, padat, berfokus pada data, tanpa basa-basi retoris, dan tanpa menggunakan emoji Unicode.`;
    } else {
      // 1. Tarik profil dan data anggaran real-time sekolah ini dari Supabase
      const { data: school } = await supabase.from("tenants_schools").select("*").eq("npsn", activeNpsn).single();
      const schoolId = school ? school.id : null;
      
      let schoolName = "Sekolah Klien";
      let totalPagu = 0;
      let rkasSummary = "Belum ada item anggaran terdaftar.";
      
      if (school) {
        schoolName = school.school_name;
        
        // Tarik data pagu
        const { data: alloc } = await supabase
          .from("bos_allocations")
          .select("bos_regular_total, bos_performance_total, silpa_previous_year")
          .eq("tenant_id", schoolId)
          .eq("fiscal_year", 2026)
          .single();
          
        if (alloc) {
          totalPagu = Number(alloc.bos_regular_total) + Number(alloc.bos_performance_total) + Number(alloc.silpa_previous_year);
        }

        // Tarik daftar anggaran RKAS saat ini
        const { data: rkasItems } = await supabase
          .from("rkas_budget_items")
          .select("snp_code, activity_name, initial_budget, shifted_amount, final_budget")
          .eq("tenant_id", schoolId)
          .eq("fiscal_year", 2026);

        if (rkasItems && rkasItems.length > 0) {
          rkasSummary = rkasItems.map(
            (it, idx) => `${idx + 1}. [${it.snp_code}] ${it.activity_name}: Awal=${it.initial_budget}, Pergeseran=${it.shifted_amount}, Akhir=${it.final_budget}`
          ).join("\n");
        }
      }

      systemPrompt = `Anda adalah AI BOS & RKAS Consultant & Data-Input Assistant untuk PLANARKA.
Anda mendampingi:
- Nama Sekolah: ${schoolName}
- NPSN: ${activeNpsn}
- Total Pagu BOS Tersedia: Rp${totalPagu.toLocaleString("id-ID")}
- Daftar RKAS Saat Ini:
${rkasSummary}

Tugas Anda:
1. Menjawab pertanyaan bendahara seputar aturan Permendikbudristek No. 63/2023 (Batas honor guru Non-ASN maks 50%, batas sarpras maks 20%, kas tunai brankas maks Rp10 juta, penalti keterlambatan PMK 2%, 3%, 4%).
2. Membantu PENGINPUTAN data anggaran baru secara otomatis jika pengguna memerintahkannya (misal: "tolong tambahkan kegiatan beli buku 10juta").
3. Membantu PENGHAPUSAN data anggaran jika diperintahkan (misal: "hapus kegiatan spidol").

ATURAN STRUKTUR OUTPUT (FUNCTION CALLING):
Jika pengguna meminta menambahkan atau menghapus item anggaran, Anda WAJIB menyertakan blok JSON berikut di akhir respon Anda:
A. Untuk Tambah Anggaran:
{
  "action": "ADD_BUDGET_ITEM",
  "data": {
    "snpCode": "SNP-1 s/d SNP-8 sesuai kategori kegiatan",
    "accountCode": "kode akun rekening perkiraan",
    "activityName": "uraian nama kegiatan",
    "initialBudget": nilai_angka_tanpa_rp
  }
}
B. Untuk Hapus Anggaran:
{
  "action": "DELETE_BUDGET_ITEM",
  "data": {
    "activityName": "uraian kegiatan yang ingin dihapus"
  }
}

Format jawaban Anda harus bersih dari emoji Unicode, ringkas, dan fokus pada data.`;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10),
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      return NextResponse.json({ error: errData.error?.message || "Gagal menghubungi Groq AI." }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak dapat merespons saat ini.";

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("Error API Chat:", e);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
