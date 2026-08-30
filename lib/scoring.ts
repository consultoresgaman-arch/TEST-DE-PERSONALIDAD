/**
 * BORRADOR de baremos / puntos de corte.
 *
 * Este modulo NO ha sido validado clinicamente. Es un punto de partida
 * defendible (basado en marcos estandar de assessment de liderazgo:
 * regulacion emocional, criterio decisional, adaptabilidad, autoconciencia)
 * para que un psicologo organizacional de Gaman Global lo revise, ajuste
 * los pesos/cortes con datos reales de la poblacion evaluada, y lo apruebe
 * antes de usarse como criterio de decision sobre candidatos reales.
 *
 * Todo lo que produce este modulo debe presentarse como apoyo al juicio
 * humano, nunca como veredicto automatico.
 */

export const DIMENSIONES = [
  "estabilidad_emocional",
  "autocontrol_impulsividad",
  "criterio_decisional",
  "adaptabilidad_cambio",
  "relacion_autoridad",
  "resiliencia_autocritica",
  "sostenibilidad_energetica",
  "autoconciencia",
  "aptitud_liderazgo_equipos",
] as const;

export type Dimension = (typeof DIMENSIONES)[number];

export type Puntajes = Record<Dimension, number>; // 0-100 cada una

export const DIMENSION_LABELS: Record<Dimension, string> = {
  estabilidad_emocional: "Estabilidad emocional bajo presión",
  autocontrol_impulsividad: "Autocontrol / regulación de impulsos",
  criterio_decisional: "Criterio decisional",
  adaptabilidad_cambio: "Adaptabilidad al cambio",
  relacion_autoridad: "Relación con la autoridad",
  resiliencia_autocritica: "Resiliencia y autocrítica ante el error",
  sostenibilidad_energetica: "Sostenibilidad de la energía (riesgo de desgaste)",
  autoconciencia: "Autoconciencia / insight",
  aptitud_liderazgo_equipos: "Aptitud demostrada para liderar equipos",
};

export function puntajesVacios(): Puntajes {
  return DIMENSIONES.reduce((acc, d) => {
    acc[d] = 0;
    return acc;
  }, {} as Puntajes);
}

