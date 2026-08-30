/**
 * Instrumentos de tamizaje clinico VALIDADOS (no inventados). Se usan tal
 * como se aplican en la practica clinica real, con sus puntos de corte
 * publicados. El sistema NUNCA convierte estos puntajes en un diagnostico:
 * solo se presentan al profesional tratante para su propia interpretacion.
 *
 * Fuentes:
 * - PHQ-9: Kroenke, Spitzer & Williams (2001). Dominio publico.
 * - GAD-7: Spitzer, Kroenke, Williams & Lowe (2006). Dominio publico.
 * - PCL-5 y LEC-5: Weathers et al. (2013), National Center for PTSD (US
 *   Dept. of Veterans Affairs). Uso clinico/investigacion libre con
 *   atribucion.
 * - ASRS-v1.1 (Parte A): Kessler et al. / OMS. Uso clinico habitual con
 *   atribucion.
 * - AQ-10: Allison, Auyeung & Baron-Cohen (2012). Uso clinico habitual con
 *   atribucion.
 * - AUDIT-C: Bush et al. (1998), version corta del AUDIT (OMS). Dominio
 *   publico.
 * - MDQ: Hirschfeld et al. (2000). Uso clinico habitual con atribucion.
 * - SCOFF: Morgan, Reid & Lacey (1999). Uso clinico habitual con atribucion.
 */

export interface Opcion {
  valor: number;
  etiqueta: string;
}

export const OPCIONES_FRECUENCIA_0_3: Opcion[] = [
  { valor: 0, etiqueta: "Nunca" },
  { valor: 1, etiqueta: "Varios días" },
  { valor: 2, etiqueta: "Más de la mitad de los días" },
  { valor: 3, etiqueta: "Casi todos los días" },
];

export const OPCIONES_INTENSIDAD_0_4: Opcion[] = [
  { valor: 0, etiqueta: "Nada en absoluto" },
  { valor: 1, etiqueta: "Un poco" },
  { valor: 2, etiqueta: "Moderadamente" },
  { valor: 3, etiqueta: "Bastante" },
  { valor: 4, etiqueta: "Extremadamente" },
];

export const OPCIONES_FRECUENCIA_0_4: Opcion[] = [
  { valor: 0, etiqueta: "Nunca" },
  { valor: 1, etiqueta: "Rara vez" },
  { valor: 2, etiqueta: "A veces" },
  { valor: 3, etiqueta: "A menudo" },
  { valor: 4, etiqueta: "Muy a menudo" },
];

export const OPCIONES_ACUERDO: Opcion[] = [
  { valor: 1, etiqueta: "Totalmente de acuerdo" },
  { valor: 2, etiqueta: "Ligeramente de acuerdo" },
  { valor: 3, etiqueta: "Ligeramente en desacuerdo" },
  { valor: 4, etiqueta: "Totalmente en desacuerdo" },
];

export const OPCIONES_SI_NO: Opcion[] = [
  { valor: 1, etiqueta: "Sí" },
  { valor: 0, etiqueta: "No" },
];

// Orden fijo: 0=me sucedio, 1=lo presencie, 2=me entere (tercero cercano),
// 3=parte de mi trabajo, 4=no estoy seguro, 5=no aplica.
export const OPCIONES_LEC5: Opcion[] = [
  { valor: 0, etiqueta: "Me sucedió a mí" },
  { valor: 1, etiqueta: "Lo presencié" },
  { valor: 2, etiqueta: "Me enteré de que le sucedió a alguien cercano" },
  { valor: 3, etiqueta: "Parte de mi trabajo (ej. paramédico, policía, militar)" },
  { valor: 4, etiqueta: "No estoy seguro/a" },
  { valor: 5, etiqueta: "No aplica" },
];

const OPCIONES_SEVERIDAD_MDQ: Opcion[] = [
  { valor: 0, etiqueta: "Ningún problema" },
  { valor: 1, etiqueta: "Problema menor" },
  { valor: 2, etiqueta: "Problema moderado" },
  { valor: 3, etiqueta: "Problema serio" },
];

const OPCIONES_AUDITC_FRECUENCIA: Opcion[] = [
  { valor: 0, etiqueta: "Nunca" },
  { valor: 1, etiqueta: "Una vez al mes o menos" },
  { valor: 2, etiqueta: "2 a 4 veces al mes" },
  { valor: 3, etiqueta: "2 a 3 veces por semana" },
  { valor: 4, etiqueta: "4 o más veces por semana" },
];

