import { NextResponse } from "next/server";
import { QUESTIONS, TOTAL_PREGUNTAS } from "@/lib/questions";
import {
  normalizarPuntajes,
  clasificarNivelLiderazgo,
  calcularAlertas,
  heuristicaDeseabilidadSocial,
  normalizarCualitativo,
  calcularCompatibilidad,
  clampScore,
  type PerfilDeseado,
  type Temperamento,
} from "@/lib/scoring";
import { construirPrompt, llamarGroq, normalizarTexto } from "@/lib/groq";
import { generarReportePDF } from "@/lib/pdf";
import { enviarInformePorCorreo } from "@/lib/email";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";
import {
  TIPI,
  WLEIS,
  BRS,
  CBI,
  MCSDS,
  puntuarTIPI,
  puntuarWLEIS,
  puntuarBRS,
  puntuarCBI,
  puntuarMCSDS,
} from "@/lib/liderazgo/escalas";

export const maxDuration = 60;

interface SubmitBody {
  nombre?: unknown;
  correo?: unknown;
  cargo?: unknown;
  respuestas?: unknown;
  escalas?: unknown;
  consentimiento_datos?: unknown;
  token?: unknown;
}

function numeros(arr: unknown, esperado: number): number[] | null {
  if (!Array.isArray(arr) || arr.length !== esperado) return null;
  const nums = arr.map((v) => Number(v));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

function validarBody(body: SubmitBody) {
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const correo = typeof body.correo === "string" ? body.correo.trim().toLowerCase() : "";
  const cargo = typeof body.cargo === "string" ? body.cargo.trim() : "";
  const respuestas = Array.isArray(body.respuestas) ? body.respuestas : null;
  const consentimiento = body.consentimiento_datos === true;
  const token = typeof body.token === "string" && body.token.trim() ? body.token.trim() : null;

  if (!nombre) return { error: "Falta el nombre del candidato." };
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { error: "El correo no es válido." };
  if (!cargo) return { error: "Falta el cargo al que postula." };
  if (!respuestas || respuestas.length !== TOTAL_PREGUNTAS) {
    return { error: `Se esperaban ${TOTAL_PREGUNTAS} respuestas y se recibieron ${respuestas?.length ?? 0}.` };
  }
  const respuestasLimpias = respuestas.map((r: unknown) => (typeof r === "string" ? r.trim() : ""));
  const vacias = respuestasLimpias.filter((r) => r.length === 0).length;
  if (vacias > 0) {
    return { error: `Hay ${vacias} respuesta(s) vacía(s). Complete todas las preguntas antes de enviar.` };
  }
  if (!consentimiento) return { error: "Falta el consentimiento de tratamiento de datos." };

  const escalasBody = (body.escalas && typeof body.escalas === "object" ? body.escalas : {}) as Record<string, unknown>;
  const tipi = numeros(escalasBody.tipi, TIPI.items.length);
  const wleis = numeros(escalasBody.wleis, WLEIS.items.length);
  const brs = numeros(escalasBody.brs, BRS.items.length);
  const cbi = numeros(escalasBody.cbi, CBI.items.length);
  const mcsds = numeros(escalasBody.mcsds, MCSDS.items.length);

  if (!tipi || !wleis || !brs || !cbi || !mcsds) {
    return { error: "Faltan respuestas de alguno de los instrumentos de personalidad (TIPI, WLEIS, BRS, CBI, MC-SDS)." };
  }

  return {
    nombre,
    correo,
    cargo,
    respuestas: respuestasLimpias,
    consentimiento,
    token,
    escalasRespuestas: { tipi, wleis, brs, cbi, mcsds },
  };
}

export async function POST(req: Request) {
  let correoLog = "desconocido";
  try {
    let body: SubmitBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
    }

    const datos = validarBody(body);
    if ("error" in datos) {
      return NextResponse.json({ ok: false, error: datos.error }, { status: 400 });
    }
    const { nombre, correo, cargo, respuestas, consentimiento, token, escalasRespuestas } = datos;
    correoLog = correo;

    const supabase = getSupabaseAdmin();

    // Si el token corresponde a una invitacion generada desde /admin, trae el
    // perfil deseado ligado a ella (para calcular compatibilidad) y valida
    // que no se haya usado. Si el token no esta pre-registrado (links viejos
    // o manuales), se cae al chequeo por unicidad en "evaluaciones" de abajo.
    let invitacionId: string | null = null;
    let perfilId: string | null = null;

    if (token) {
      const { data: invitacion, error: errInvitacion } = await supabase
        .from("invitaciones")
        .select("id, usado, perfil_id")
        .eq("token", token)
        .maybeSingle();

      if (errInvitacion) {
        await logErrorSistema("api/submit", `Error verificando invitación: ${errInvitacion.message}`, { correo });
        return NextResponse.json({ ok: false, error: "No se pudo verificar el enlace. Intente nuevamente." }, { status: 500 });
      }

      if (invitacion) {
        if (invitacion.usado) {
          return NextResponse.json(
            { ok: false, error: "Este enlace ya ha sido utilizado anteriormente y no puede volver a responderse." },
            { status: 409 }
          );
        }
        invitacionId = invitacion.id;
        perfilId = invitacion.perfil_id;
      } else {
        const { data: existente, error: errBusqueda } = await supabase
          .from("evaluaciones")
          .select("id")
          .eq("token", token)
          .maybeSingle();

        if (errBusqueda) {
          await logErrorSistema("api/submit", `Error verificando token: ${errBusqueda.message}`, { correo });
          return NextResponse.json({ ok: false, error: "No se pudo verificar el enlace. Intente nuevamente." }, { status: 500 });
        }
        if (existente) {
          return NextResponse.json(
            { ok: false, error: "Este enlace ya ha sido utilizado anteriormente y no puede volver a responderse." },
            { status: 409 }
          );
        }
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      await logErrorSistema("api/submit", "GROQ_API_KEY no configurada", { nombre });
      return NextResponse.json({ ok: false, error: "Falta configurar la llave GROQ_API_KEY en el servidor." }, { status: 500 });
    }

    // --- Puntuar instrumentos de personalidad validados ---------------------
    const resultadoTIPI = puntuarTIPI(escalasRespuestas.tipi);
    const resultadoWLEIS = puntuarWLEIS(escalasRespuestas.wleis);
    const resultadoBRS = puntuarBRS(escalasRespuestas.brs);
    const resultadoCBI = puntuarCBI(escalasRespuestas.cbi);
    const resultadoMCSDS = puntuarMCSDS(escalasRespuestas.mcsds);
    const escalasValidadas = [resultadoTIPI, resultadoWLEIS, resultadoBRS, resultadoCBI, resultadoMCSDS];

    const prompt = construirPrompt(nombre, cargo, respuestas, escalasValidadas);

    let parsed;
    try {
      parsed = await llamarGroq(prompt, apiKey);
    } catch (iaError: any) {
      await logErrorSistema("api/submit", `Fallo llamada IA: ${iaError.message}`, { nombre, cargo });
      return NextResponse.json(
        { ok: false, error: "No se pudo generar el análisis en este momento. Intente nuevamente en unos minutos." },
        { status: 502 }
      );
    }

    const puntajes = normalizarPuntajes(parsed.puntajes);
    const { nivel, indice } = clasificarNivelLiderazgo(puntajes);
    const alertas = calcularAlertas(puntajes);
    const heuristica = heuristicaDeseabilidadSocial(respuestas);
    const desSocialIA = clampScore(parsed.deseabilidad_social_ia);
    const indiceDeseabilidadSocial = clampScore((desSocialIA + heuristica.indice) / 2);
    const cualitativo = normalizarCualitativo(parsed);

    const analisis = typeof parsed.analisis === "string" && parsed.analisis.trim()
      ? normalizarTexto(parsed.analisis)
      : "No fue posible generar el análisis narrativo. Los puntajes por dimensión igualmente quedaron calculados.";

    const resumenEjecutivo = typeof parsed.resumen_ejecutivo === "string" && parsed.resumen_ejecutivo.trim()
      ? normalizarTexto(parsed.resumen_ejecutivo)
      : "";

    const hipotesis = Array.isArray(parsed.hipotesis)
      ? parsed.hipotesis
          .filter((h: any) => h && typeof h.hipotesis === "string" && h.hipotesis.trim() && typeof h.pregunta_entrevista === "string")
          .map((h: any) => ({ hipotesis: h.hipotesis.trim(), pregunta_entrevista: h.pregunta_entrevista.trim() }))
          .slice(0, 6)
      : [];

    // Si la invitacion traia un perfil deseado ligado, calcula compatibilidad.
    let compatibilidad: ReturnType<typeof calcularCompatibilidad> | null = null;
    if (perfilId) {
      const { data: perfilRow, error: errPerfil } = await supabase
        .from("perfiles_deseados")
        .select("nombre, puntajes_minimos, temperamento_preferido")
        .eq("id", perfilId)
        .maybeSingle();

      if (errPerfil) {
        await logErrorSistema("api/submit", `Error obteniendo perfil deseado: ${errPerfil.message}`, { correo, perfilId });
      } else if (perfilRow) {
        const perfil: PerfilDeseado = {
          nombre: perfilRow.nombre,
          puntajesMinimos: perfilRow.puntajes_minimos || {},
          temperamentoPreferido: (perfilRow.temperamento_preferido as Temperamento) || null,
        };
        compatibilidad = calcularCompatibilidad(puntajes, perfil, cualitativo.temperamento.dominante);
      }
    }

    // Persistencia en Supabase (candidato + evaluacion).
    const { data: candidato, error: errCandidato } = await supabase
      .from("candidatos")
      .upsert({ nombre, correo }, { onConflict: "correo" })
      .select("id")
      .single();

    if (errCandidato || !candidato) {
      await logErrorSistema("api/submit", `Error creando/actualizando candidato: ${errCandidato?.message}`, { correo });
      return NextResponse.json({ ok: false, error: "No se pudo registrar al candidato. Intente nuevamente." }, { status: 500 });
    }

    const respuestasEstructuradas = respuestas.map((respuesta, i) => ({
      pregunta: QUESTIONS[i],
      respuesta,
    }));

    const { error: errEvaluacion } = await supabase.from("evaluaciones").insert({
      candidato_id: candidato.id,
      cargo_postulado: cargo,
      token,
      motor_ia: "groq",
      perfil_id: perfilId,
      respuestas: respuestasEstructuradas,
      puntajes,
      nivel_liderazgo: nivel,
      alertas,
      indice_deseabilidad_social: indiceDeseabilidadSocial,
      analisis_ia: analisis,
      resumen_ejecutivo: resumenEjecutivo,
      analisis_cualitativo: cualitativo,
      escalas_validadas: escalasValidadas,
      hipotesis,
      compatibilidad_pct: compatibilidad?.porcentaje ?? null,
      compatibilidad_detalle: compatibilidad?.detalle ?? null,
      consentimiento_datos: consentimiento,
      consentimiento_fecha: new Date().toISOString(),
    });

    if (errEvaluacion) {
      if (errEvaluacion.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "Este enlace ya ha sido utilizado anteriormente y no puede volver a responderse." },
          { status: 409 }
        );
      }
      await logErrorSistema("api/submit", `Error guardando evaluación: ${errEvaluacion.message}`, { correo });
      return NextResponse.json({ ok: false, error: "No se pudo guardar la evaluación. Intente nuevamente." }, { status: 500 });
    }

    if (invitacionId) {
      const { error: errMarcarUsado } = await supabase
        .from("invitaciones")
        .update({ usado: true })
        .eq("id", invitacionId);
      if (errMarcarUsado) {
        await logErrorSistema("api/submit", `No se pudo marcar la invitación como usada: ${errMarcarUsado.message}`, { correo });
      }
    }

    // Generacion de PDF + envio por correo. El candidato NUNCA ve este contenido.
    try {
      const pdfBuffer = await generarReportePDF({
        nombre,
        correo,
        cargo,
        fecha: new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" }),
        puntajes,
        nivel,
        indice,
        alertas,
        indiceDeseabilidadSocial,
        analisisIA: analisis,
        resumenEjecutivo,
        cualitativo,
        compatibilidad,
        escalasValidadas,
        hipotesis,
      });

      await enviarInformePorCorreo({
        nombre,
        correo,
        cargo,
        puntajes,
        nivel,
        indice,
        alertas,
        indiceDeseabilidadSocial,
        analisisIA: analisis,
        resumenEjecutivo,
        cualitativo,
        compatibilidad,
        escalasValidadas,
        hipotesis,
        pdfBuffer,
      });
    } catch (envioError: any) {
      // La evaluacion ya quedo guardada en Supabase; el envio de correo es
      // best-effort pero se loguea para que el equipo revise manualmente.
      await logErrorSistema("api/submit", `Fallo generacion/envio de informe: ${envioError.message}`, { correo });
    }

    return NextResponse.json({
      ok: true,
      message: "Evaluación registrada correctamente.",
    });
  } catch (error: any) {
    await logErrorSistema("api/submit", `Error inesperado: ${error?.message}`, { correo: correoLog });
    return NextResponse.json(
      { ok: false, error: "Ocurrió un error inesperado al procesar la evaluación. El equipo técnico fue notificado." },
      { status: 500 }
    );
  }
}
