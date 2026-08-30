import { createClient, SupabaseClient } from "@supabase/supabase-js";

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Cliente con permisos minimos (rol anon). Solo puede INSERT segun las
 * politicas RLS de supabase/schema.sql. Es el que deben usar las rutas que
 * reciben datos directamente del formulario publico.
 */
export function getSupabaseAnon(): SupabaseClient {
  if (anonClient) return anonClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Falta configurar SUPABASE_URL / SUPABASE_ANON_KEY.");
  }
  anonClient = createClient(url, key, { auth: { persistSession: false } });
  return anonClient;
}

/**
 * Cliente con service_role (bypassea RLS). Uso EXCLUSIVO en el servidor,
 * nunca debe llegar al navegador. Se usa para leer una evaluacion puntual
 * al generar el PDF. Si no esta configurada la key, se hace fallback al
 * cliente anon (que no podra leer, solo insertar).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return getSupabaseAnon();
  }
  adminClient = createClient(url, key, { auth: { persistSession: false } });
  return adminClient;
}

export async function logErrorSistema(origen: string, mensaje: string, detalle?: unknown) {
  // Siempre a consola primero: supabase-js no lanza en errores de RLS/insert,
  // devuelve { error } en la respuesta, asi que no podemos depender del catch.
  console.error(`[errores_sistema] ${origen}: ${mensaje}`, detalle ?? "");
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("errores_sistema").insert({
      origen,
      mensaje,
      detalle: detalle ? JSON.parse(JSON.stringify(detalle)) : null,
    });
    if (error) {
      console.error(`[errores_sistema] no se pudo insertar el log en Supabase: ${error.message}`);
    }
  } catch (e: any) {
    console.error(`[errores_sistema] excepcion al loguear: ${e?.message}`);
  }
}