const OPCIONES_AUDITC_CANTIDAD: Opcion[] = [
  { valor: 0, etiqueta: "1 o 2" },
  { valor: 1, etiqueta: "3 o 4" },
  { valor: 2, etiqueta: "5 o 6" },
  { valor: 3, etiqueta: "7 a 9" },
  { valor: 4, etiqueta: "10 o más" },
];

const OPCIONES_AUDITC_BINGE: Opcion[] = [
  { valor: 0, etiqueta: "Nunca" },
  { valor: 1, etiqueta: "Menos de una vez al mes" },
  { valor: 2, etiqueta: "Mensualmente" },
  { valor: 3, etiqueta: "Semanalmente" },
  { valor: 4, etiqueta: "Diariamente o casi diariamente" },
];

const OPCIONES_GRAVEDAD_ISI: Opcion[] = [
  { valor: 0, etiqueta: "Ninguna" },
  { valor: 1, etiqueta: "Leve" },
  { valor: 2, etiqueta: "Moderada" },
  { valor: 3, etiqueta: "Severa" },
  { valor: 4, etiqueta: "Muy severa" },
];

const OPCIONES_SATISFACCION_ISI: Opcion[] = [
  { valor: 0, etiqueta: "Muy satisfecho/a" },
  { valor: 1, etiqueta: "Satisfecho/a" },
  { valor: 2, etiqueta: "Neutral" },
  { valor: 3, etiqueta: "Insatisfecho/a" },
  { valor: 4, etiqueta: "Muy insatisfecho/a" },
];

const OPCIONES_INTERFERENCIA_ISI: Opcion[] = [
  { valor: 0, etiqueta: "Nada" },
  { valor: 1, etiqueta: "Un poco" },
  { valor: 2, etiqueta: "Algo" },
  { valor: 3, etiqueta: "Bastante" },
  { valor: 4, etiqueta: "Mucho" },
];

const OPCIONES_MOLESTIA_0_2: Opcion[] = [
  { valor: 0, etiqueta: "Nada molesto/a (o no aplica)" },
  { valor: 1, etiqueta: "Un poco molesto/a" },
  { valor: 2, etiqueta: "Muy molesto/a" },
];

const OPCIONES_TIPI: Opcion[] = [
  { valor: 1, etiqueta: "Totalmente en desacuerdo" },
  { valor: 2, etiqueta: "Moderadamente en desacuerdo" },
  { valor: 3, etiqueta: "Un poco en desacuerdo" },
  { valor: 4, etiqueta: "Ni de acuerdo ni en desacuerdo" },
  { valor: 5, etiqueta: "Un poco de acuerdo" },
  { valor: 6, etiqueta: "Moderadamente de acuerdo" },
  { valor: 7, etiqueta: "Totalmente de acuerdo" },
];

export type TipoOpciones = "frecuencia_0_3" | "intensidad_0_4" | "frecuencia_0_4" | "acuerdo" | "si_no" | "lec5";

export const OPCIONES_POR_TIPO: Record<TipoOpciones, Opcion[]> = {
  frecuencia_0_3: OPCIONES_FRECUENCIA_0_3,
  intensidad_0_4: OPCIONES_INTENSIDAD_0_4,
  frecuencia_0_4: OPCIONES_FRECUENCIA_0_4,
  acuerdo: OPCIONES_ACUERDO,
  si_no: OPCIONES_SI_NO,
  lec5: OPCIONES_LEC5,
};

export interface Escala {
  id: string;
  nombre: string;
  instrucciones: string;
  items: string[];
  tipoOpciones: TipoOpciones;
  // Si se define para un indice de item, sus opciones reemplazan a las de
  // tipoOpciones SOLO para ese item (instrumentos con opciones heterogeneas
  // por pregunta, como AUDIT-C o el ultimo item del MDQ).
  opcionesPorItem?: Record<number, Opcion[]>;
}

export function opcionesDeItem(escala: Escala, idx: number): Opcion[] {
  return escala.opcionesPorItem?.[idx] || OPCIONES_POR_TIPO[escala.tipoOpciones];
}

export const PHQ9: Escala = {
  id: "phq9",
  nombre: "PHQ-9 (tamizaje de síntomas depresivos)",
  instrucciones: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
  tipoOpciones: "frecuencia_0_3",
  items: [
    "Poco interés o placer en hacer las cosas",
    "Se ha sentido decaído/a, deprimido/a o sin esperanza",
    "Dificultad para quedarse o permanecer dormido/a, o ha dormido demasiado",
    "Se ha sentido cansado/a o con poca energía",
    "Falta de apetito o ha comido en exceso",
    "Se ha sentido mal con usted mismo/a, o que es un fracaso, o que se ha fallado a sí mismo/a o a su familia",
    "Dificultad para concentrarse en actividades, como leer o ver televisión",
    "¿Se ha movido o hablado tan lento que otras personas podrían notarlo? O lo contrario: ha estado tan inquieto/a que se ha movido mucho más de lo normal",
    "Pensamientos de que estaría mejor muerto/a, o de hacerse daño de alguna manera",
  ],
};

