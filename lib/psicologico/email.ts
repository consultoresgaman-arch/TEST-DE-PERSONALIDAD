import { TEMPERAMENTO_LABELS, TEMPERAMENTO_DISCLAIMER, type Temperamento } from "../scoring";
import type { ResultadoEscala } from "./escalas";

function getDestino(): { apiKey: string; destino: string } {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.EMAIL_DESTINO_PSICOLOGICO || process.env.EMAIL_DESTINO;
  if (!apiKey || !destino) {
    throw new Error("Falta configurar RESEND_API_KEY o EMAIL_DESTINO_PSICOLOGICO/EMAIL_DESTINO en el servidor.");
  }
  return { apiKey, destino };
}

/**
 * Alerta de riesgo: se envia ANTES del informe completo (que puede tardar
 * por la llamada a IA + PDF), para que el profesional se entere lo antes
 * posible si el paciente marco ideacion de muerte/autolesion. No depende de
 * Groq ni del PDF: solo texto plano, envio rapido.
 */
export async function enviarAlertaCrisis(params: {
  nombre: string;
  correo: string;
  motivoConsulta: string;
  riesgoDetalle: string[];
  severidadCSSRS?: string;
}): Promise<void> {
  const { apiKey, destino } = getDestino();

  const texto = [
    `ALERTA DE RIESGO — ${params.nombre}`,
    "",
    `El paciente marcó presencia de ideación de muerte/autolesión en el ítem 9 del PHQ-9` +
      (params.riesgoDetalle.length > 0
        ? ` y se detectaron expresiones de riesgo en su relato: ${params.riesgoDetalle.join(", ")}.`
        : "."),
    "",
    ...(params.severidadCSSRS ? [`Severidad C-SSRS: ${params.severidadCSSRS}`, ""] : []),
    `Correo del paciente: ${params.correo}`,
    `Motivo de consulta: ${params.motivoConsulta}`,
    "",
    "Requiere evaluación de riesgo suicida inmediata. El informe completo de intake llega en un correo separado en los próximos minutos.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Gaman Global <onboarding@resend.dev>",
      to: destino,
      subject: `🚨 ALERTA DE RIESGO — ${params.nombre}`,
      text: texto,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.message || `Error al enviar la alerta de riesgo (HTTP ${response.status}).`);
  }
}

export interface InformeClinicoEmailData {
  nombre: string;
  correo: string;
  motivoConsulta: string;
  escalas: ResultadoEscala[];
  riesgoDetectado: boolean;
  riesgoDetalle: string[];
  miedosNucleares: string[];
  patronesRepetitivos: string;
  temperamento: { dominante: Temperamento; justificacion: string };
  observacionesSomaticas: string;
  factoresProtectores: string[];
  eventoIndicePCL5?: string;
  puntosAtencionClinica: string[];
  hipotesisClinicas: { hipotesis: string; pregunta_sesion: string }[];
  resumenClinico: string;
  pdfBuffer: Buffer;
}

function construirCuerpoTexto(data: InformeClinicoEmailData): string {
  const lineas: string[] = [];

  lineas.push(`Informe de intake clínico — ${data.nombre}`);
  lineas.push(`Correo del paciente: ${data.correo}`);
  lineas.push(`Motivo de consulta: ${data.motivoConsulta}`);
  lineas.push("");

  if (data.riesgoDetectado) {
    lineas.push("⚠ Este paciente tiene una alerta de riesgo activa (ver correo de alerta separado).");
    lineas.push("");
  }

  if (data.eventoIndicePCL5) {
    lineas.push(`Evento de referencia identificado para PCL-5 (LEC-5): ${data.eventoIndicePCL5}`);
    lineas.push("");
  }

  lineas.push("Instrumentos de tamizaje validados:");
  for (const e of data.escalas) {
    lineas.push(`  - ${e.nombre}: ${e.puntaje}/${e.puntajeMaximo} (${e.nivel})`);
  }
  lineas.push("");

  lineas.push(`Temperamento dominante: ${TEMPERAMENTO_LABELS[data.temperamento.dominante]}`);
  lineas.push(data.temperamento.justificacion);
  lineas.push(`(${TEMPERAMENTO_DISCLAIMER})`);
  lineas.push("");

  if (data.factoresProtectores.length > 0) {
    lineas.push("Factores protectores:");
    for (const f of data.factoresProtectores) lineas.push(`  - ${f}`);
    lineas.push("");
  }

  if (data.miedosNucleares.length > 0) {
    lineas.push("Miedos nucleares:");
    for (const m of data.miedosNucleares) lineas.push(`  - ${m}`);
    lineas.push("");
  }

  lineas.push("Patrones repetitivos / bucles:");
  lineas.push(data.patronesRepetitivos);
  lineas.push("");

  lineas.push("Observaciones somáticas:");
  lineas.push(data.observacionesSomaticas);
  lineas.push("");

  if (data.puntosAtencionClinica.length > 0) {
    lineas.push("Puntos de atención sugeridos:");
    for (const p of data.puntosAtencionClinica) lineas.push(`  - ${p}`);
    lineas.push("");
  }

  if (data.hipotesisClinicas.length > 0) {
    lineas.push("Hipótesis clínicas de trabajo (no diagnósticas):");
    for (const h of data.hipotesisClinicas) {
      lineas.push(`  - ${h.hipotesis}`);
      lineas.push(`    Para contrastar en sesión: ${h.pregunta_sesion}`);
    }
    lineas.push("");
  }

  lineas.push("--- Resumen de intake completo ---");
  lineas.push(data.resumenClinico);
  lineas.push("");
  lineas.push("El informe en PDF va adjunto a este correo. Este documento NO es un diagnóstico.");

  return lineas.join("\n");
}

export async function enviarInformeClinicoPorCorreo(data: InformeClinicoEmailData): Promise<void> {
  const { apiKey, destino } = getDestino();

  const nombreArchivo = `intake-${data.nombre.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}.pdf`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Gaman Global <onboarding@resend.dev>",
      to: destino,
      subject: `${data.riesgoDetectado ? "⚠ " : ""}Informe de intake clínico: ${data.nombre}`,
      text: construirCuerpoTexto(data),
      attachments: [{ filename: nombreArchivo, content: data.pdfBuffer.toString("base64") }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.message || `Error al enviar el correo (HTTP ${response.status}).`);
  }
}
