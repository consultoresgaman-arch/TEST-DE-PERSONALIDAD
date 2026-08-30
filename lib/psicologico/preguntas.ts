export interface SeccionClinica {
  titulo: string;
  descripcion?: string;
  preguntas: string[];
}

// Preguntas abiertas de intake clinico. Complementan (no reemplazan) los
// instrumentos validados en lib/psicologico/escalas.ts. Redactadas para
// aplicarse en consulta, con el profesional presente.
export const SECCIONES_CLINICAS: SeccionClinica[] = [
  {
    titulo: "Motivo de consulta",
    preguntas: [
      "¿Qué lo/la trae a consulta en este momento de su vida?",
      "¿Desde cuándo nota lo que le preocupa, y hubo algún evento que lo haya desencadenado o agravado?",
      "¿Qué espera lograr con este proceso terapéutico?",
      "¿Ha recibido atención psicológica o psiquiátrica antes? ¿Qué diagnósticos o tratamientos le han indicado, si los recuerda?",
      "¿Toma actualmente algún medicamento psiquiátrico o de otro tipo de forma regular?",
    ],
  },
  {
    titulo: "Sueño y energía",
    preguntas: [
      "¿Cómo describiría su sueño en las últimas semanas: cantidad, calidad, facilidad para dormirse y para despertar?",
      "¿Ha tenido pesadillas recurrentes o se despierta sobresaltado/a durante la noche?",
      "¿Cómo es su nivel de energía a lo largo del día: estable, o con subidas y bajadas marcadas?",
      "¿Qué actividades le quitan energía y cuáles se la devuelven?",
    ],
  },
  {
    titulo: "Estado emocional actual",
    preguntas: [
      "Si tuviera que describir su estado de ánimo predominante de las últimas dos semanas, ¿cómo lo describiría?",
      "¿Hay momentos del día en que su ánimo cambia de forma marcada? ¿Cuándo y por qué cree que ocurre?",
      "¿Qué tan seguido siente que llora, se irrita o se desborda emocionalmente sin poder controlarlo del todo?",
      "¿Hay algo que sienta que no puede o no se atreve a decirle a nadie de su entorno cercano?",
    ],
  },
  {
    titulo: "Historia de vida e infancia",
    descripcion: "Puede responder con el nivel de detalle que le sea cómodo; no es necesario relatar hechos específicos si prefiere no hacerlo todavía.",
    preguntas: [
      "¿Cómo describiría el ambiente emocional de su hogar durante la infancia?",
      "¿Hubo alguna figura de autoridad (padre, madre, cuidador) con quien la relación fuera especialmente difícil? ¿Qué la hacía difícil?",
      "¿Existe algún evento de su infancia o adolescencia que sienta que todavía influye en cómo es usted hoy?",
      "¿Cómo era usted de niño/a, comparado con cómo es ahora?",
      "¿Qué mensaje o mandato familiar siente que recibió de niño/a que aún lo/la condiciona (ej. 'no llores', 'hay que ser fuerte', 'no molestes')?",
    ],
  },
  {
    titulo: "Miedos y frustraciones",
    preguntas: [
      "¿Cuál diría que es su miedo más profundo, el que le cuesta más admitir?",
      "¿Qué situación cotidiana le genera más frustración y cómo reacciona habitualmente ante ella?",
      "¿Hay algo que evite sistemáticamente por miedo, aunque sepa que le convendría enfrentarlo?",
      "¿Qué es lo que más le frustra de usted mismo/a?",
    ],
  },
  {
    titulo: "Rumiación y patrones de pensamiento",
    preguntas: [
      "¿Hay pensamientos que se repiten una y otra vez en su cabeza, aunque intente dejarlos de lado?",
      "Cuando algo le preocupa, ¿cuánto tiempo suele quedarse dándole vueltas antes de poder soltarlo?",
      "¿Nota algún patrón que se repite en sus relaciones, trabajos o decisiones importantes, como si volviera a vivir lo mismo de formas distintas?",
      "¿Qué hace su mente cuando está en silencio y sin estímulos externos?",
    ],
  },
  {
    titulo: "Cuerpo y síntomas psicosomáticos",
    preguntas: [
      "¿Nota que su cuerpo reacciona físicamente cuando está bajo estrés emocional (dolor de cabeza, tensión muscular, molestias digestivas, opresión en el pecho)?",
      "¿Ha notado cambios en su apetito o en su relación con la comida en el último tiempo?",
      "¿Hay alguna parte de su cuerpo donde sienta que 'guarda' la tensión o el malestar emocional?",
    ],
  },
  {
    titulo: "Límites y relaciones",
    preguntas: [
      "¿Le resulta fácil o difícil decir que no cuando algo lo/la sobrepasa?",
      "¿Qué pasa cuando alguien cercano cruza un límite suyo? ¿Cómo lo maneja habitualmente?",
      "¿Con qué tipo de personas o vínculos siente que pierde más su propio criterio o identidad?",
    ],
  },
  {
    titulo: "Temperamento y personalidad",
    preguntas: [
      "Si tuviera que describir su temperamento, ¿diría que es más colérico, sanguíneo, flemático o melancólico? ¿Por qué?",
      "¿Cómo describirían su forma de ser las personas que lo/la conocen bien, y coincide con cómo se ve usted mismo/a?",
      "¿Qué rasgo suyo cambiaría si pudiera, y cuál protegería a toda costa?",
    ],
  },
  {
    titulo: "Contexto psicosocial y antecedentes familiares",
    preguntas: [
      "¿Cuál es su situación laboral o de estudios actual, y cómo la vive?",
      "¿Con quién vive actualmente y cómo describiría esa convivencia?",
      "¿Con quién cuenta de verdad cuando algo le pasa? Describa su red de apoyo actual.",
      "¿Algún familiar directo (padres, hermanos, abuelos) ha tenido problemas de salud mental, consumo de alcohol/drogas, o ha intentado quitarse la vida? Cuente lo que sepa.",
    ],
  },
  {
    titulo: "Factores protectores",
    preguntas: [
      "¿Qué razones tiene hoy para seguir adelante, incluso en los momentos más difíciles?",
      "¿Qué ha hecho antes que realmente le haya ayudado a salir de un mal momento?",
      "¿Qué o quién siente que lo/la sostiene cuando todo lo demás falla?",
    ],
  },
];

export const PREGUNTAS_CLINICAS: string[] = SECCIONES_CLINICAS.flatMap((s) => s.preguntas);
export const TOTAL_PREGUNTAS_CLINICAS = PREGUNTAS_CLINICAS.length;