// Indice del item de riesgo dentro de PHQ9.items (0-based). Es el disparador
// principal del protocolo de crisis.
export const PHQ9_INDICE_ITEM_RIESGO = 8;

export const GAD7: Escala = {
  id: "gad7",
  nombre: "GAD-7 (tamizaje de síntomas de ansiedad)",
  instrucciones: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
  tipoOpciones: "frecuencia_0_3",
  items: [
    "Sentirse nervioso/a, ansioso/a o con los nervios de punta",
    "No poder dejar de preocuparse o controlar la preocupación",
    "Preocuparse demasiado por diferentes cosas",
    "Dificultad para relajarse",
    "Estar tan inquieto/a que es difícil quedarse quieto/a",
    "Irritarse o enojarse con facilidad",
    "Sentir miedo, como si algo terrible fuera a pasar",
  ],
};

// LEC-5: checklist de eventos de vida potencialmente traumaticos. No produce
// un puntaje clinico: su unico proposito es ayudar al paciente a identificar
// el evento de referencia para el PCL-5 (ver obtenerEventosAplicablesLEC5).
export const LEC5: Escala = {
  id: "lec5",
  nombre: "LEC-5 (listado de experiencias de vida)",
  instrucciones:
    "Estas cosas les suceden a algunas personas. Para cada una, marque la opción que mejor describa su relación con ese evento.",
  tipoOpciones: "lec5",
  items: [
    "Desastre natural (ej. inundación, huracán, terremoto)",
    "Incendio o explosión",
    "Accidente de transporte (ej. de auto, barco, tren o avión)",
    "Accidente grave en el trabajo, el hogar o durante una actividad recreativa",
    "Exposición a una sustancia tóxica (ej. químicos peligrosos, radiación)",
    "Asalto físico (ej. ser golpeado/a, pateado/a, abofeteado/a)",
    "Asalto con un arma (ej. amenazado/a con cuchillo, arma de fuego)",
    "Agresión sexual (violación o intento de violación)",
    "Otra experiencia sexual no deseada o incómoda",
    "Combate o exposición a una zona de guerra",
    "Cautiverio (ej. secuestrado/a, tomado/a como rehén)",
    "Enfermedad o lesión que puso en riesgo su vida",
    "Sufrimiento humano severo (presenciado)",
    "Muerte violenta o repentina de un ser querido",
    "Muerte accidental repentina de un ser querido",
    "Lesión, daño o muerte grave que usted causó a otra persona",
    "Cualquier otra experiencia muy estresante o traumática",
  ],
};

// Categorias de OPCIONES_LEC5 que implican exposicion directa/testigo/rol
// laboral (candidatas a ser el evento de referencia para PCL-5). Excluye
// "me entere" (2), "no estoy seguro" (4) y "no aplica" (5).
export function obtenerEventosAplicablesLEC5(respuestas: number[]): number[] {
  return respuestas
    .map((v, i) => ({ v: Number(v), i }))
    .filter((x) => x.v === 0 || x.v === 1 || x.v === 3)
    .map((x) => x.i);
}

export function construirInstruccionesPCL5(descripcionEvento: string): string {
  const base = descripcionEvento?.trim()
    ? `Piense en la siguiente experiencia que usted identificó: "${descripcionEvento.trim()}".`
    : "Piense en la experiencia más estresante o difícil que haya vivido.";
  return `${base} Durante el último mes, ¿cuánto le ha molestado cada uno de los siguientes problemas por esa experiencia?`;
}

