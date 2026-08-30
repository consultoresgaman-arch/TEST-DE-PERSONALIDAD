// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { SECCIONES_CLINICAS, TOTAL_PREGUNTAS_CLINICAS } from "@/lib/psicologico/preguntas";
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
  opcionesDeItem,
  obtenerEventosAplicablesLEC5,
  construirInstruccionesPCL5,
} from "@/lib/psicologico/escalas";

const NAVY = "#0F172A";
const BLUE = "#0ea5e9";
const GRAY = "#64748b";

const ESCALAS_ORDEN = [LEC5, PHQ9, CSSRS, GAD7, PCL5, ASRS, AQ10, AUDITC, MDQ, SCOFF, ISI, PHQ15, TIPI, ACE];

function valoresIniciales(escala: any) {
  return Array(escala.items.length).fill(null);
}

function Logo({ size = 32 }: { size?: number }) {
  return <img src="/LOGO.png" alt="Gaman Global" style={{ height: size, width: "auto" }} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#ffffff", padding: 40, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
      {children}
    </div>
  );
}

export default function PsicologicoPage() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState(0); // 0 bienvenida, 1 registro, 2 preguntas, 3 fin
  const [seccionActual, setSeccionActual] = useState(0);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);

  const [respuestasAbiertas, setRespuestasAbiertas] = useState<string[]>(Array(TOTAL_PREGUNTAS_CLINICAS).fill(""));
  const [respuestasEscalas, setRespuestasEscalas] = useState<Record<string, (number | null)[]>>(() => {
    const obj: Record<string, (number | null)[]> = {};
    for (const e of ESCALAS_ORDEN) obj[e.id] = valoresIniciales(e);
    return obj;
  });

  const [eventoIndiceSeleccion, setEventoIndiceSeleccion] = useState<number | null>(null);
  const [eventoIndiceDescripcion, setEventoIndiceDescripcion] = useState("");
  const [eventoIndiceOmitido, setEventoIndiceOmitido] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [draftRestaurado, setDraftRestaurado] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const draftKey = useMemo(() => `psico_draft_${token || "sin_token"}`, [token]);

  // Restaurar borrador guardado (si existe) al cargar la pagina.
  useEffect(() => {
    if (!token && draftKey === "psico_draft_sin_token") {
      // esperar a que token se resuelva desde la URL antes de intentar restaurar
    }
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const data = JSON.parse(raw);
        setNombre(data.nombre || "");
        setCorreo(data.correo || "");
        setMotivoConsulta(data.motivoConsulta || "");
        setConsentimiento(!!data.consentimiento);
        if (Array.isArray(data.respuestasAbiertas) && data.respuestasAbiertas.length === TOTAL_PREGUNTAS_CLINICAS) {
          setRespuestasAbiertas(data.respuestasAbiertas);
        }
        if (data.respuestasEscalas) setRespuestasEscalas(data.respuestasEscalas);
        if (typeof data.eventoIndiceSeleccion === "number") setEventoIndiceSeleccion(data.eventoIndiceSeleccion);
        if (typeof data.eventoIndiceDescripcion === "string") setEventoIndiceDescripcion(data.eventoIndiceDescripcion);
        if (typeof data.eventoIndiceOmitido === "boolean") setEventoIndiceOmitido(data.eventoIndiceOmitido);
        if (typeof data.step === "number" && data.step > 0 && data.step < 3) {
          setStep(data.step);
          setSeccionActual(data.seccionActual || 0);
          setDraftRestaurado(true);
        }
      }
    } catch {
      // localStorage no disponible o dato corrupto: se ignora, se empieza de cero.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Guardar borrador en cada cambio relevante (mientras no se haya terminado).
  useEffect(() => {
    if (step === 0 || step === 3) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          nombre,
          correo,
          motivoConsulta,
          consentimiento,
          respuestasAbiertas,
          respuestasEscalas,
          eventoIndiceSeleccion,
          eventoIndiceDescripcion,
          eventoIndiceOmitido,
          step,
          seccionActual,
        })
      );
    } catch {
      // si falla el guardado (ej. cuota excedida), simplemente no se persiste.
    }
  }, [
    step, seccionActual, nombre, correo, motivoConsulta, consentimiento,
    respuestasAbiertas, respuestasEscalas, eventoIndiceSeleccion, eventoIndiceDescripcion, eventoIndiceOmitido, draftKey,
  ]);

  const limpiarBorrador = () => {
    try { localStorage.removeItem(draftKey); } catch {}
  };

  const empezarDeNuevo = () => {
    limpiarBorrador();
    setNombre(""); setCorreo(""); setMotivoConsulta(""); setConsentimiento(false);
    setRespuestasAbiertas(Array(TOTAL_PREGUNTAS_CLINICAS).fill(""));
    const obj: Record<string, (number | null)[]> = {};
    for (const e of ESCALAS_ORDEN) obj[e.id] = valoresIniciales(e);
    setRespuestasEscalas(obj);
    setEventoIndiceSeleccion(null); setEventoIndiceDescripcion(""); setEventoIndiceOmitido(false);
    setDraftRestaurado(false);
    setStep(0); setSeccionActual(0);
  };

  const offsets = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    for (const s of SECCIONES_CLINICAS) {
      arr.push(acc);
      acc += s.preguntas.length;
    }
    return arr;
  }, []);

  const eventosAplicablesLEC5 = useMemo(
    () => obtenerEventosAplicablesLEC5(respuestasEscalas.lec5 || []),
    [respuestasEscalas.lec5]
  );

  const pasos = useMemo(() => {
    const abiertos = SECCIONES_CLINICAS.map((s, i) => ({ tipo: "abierta" as const, seccion: s, offset: offsets[i] }));
    const conEscalas: any[] = [...abiertos];
    for (const escala of ESCALAS_ORDEN) {
      conEscalas.push({ tipo: "escala" as const, escala });
      if (escala.id === "lec5") {
        conEscalas.push({ tipo: "evento_indice" as const });
      }
    }
    return conEscalas;
  }, [offsets]);

  const totalPasos = pasos.length;
  const pasoActual = pasos[seccionActual];

  const updateAbierta = (globalIdx: number, value: string) => {
    setRespuestasAbiertas((prev) => {
      const copy = [...prev];
      copy[globalIdx] = value;
      return copy;
    });
  };

  const updateEscala = (key: string, idx: number, value: number) => {
    setRespuestasEscalas((prev) => {
      const copy = { ...prev, [key]: [...prev[key]] };
      copy[key][idx] = value;
      return copy;
    });
  };

  const handleIniciar = () => {
    if (!nombre.trim() || !correo.trim()) {
      setErrorMessage("Ingresa el nombre y correo del paciente.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      return;
    }
    if (!consentimiento) {
      setErrorMessage("Se requiere el consentimiento informado del paciente para continuar.");
      return;
    }
    setErrorMessage("");
    setStep(2);
    setSeccionActual(0);
  };

  const pasoCompleto = (idx: number) => {
    const paso = pasos[idx];
    if (paso.tipo === "abierta") {
      const inicio = paso.offset;
      const fin = inicio + paso.seccion.preguntas.length;
      return respuestasAbiertas.slice(inicio, fin).every((a) => a.trim().length > 0);
    }
    if (paso.tipo === "evento_indice") {
      if (eventoIndiceOmitido) return true;
      return eventoIndiceSeleccion !== null;
    }
    return respuestasEscalas[paso.escala.id].every((v) => v !== null);
  };

  const handleSiguiente = () => {
    if (!pasoCompleto(seccionActual)) {
      setErrorMessage("Responde todos los ítems de esta sección antes de continuar.");
      return;
    }
    setErrorMessage("");
    if (seccionActual < totalPasos - 1) {
      setSeccionActual((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleAnterior = () => {
    if (seccionActual > 0) {
      setSeccionActual((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const descripcionEvento = eventoIndiceOmitido
        ? ""
        : eventoIndiceSeleccion !== null
        ? `${LEC5.items[eventoIndiceSeleccion]}${eventoIndiceDescripcion.trim() ? " — " + eventoIndiceDescripcion.trim() : ""}`
        : "";

      const res = await fetch("/api/psicologico/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          motivoConsulta,
          respuestas: respuestasAbiertas,
          escalas: respuestasEscalas,
          eventoIndice: descripcionEvento,
          consentimiento_datos: consentimiento,
          token,
        }),
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("El servidor no devolvió una respuesta válida.");
      }
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "No se pudo procesar el intake.");
      }
      limpiarBorrador();
      setStep(3);
    } catch (e: any) {
      setErrorMessage(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const shellStyle: React.CSSProperties = {
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: 900,
    margin: "0 auto",
    background: "#f8fafc",
    minHeight: "100vh",
    boxSizing: "border-box",
  };

  if (step === 3) {
    return (
      <main style={{ ...shellStyle, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Logo size={40} />
          </div>
          <h1 style={{ color: NAVY, marginBottom: 10 }}>Intake completado</h1>
          <p style={{ color: GRAY, lineHeight: 1.6 }}>
            Gracias, {nombre}. La información quedó registrada de forma segura y tu psicólogo/a tratante la revisará
            junto contigo en la sesión.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main style={shellStyle}>
      {step === 0 && (
        <Card>
          <div style={{ marginBottom: 20 }}>
            <Logo size={48} />
          </div>
          <h1 style={{ color: NAVY, marginBottom: 10, fontSize: 26 }}>Intake Clínico</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 25, fontSize: 16 }}>
            Este cuestionario reúne información sobre tu historia de vida, estado emocional y algunos tamizajes
            validados que utiliza tu psicólogo/a tratante. Se completa en consulta, con acompañamiento profesional.
            Tus respuestas son confidenciales y se usan exclusivamente para tu proceso terapéutico.
          </p>

          {draftRestaurado && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#1e40af", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span>Se encontró un intake anterior sin terminar. Puedes continuarlo o empezar de nuevo.</span>
              <button
                type="button"
                onClick={empezarDeNuevo}
                style={{ padding: "6px 12px", background: "#fff", border: "1px solid #bfdbfe", borderRadius: 6, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}
              >
                Empezar de nuevo
              </button>
            </div>
          )}

          <button
            onClick={() => (draftRestaurado ? setStep(2) : setStep(1))}
            style={{ width: "100%", padding: 16, fontWeight: 700, background: BLUE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}
          >
            {draftRestaurado ? "Continuar intake" : "Comenzar"}
          </button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div style={{ marginBottom: 20 }}>
            <Logo size={40} />
          </div>
          <h1 style={{ color: NAVY, marginBottom: 10, fontSize: 24 }}>Datos del paciente</h1>

          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />
            <input
              placeholder="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />
            <input
              placeholder="Motivo de consulta (opcional)"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />

            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} style={{ marginTop: 3 }} />
              <span>
                Consiento el tratamiento de mis datos personales y de salud, incluyendo información sensible sobre mi
                historia de vida y estado emocional, con la finalidad exclusiva de mi proceso terapéutico, conforme a
                la Ley N.º 19.628 sobre Protección de la Vida Privada y a la Ley N.º 20.584 sobre derechos y deberes
                de los pacientes. Entiendo que este resumen no reemplaza el juicio clínico de mi profesional tratante.
              </span>
            </label>

            <button
              onClick={handleIniciar}
              style={{ width: "100%", padding: 16, fontWeight: 700, background: BLUE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, marginTop: 10 }}
            >
              Comenzar intake
            </button>
          </div>
        </Card>
      )}

      {step === 2 && pasoActual && (
        <form onSubmit={(e) => { e.preventDefault(); handleSiguiente(); }}>
          <div
            style={{
              position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(5px)",
              padding: "16px 24px", fontWeight: 700, borderBottom: "1px solid #e2e8f0", zIndex: 10,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderRadius: "0 0 12px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", marginBottom: 24,
            }}
          >
            <Logo size={20} />
            <span style={{ color: NAVY, fontSize: 14, background: "#f1f5f9", padding: "6px 12px", borderRadius: 6 }}>
              Sección {seccionActual + 1} de {totalPasos}
            </span>
          </div>

          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {errorMessage}
            </div>
          )}

          {pasoActual.tipo === "abierta" && (
            <>
              <h2 style={{ color: NAVY, marginBottom: 4 }}>{pasoActual.seccion.titulo}</h2>
              {pasoActual.seccion.descripcion && (
                <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>{pasoActual.seccion.descripcion}</p>
              )}
              {pasoActual.seccion.preguntas.map((q, localIdx) => {
                const globalIdx = pasoActual.offset + localIdx;
                return (
                  <div key={globalIdx} style={{ background: "#ffffff", padding: 28, borderRadius: 16, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: NAVY, fontSize: 16, lineHeight: 1.5 }}>
                      {q}
                    </label>
                    <textarea
                      value={respuestasAbiertas[globalIdx]}
                      onChange={(e) => updateAbierta(globalIdx, e.target.value)}
                      required
                      rows={4}
                      placeholder="Respuesta..."
                      style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15, lineHeight: 1.5, resize: "vertical", fontFamily: "Arial, sans-serif" }}
                    />
                  </div>
                );
              })}
            </>
          )}

          {pasoActual.tipo === "escala" && (
            <>
              <h2 style={{ color: NAVY, marginBottom: 4 }}>{pasoActual.escala.nombre}</h2>
              <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>
                {pasoActual.escala.id === "pcl5"
                  ? construirInstruccionesPCL5(
                      eventoIndiceOmitido
                        ? ""
                        : eventoIndiceSeleccion !== null
                        ? `${LEC5.items[eventoIndiceSeleccion]}${eventoIndiceDescripcion.trim() ? " — " + eventoIndiceDescripcion.trim() : ""}`
                        : ""
                    )
                  : pasoActual.escala.instrucciones}
              </p>
              {pasoActual.escala.items.map((item: string, idx: number) => (
                <div key={idx} style={{ background: "#ffffff", padding: 24, borderRadius: 16, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", marginBottom: 14, fontWeight: 700, color: NAVY, fontSize: 15, lineHeight: 1.5 }}>
                    {idx + 1}. {item}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {opcionesDeItem(pasoActual.escala, idx).map((op) => {
                      const seleccionado = respuestasEscalas[pasoActual.escala.id][idx] === op.valor;
                      return (
                        <button
                          type="button"
                          key={op.valor}
                          onClick={() => updateEscala(pasoActual.escala.id, idx, op.valor)}
                          style={{
                            padding: "10px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                            border: seleccionado ? `2px solid ${BLUE}` : "1px solid #cbd5e1",
                            background: seleccionado ? "#e0f2fe" : "#fff",
                            color: seleccionado ? BLUE : "#475569",
                            fontWeight: seleccionado ? 700 : 400,
                          }}
                        >
                          {op.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {pasoActual.tipo === "evento_indice" && (
            <>
              <h2 style={{ color: NAVY, marginBottom: 4 }}>Evento de referencia</h2>
              <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>
                De los eventos que marcó como vividos, presenciados o parte de su trabajo, ¿cuál diría que es el que
                más le ha afectado? Esto se usará como referencia en la siguiente sección.
              </p>

              <div style={{ background: "#ffffff", padding: 24, borderRadius: 16, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                {eventosAplicablesLEC5.length === 0 ? (
                  <p style={{ color: GRAY, fontSize: 14 }}>
                    No se marcaron eventos vividos, presenciados o laborales en la sección anterior. Puede continuar.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {eventosAplicablesLEC5.map((idx) => {
                      const seleccionado = eventoIndiceSeleccion === idx;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => { setEventoIndiceSeleccion(idx); setEventoIndiceOmitido(false); }}
                          style={{
                            textAlign: "left", padding: "12px 14px", borderRadius: 8, fontSize: 14, cursor: "pointer",
                            border: seleccionado ? `2px solid ${BLUE}` : "1px solid #cbd5e1",
                            background: seleccionado ? "#e0f2fe" : "#fff",
                            color: seleccionado ? BLUE : "#334155",
                            fontWeight: seleccionado ? 700 : 400,
                          }}
                        >
                          {LEC5.items[idx]}
                        </button>
                      );
                    })}
                  </div>
                )}

                {eventoIndiceSeleccion !== null && !eventoIndiceOmitido && (
                  <textarea
                    value={eventoIndiceDescripcion}
                    onChange={(e) => setEventoIndiceDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Descripción breve (opcional, solo lo que se sienta cómodo/a compartiendo)"
                    style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 14, marginBottom: 12 }}
                  />
                )}

                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: GRAY }}>
                  <input
                    type="checkbox"
                    checked={eventoIndiceOmitido}
                    onChange={(e) => { setEventoIndiceOmitido(e.target.checked); if (e.target.checked) setEventoIndiceSeleccion(null); }}
                  />
                  Prefiero no especificar un evento concreto
                </label>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            {seccionActual > 0 && (
              <button
                type="button"
                onClick={handleAnterior}
                style={{ flex: 1, padding: 16, fontWeight: 700, background: "#e2e8f0", color: NAVY, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16 }}
              >
                Sección anterior
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: 18, fontWeight: 700, background: BLUE, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16, boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
            >
              {loading ? "Procesando..." : seccionActual < totalPasos - 1 ? "Siguiente sección" : "Finalizar intake"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
