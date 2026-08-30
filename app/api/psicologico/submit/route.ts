import { NextResponse } from "next/server";
import { PREGUNTAS_CLINICAS, TOTAL_PREGUNTAS_CLINICAS } from "@/lib/psicologico/preguntas";
import {
  PHQ9,
  GAD7,
  PCL5,
  ASRS,
  AQ10,
  LEC5,
  AUDITC,
  MDQ,
  SCOFF,
  CSSRS,
  ISI,
  PHQ15,
  TIPI,
  ACE,
  puntuarPHQ9,
  puntuarGAD7,
  puntuarPCL5,
  puntuarASRS,
  puntuarAQ10,
  puntuarAUDITC,
  puntuarMDQ,
  puntuarSCOFF,
  puntuarCSSRS,
  puntuarISI,
  puntuarPHQ15,
  puntuarTIPI,
  puntuarACE,
  detectarRiesgoEnTexto,
} from "@/lib/psicologico/escalas";
import { construirPromptClinico, llamarGroqClinico, normalizarTextoClinico } from "@/lib/psicologico/groq";
import { generarReporteClinicoPDF } from "@/lib/psicologico/pdf";
import { enviarAlertaCrisis, enviarInformeClinicoPorCorreo } from "@/lib/psicologico/email";
import { normalizarCualitativo } from "@/lib/scoring";
import { getSupabaseAdmin, logErrorSistema } from "@/lib/supabase";

export const maxDuration = 60;

interface SubmitBody {
  nombre?: unknown;
  correo?: unknown;
  motivoConsulta?: unknown;
  respuestas?: unknown;
  escalas?: unknown;
  eventoIndice?: unknown;
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
  const motivoConsulta = typeof body.motivoConsulta === "string" ? body.motivoConsulta.trim() : "";
  const respuestas = Array.isArray(body.respuestas) ? body.respuestas : null;
  const consentimiento = body.consentimiento_datos === true;
  const token = typeof body.token === "string" && body.token.trim() ? body.token.trim() : null;

  if (!nombre) return { error: "Falta el nombre del paciente." };
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { error: "El correo no es válido." };
  if (!respuestas || respuestas.length !== TOTAL_PREGUNTAS_CLINICAS) {
    return { error: `Se esperaban ${TOTAL_PREGUNTAS_CLINICAS} respuestas y se recibieron ${respuestas?.length ?? 0}.` };
  }
  const respuestasLimpias = respuestas.map((r: unknown) => (typeof r === "string" ? r.trim() : ""));
  const vacias = respuestasLimpias.filter((r) => r.length === 0).length;
  if (vacias > 0) {
    return { error: `Hay ${vacias} respuesta(s) vacía(s). Complete todas las preguntas antes de enviar.` };
  }
  if (!consentimiento) return { error: "Falta el consentimiento informado del paciente." };

  const eventoIndice = typeof body.eventoIndice === "string" ? body.eventoIndice.trim() : "";

  const escalasBody = (body.escalas && typeof body.escalas === "object" ? body.escalas : {}) as Record<string, unknown>;
  const lec5 = numeros(escalasBody.lec5, LEC5.items.length);
  const phq9 = numeros(escalasBody.phq9, PHQ9.items.length);
  const gad7 = numeros(escalasBody.gad7, GAD7.items.length);
  const pcl5 = numeros(escalasBody.pcl5, PCL5.items.length);
  const asrs = numeros(escalasBody.asrs, ASRS.items.length);
  const aq10 = numeros(escalasBody.aq10, AQ10.items.length);
  const auditc = numeros(escalasBody.auditc, AUDITC.items.length);
  const mdq = numeros(escalasBody.mdq, MDQ.items.length);
  const scoff = numeros(escalasBody.scoff, SCOFF.items.length);
  const cssrs = numeros(escalasBody.cssrs, CSSRS.items.length);
  const isi = numeros(escalasBody.isi, ISI.items.length);
  const phq15 = numeros(escalasBody.phq15, PHQ15.items.length);
  const tipi = numeros(escalasBody.tipi, TIPI.items.length);
  const ace = numeros(escalasBody.ace, ACE.items.length);

  if (!lec5 || !phq9 || !gad7 || !pcl5 || !asrs || !aq10 || !auditc || !mdq || !scoff || !cssrs || !isi || !phq15 || !tipi || !ace) {
    return { error: "Faltan respuestas de alguno de los instrumentos de tamizaje." };
  }