export const PCL5: Escala = {
  id: "pcl5",
  nombre: "PCL-5 (síntomas de estrés postraumático)",
  instrucciones:
    "Piense en la experiencia más estresante o difícil que haya vivido. Durante el último mes, ¿cuánto le ha molestado cada uno de los siguientes problemas por esa experiencia?",
  tipoOpciones: "intensidad_0_4",
  items: [
    "Recuerdos repetidos, perturbadores y no deseados de la experiencia",
    "Sueños repetidos y perturbadores relacionados con la experiencia",
    "De repente sentir o actuar como si la experiencia estuviera sucediendo de nuevo",
    "Sentirse muy afectado/a cuando algo le recordó la experiencia",
    "Reacciones físicas fuertes cuando algo le recordó la experiencia (palpitaciones, dificultad para respirar, sudoración)",
    "Evitar recuerdos, pensamientos o sentimientos relacionados con la experiencia",
    "Evitar personas, lugares, conversaciones o actividades que le recuerden la experiencia",
    "Problemas para recordar partes importantes de la experiencia",
    "Creencias negativas fuertes sobre usted mismo/a, otras personas o el mundo",
    "Culparse a sí mismo/a o a otra persona por lo sucedido",
    "Sentimientos negativos fuertes como miedo, horror, enojo, culpa o vergüenza",
    "Pérdida de interés en actividades que antes disfrutaba",
    "Sentirse distante o alejado/a de otras personas",
    "Dificultad para experimentar sentimientos positivos",
    "Comportamiento irritable, arrebatos de enojo o actuar de forma agresiva",
    "Involucrarse en comportamientos arriesgados o imprudentes",
    "Estar muy alerta, vigilante o en guardia",
    "Sentirse nervioso/a o sobresaltarse con facilidad",
    "Dificultad para concentrarse",
    "Problemas para dormir",
  ],
};

export const ASRS: Escala = {
  id: "asrs",
  nombre: "ASRS-v1.1 Parte A (tamizaje de síntomas de TDAH en adultos)",
  instrucciones: "¿Con qué frecuencia le ha pasado lo siguiente en los últimos 6 meses?",
  tipoOpciones: "frecuencia_0_4",
  items: [
    "Problemas para concluir los últimos detalles de un proyecto, una vez que las partes difíciles ya se hicieron",
    "Dificultad para poner las cosas en orden cuando debe hacer una tarea que requiere organización",
    "Problemas para recordar citas u obligaciones",
    "Evita o retrasa comenzar una tarea que requiere mucho pensamiento",
    "Se mueve o retuerce las manos o los pies cuando tiene que estar sentado/a mucho tiempo",
    "Se siente excesivamente activo/a u obligado/a a hacer cosas, como impulsado/a por un motor",
  ],
};

export const AQ10: Escala = {
  id: "aq10",
  nombre: "AQ-10 (tamizaje de rasgos del espectro autista en adultos)",
  instrucciones: "Indique cuánto está de acuerdo con cada afirmación sobre usted mismo/a.",
  tipoOpciones: "acuerdo",
  items: [
    "A menudo noto sonidos pequeños cuando otros no lo hacen",
    "Normalmente me concentro más en el panorama general que en los detalles pequeños",
    "Me resulta fácil hacer más de una cosa a la vez",
    "Si hay una interrupción, puedo volver a lo que estaba haciendo muy rápidamente",
    "Me resulta fácil \"leer entre líneas\" cuando alguien me habla",
    "Sé cómo notar si a la persona que me escucha le está aburriendo la conversación",
    "Cuando leo una historia, me cuesta determinar las intenciones de los personajes",
    "Me gusta reunir información sobre categorías de cosas (tipos de auto, de ave, de tren, etc.)",
    "Me resulta fácil darme cuenta de lo que alguien piensa o siente solo con mirar su cara",
    "Encuentro difícil darme cuenta de las intenciones de las personas",
  ],
};

// items donde responder "de acuerdo" (valor 1 o 2) suma un punto AQ-10.
const AQ10_DIRECCION_ACUERDO = new Set([0, 6, 7, 9]);

export const AUDITC: Escala = {
  id: "auditc",
  nombre: "AUDIT-C (tamizaje de consumo de alcohol)",
  instrucciones: "Responda pensando en su consumo de alcohol durante el último año.",
  tipoOpciones: "frecuencia_0_4",
  items: [
    "¿Con qué frecuencia consume alguna bebida alcohólica?",
    "¿Cuántas bebidas alcohólicas suele consumir en un día típico cuando bebe?",
    "¿Con qué frecuencia toma 6 o más bebidas alcohólicas en una sola ocasión?",
  ],
  opcionesPorItem: {
    0: OPCIONES_AUDITC_FRECUENCIA,
    1: OPCIONES_AUDITC_CANTIDAD,
    2: OPCIONES_AUDITC_BINGE,
  },
};

