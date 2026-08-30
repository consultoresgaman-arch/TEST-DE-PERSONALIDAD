import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validarTokenSesion, SESSION_COOKIE_NAME } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const esLogin = pathname === "/admin/login" || pathname === "/api/admin/login";
  const esRutaAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!esRutaAdmin || esLogin) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (await validarTokenSesion(cookie)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
