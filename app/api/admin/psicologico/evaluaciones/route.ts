import { NextResponse } from "next/server";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";

// Este panel debe reflejar siempre el estado actual de la base de datos
// (en particular las alertas de riesgo): nunca debe quedar cacheado como
// contenido estatico generado en build time.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("evaluaciones_psicologicas")
      .select("id, motivo_consulta, riesgo_detectado, riesgo_detalle, created_at, pacientes(nombre, correo)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      await logErrorSistema("api/admin/psicologico/evaluaciones", `Error listando evaluaciones: ${error.message}`);
      return NextResponse.json({ ok: false, error: "No se pudieron cargar las evaluaciones." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, evaluaciones: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}
