/**
 * Instrumentos de personalidad/tamizaje VALIDADOS para el Test de Liderazgo.
 * TIPI se reutiliza tal cual del modulo clinico (mismo instrumento, sin
 * duplicar codigo); los otros 3 son nuevos aqui.
 *
 * Fuentes:
 * - TIPI: Gosling, Rentfrow & Swann (2003). Dominio publico.
 * - WLEIS: Wong & Law (2002). Uso academico/clinico habitual con atribucion.
 * - BRS (Brief Resilience Scale): Smith et al. (2008). Uso habitual con
 *   atribucion.
 * - CBI (Copenhagen Burnout Inventory, subescala personal): Kristensen et
 *   al. (2005). Dominio publico (a diferencia del Maslach, que es
 *   comercial).
 * - MC-SDS-13 (Marlowe-Crowne Social Desirability Scale, forma corta):
 *   Reynolds (1982), adaptacion de Crowne & Marlowe (1960). Reemplaza a la
 *   heuristica de palabras clave por un instrumento real; la redaccion aqui
 *   es una reconstruccion de buena fe, se recomienda cotejarla contra la
 *   fuente original antes de un uso de alto riesgo.
 */

import {
  type Opcion,
  type Escala,
  type ResultadoEscala,
  opcionesDeItem,
  TIPI,
  puntuarTIPI,
  puntuarTIPIDetalle,
  type PuntajeTIPI,
} from "../psicologico/escalas";

export { TIPI, puntuarTIPI, puntuarTIPIDetalle, opcionesDeItem };
export type { Opcion, Escala, ResultadoEscala, PuntajeTIPI };

const OPCIONES_ACUERDO_1_7: Opcion[] = [
  { valor: 1, etiqueta: "Totalmente en desacuerdo" },
  { valor: 2, etiqueta: "Moderadamente en desacuerdo" },
  { valor: 3, etiqueta: "Un poco en desacuerdo" },
  { valor: 4, etiqueta: "Ni de acuerdo ni en desacuerdo" },
  { valor: 5, etiqueta: "Un poco de acuerdo" },
  { valor: 6, etiqueta: "Moderadamente de acuerdo" },
  { valor: 7, etiqueta: "Totalmente de acuerdo" },
];

const OPCIONES_ACUERDO_1_5: Opcion[] = [
  { valor: 1, etiqueta: "Totalmente en desacuerdo" },
  { valor: 2, etiqueta: "En desacuerdo" },
  { valor: 3, etiqueta: "Neutral" },
  { valor: 4, etiqueta: "De acuerdo" },
  { valor: 5, etiqueta: "Totalmente de acuerdo" },
];

const OPCIONES_FRECUENCIA_CBI: Opcion[] = [
  { valor: 0, etiqueta: "Nunca o casi nunca" },
  { valor: 25, etiqueta: "Rara vez" },
  { valor: 50, etiqueta: "A veces" },
  { valor: 75, etiqueta: "A menudo" },
  { valor: 100, etiqueta: "Siempre" },
];

const OPCIONES_VERDADERO_FALSO: Opcion[] = [
  { valor: 1, etiqueta: "Verdadero" },
  { valor: 0, etiqueta: "Falso" },
];

// --- WLEIS (inteligencia emocional) -------------------------------------

export const WLEIS: Escala = {
  id: "wleis",
  nombre: "WLEIS (inteligencia emocional)",
  instrucciones: "Indique cuánto está de acuerdo con cada afirmación sobre usted mismo/a.",
  tipoOpciones: "acuerdo",
  opcionesPorItem: Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, OPCIONES_ACUERDO_1_7])),
  items: [
    "Casi siempre sé por qué tengo ciertos sentimientos",
    "Tengo una buena comprensión de mis propias emociones",
    "Realmente entiendo lo que siento",
    "Siempre sé si estoy feliz o no",
    "Siempre sé las emociones de las personas cercanas a partir de su comportamiento",
    "Soy un buen observador de las emociones de los demás",
    "Soy sensible a los sentimientos y emociones de los demás",
    "Tengo una buena comprensión de las emociones de las personas que me rodean",
    "Siempre puedo calmarme rápidamente cuando estoy muy enojado/a",
    "Tengo buen control de mis propias emociones",
    "Puedo controlar siempre mi temperamento y manejar las dificultades de forma racional",
    "Soy capaz de controlar mis propios sentimientos",
    "Siempre me pongo metas y luego intento hacer lo mejor para lograrlas",
    "Me digo a mí mismo/a que soy una persona capaz",
    "Soy una persona que se automotiva",
    "Siempre me animaría a mí mismo/a a dar lo mejor de mí",
  ],
};

export interface PuntajeWLEIS {
  autoconcienciaEmocional: number;
  percepcionEmocionalAjena: number;
  regulacionEmocional: number;
  usoEmocional: number;
}

export function puntuarWLEISDetalle(respuestas: number[]): PuntajeWLEIS {
  const r = respuestas.map((v) => Number(v) || 4);
  const avg = (arr: number[]) => Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
  return {
    autoconcienciaEmocional: avg(r.slice(0, 4)),
    percepcionEmocionalAjena: avg(r.slice(4, 8)),
    regulacionEmocional: avg(r.slice(8, 12)),
    usoEmocional: avg(r.slice(12, 16)),
  };
}

