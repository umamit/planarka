import { NextRequest, NextResponse } from "next/server";
import { verifyLicenseKey } from "@/lib/calculations/license-engine";

export async function POST(request: NextRequest) {
  try {
    const { npsn, licenseKey } = await request.json();

    if (!npsn || !licenseKey) {
      return NextResponse.json({ error: "NPSN dan Kunci Lisensi wajib diisi." }, { status: 400 });
    }

    const isValid = await verifyLicenseKey(npsn.trim(), licenseKey.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: "Kunci lisensi tidak valid untuk NPSN ini. Hubungi IBRA Digital Engineering." },
        { status: 401 }
      );
    }

    const sessionPayload = btoa(
      JSON.stringify({ npsn, issuedAt: Date.now() })
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set("planarka_session", sessionPayload, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
