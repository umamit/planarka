import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    let supabaseQuery = supabase
      .from("rkas_account_codes")
      .select("account_code, account_name, default_snp_code, is_honor_non_asn, is_maintenance_sarpras, is_book_procurement")
      .order("account_code", { ascending: true })
      .limit(10);

    if (query) {
      // Cari berdasarkan kode rekening atau nama kegiatan belanja
      supabaseQuery = supabaseQuery.or(
        `account_code.ilike.%${query}%,account_name.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
