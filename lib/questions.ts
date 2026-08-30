export interface Seccion {
  titulo: string;
  preguntas: string[];
}

// Fuente unica de verdad: usada tanto por el frontend (app/page.tsx) como por
// el backend (app/api/analyze) para no duplicar ni desincronizar el listado.
// Agrupadas en bloques tematicos solo para mejorar el flujo percibido por el
// candidato (progreso por bloques en vez de una lista plana de 45 items);
// el contenido clinico de las preguntas no fue reescrito en esta pasada.
export const SECCIONES: Seccion[] = [
  {
    titulo: "Energía y ritmo diario",
    preguntas: [
      "¿Cómo se comporta físicamente su cuerpo en las primeras dos horas después de despertar y cuál es el tono emocional de su primer pensamiento del día?",
      "Piense en una tarea que le resulta profundamente monótona pero ineludible. ¿Qué ocurre exactamente con su atención al pasar los minutos y qué estrategias involuntarias usa para escapar de ella?",
      "Si tuviera que evaluar la estabilidad de su energía a lo largo de la semana, ¿diría que se mueve por ráfagas intensas de hiperfoco seguidas de caídas drásticas, o mantiene un flujo constante?",
      "¿Cómo describiría la calidad de sus despertares nocturnos y con qué frecuencia su cuerpo se tensa sin razón aparente durante la noche?",
      "¿Qué actividad que hace un año le generaba entusiasmo o disfrute genuino nota que hoy realiza por absoluta inercia, cansancio o compromiso?",
      "¿Cómo se manifiesta su fatiga cuando lleva varios días consecutivos liderando personas y resolviendo problemas ajenos?",
      "¿Qué sensaciones físicas o cambios de humor experimenta cuando lleva varios días sin realizar ninguna actividad física o de descarga?",
      "Describa cómo percibe el límite de su propia energía vital: ¿siente que es un recurso renovable o vive con la constante sensación de estar exprimiendo la última gota?",
    ],
  },
  {
    titulo: "Reacción ante presión y cambio",
    preguntas: [
      "Ante un cambio radical e imprevisto en las reglas del juego de un proyecto importante, ¿cuál es su primera reacción visceral: se activa una furia interna, se paraliza la mente o se reorganiza de inmediato?",
      "Describa una situación reciente en la que sintió que la presión superaba su capacidad de respuesta. ¿Cómo reaccionó su respiración, su pecho y su nivel de paciencia con los demás?",
      "¿Qué sensaciones físicas experimenta en el cuerpo (tensión mandibular, nudo en el estómago, aceleración) cuando anticipa una conversación difícil o una evaluación sobre su desempeño?",
      "Cuando se acumulan múltiples exigencias y tareas de distinta prioridad, ¿cuál es su patrón de conducta: se organiza con frialdad, salta de una cosa a otra sin terminar ninguna, o experimenta bloqueo mental?",
      "Describa cómo experimenta el tiempo cuando está bajo un estrés severo: ¿siente que el mundo va demasiado lento y le desespera, o que el tiempo se atropella y no le alcanza?",
      "Cuando experimenta una interrupción imprevista mientras está profundamente concentrado en algo, ¿cómo reacciona su cuerpo y qué pasa con su humor en los siguientes diez minutos?",
      "¿Cómo maneja la frustración cuando un plan cuidadosamente trazado se derrumba por factores ajenos a su control en el último minuto?",
      "Cuando una situación lo desborda por completo y siente que ya no puede más, ¿cuál es su refugio mental o físico automático para escapar de la realidad?",
    ],
  },
  {
    titulo: "Autoridad, conflicto y crítica",
    preguntas: [
      "Cuando se enfrenta a un conflicto interpersonal donde la otra persona adopta una postura pasiva-agresiva o esquiva, ¿cuál es su tendencia instintiva: confrontar de frente, insistir hasta desgastar, o retirarse mentalmente?",
      "¿Cómo procesa internamente cuando un colaborador o superior pone en duda públicamente un criterio técnico o una decisión que usted tomó?",
      "¿Qué significado tiene para usted la autoridad y de qué manera descubrió, a lo largo de su historia personal, que debía relacionarse con ella?",
      "¿Qué tipo de críticas externas son las que logran penetrar sus defensas y quedarse resonando en su mente durante días?",
      "Describa un momento en el que prefirió guardar silencio para evitar un enfrentamiento y qué costo emocional pagó en los días siguientes.",
      "¿Cómo se manifiesta su impaciencia ante la lentitud, incompetencia o desorganización de las personas que le rodean?",
      "¿Qué tipo de líder o figura de autoridad le genera una repulsión instintiva y qué dice eso de sus propios valores inquebrantables?",
      "Piense en la persona a la que le resulta más difícil perdonar o tolerar. ¿Qué rasgo de ella le irrita profundamente porque secretamente teme poseerlo o haberlo padecido?",
    ],
  },
  {
    titulo: "Error, culpa y autocrítica",
    preguntas: [
      "¿Cuál es el diálogo interno exacto que se activa en su cabeza cuando comete un error grave del que nadie más se ha dado cuenta todavía?",
      "Ante un fracaso rotundo donde la responsabilidad es compartida, ¿cuánto tiempo permanece rumiando el error antes de pasar a la fase de reconstrucción?",
      "Cuando tiene que tomar una decisión que afectará negativamente el bienestar o el empleo de otra persona, ¿cómo procesa la culpa o la responsabilidad emocional?",
      "¿Qué mecanismos utiliza su mente cuando quiere evitar a toda costa una verdad incómoda sobre su propio rendimiento o conducta?",
      "¿Cómo reacciona ante los halagos o el reconocimiento público: los recibe con naturalidad, los desconfía, o siente que en cualquier momento descubrirán que es un fraude?",
      "¿Cómo describiría su relación con el pasado: es un archivo de aprendizajes útiles o un peso constante que vuelve en forma de reproches internos?",
      "Si pudiera borrar una de sus respuestas automáticas ante el estrés o la defensiva, ¿cuál elegiría y en qué momento exacto de su historia aprendió a usarla?",
    ],
  },
  {
    titulo: "Entorno, límites y valores",
    preguntas: [
      "¿Qué características exactas debe tener una persona para que su sola presencia en una sala le genere un desgaste físico o mental inmediato?",
      "¿Cómo es su ritual o transición mental al intentar apagar sus pensamientos para dormir? ¿Su mente se aquieta con facilidad o se convierte en un bucle de pendientes y escenarios hipotéticos?",
      "¿Qué tipo de entornos ambientales (silencio absoluto, ruido blanco, caos, música de fondo) necesita de forma imperativa para rendir y cuáles le saturan el sistema nervioso hasta agotar su paciencia?",
      "Si tuviera que identificar esa 'creencia ancla' o mandato invisible que más veces le ha frenado en su vida profesional o personal, ¿cómo lo describiría?",
      "¿De qué manera distingue el límite entre una exigencia laboral normal y una sensación de asfixia o vacío existencial?",
      "Cuando una tarea requiere atención sostenida a detalles minuciosos y repetitivos, ¿qué tipo de resistencia mental experimenta y cómo la vence?",
      "Si observa su trayectoria, ¿tiende a buscar la seguridad y la estabilidad predecible o se aburre con facilidad y busca el riesgo o el cambio constante?",
      "¿Cómo reacciona su cuerpo y su mente cuando se encuentra en espacios con multitudes, exceso de estímulos visuales o ruidos caóticos?",
      "¿Qué lugar ocupa el control en su vida? ¿Necesitar tenerlo todo previsto le otorga paz o se convierte en una prisión mental?",
    ],
  },
  {
    titulo: "Cierre e insight",
    preguntas: [
      "Cuando las cosas marchan bien y no hay problemas urgentes que resolver, ¿aparece alguna sensación de incomodidad, culpa o la expectativa de que algo malo va a suceder?",
      "Cuando se encuentra ante un problema complejo que no tiene una solución evidente, ¿cuál es su primer impulso: buscar ayuda inmediata, investigar en solitario hasta agotarse, o postergarlo?",
      "¿Cómo se expresa su ira o enojo reprimido cuando no puede manifestarlo abiertamente en un entorno formal o laboral?",
      "¿Qué le dice su intuición profunda sobre su estado actual de salud mental y emocional que prefiere no admitir ante los demás?",
      "Si esta evaluación fuera un espejo absoluto que revelara sin filtros lo más luminoso y lo más oscuro de su ser, ¿qué parte de ese reflejo le daría más recelo enfrentar?",
    ],
  },
  {
    titulo: "Liderazgo de equipos",
    preguntas: [
      "Describa un conflicto fuerte con un colaborador o par. ¿Qué hizo exactamente para resolverlo y qué aprendió de esa situación?",
      "¿Qué hace cuando tiene en su equipo a una persona talentosa pero emocionalmente difícil o inestable?",
      "¿Cómo se da cuenta de que alguien de su equipo está desmotivado, saturado o en riesgo de entrar en conflicto, y qué hace al respecto?",
      "Cuando la organización le exige resultados muy agresivos, ¿qué hace concretamente para no sacrificar a las personas, la cultura ni su criterio?",
      "Describa la vez más difícil en que tuvo que tomar una decisión que afectó negativamente a un miembro de su equipo (despido, no ascenso, llamado de atención fuerte). ¿Cómo la tomó y cómo la vivió?",
      "¿Qué tipo de líder no le gustaría ser jamás, aunque eso significara lograr mejores resultados a corto plazo?",
    ],
  },
];

export const QUESTIONS: string[] = SECCIONES.flatMap((s) => s.preguntas);
export const TOTAL_PREGUNTAS = QUESTIONS.length;
