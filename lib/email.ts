import {
  DIMENSIONES,
  DIMENSION_LABELS,
  NIVEL_LABELS,
  TEMPERAMENTO_LABELS,
  type Puntajes,
  type Alerta,
  type NivelLiderazgo,
  type AnalisisCualitativo,
  type ResultadoCompatibilidad,
} from "./scoring";

export interface InformeEmailData {
  nombre: string;
  correo: string;
  cargo: string;
  puntajes: Puntajes;
  nivel: NivelLiderazgo;
  indice: number;
  alertas: Alerta[];
  indiceDeseabilidadSocial: number;
  analisisIA: string;
  resumenEjecutivo: string;
  cualitativo: AnalisisCualitativo;
  compatibilidad?: ResultadoCompatibilidad | null;
  pdfBuffer: Buffer;
}

function construirCuerpoTexto(data: InformeEmailData): string {
  const lineas: string[] = [];

  lineas.push(`Nuevo informe de evaluación — ${data.nombre} (${data.cargo})`);
  lineas.push(`Correo del candidato: ${data.correo}`);
  lineas.push("");
  lineas.push(`Nivel de liderazgo: ${NIVEL_LABELS[data.nivel]} (índice ${data.indice}/100)`);
  lineas.push("");

  if (data.resumenEjecutivo) {
    lineas.push("=== RESUMEN EJECUTIVO ===");
    lineas.push(data.resumenEjecutivo);
    lineas.push("");
  }

  if (data.compatibilidad) {
    lineas.push(`Compatibilidad con el perfil buscado: ${data.compatibilidad.porcentaje}%`);
    for (const d of data.compatibilidad.detalle) {
      lineas.push(`  - ${DIMENSION_LABELS[d.dimension]}: ${d.obtenido} (mínimo ${d.minimo}) ${d.cumple ? "✓" : "✗"}`);
    }
    if (data.compatibilidad.temperamentoCoincide !== null) {
      lineas.push(
        `  - Temperamento: ${data.compatibilidad.temperamentoCoincide ? "coincide" : "no coincide"} con el preferido para el cargo`
      );
    }
    lineas.push("");
  }

  lineas.push("Puntajes por dimensión:");
  for (const d of DIMENSIONES) {
    lineas.push(`  - ${DIMENSION_LABELS[d]}: ${data.puntajes[d]}`);
  }
  lineas.push("");

  if (data.alertas.length > 0) {
    lineas.push("Alertas:");
    for (const a of data.alertas) {
      lineas.push(`  - [${a.severidad.toUpperCase()}] ${a.descripcion}`);
    }
    lineas.push("");
  }

  lineas.push(`Índice de deseabilidad social: ${data.indiceDeseabilidadSocial}/100`);
  lineas.push("");
  lineas.push(`Temperamento dominante: ${TEMPERAMENTO_LABELS[data.cualitativo.temperamento.dominante]}`);
  lineas.push(data.cualitativo.temperamento.justificacion);
  lineas.push("");

  if (data.cualitativo.miedosNucleares.length > 0) {
    lineas.push("Miedos nucleares:");
    for (const m of data.cualitativo.miedosNucleares) lineas.push(`  - ${m}`);
    lineas.push("");
  }

  lineas.push("Patrones repetitivos / bucles:");
  lineas.push(data.cualitativo.patronesRepetitivos);
  lineas.push("");

  lineas.push("Observaciones cognitivas y sensoriales (descriptivo, no diagnóstico):");
  lineas.push(data.cualitativo.patronesCognitivosSensoriales);
  lineas.push("");

  lineas.push("--- Análisis clínico completo ---");
  lineas.push(data.analisisIA);
  lineas.push("");
  lineas.push("El informe en PDF va adjunto a este correo.");

  return lineas.join("\n");
}

export async function enviarInformePorCorreo(data: InformeEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.EMAIL_DESTINO;

  if (!apiKey || !destino) {
    throw new Error("Falta configurar RESEND_API_KEY o EMAIL_DESTINO en el servidor.");
  }

  const nombreArchivo = `informe-${data.nombre.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}.pdf`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Gaman Global <onboarding@resend.dev>",
      to: destino,
      subject: `Informe de evaluación: ${data.nombre} (${data.cargo})`,
      text: construirCuerpoTexto(data),
      attachments: [
        {
          filename: nombreArchivo,
          content: data.pdfBuffer.toString("base64"),
        },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.message || `Error al enviar el correo (HTTP ${response.status}).`);
  }
}