export const MDQ: Escala = {
  id: "mdq",
  nombre: "MDQ (tamizaje del espectro bipolar)",
  instrucciones:
    "Ha habido alguna vez un período de tiempo en que usted no era su forma habitual de ser, y...",
  tipoOpciones: "si_no",
  items: [
    "...se sintió tan bien o eufórico/a que otras personas pensaron que no era usted mismo/a, o estuvo tan eufórico/a que se metió en problemas",
    "...estuvo tan irritable que gritó a la gente o comenzó peleas o discusiones",
    "...se sintió mucho más seguro/a de sí mismo/a de lo habitual",
    "...durmió mucho menos de lo habitual y realmente no lo extrañó",
    "...habló mucho más o más rápido de lo habitual",
    "...los pensamientos corrían por su cabeza o no podía frenar su mente",
    "...se distraía tan fácilmente que le costaba concentrarse o mantenerse en una tarea",
    "...tuvo mucha más energía de lo habitual",
    "...estuvo mucho más activo/a o hizo muchas más cosas de lo habitual",
    "...fue mucho más sociable o extrovertido/a de lo habitual (ej. llamó a amigos de madrugada)",
    "...estuvo mucho más interesado/a en el sexo de lo habitual",
    "...hizo cosas inusuales para usted, o que otros consideraron excesivas, tontas o arriesgadas",
    "...gastar dinero le trajo problemas a usted o a su familia",
    "Si respondió 'Sí' a más de una de las anteriores: ¿varias de ellas ocurrieron durante el mismo período de tiempo?",
    "¿Cuánto problema le causó algo de esto (ej. no poder trabajar, problemas familiares, económicos o legales, discusiones o peleas)?",
  ],
  opcionesPorItem: {
    14: OPCIONES_SEVERIDAD_MDQ,
  },
};

export const SCOFF: Escala = {
  id: "scoff",
  nombre: "SCOFF (tamizaje de conducta alimentaria)",
  instrucciones: "Responda pensando en su relación con la comida y su cuerpo.",
  tipoOpciones: "si_no",
  items: [
    "¿Se provoca el vómito porque se siente incómodamente lleno/a?",
    "¿Le preocupa haber perdido el control sobre cuánto come?",
    "¿Ha perdido recientemente más de 6 kilos en un período de 3 meses?",
    "¿Cree que está gordo/a aunque otros digan que está demasiado delgado/a?",
    "¿Diría que la comida domina su vida?",
  ],
};

// C-SSRS Screener: se aplica siempre a continuacion del PHQ-9 (no solo si el
// item 9 dio positivo) para mantener un flujo fijo y consistente. Cuantifica
// la severidad de la ideacion/conducta suicida, no solo su presencia.
export const CSSRS: Escala = {
  id: "cssrs",
  nombre: "C-SSRS Screener (severidad de riesgo suicida)",
  instrucciones: "Las siguientes preguntas son sobre pensamientos que pudo haber tenido en el último mes (la última pregunta es sobre toda su vida).",
  tipoOpciones: "si_no",
  items: [
    "¿Ha deseado estar muerto/a o quedarse dormido/a y no despertar?",
    "¿Ha tenido pensamientos reales de querer quitarse la vida?",
    "¿Ha pensado en cómo podría hacerlo (un método concreto)?",
    "¿Ha tenido alguna intención de actuar según esos pensamientos, más allá de solo tenerlos?",
    "¿Ha comenzado a elaborar o ha elaborado un plan detallado de cómo quitarse la vida?",
    "En toda su vida, ¿alguna vez ha hecho algo, comenzado a hacer algo, o se ha preparado para hacer algo con el fin de terminar con su vida?",
    "Si respondió 'Sí' a la anterior: ¿fue esto en los últimos 3 meses?",
  ],
};

export const ISI: Escala = {
  id: "isi",
  nombre: "ISI (Índice de Severidad del Insomnio)",
  instrucciones: "Responda pensando en sus últimas 2 semanas.",
  tipoOpciones: "intensidad_0_4",
  items: [
    "Gravedad de la dificultad para CONCILIAR el sueño",
    "Gravedad de la dificultad para MANTENER el sueño",
    "Problema de DESPERTAR DEMASIADO TEMPRANO",
    "Qué tan SATISFECHO/A o INSATISFECHO/A está con su patrón de sueño actual",
    "¿Cuánto interfiere su problema de sueño con su funcionamiento diario (fatiga, concentración, memoria, ánimo)?",
    "Qué tan NOTORIO cree que es para los demás el deterioro causado por su problema de sueño",
    "Qué tan PREOCUPADO/A o ANGUSTIADO/A está por su problema de sueño actual",
  ],
  opcionesPorItem: {
    0: OPCIONES_GRAVEDAD_ISI,
    1: OPCIONES_GRAVEDAD_ISI,
    2: OPCIONES_GRAVEDAD_ISI,
    3: OPCIONES_SATISFACCION_ISI,
    4: OPCIONES_INTERFERENCIA_ISI,
    5: OPCIONES_INTERFERENCIA_ISI,
    6: OPCIONES_INTERFERENCIA_ISI,
  },
};

