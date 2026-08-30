import { QUESTIONS, SECCIONES, TOTAL_PREGUNTAS } from "./questions";
import { DIMENSIONES, DIMENSION_LABELS, TEMPERAMENTOS } from "./scoring";
import type { ResultadoEscala } from "./liderazgo/escalas";

const GROQ_MODEL = "openai/gpt-oss-120b";

export interface IAParsed {
  puntajes: Record<string, unknown>;
  deseabilidad_social_ia: unknown;
  analisis: unknown;
  resumen_ejecutivo?: unknown;
  miedos_nucleares?: unknown;
  patrones_repetitivos?: unknown;
  temperamento?: unknown;
  patrones_cognitivos_sensoriales?: unknown;
  hipotesis?: unknown;
}

const FUENTES_ESCALAS_LIDERAZGO = `- TIPI (Gosling, Rentfrow & Swann, 2003): perfil Big Five (1-7 por dimensión), sin punto de corte clínico.
- WLEIS (Wong & Law, 2002): inteligencia emocional en 4 subescalas (1-7), sin punto de corte clínico.
- BRS (Smith et al., 2008): resiliencia percibida — <3 baja, 3-4.3 normal, >4.3 alta.
- CBI subescala personal (Kristensen et al., 2005): ≥50/100 sugiere agotamiento personal elevado.
- MC-SDS-13 (Reynolds, 1982): deseabilidad social — ≥9/13 alta, 5-8 moderada, <5 baja.
Cita estas fuentes tal cual si es relevante; no inventes otros puntos de corte.`;

function construirBloqueRespuestas(respuestas: string[]): string {
  const bloques: string[] = [];
  let idx = 0;
  for (const seccion of SECCIONES) {
    bloques.push(`== Sección: ${seccion.titulo} ==`);
    for (const pregunta of seccion.preguntas) {
      bloques.push(`P${idx + 1}: ${pregunta}\nR${idx + 1}: ${respuestas[idx]}`);
      idx++;
    }
  }
  return bloques.join("\n\n");
}

function construirBloqueEscalasValidadas(escalas: ResultadoEscala[]): string {
  return escalas.map((e) => `- ${e.nombre}: ${e.puntaje}/${e.puntajeMaximo} (${e.nivel})`).join("\n");
}

