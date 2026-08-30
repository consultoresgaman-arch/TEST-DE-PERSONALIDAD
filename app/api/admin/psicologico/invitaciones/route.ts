import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("invitaciones_psicologicas")
      .select("id, token, motivo_consulta, usado, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      await logErrorSistema("api/admin/psicologico/invitaciones", `Error listando invitaciones: ${error.message}`);
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
    const motivoConsulta = typeof body?.motivo_consulta === "string" ? body.motivo_consulta.trim() : "";

    const token = crypto.randomBytes(12).toString("base64url");

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("invitaciones_psicologicas")
      .insert({ token, motivo_consulta: motivoConsulta || null })
      .select("id, token, motivo_consulta, usado, created_at")
      .single();

    if (error || !data) {
      await logErrorSistema("api/admin/psicologico/invitaciones", `Error creando invitación: ${error?.message}`);
      return NextResponse.json({ ok: false, error: "No se pudo crear la invitación." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, invitacion: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}