export const PHQ15: Escala = {
  id: "phq15",
  nombre: "PHQ-15 (severidad de síntomas somáticos)",
  instrucciones: "Durante las últimas 4 semanas, ¿cuánto le han molestado los siguientes síntomas?",
  tipoOpciones: "si_no", // se sobreescribe con OPCIONES_MOLESTIA_0_2 en todos los items
  opcionesPorItem: Object.fromEntries(Array.from({ length: 15 }, (_, i) => [i, OPCIONES_MOLESTIA_0_2])),
  items: [
    "Dolor de estómago",
    "Dolor de espalda",
    "Dolor en brazos, piernas o articulaciones (rodillas, caderas, etc.)",
    "Dolores menstruales u otros problemas menstruales (si no aplica, marque 'no aplica')",
    "Dolor de cabeza",
    "Dolor en el pecho",
    "Mareo",
    "Episodios de desmayo",
    "Sentir el corazón acelerado o con palpitaciones",
    "Falta de aire",
    "Dolor o problemas durante las relaciones sexuales",
    "Estreñimiento, intestino irritable o indigestión",
    "Náuseas, gases o problemas digestivos",
    "Sentirse cansado/a o con poca energía",
    "Problemas para dormir",
  ],
};

export const TIPI: Escala = {
  id: "tipi",
  nombre: "TIPI (personalidad, Big Five breve)",
  instrucciones: "Me veo a mí mismo/a como una persona...",
  tipoOpciones: "acuerdo", // se sobreescribe: todos usan OPCIONES_TIPI (1-7)
  opcionesPorItem: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, OPCIONES_TIPI])),
  items: [
    "Extrovertida, entusiasta",
    "Crítica, con tendencia a discutir",
    "Confiable, autodisciplinada",
    "Ansiosa, que se altera con facilidad",
    "Abierta a nuevas experiencias, compleja",
    "Reservada, callada",
    "Solidaria, cálida",
    "Desorganizada, descuidada",
    "Calmada, emocionalmente estable",
    "Convencional, poco creativa",
  ],
};

export const ACE: Escala = {
  id: "ace",
  nombre: "ACE (experiencias adversas en la infancia)",
  instrucciones: "Las siguientes preguntas son sobre experiencias antes de que usted cumpliera 18 años.",
  tipoOpciones: "si_no",
  items: [
    "¿Un padre/madre u otro adulto del hogar frecuentemente lo/la insultaba, humillaba, o actuaba de forma que usted temiera sufrir daño físico?",
    "¿Un padre/madre u otro adulto del hogar frecuentemente lo/la empujaba, agarraba, abofeteaba, o lo/la golpeó tan fuerte que dejó marcas?",
    "¿Un adulto o alguien al menos 5 años mayor que usted lo/la tocó sexualmente, lo/la hizo tocar su cuerpo de forma sexual, o intentó o tuvo algún tipo de relación sexual con usted?",
    "¿Sintió frecuentemente que nadie en su familia lo/la amaba o pensaba que usted era importante, o que su familia no se apoyaba ni se sentía cercana?",
    "¿Sintió frecuentemente que no tenía suficiente comida, tenía que usar ropa sucia, o no tenía quién lo/la protegiera o llevara al médico si lo necesitaba?",
    "¿Sus padres alguna vez se separaron o se divorciaron?",
    "¿Su madre o madrastra fue frecuentemente golpeada, empujada, abofeteada, o amenazada/herida con un arma?",
    "¿Vivió con alguien que tenía problemas de consumo de alcohol o drogas?",
    "¿Algún miembro del hogar sufría de depresión, alguna enfermedad mental, o intentó quitarse la vida?",
    "¿Algún miembro del hogar fue a prisión?",
  ],
};

export interface ResultadoEscala {
  id: string;
  nombre: string;
  puntaje: number;
  puntajeMaximo: number;
  nivel: string;
}

export function puntuarPHQ9(respuestas: number[]): ResultadoEscala & { riesgoItem9: boolean } {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  let nivel = "Mínimo";
  if (puntaje >= 20) nivel = "Severo";
  else if (puntaje >= 15) nivel = "Moderadamente severo";
  else if (puntaje >= 10) nivel = "Moderado";
  else if (puntaje >= 5) nivel = "Leve";
  return {
    id: PHQ9.id,
    nombre: PHQ9.nombre,
    puntaje,
    puntajeMaximo: 27,
    nivel,
    riesgoItem9: (Number(respuestas[PHQ9_INDICE_ITEM_RIESGO]) || 0) > 0,
  };
}

export function puntuarGAD7(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  let nivel = "Mínimo";
  if (puntaje >= 15) nivel = "Severo";
  else if (puntaje >= 10) nivel = "Moderado";
  else if (puntaje >= 5) nivel = "Leve";
  return { id: GAD7.id, nombre: GAD7.nombre, puntaje, puntajeMaximo: 21, nivel };
}