export function construirPrompt(
  nombre: string,
  cargo: string,
  respuestas: string[],
  escalasValidadas: ResultadoEscala[] = []
): string {
  const bloqueRespuestas = construirBloqueRespuestas(respuestas);
  const listaDimensiones = DIMENSIONES.map((d) => `- ${d}: ${DIMENSION_LABELS[d]}`).join("\n");
  const bloqueEscalasValidadas = construirBloqueEscalasValidadas(escalasValidadas);

  return `Eres un psicólogo clínico y organizacional de altísima precisión analítica, contratado por Gaman Global Consultores para evaluar candidatos ejecutivos. Tu trabajo no es resumir lo que el candidato dijo: es descifrar lo que sus respuestas revelan que él mismo probablemente no percibe conscientemente. Es un informe interno para el equipo de selección; el candidato nunca lo verá.

Tono obligatorio: clínico, analítico, directo, basado en evidencia textual concreta. PROHIBIDO usar frases de marketing corporativo, elogios genéricos o "humo" (ej.: "gran potencial de liderazgo", "es un profesional excepcional", "team player nato"). Cada afirmación debe apoyarse en una observación concreta de lo que el candidato escribió, citando la pregunta (Pn) cuando corresponda.

No te quedes en lo literal. Interpreta la intención detrás de cada respuesta: qué evita decir, dónde se contradice entre distintas preguntas, qué está racionalizando o minimizando, y qué patrón emocional se repite aunque el candidato no lo nombre.

Puntos de referencia de los instrumentos de personalidad validados (para que tu análisis sea preciso, no solo descriptivo):
${FUENTES_ESCALAS_LIDERAZGO}

Candidato: ${nombre}
Cargo evaluado: ${cargo}

Puntajes de instrumentos de personalidad validados (ya calculados; cruza estos datos con las respuestas abiertas, especialmente si hay contradicción entre lo que el candidato relata y lo que estos instrumentos muestran):
${bloqueEscalasValidadas}

Respuestas del candidato (${TOTAL_PREGUNTAS} preguntas abiertas, organizadas por sección temática):

${bloqueRespuestas}

Tarea: devuelve EXCLUSIVAMENTE un JSON válido (sin markdown, sin texto fuera del JSON) con esta forma exacta:

{
  "puntajes": {
${DIMENSIONES.map((d) => `    "${d}": <entero 0-100>`).join(",\n")}
  },
  "deseabilidad_social_ia": <entero 0-100, tu propia estimación de cuánto el candidato podría estar respondiendo de forma idealizada en vez de describir su conducta real — cruza esto con el puntaje del MC-SDS-13>,
  "miedos_nucleares": [<2 a 5 strings breves, en español, con los miedos de fondo que emergen del conjunto de respuestas — no lo que el candidato dice temer literalmente en una sola respuesta, sino el patrón que se repite entre varias>],
  "patrones_repetitivos": "<1-2 párrafos describiendo bucles de pensamiento o conducta que se repiten a través de distintas respuestas: qué gatilla el patrón, cómo se manifiesta, y cómo se resuelve o no se resuelve>",
  "temperamento": {
    "dominante": "<una sola palabra, exactamente una de: ${TEMPERAMENTOS.join(", ")}>",
    "justificacion": "<1 párrafo explicando por qué, citando ejemplos concretos de las respuestas. Menciona también cómo se relaciona (o contradice) con el perfil TIPI ya calculado.>"
  },
  "patrones_cognitivos_sensoriales": "<1 párrafo puramente descriptivo sobre atención sostenida, sensibilidad a estímulos (ruido, caos, interrupciones) y necesidad de estructura vs. flexibilidad. ESTRICTAMENTE PROHIBIDO usar cualquier término diagnóstico, clínico o de discapacidad (ej: TDAH, autismo, espectro, neurodivergente, trastorno, condición). Describe únicamente el patrón observable, nunca una etiqueta ni una sugerencia de diagnóstico.>",
  "hipotesis": [
    {
      "hipotesis": "<una hipótesis de trabajo incisiva sobre un patrón/mecanismo psicológico relevante para el cargo, anclada a evidencia concreta (una respuesta específica Pn y/o un puntaje de instrumento validado). Nunca una etiqueta diagnóstica.>",
      "pregunta_entrevista": "<una pregunta concreta y específica que el entrevistador podría hacer para poner a prueba esa hipótesis puntual en la entrevista final>"
    }
    // 3 a 5 de estas, priorizando contradicciones entre lo que el candidato relata y lo que los instrumentos validados muestran
  ],
  "analisis": "<informe clínico de 7 a 10 párrafos en español, tono profesional y directo, sin bullets, que cubra: (1) qué revela el patrón general de respuestas sobre su funcionamiento psicológico real; (2) estabilidad emocional y autocontrol bajo presión con ejemplos concretos, cruzando con WLEIS y BRS; (3) relación con la autoridad y manejo de conflicto; (4) evidencia concreta de su aptitud para liderar equipos, citando específicamente las respuestas sobre delegación, conflicto con colaboradores, decisiones difíciles sobre personas y qué tipo de líder rechaza ser; (5) autocrítica, resiliencia y relación con el error; (6) riesgo de desgaste según el CBI y lo que el candidato relata sobre su energía; (7) coherencia o contradicción entre lo que dice ser, su perfil TIPI, y lo que sus propias respuestas evidencian.>",
  "resumen_ejecutivo": "<3 a 5 frases, escritas AL FINAL después de haber razonado todo lo anterior, que sinteticen para un reclutador con poco tiempo: el hallazgo psicológico más relevante, el temperamento y su implicancia práctica, la fortaleza y el riesgo más importantes, y una recomendación explícita (avanzar / avanzar con reserva y profundizar en entrevista / no avanzar) con el motivo central en una frase.>"
}

Dimensiones a puntuar (0 = señal muy débil o de riesgo, 100 = señal muy fuerte y favorable):
${listaDimensiones}

Reglas:
- "aptitud_liderazgo_equipos" debe basarse específicamente en las respuestas de la sección "Liderazgo de equipos" (delegación, conflicto con colaboradores, decisiones difíciles sobre personas, tipo de líder que rechaza ser), no en impresiones generales.
- Si una respuesta es evasiva, contradictoria o superficial, eso debe bajar el puntaje de la dimensión correspondiente y debe mencionarse explícitamente en el análisis.
- No inventes información que no esté en las respuestas.
- El JSON debe ser parseable directamente, sin comentarios ni texto adicional.`;
}

export async function llamarGroq(prompt: string, apiKey: string): Promise<IAParsed> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un psicólogo clínico y organizacional. Respondes EXCLUSIVAMENTE con un JSON válido, sin markdown ni texto adicional. Nunca emites diagnósticos clínicos ni etiquetas de discapacidad o neurodivergencia.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(55000),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Error al conectar con Groq.");
  }

  const texto = data?.choices?.[0]?.message?.content;
  if (!texto || typeof texto !== "string") {
    throw new Error("La inteligencia artificial no devolvió contenido de respuesta.");
  }

  let parsed: IAParsed;
  try {
    parsed = JSON.parse(texto);
  } catch {
    // Fallback por si el modelo envuelve el JSON en ```json ... ```
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("La IA devolvió un formato no interpretable.");
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || typeof parsed !== "object" || !parsed.analisis || !parsed.puntajes) {
    throw new Error("La respuesta de la IA no tiene la estructura esperada.");
  }

  return parsed;
}

// Algunos modelos (visto con Groq) devuelven "\n" literal dentro del JSON en
// vez de un salto de linea real; se normaliza para que se vea bien tanto en
// el correo como en el PDF.
export function normalizarTexto(texto: string): string {
  return texto.trim().replace(/\\n/g, "\n").replace(/\\t/g, " ");
}
