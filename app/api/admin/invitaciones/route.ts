import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("invitaciones")
      .select("id, token, cargo, usado, created_at, perfiles_deseados(nombre)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      await logErrorSistema("api/admin/invitaciones", `Error listando invitaciones: ${error.message}`);
      return NextResponse.json({ ok: false, error: "No se pudieron cargar las invitaciones." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, invitaciones: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const perfilId = typeof body?.perfil_id === "string" && body.perfil_id.trim() ? body.perfil_id.trim() : null;
    const cargo = typeof body?.cargo === "string" ? body.cargo.trim() : "";

    const token = crypto.randomBytes(12).toString("base64url");

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("invitaciones")
      .insert({ token, perfil_id: perfilId, cargo: cargo || null })
      .select("id, token, cargo, usado, created_at")
      .single();

    if (error || !data) {
      await logErrorSistema("api/admin/invitaciones", `Error creando invitación: ${error?.message}`, { perfilId });
      return NextResponse.json({ ok: false, error: "No se pudo crear la invitación." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, invitacion: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}
