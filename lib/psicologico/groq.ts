import { SECCIONES_CLINICAS, TOTAL_PREGUNTAS_CLINICAS } from "./preguntas";
import { TEMPERAMENTOS } from "../scoring";
import type { ResultadoEscala } from "./escalas";

const GROQ_MODEL = "openai/gpt-oss-120b";

export interface IAParsedClinico {
  resumen_clinico: unknown;
  miedos_nucleares?: unknown;
  patrones_repetitivos?: unknown;
  temperamento?: unknown;
  observaciones_somaticas?: unknown;
  factores_protectores?: unknown;
  puntos_atencion_clinica?: unknown;
  hipotesis_clinicas?: unknown;
}

const FUENTES_ESCALAS = `- PHQ-9 (Kroenke, Spitzer & Williams, 2001): 0-4 mínimo, 5-9 leve, 10-14 moderado, 15-19 moderadamente severo, 20-27 severo.
- GAD-7 (Spitzer, Kroenke, Williams & Löwe, 2006): 0-4 mínimo, 5-9 leve, 10-14 moderado, 15-21 severo.
- PCL-5 (Weathers et al., 2013; National Center for PTSD): punto de corte de tamizaje habitual ≥31-33/80.
- ASRS-v1.1 Parte A (Kessler et al.; OMS): tamizaje positivo si 4 o más de los 6 ítems superan su umbral específico (ítems 1-3 desde "a veces", ítems 4-6 desde "a menudo").
- AQ-10 (Allison, Auyeung & Baron-Cohen, 2012; adoptado por NICE): punto de corte de derivación ≥6/10.
- AUDIT-C (Bush et al., 1998; OMS): sugiere consumo de riesgo con puntaje ≥3 en mujeres o ≥4 en hombres (sobre 12).
- MDQ (Hirschfeld et al., 2000): tamizaje positivo si ≥7 de 13 síntomas + co-ocurrencia + problema moderado/serio.
- SCOFF (Morgan, Reid & Lacey, 1999): tamizaje positivo con 2 o más respuestas afirmativas de 5.
- C-SSRS Screener (Posner et al., 2011; Columbia Protocol): cuantifica severidad de ideación (1-5) y presencia/recencia de conducta suicida. Nivel 3+ o cualquier conducta = riesgo activo.
- ISI (Bastien, Vallières & Morin, 2001): 0-7 sin insomnio, 8-14 subclínico, 15-21 moderado, 22-28 severo.
- PHQ-15 (Kroenke, Spitzer & Williams, 2002): 0-4 mínimo, 5-9 leve, 10-14 moderado, 15-30 severo.
- TIPI (Gosling, Rentfrow & Swann, 2003): 5 dimensiones Big Five (1-7 cada una), sin punto de corte clínico — es un perfil dimensional de personalidad, no un tamizaje de riesgo.
- ACE (Felitti et al., 1998; CDC-Kaiser): puntaje ≥4 de 10 asociado a mayor riesgo de salud física y mental en la adultez.
Cita estas fuentes tal cual si es relevante; no inventes otros puntos de corte ni otras referencias.`;

function construirBloqueRespuestas(respuestas: string[]): string {
  const bloques: string[] = [];
  let idx = 0;
  for (const seccion of SECCIONES_CLINICAS) {
    bloques.push(`== Sección: ${seccion.titulo} ==`);
    for (const pregunta of seccion.preguntas) {
      bloques.push(`P${idx + 1}: ${pregunta}\nR${idx + 1}: ${respuestas[idx]}`);
      idx++;
    }
  }
  return bloques.join("\n\n");
}

function construirBloqueEscalas(escalas: ResultadoEscala[]): string {
  return escalas
    .map((e) => `- ${e.nombre}: ${e.puntaje}/${e.puntajeMaximo} (${e.nivel})`)
    .join("\n");
}