export function puntuarWLEIS(respuestas: number[]): ResultadoEscala {
  const d = puntuarWLEISDetalle(respuestas);
  const promedio = (d.autoconcienciaEmocional + d.percepcionEmocionalAjena + d.regulacionEmocional + d.usoEmocional) / 4;
  const nivel =
    `Autoconciencia emocional: ${d.autoconcienciaEmocional}/7 · Percepción emocional ajena: ${d.percepcionEmocionalAjena}/7 · ` +
    `Regulación emocional: ${d.regulacionEmocional}/7 · Uso emocional: ${d.usoEmocional}/7`;
  return { id: WLEIS.id, nombre: WLEIS.nombre, puntaje: Number(promedio.toFixed(1)), puntajeMaximo: 7, nivel };
}

// --- BRS (resiliencia) ---------------------------------------------------

export const BRS: Escala = {
  id: "brs",
  nombre: "BRS (Brief Resilience Scale)",
  instrucciones: "Indique cuánto está de acuerdo con cada afirmación, pensando en cómo suele reaccionar ante la adversidad.",
  tipoOpciones: "acuerdo",
  opcionesPorItem: Object.fromEntries(Array.from({ length: 6 }, (_, i) => [i, OPCIONES_ACUERDO_1_5])),
  items: [
    "Tiendo a recuperarme rápidamente después de momentos difíciles",
    "Me cuesta pasar por situaciones estresantes",
    "No demoro mucho en recuperarme de un evento estresante",
    "Me es difícil volver a la normalidad cuando algo malo me pasa",
    "Usualmente paso por momentos difíciles con poca dificultad",
    "Tiendo a tardar mucho en superar los contratiempos en mi vida",
  ],
};

const BRS_INDICES_INVERSOS = new Set([1, 3, 5]);

export function puntuarBRS(respuestas: number[]): ResultadoEscala {
  const ajustadas = respuestas.map((r, i) => (BRS_INDICES_INVERSOS.has(i) ? 6 - (Number(r) || 3) : Number(r) || 3));
  const promedio = ajustadas.reduce((a, b) => a + b, 0) / ajustadas.length;
  let nivel = "Resiliencia normal";
  if (promedio < 3) nivel = "Baja resiliencia percibida";
  else if (promedio > 4.3) nivel = "Alta resiliencia percibida";
  return { id: BRS.id, nombre: BRS.nombre, puntaje: Number(promedio.toFixed(2)), puntajeMaximo: 5, nivel };
}

// --- CBI (burnout, subescala personal) -----------------------------------

export const CBI: Escala = {
  id: "cbi",
  nombre: "CBI (agotamiento personal, Copenhagen Burnout Inventory)",
  instrucciones: "Piense en las últimas semanas y responda con qué frecuencia le ha pasado lo siguiente.",
  tipoOpciones: "frecuencia_0_4",
  opcionesPorItem: Object.fromEntries(Array.from({ length: 6 }, (_, i) => [i, OPCIONES_FRECUENCIA_CBI])),
  items: [
    "¿Con qué frecuencia se siente cansado/a?",
    "¿Con qué frecuencia se siente físicamente agotado/a?",
    "¿Con qué frecuencia se siente emocionalmente agotado/a?",
    "¿Con qué frecuencia piensa \"no puedo más\"?",
    "¿Con qué frecuencia se siente agotado/a en general?",
    "¿Con qué frecuencia se siente débil y susceptible a enfermar?",
  ],
};

export function puntuarCBI(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0) / respuestas.length;
  const nivel = puntaje >= 50 ? "Agotamiento personal elevado" : "Agotamiento personal bajo/moderado";
  return { id: CBI.id, nombre: CBI.nombre, puntaje: Number(puntaje.toFixed(1)), puntajeMaximo: 100, nivel };
}

// --- MC-SDS-13 (deseabilidad social validada) ----------------------------

export const MCSDS: Escala = {
  id: "mcsds",
  nombre: "MC-SDS-13 (deseabilidad social, forma corta)",
  instrucciones: "Indique si cada afirmación es verdadera o falsa respecto a usted.",
  tipoOpciones: "si_no",
  opcionesPorItem: Object.fromEntries(Array.from({ length: 13 }, (_, i) => [i, OPCIONES_VERDADERO_FALSO])),
  items: [
    "Antes de votar, me informo a fondo sobre las cualificaciones de todos los candidatos",
    "Nunca dudo en ayudar a alguien que tiene problemas",
    "A veces me resulta difícil seguir con mi trabajo si no me animan",
    "A veces me molesta bastante no salirme con la mía",
    "En alguna ocasión he dejado de hacer algo porque dudaba de mi propia capacidad",
    "Me ha molestado alguna vez que otros tuvieran ideas muy distintas a las mías",
    "Siempre estoy dispuesto/a a admitir cuando cometo un error",
    "Siempre soy cortés, incluso con personas que me resultan desagradables",
    "Nunca he sentido la tentación de romper una regla o norma",
    "Me he aprovechado de alguien alguna vez",
    "Alguna vez he sentido ganas de destruir cosas",
    "Nunca he sentido un fuerte deseo de vengarme cuando alguien me trata mal",
    "Hay ocasiones en que he sentido celos del éxito de otros",
  ],
};

// true = responder "Verdadero" (valor 1) es la respuesta socialmente deseable
const MCSDS_DIRECCION_VERDADERO = [true, true, false, false, false, false, true, true, true, false, false, true, false];

export function puntuarMCSDS(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((acc, r, i) => {
    const esVerdadero = Number(r) === 1;
    return acc + (esVerdadero === MCSDS_DIRECCION_VERDADERO[i] ? 1 : 0);
  }, 0);
  const nivel =
    puntaje >= 9
      ? "Deseabilidad social alta (posible respuesta idealizada)"
      : puntaje >= 5
      ? "Deseabilidad social moderada"
      : "Deseabilidad social baja";
  return { id: MCSDS.id, nombre: MCSDS.nombre, puntaje, puntajeMaximo: 13, nivel };
}
