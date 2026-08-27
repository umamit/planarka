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

    // 1. Siapkan instruksi sistem (system prompt) berdasarkan peran
    let systemPrompt = "";

    if (isSuperadmin) {
      // Dapatkan data statistik database real-time untuk Superadmin
      const { count: schCount } = await supabase.from("tenants_schools").select("id", { count: "exact", head: true });
      const { count: rkCount } = await supabase.from("rkas_budget_items").select("id", { count: "exact", head: true });

      systemPrompt = `Anda adalah AI Business Analyst untuk aplikasi PLANARKA dikembangkan oleh IBRA Digital Engineering.
Peran Anda adalah membantu Superadmin dalam menganalisis data lisensi sekolah klien dan performa bisnis.
Data database Supabase saat ini:
- Jumlah sekolah terdaftar: ${schCount ? schCount - 1 : 0} sekolah (tidak termasuk akun superadmin).
- Jumlah rencana kegiatan anggaran (RKAS) tersimpan di cloud: ${rkCount || 0} item kegiatan.

Jawablah dengan gaya profesional, padat, berfokus pada data, tanpa basa-basi retoris, dan tanpa menggunakan emoji Unicode.`;
    } else {
      // Tarik profil sekolah klien
      const { data: school } = await supabase.from("tenants_schools").select("*").eq("npsn", activeNpsn).single();
      const schoolName = school ? school.school_name : "Sekolah Klien";
      const district = school ? school.district_name : "Dinas Pendidikan";
      const province = school ? school.province_name : "Maluku Utara";

      systemPrompt = `Anda adalah AI BOS & RKAS Consultant untuk aplikasi PLANARKA.
Tugas Anda adalah mendampingi bendahara dan kepala sekolah dari:
- Nama Sekolah: ${schoolName}
- NPSN: ${activeNpsn}
- Wilayah: ${district}, Provinsi ${province}

Panduan Regulasi (Permendikbudristek No. 63/2023 & PMK Kemenkeu):
1. Penggunaan honor guru Non-ASN dilarang melebihi 50% dari total pagu BOS reguler.
2. Pemeliharaan sarana prasarana sekolah dibatasi maksimal 20% dan dilarang untuk rehabilitasi gedung berat (hanya boleh perawatan ringan seperti cat/atap bocor ringan).
3. Belanja buku teks utama Kurikulum Merdeka HET adalah prioritas utama (fleksibel riil bebas plafon).
4. Brankas tunai sekolah dilarang menyimpan uang tunai lebih dari Rp10.000.000 untuk menghindari temuan pemeriksaan kas opname fisik BPK.
5. PMK No. 204/PMK.07/2022 mengatur sanksi keterlambatan pelaporan BOSP: telat salur Tahap 1 (>31 Juli) kena sanksi potong penyaluran Tahap 2 sebesar 2% (Agustus), 3% (September), atau 4% (Oktober).

Berikan saran pembelanjaan RKAS yang taktis, logis, patuh regulasi, tanpa basa-basi retoris, dan tanpa menggunakan emoji Unicode.`;
    }

    // 2. Panggil API Groq secara langsung menggunakan native fetch
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "groq/compound-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Batasi riwayat obrolan hingga 10 pesan terakhir
        ],
        temperature: 0.3,
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
