import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const LOGIN_PATH = "/auth/login";
const SESSION_COOKIE = "planarka_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Arahkan beranda "/" langsung ke "/dashboard"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Lindungi rute /dashboard/*
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE);

  // Jika sesi tidak valid, alihkan ke login
  if (!session || !session.value) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sesi valid, buat respon dan suntikkan header anti-cache
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