export function clampScore(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function normalizarPuntajes(raw: Partial<Record<string, unknown>>): Puntajes {
  const out = puntajesVacios();
  for (const d of DIMENSIONES) {
    out[d] = clampScore(raw?.[d]);
  }
  return out;
}

// --- Clasificacion de nivel de liderazgo (BORRADOR) -----------------------

export type NivelLiderazgo =
  | "estrategico"
  | "operativo_con_potencial"
  | "operativo"
  | "no_concluyente";

export const NIVEL_LABELS: Record<NivelLiderazgo, string> = {
  estrategico: "Liderazgo estratégico",
  operativo_con_potencial: "Liderazgo operativo con potencial estratégico",
  operativo: "Liderazgo operativo",
  no_concluyente: "No concluyente (requiere validación adicional)",
};

const PESOS_INDICE_ESTRATEGICO: Partial<Record<Dimension, number>> = {
  aptitud_liderazgo_equipos: 0.35,
  criterio_decisional: 0.2,
  adaptabilidad_cambio: 0.15,
  autoconciencia: 0.15,
  resiliencia_autocritica: 0.15,
};

export function indiceLiderazgoEstrategico(p: Puntajes): number {
  let total = 0;
  let pesos = 0;
  for (const [dim, peso] of Object.entries(PESOS_INDICE_ESTRATEGICO)) {
    total += p[dim as Dimension] * (peso as number);
    pesos += peso as number;
  }
  return clampScore(total / pesos);
}

// Puntos de corte BORRADOR sobre el indice compuesto (0-100).
export function clasificarNivelLiderazgo(p: Puntajes): {
  nivel: NivelLiderazgo;
  indice: number;
} {
  const indice = indiceLiderazgoEstrategico(p);

  // Si la estabilidad emocional o el autocontrol estan criticamente bajos,
  // no es defendible clasificar el liderazgo sin marcarlo como no concluyente:
  // el patron de riesgo debe resolverse antes que la clasificacion de nivel.
  if (p.estabilidad_emocional < 25 || p.autocontrol_impulsividad < 25) {
    return { nivel: "no_concluyente", indice };
  }

  if (indice >= 75) return { nivel: "estrategico", indice };
  if (indice >= 55) return { nivel: "operativo_con_potencial", indice };
  if (indice >= 35) return { nivel: "operativo", indice };
  return { nivel: "no_concluyente", indice };
}

// --- Alertas de estabilidad emocional / riesgo (BORRADOR) -----------------

export interface Alerta {
  tipo: string;
  severidad: "media" | "alta";
  descripcion: string;
}

export function calcularAlertas(p: Puntajes): Alerta[] {
  const alertas: Alerta[] = [];

  if (p.estabilidad_emocional < 40) {
    alertas.push({
      tipo: "estabilidad_emocional",
      severidad: p.estabilidad_emocional < 25 ? "alta" : "media",
      descripcion:
        "Indicadores de baja estabilidad emocional bajo presión. Profundizar en entrevista clínica antes de asignar cargos de alta exigencia.",
    });
  }

  if (p.autocontrol_impulsividad < 35) {
    alertas.push({
      tipo: "impulsividad",
      severidad: p.autocontrol_impulsividad < 20 ? "alta" : "media",
      descripcion:
        "Posible dificultad para regular respuestas impulsivas ante frustración o cuestionamientos. Validar con referencias conductuales.",
    });
  }

  if (p.sostenibilidad_energetica < 35) {
    alertas.push({
      tipo: "riesgo_desgaste",
      severidad: p.sostenibilidad_energetica < 20 ? "alta" : "media",
      descripcion:
        "Señales compatibles con fatiga sostenida o riesgo de desgaste (burnout). Considerar seguimiento si el cargo implica alta carga sostenida.",
    });
  }

  if (p.autoconciencia < 30) {
    alertas.push({
      tipo: "baja_autoconciencia",
      severidad: "media",
      descripcion:
        "Bajo nivel de insight sobre el propio comportamiento en las respuestas. Puede dificultar la retroalimentación y el desarrollo dirigido.",
    });
  }

  if (p.aptitud_liderazgo_equipos < 35) {
    alertas.push({
      tipo: "baja_aptitud_liderazgo_equipos",
      severidad: p.aptitud_liderazgo_equipos < 20 ? "alta" : "media",
      descripcion:
        "Las respuestas sobre manejo de equipos muestran poca evidencia de habilidades de gestión de personas (delegación, conflicto, motivación). Evaluar si el cargo requiere liderar personas o es más adecuado un rol de contribución individual.",
    });
  }

  return alertas;
}

// --- Heuristica de deseabilidad social (texto libre) -----------------------
//
// Señal complementaria, NO diagnostica por si sola. Estima, a partir de
// patrones de lenguaje en el conjunto de respuestas, si el candidato podria
// estar respondiendo de forma idealizada ("lo que la empresa quiere oir")
// en vez de describir su conducta real. Se combina con la propia evaluacion
// de la IA sobre el mismo fenomeno (ver prompt en app/api/analyze).

const PALABRAS_POSITIVAS_GENERICAS = [
  "siempre logro", "nunca tengo problemas", "no tengo debilidades", "jamás me enojo",
  "controlo todo", "manejo perfectamente", "no me afecta en nada", "trabajo en equipo",
  "me encanta el desafío", "doy siempre lo mejor", "nunca fallo", "resiliente por naturaleza",
  "líder nato", "cero problemas", "todo bajo control",
];

const PALABRAS_AUTOCRITICA = [
  "error", "me equivoqué", "fallé", "falla", "miedo", "frustra", "frustración",
  "ira", "rabia", "cansad", "agotad", "duda", "inseguridad", "culpa", "ansiedad",
  "no supe", "me costó", "debilidad", "vulnerab",
];

export interface DeseabilidadSocialHeuristica {
  indice: number; // 0-100, mayor = mas señales de respuesta idealizada
  detalle: string[];
}

export function heuristicaDeseabilidadSocial(respuestas: string[]): DeseabilidadSocialHeuristica {
  const textoCompleto = respuestas.join(" \n ").toLowerCase();
  const detalle: string[] = [];

  const hitsPositivos = PALABRAS_POSITIVAS_GENERICAS.filter((f) => textoCompleto.includes(f)).length;
  const hitsAutocritica = PALABRAS_AUTOCRITICA.filter((f) => textoCompleto.includes(f)).length;

  const longitudes = respuestas.map((r) => (r || "").trim().length);
  const respuestasNoVacias = longitudes.filter((l) => l > 0);
  const promedioLongitud =
    respuestasNoVacias.reduce((a, b) => a + b, 0) / (respuestasNoVacias.length || 1);
  const uniformidadAlta =
    respuestasNoVacias.length > 5 &&
    respuestasNoVacias.every((l) => Math.abs(l - promedioLongitud) < promedioLongitud * 0.15);

  let indice = 0;

  if (hitsAutocritica === 0 && respuestasNoVacias.length > 10) {
    indice += 40;
    detalle.push("Ausencia total de auto-revelación negativa en todo el cuestionario.");
  } else if (hitsAutocritica <= 2) {
    indice += 20;
    detalle.push("Muy baja auto-revelación negativa respecto al volumen de respuestas.");
  }

  if (hitsPositivos >= 3) {
    indice += 25;
    detalle.push("Uso recurrente de frases de autopresentación idealizada ('siempre', 'nunca falla', etc.).");
  }

  if (uniformidadAlta) {
    indice += 15;
    detalle.push("Longitud de respuestas anormalmente uniforme, compatible con respuestas guionadas.");
  }

  return { indice: clampScore(indice), detalle };
}

// --- Campos cualitativos del analisis clinico profundo ---------------------
//
// No son puntajes 0-100: son observaciones narrativas que la IA extrae del
// conjunto de respuestas. "patronesCognitivosSensoriales" es deliberadamente
// descriptivo (atencion, estimulos, necesidad de estructura) y NUNCA debe
// convertirse en una etiqueta diagnostica (p. ej. "es/no es neurodivergente"):
// eso seria discriminacion por discapacidad bajo la Ley 20.422 y no tiene
// respaldo clinico valido viniendo de un LLM. Se usa solo como insumo
// cualitativo para el psicologo que revise el informe.

export const TEMPERAMENTOS = ["colerico", "sanguineo", "flematico", "melancolico"] as const;
export type Temperamento = (typeof TEMPERAMENTOS)[number];

export const TEMPERAMENTO_LABELS: Record<Temperamento, string> = {
  colerico: "Colérico",
  sanguineo: "Sanguíneo",
  flematico: "Flemático",
  melancolico: "Melancólico",
};

// El modelo de los 4 temperamentos (Galeno) es un marco narrativo/cualitativo
// clasico, util como apoyo conversacional, pero NO es un instrumento
// psicometrico validado como el PHQ-9, GAD-7, PCL-5, ASRS-v1.1 o AQ-10. No
// debe presentarse con el mismo peso probatorio que esos instrumentos.
export const TEMPERAMENTO_DISCLAIMER =
  "Marco narrativo/cualitativo clásico (los cuatro temperamentos), útil como apoyo conversacional. A diferencia de los instrumentos de tamizaje anteriores, NO es una escala psicométrica validada; no debe pesar como un hallazgo clínico equivalente.";

export interface AnalisisCualitativo {
  miedosNucleares: string[];
  patronesRepetitivos: string;
  temperamento: { dominante: Temperamento; justificacion: string };
  patronesCognitivosSensoriales: string;
}

// --- Compatibilidad con un perfil deseado (ficha de cargo) ------------------
//
// El evaluador define, desde /admin, un puntaje minimo aceptable por
// dimension (solo para las que le importan al cargo). La compatibilidad mide
// cuanto el candidato cumple o supera esos minimos; superar el minimo da
// credito completo (100%) para esa dimension, quedar por debajo da credito
// proporcional (no es un corte binario duro, para no saltar abruptamente
// entre 99% y 0% de cumplimiento por un punto de diferencia).

export interface PerfilDeseado {
  nombre: string;
  puntajesMinimos: Partial<Record<Dimension, number>>;
  temperamentoPreferido?: Temperamento | null;
}

export interface DetalleCompatibilidad {
  dimension: Dimension;
  minimo: number;
  obtenido: number;
  cumple: boolean;
}

export interface ResultadoCompatibilidad {
  porcentaje: number;
  detalle: DetalleCompatibilidad[];
  temperamentoPreferido: Temperamento | null;
  temperamentoCandidato: Temperamento | null;
  temperamentoCoincide: boolean | null;
}

export function calcularCompatibilidad(
  puntajes: Puntajes,
  perfil: PerfilDeseado,
  temperamentoCandidato?: Temperamento
): ResultadoCompatibilidad {
  const dims = Object.keys(perfil.puntajesMinimos) as Dimension[];

  const detalle: DetalleCompatibilidad[] = dims.map((d) => {
    const minimo = clampScore(perfil.puntajesMinimos[d]);
    const obtenido = puntajes[d];
    return { dimension: d, minimo, obtenido, cumple: obtenido >= minimo };
  });

  let porcentaje = 0;
  if (dims.length > 0) {
    const suma = detalle.reduce((acc, d) => {
      const credito = d.minimo <= 0 ? 100 : (d.obtenido / d.minimo) * 100;
      return acc + Math.min(100, Math.max(0, credito));
    }, 0);
    porcentaje = clampScore(suma / dims.length);
  }

  const temperamentoPreferido = perfil.temperamentoPreferido || null;
  const temperamentoCoincide =
    temperamentoPreferido && temperamentoCandidato ? temperamentoPreferido === temperamentoCandidato : null;

  return {
    porcentaje,
    detalle,
    temperamentoPreferido,
    temperamentoCandidato: temperamentoCandidato || null,
    temperamentoCoincide,
  };
}

export function normalizarCualitativo(raw: any): AnalisisCualitativo {
  const miedos = Array.isArray(raw?.miedos_nucleares)
    ? raw.miedos_nucleares.filter((m: unknown) => typeof m === "string" && m.trim()).slice(0, 6)
    : [];

  const dominanteRaw = typeof raw?.temperamento?.dominante === "string"
    ? raw.temperamento.dominante.toLowerCase().trim()
    : "";
  const dominante = (TEMPERAMENTOS as readonly string[]).includes(dominanteRaw)
    ? (dominanteRaw as Temperamento)
    : "sanguineo";

  return {
    miedosNucleares: miedos,
    patronesRepetitivos:
      typeof raw?.patrones_repetitivos === "string" ? raw.patrones_repetitivos.trim() : "",
    temperamento: {
      dominante,
      justificacion:
        typeof raw?.temperamento?.justificacion === "string" ? raw.temperamento.justificacion.trim() : "",
    },
    patronesCognitivosSensoriales:
      typeof raw?.patrones_cognitivos_sensoriales === "string"
        ? raw.patrones_cognitivos_sensoriales.trim()
        : "",
  };
}