export function puntuarPCL5(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  const nivel = puntaje >= 31 ? "Sugiere posible TEPT (requiere evaluación clínica)" : "Bajo el punto de corte habitual";
  return { id: PCL5.id, nombre: PCL5.nombre, puntaje, puntajeMaximo: 80, nivel };
}

// Umbral oficial de la Parte A del ASRS-v1.1: los items 1-3 (indices 0-2)
// cuentan si la respuesta es "A veces" (>=2) o mas frecuente; los items 4-6
// (indices 3-5) solo cuentan si es "A menudo" (>=3) o mas frecuente. 4 o mas
// items marcados es el punto de corte de tamizaje positivo.
const ASRS_UMBRAL_POR_INDICE = [2, 2, 2, 3, 3, 3];

export function puntuarASRS(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  const itemsMarcados = respuestas.filter((r, i) => (Number(r) || 0) >= ASRS_UMBRAL_POR_INDICE[i]).length;
  const nivel = itemsMarcados >= 4 ? "Tamizaje positivo (sugiere evaluación adicional)" : "Tamizaje negativo";
  return { id: ASRS.id, nombre: ASRS.nombre, puntaje, puntajeMaximo: 24, nivel };
}

export function puntuarAQ10(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((acc, r, i) => {
    const enDireccionAcuerdo = AQ10_DIRECCION_ACUERDO.has(i);
    const marcoAcuerdo = Number(r) <= 2; // 1-2 = de acuerdo, 3-4 = en desacuerdo
    const cuenta = enDireccionAcuerdo ? marcoAcuerdo : !marcoAcuerdo;
    return acc + (cuenta ? 1 : 0);
  }, 0);
  const nivel = puntaje >= 6 ? "Sugiere evaluación adicional del espectro autista" : "Bajo el punto de corte habitual";
  return { id: AQ10.id, nombre: AQ10.nombre, puntaje, puntajeMaximo: 10, nivel };
}

export function puntuarAUDITC(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  const nivel =
    puntaje >= 4
      ? "Sugiere consumo de riesgo (el corte exacto varía: ≥3 en mujeres, ≥4 en hombres, según criterio clínico)"
      : "Bajo el punto de corte habitual";
  return { id: AUDITC.id, nombre: AUDITC.nombre, puntaje, puntajeMaximo: 12, nivel };
}

export function puntuarMDQ(respuestas: number[]): ResultadoEscala {
  const sintomas = respuestas.slice(0, 13);
  const coocurrencia = Number(respuestas[13]) || 0;
  const severidad = Number(respuestas[14]) || 0;
  const sintomasPositivos = sintomas.filter((r) => Number(r) === 1).length;
  const puntaje = sintomasPositivos;

  const tamizajePositivo = sintomasPositivos >= 7 && coocurrencia === 1 && severidad >= 2;
  const nivel = tamizajePositivo
    ? "Tamizaje positivo (sugiere evaluación adicional del espectro bipolar)"
    : "Tamizaje negativo";
  return { id: MDQ.id, nombre: MDQ.nombre, puntaje, puntajeMaximo: 13, nivel };
}

export function puntuarSCOFF(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  const nivel = puntaje >= 2 ? "Sugiere evaluación adicional de conducta alimentaria" : "Bajo el punto de corte habitual";
  return { id: SCOFF.id, nombre: SCOFF.nombre, puntaje, puntajeMaximo: 5, nivel };
}

const NIVELES_IDEACION_CSSRS = [
  "Sin ideación reportada",
  "Deseo de estar muerto/a (pasivo)",
  "Ideación suicida activa, sin método",
  "Ideación activa con método, sin plan ni intención",
  "Ideación activa con alguna intención de actuar",
  "Ideación activa con plan y método específicos",
];

export function puntuarCSSRS(respuestas: number[]): ResultadoEscala & { riesgoActivo: boolean; nivelIdeacion: number } {
  // items 0-4 (0-based) = niveles de ideacion 1 a 5 (severidad creciente).
  // item 5 = conducta suicida alguna vez en la vida. item 6 = si fue en los ultimos 3 meses.
  const ideacion = respuestas.slice(0, 5);
  let nivelIdeacion = 0;
  for (let i = 0; i < ideacion.length; i++) {
    if (Number(ideacion[i]) === 1) nivelIdeacion = i + 1;
  }
  const conductaVida = Number(respuestas[5]) === 1;
  const conductaReciente = Number(respuestas[6]) === 1;

  // Riesgo activo: ideacion nivel 3+ (con metodo) o cualquier conducta suicida.
  const riesgoActivo = nivelIdeacion >= 3 || conductaVida;

  let nivel = NIVELES_IDEACION_CSSRS[nivelIdeacion];
  if (conductaVida) {
    nivel += conductaReciente ? " · Conducta suicida en los últimos 3 meses" : " · Conducta suicida previa (no reciente)";
  }

  return {
    id: CSSRS.id,
    nombre: CSSRS.nombre,
    puntaje: nivelIdeacion,
    puntajeMaximo: 5,
    nivel,
    riesgoActivo,
    nivelIdeacion,
  };
}

