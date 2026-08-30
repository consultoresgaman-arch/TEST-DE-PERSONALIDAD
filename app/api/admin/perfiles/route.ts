import { NextResponse } from "next/server";
import { DIMENSIONES, TEMPERAMENTOS, clampScore } from "@/lib/scoring";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("perfiles_deseados")
      .select("id, nombre, cargo, puntajes_minimos, temperamento_preferido, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      await logErrorSistema("api/admin/perfiles", `Error listando perfiles: ${error.message}`);
      return NextResponse.json({ ok: false, error: "No se pudieron cargar los perfiles." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, perfiles: data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
    const cargo = typeof body?.cargo === "string" ? body.cargo.trim() : "";
    const temperamentoPreferido =
      typeof body?.temperamento_preferido === "string" && body.temperamento_preferido.trim()
        ? body.temperamento_preferido.trim()
        : null;

    if (!nombre) {
      return NextResponse.json({ ok: false, error: "Falta el nombre del perfil." }, { status: 400 });
    }
    if (temperamentoPreferido && !(TEMPERAMENTOS as readonly string[]).includes(temperamentoPreferido)) {
      return NextResponse.json({ ok: false, error: "Temperamento preferido inválido." }, { status: 400 });
    }

    const puntajesMinimosRaw = body?.puntajes_minimos && typeof body.puntajes_minimos === "object" ? body.puntajes_minimos : {};
    const puntajesMinimos: Record<string, number> = {};
    for (const d of DIMENSIONES) {
      const valor = puntajesMinimosRaw[d];
      if (valor === undefined || valor === null || valor === "") continue;
      puntajesMinimos[d] = clampScore(Number(valor));
    }

    if (Object.keys(puntajesMinimos).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Define al menos un puntaje mínimo para alguna dimensión." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("perfiles_deseados")
      .insert({
        nombre,
        cargo: cargo || null,
        puntajes_minimos: puntajesMinimos,
        temperamento_preferido: temperamentoPreferido,
      })
      .select("id, nombre, cargo, puntajes_minimos, temperamento_preferido, created_at")
      .single();

    if (error || !data) {
      await logErrorSistema("api/admin/perfiles", `Error creando perfil: ${error?.message}`, { nombre });
      return NextResponse.json({ ok: false, error: "No se pudo crear el perfil." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, perfil: data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: "Error inesperado." }, { status: 500 });
  }
}
