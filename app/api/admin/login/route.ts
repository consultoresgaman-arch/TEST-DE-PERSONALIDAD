import { NextResponse } from "next/server";
import { validarPassword, crearTokenSesion, SESSION_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD no configurada en el servidor." }, { status: 500 });
    }

    if (!password || !validarPassword(password)) {
      return NextResponse.json({ ok: false, error: "Contraseña incorrecta." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, await crearTokenSesion(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error inesperado al iniciar sesión." }, { status: 500 });
  }
}