export function puntuarISI(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  let nivel = "Sin insomnio clínicamente significativo";
  if (puntaje >= 22) nivel = "Insomnio severo";
  else if (puntaje >= 15) nivel = "Insomnio moderado";
  else if (puntaje >= 8) nivel = "Insomnio subclínico/leve";
  return { id: ISI.id, nombre: ISI.nombre, puntaje, puntajeMaximo: 28, nivel };
}

export function puntuarPHQ15(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  let nivel = "Mínimo";
  if (puntaje >= 15) nivel = "Severo";
  else if (puntaje >= 10) nivel = "Moderado";
  else if (puntaje >= 5) nivel = "Leve";
  return { id: PHQ15.id, nombre: PHQ15.nombre, puntaje, puntajeMaximo: 30, nivel };
}

export interface PuntajeTIPI {
  extraversion: number;
  amabilidad: number;
  responsabilidad: number;
  estabilidadEmocional: number;
  apertura: number;
}

function invertirTIPI(v: number): number {
  return 8 - Number(v);
}

export function puntuarTIPIDetalle(respuestas: number[]): PuntajeTIPI {
  const r = respuestas.map((v) => Number(v) || 4);
  return {
    extraversion: Number(((r[0] + invertirTIPI(r[5])) / 2).toFixed(1)),
    amabilidad: Number(((invertirTIPI(r[1]) + r[6]) / 2).toFixed(1)),
    responsabilidad: Number(((r[2] + invertirTIPI(r[7])) / 2).toFixed(1)),
    estabilidadEmocional: Number(((invertirTIPI(r[3]) + r[8]) / 2).toFixed(1)),
    apertura: Number(((r[4] + invertirTIPI(r[9])) / 2).toFixed(1)),
  };
}

export function puntuarTIPI(respuestas: number[]): ResultadoEscala {
  const d = puntuarTIPIDetalle(respuestas);
  const promedio = (d.extraversion + d.amabilidad + d.responsabilidad + d.estabilidadEmocional + d.apertura) / 5;
  const nivel =
    `Extraversión: ${d.extraversion}/7 · Amabilidad: ${d.amabilidad}/7 · ` +
    `Responsabilidad: ${d.responsabilidad}/7 · Estabilidad emocional: ${d.estabilidadEmocional}/7 · ` +
    `Apertura: ${d.apertura}/7`;
  return { id: TIPI.id, nombre: TIPI.nombre, puntaje: Number(promedio.toFixed(1)), puntajeMaximo: 7, nivel };
}

export function puntuarACE(respuestas: number[]): ResultadoEscala {
  const puntaje = respuestas.reduce((a, b) => a + (Number(b) || 0), 0);
  const nivel =
    puntaje >= 4
      ? "Exposición alta a adversidad infantil (≥4, asociado a mayor riesgo en salud física y mental adulta)"
      : puntaje >= 1
      ? "Exposición presente a adversidad infantil"
      : "Sin experiencias adversas reportadas en este instrumento";
  return { id: ACE.id, nombre: ACE.nombre, puntaje, puntajeMaximo: 10, nivel };
}

// --- Deteccion heuristica de riesgo en texto libre ---------------------
// Capa adicional (no reemplaza el item 9 del PHQ-9) que revisa las
// respuestas abiertas por palabras asociadas a riesgo vital, para que nada
// se pierda en una intake larga.
const PALABRAS_RIESGO = [
  "quiero morir",
  "quiero morirme",
  "no quiero seguir viviendo",
  "no quiero vivir",
  "acabar con todo",
  "quitarme la vida",
  "suicid",
  "hacerme daño",
  "hacerme dano",
  "lastimarme",
  "no vale la pena seguir",
  "mejor estaria muerto",
  "mejor estaría muerto",
];

export function detectarRiesgoEnTexto(respuestas: string[]): string[] {
  const encontradas = new Set<string>();
  const textoCompleto = respuestas.join(" \n ").toLowerCase();
  for (const palabra of PALABRAS_RIESGO) {
    if (textoCompleto.includes(palabra)) encontradas.add(palabra);
  }
  return Array.from(encontradas);
}