export function construirPromptClinico(
  nombre: string,
  motivoConsulta: string,
  respuestas: string[],
  escalas: ResultadoEscala[],
  eventoIndicePCL5?: string
): string {
  const bloqueRespuestas = construirBloqueRespuestas(respuestas);
  const bloqueEscalas = construirBloqueEscalas(escalas);
  const lineaEvento = eventoIndicePCL5?.trim()
    ? `\nEvento de referencia que el paciente identificó para el PCL-5 (LEC-5): "${eventoIndicePCL5.trim()}"\n`
    : "";

  return `Eres un asistente clínico de altísimo rigor psicométrico que apoya a un psicólogo/a con licencia vigente a organizar la información de intake de un paciente. NO eres quien diagnostica: el profesional tratante es el único responsable de cualquier diagnóstico. Tu función es sintetizar con precisión, desglosar por ítem (no solo el puntaje global), cruzar los instrumentos validados con las respuestas abiertas, y generar hipótesis clínicas de trabajo incisivas — no un resumen genérico ni "humo" terapéutico.

REGLA ABSOLUTA E INQUEBRANTABLE: tienes PROHIBIDO usar cualquier término diagnóstico formal o nombre de trastorno, incluso dentro de una hipótesis (ejemplos de lo que NUNCA debes escribir: "depresión mayor", "trastorno de ansiedad", "TEPT", "TDAH", "trastorno bipolar", "trastorno de personalidad", "autismo", "neurodivergente", o cualquier código o nombre CIE-11/DSM-5). Una hipótesis clínica se expresa como patrón, mecanismo o dinámica psicológica ("posible evitación experiencial ante la activación fisiológica descrita en P12"), nunca como una etiqueta de trastorno. El profesional decide el diagnóstico; tú nunca lo nombras.

Puntos de corte oficiales de cada instrumento (para que tu análisis sea preciso, no solo descriptivo):
${FUENTES_ESCALAS}

Paciente: ${nombre}
Motivo de consulta: ${motivoConsulta}
${lineaEvento}
Puntajes de instrumentos de tamizaje validados (ya calculados; interprétalos según los puntos de corte de arriba, pero SIN convertirlos en una etiqueta diagnóstica):
${bloqueEscalas}

Respuestas del paciente al intake (${TOTAL_PREGUNTAS_CLINICAS} preguntas abiertas, organizadas por sección):

${bloqueRespuestas}

Tarea: devuelve EXCLUSIVAMENTE un JSON válido (sin markdown, sin texto fuera del JSON) con esta forma exacta:

{
  "miedos_nucleares": [<2 a 5 strings breves, en español, con los miedos de fondo que emergen del relato del paciente>],
  "patrones_repetitivos": "<1-2 párrafos describiendo bucles de pensamiento o conducta que el paciente describe o que se infieren del patrón de respuestas: qué los gatilla, cómo se manifiestan, cómo el paciente intenta o no resolverlos>",
  "temperamento": {
    "dominante": "<una sola palabra, exactamente una de: ${TEMPERAMENTOS.join(", ")}>",
    "justificacion": "<1 párrafo explicando por qué, citando ejemplos concretos de las respuestas. Recuerda: esto es un marco narrativo de apoyo, NO un hallazgo psicométrico equivalente a las escalas validadas — no lo presentes con el mismo peso.>"
  },
  "observaciones_somaticas": "<1 párrafo describiendo lo que el paciente reporta sobre manifestaciones corporales del malestar emocional (tensión, sueño, apetito, etc.), de forma descriptiva>",
  "factores_protectores": [<2 a 4 strings breves con los recursos, vínculos o razones que el paciente menciona como sostén, tomados de la sección "Factores protectores">],
  "puntos_atencion_clinica": [<2 a 5 strings breves señalando temas generales que el profesional debería explorar en profundidad en sesión, incluyendo antecedentes familiares o contexto psicosocial si son relevantes>],
  "hipotesis_clinicas": [
    {
      "hipotesis": "<una hipótesis de trabajo incisiva, en términos de patrón/mecanismo psicológico, citando el ítem o puntaje concreto que la sustenta (ej. 'el PHQ-9 marca anhedonia (ítem 1) y baja energía (ítem 4) por sobre el resto, mientras que en P8 el paciente minimiza estos mismos síntomas como simple cansancio — posible mecanismo de minimización o baja conciencia de la propia sintomatología'). NUNCA un nombre de trastorno.>",
      "pregunta_sesion": "<una pregunta concreta y específica que el profesional podría hacer en sesión para poner a prueba esa hipótesis puntual>"
    }
    // 3 a 5 de estas, cada una anclada a evidencia concreta (ítem de escala + respuesta abierta), priorizando contradicciones entre lo que el paciente relata y lo que las escalas muestran
  ],
  "resumen_clinico": "<informe de intake de 9 a 13 párrafos en español, tono profesional y clínico, sin bullets, que organice: (1) motivo de consulta y contexto actual; (2) historia de vida relevante que el paciente reporta, integrando el puntaje ACE si es ≥1; (3) estado emocional y patrones anímicos, cruzando explícitamente con los puntajes de PHQ-9/GAD-7 y sus puntos de corte; (4) severidad del riesgo segun C-SSRS si hay ideación (nivel alcanzado, no solo presencia/ausencia); (5) miedos, frustraciones y patrones de rumiación; (6) sueño (ISI) y manifestaciones corporales (PHQ-15), y su relación con PCL-5/ASRS si aplica; (7) contexto psicosocial, antecedentes familiares relevantes y resultados de AUDIT-C/MDQ/SCOFF si hay señales positivas; (8) personalidad: integra el perfil TIPI (dato validado) junto con el temperamento narrativo, dejando explícito cuál es cuál; estilo relacional/límites; (9) factores protectores identificados; (10) contradicciones o tensiones internas entre el relato del paciente y los puntajes obtenidos — incluyendo patrones que el paciente no verbaliza directamente pero que se infieren de forma consistente entre varias respuestas (siempre citando la evidencia textual concreta que sustenta la inferencia, nunca como una afirmación sin respaldo). Cita ejemplos concretos de las respuestas (Pn) cuando sea relevante. NO uses ningún término diagnóstico formal.>"
}

Reglas:
- No inventes información que no esté en las respuestas del paciente ni en los puntajes entregados.
- Cada hipótesis clínica debe anclarse a evidencia puntual (un ítem de escala o una respuesta concreta), no a una impresión general.
- El JSON debe ser parseable directamente, sin comentarios ni texto adicional.
- Recuerda: cero términos diagnósticos formales, en ningún campo, ni siquiera dentro de una hipótesis.`;
}

export async function llamarGroqClinico(prompt: string, apiKey: string): Promise<IAParsedClinico> {
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
            "Eres un asistente clínico de organización de intake. Respondes EXCLUSIVAMENTE con un JSON válido. Tienes prohibido usar términos diagnósticos formales o nombres de trastornos: el diagnóstico es responsabilidad exclusiva del profesional tratante.",
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

  let parsed: IAParsedClinico;
  try {
    parsed = JSON.parse(texto);
  } catch {
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("La IA devolvió un formato no interpretable.");
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || typeof parsed !== "object" || !parsed.resumen_clinico) {
    throw new Error("La respuesta de la IA no tiene la estructura esperada.");
  }

  return parsed;
}

export function normalizarTextoClinico(texto: string): string {
  return texto.trim().replace(/\\n/g, "\n").replace(/\\t/g, " ");
}
