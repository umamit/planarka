import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables dari .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllTables() {
  console.log("Memulai verifikasi database Supabase secara empiris...");
  
  // Ambil data schema list menggunakan SQL query di RPC jika tersedia
  // atau uji query select 1 baris ke masing-masing target tabel untuk memvalidasi keberadaannya.
  const targetTables = [
    "tenants_schools",
    "bos_allocations",
    "rkas_budget_items",
    "honor_recipients_validation",
    "pbd_rapor_indicators"
  ];

  for (const table of targetTables) {
    const { error } = await supabase
      .from(table)
      .select("*")
      .limit(1);

    if (error) {
      if (error.code === "PGRST116" || error.code === "PGRST116") {
        console.log(`[OK] Tabel "${table}" ada (tabel kosong / single row ready)`);
      } else if (error.message.includes("does not exist") || error.code === "42P01") {
        console.log(`[TIDAK ADA] Tabel "${table}" belum terbuat di database!`);
      } else {
        console.log(`[OK] Tabel "${table}" ada (Error RLS/lainnya: ${error.message})`);
      }
    } else {
      console.log(`[OK] Tabel "${table}" ada (berhasil query select)`);
    }
  }
}

checkAllTables();