  return {
    nombre,
    correo,
    motivoConsulta,
    respuestas: respuestasLimpias,
    consentimiento,
    token,
    eventoIndice,
    escalasRespuestas: { lec5, phq9, gad7, pcl5, asrs, aq10, auditc, mdq, scoff, cssrs, isi, phq15, tipi, ace },
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
    const { nombre, correo, motivoConsulta, respuestas, consentimiento, token, eventoIndice, escalasRespuestas } = datos;
    correoLog = correo;

    const supabase = getSupabaseAdmin();

    let invitacionId: string | null = null;
    if (token) {
      const { data: invitacion, error: errInvitacion } = await supabase
        .from("invitaciones_psicologicas")
        .select("id, usado")
        .eq("token", token)
        .maybeSingle();

      if (errInvitacion) {
        await logErrorSistema("api/psicologico/submit", `Error verificando invitación: ${errInvitacion.message}`, { correo });
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
      }
    }

    // --- Puntuar instrumentos validados ------------------------------------
    // LEC-5 no produce puntaje clinico: solo ayudo a identificar el evento
    // de referencia (eventoIndice), ya resuelto en el frontend.
    const resultadoPHQ9 = puntuarPHQ9(escalasRespuestas.phq9);
    const resultadoGAD7 = puntuarGAD7(escalasRespuestas.gad7);
    const resultadoPCL5 = puntuarPCL5(escalasRespuestas.pcl5);
    const resultadoASRS = puntuarASRS(escalasRespuestas.asrs);
    const resultadoAQ10 = puntuarAQ10(escalasRespuestas.aq10);
    const resultadoAUDITC = puntuarAUDITC(escalasRespuestas.auditc);
    const resultadoMDQ = puntuarMDQ(escalasRespuestas.mdq);
    const resultadoSCOFF = puntuarSCOFF(escalasRespuestas.scoff);
    const resultadoCSSRS = puntuarCSSRS(escalasRespuestas.cssrs);
    const resultadoISI = puntuarISI(escalasRespuestas.isi);
    const resultadoPHQ15 = puntuarPHQ15(escalasRespuestas.phq15);
    const resultadoTIPI = puntuarTIPI(escalasRespuestas.tipi);
    const resultadoACE = puntuarACE(escalasRespuestas.ace);
    const escalas = [
      resultadoPHQ9, resultadoCSSRS, resultadoGAD7, resultadoPCL5, resultadoASRS, resultadoAQ10,
      resultadoAUDITC, resultadoMDQ, resultadoSCOFF, resultadoISI, resultadoPHQ15, resultadoTIPI, resultadoACE,
    ];

    const riesgoTexto = detectarRiesgoEnTexto(respuestas);
    const riesgoDetectado = resultadoPHQ9.riesgoItem9 || resultadoCSSRS.riesgoActivo || riesgoTexto.length > 0;

    // Alerta de riesgo: se envia primero y de forma independiente del resto
    // del pipeline (no depende de Groq ni del PDF), para que llegue lo antes
    // posible si hay riesgo. Incluye la severidad del C-SSRS para que la
    // alerta sea accionable de inmediato, no solo "hay riesgo".
    if (riesgoDetectado) {
      try {
        await enviarAlertaCrisis({
          nombre,
          correo,
          motivoConsulta,
          riesgoDetalle: riesgoTexto,
          severidadCSSRS: resultadoCSSRS.nivel,
        });
      } catch (alertaError: any) {
        await logErrorSistema("api/psicologico/submit", `Fallo enviando alerta de riesgo: ${alertaError.message}`, { correo });
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      await logErrorSistema("api/psicologico/submit", "GROQ_API_KEY no configurada", { nombre });
      return NextResponse.json({ ok: false, error: "Falta configurar la llave GROQ_API_KEY en el servidor." }, { status: 500 });
    }

    const prompt = construirPromptClinico(nombre, motivoConsulta, respuestas, escalas, eventoIndice);

    let parsed;
    try {
      parsed = await llamarGroqClinico(prompt, apiKey);
    } catch (iaError: any) {
      await logErrorSistema("api/psicologico/submit", `Fallo llamada IA: ${iaError.message}`, { nombre });
      return NextResponse.json(
        { ok: false, error: "No se pudo generar el resumen en este momento. Intente nuevamente en unos minutos." },
        { status: 502 }
      );
    }

    const cualitativo = normalizarCualitativo({
      miedos_nucleares: parsed.miedos_nucleares,
      patrones_repetitivos: parsed.patrones_repetitivos,
      temperamento: parsed.temperamento,
      patrones_cognitivos_sensoriales: parsed.observaciones_somaticas,
    });

    const resumenClinico = typeof parsed.resumen_clinico === "string" && parsed.resumen_clinico.trim()
      ? normalizarTextoClinico(parsed.resumen_clinico)
      : "No fue posible generar el resumen narrativo. Los puntajes de los instrumentos igualmente quedaron calculados.";

    const factoresProtectores = Array.isArray(parsed.factores_protectores)
      ? parsed.factores_protectores.filter((p: unknown) => typeof p === "string" && p.trim()).slice(0, 6)
      : [];

    const puntosAtencionClinica = Array.isArray(parsed.puntos_atencion_clinica)
      ? parsed.puntos_atencion_clinica.filter((p: unknown) => typeof p === "string" && p.trim()).slice(0, 6)
      : [];

    const hipotesisClinicas = Array.isArray(parsed.hipotesis_clinicas)
      ? parsed.hipotesis_clinicas
          .filter(
            (h: any) => h && typeof h.hipotesis === "string" && h.hipotesis.trim() && typeof h.pregunta_sesion === "string"
          )
          .map((h: any) => ({ hipotesis: h.hipotesis.trim(), pregunta_sesion: h.pregunta_sesion.trim() }))
          .slice(0, 6)
      : [];

    // --- Persistencia -------------------------------------------------------
    const { data: paciente, error: errPaciente } = await supabase
      .from("pacientes")
      .upsert({ nombre, correo }, { onConflict: "correo" })
      .select("id")
      .single();

    if (errPaciente || !paciente) {
      await logErrorSistema("api/psicologico/submit", `Error creando/actualizando paciente: ${errPaciente?.message}`, { correo });
      return NextResponse.json({ ok: false, error: "No se pudo registrar al paciente. Intente nuevamente." }, { status: 500 });
    }

    const respuestasEstructuradas = respuestas.map((respuesta, i) => ({
      pregunta: PREGUNTAS_CLINICAS[i],
      respuesta,
    }));

    const { error: errEvaluacion } = await supabase.from("evaluaciones_psicologicas").insert({
      paciente_id: paciente.id,
      token,
      motor_ia: "groq",
      motivo_consulta: motivoConsulta,
      respuestas: respuestasEstructuradas,
      evento_indice_pcl5: eventoIndice || null,
      escalas,
      riesgo_detectado: riesgoDetectado,
      riesgo_detalle: riesgoTexto,
      resumen_clinico: resumenClinico,
      miedos_nucleares: cualitativo.miedosNucleares,
      patrones_repetitivos: cualitativo.patronesRepetitivos,
      temperamento: cualitativo.temperamento,
      observaciones_somaticas: cualitativo.patronesCognitivosSensoriales,
      factores_protectores: factoresProtectores,
      puntos_atencion_clinica: puntosAtencionClinica,
      hipotesis_clinicas: hipotesisClinicas,
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
      await logErrorSistema("api/psicologico/submit", `Error guardando evaluación: ${errEvaluacion.message}`, { correo });
      return NextResponse.json({ ok: false, error: "No se pudo guardar la evaluación. Intente nuevamente." }, { status: 500 });
    }

    if (invitacionId) {
      const { error: errUsado } = await supabase
        .from("invitaciones_psicologicas")
        .update({ usado: true })
        .eq("id", invitacionId);
      if (errUsado) {
        await logErrorSistema("api/psicologico/submit", `No se pudo marcar la invitación como usada: ${errUsado.message}`, { correo });
      }
    }

    // --- PDF + correo (best-effort) -----------------------------------------
    try {
      const pdfBuffer = await generarReporteClinicoPDF({
        nombre,
        correo,
        motivoConsulta,
        fecha: new Date().toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" }),
        escalas,
        riesgoDetectado,
        riesgoDetalle: riesgoTexto,
        miedosNucleares: cualitativo.miedosNucleares,
        patronesRepetitivos: cualitativo.patronesRepetitivos,
        temperamento: cualitativo.temperamento,
        observacionesSomaticas: cualitativo.patronesCognitivosSensoriales,
        factoresProtectores,
        eventoIndicePCL5: eventoIndice,
        puntosAtencionClinica,
        hipotesisClinicas,
        resumenClinico,
      });

      await enviarInformeClinicoPorCorreo({
        nombre,
        correo,
        motivoConsulta,
        escalas,
        riesgoDetectado,
        riesgoDetalle: riesgoTexto,
        miedosNucleares: cualitativo.miedosNucleares,
        patronesRepetitivos: cualitativo.patronesRepetitivos,
        temperamento: cualitativo.temperamento,
        observacionesSomaticas: cualitativo.patronesCognitivosSensoriales,
        factoresProtectores,
        eventoIndicePCL5: eventoIndice,
        puntosAtencionClinica,
        hipotesisClinicas,
        resumenClinico,
        pdfBuffer,
      });
    } catch (envioError: any) {
      await logErrorSistema("api/psicologico/submit", `Fallo generación/envío de informe: ${envioError.message}`, { correo });
    }

    return NextResponse.json({ ok: true, message: "Intake registrado correctamente." });
  } catch (error: any) {
    await logErrorSistema("api/psicologico/submit", `Error inesperado: ${error?.message}`, { correo: correoLog });
    return NextResponse.json(
      { ok: false, error: "Ocurrió un error inesperado al procesar el intake. El equipo técnico fue notificado." },
      { status: 500 }
    );
  }
}
