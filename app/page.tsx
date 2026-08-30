// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { SECCIONES, TOTAL_PREGUNTAS } from "@/lib/questions";
import { TIPI, WLEIS, BRS, CBI, MCSDS, opcionesDeItem } from "@/lib/liderazgo/escalas";

const NAVY = "#0F172A";
const ORANGE = "#FF6B00";
const GRAY = "#64748b";

const ESCALAS_ORDEN = [TIPI, WLEIS, BRS, CBI, MCSDS];

function valoresIniciales(escala: any) {
  return Array(escala.items.length).fill(null);
}

function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="/LOGO.png" alt="Gaman Global Consultores" style={{ height: size, width: "auto" }} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: 40,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
      }}
    >
      {children}
    </div>
  );
}

export default function Page() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState(0); // 0: bienvenida, 1: registro, 2: test, 3: resultado
  const [seccionActual, setSeccionActual] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(TOTAL_PREGUNTAS).fill(""));
  const [respuestasEscalas, setRespuestasEscalas] = useState<Record<string, (number | null)[]>>(() => {
    const obj: Record<string, (number | null)[]> = {};
    for (const e of ESCALAS_ORDEN) obj[e.id] = valoresIniciales(e);
    return obj;
  });
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  useEffect(() => {
    if (!started || blocked || step !== 2) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, blocked, step]);

  useEffect(() => {
    const onBlur = () => {
      if (started && step === 2) setBlocked(true);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden" && started && step === 2) setBlocked(true);
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [started, step]);

  const timer = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const offsets = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    for (const s of SECCIONES) {
      arr.push(acc);
      acc += s.preguntas.length;
    }
    return arr;
  }, []);

  const pasos = useMemo(() => {
    const abiertos = SECCIONES.map((s, i) => ({ tipo: "abierta" as const, seccion: s, offset: offsets[i] }));
    const escalas = ESCALAS_ORDEN.map((e) => ({ tipo: "escala" as const, escala: e }));
    return [...abiertos, ...escalas];
  }, [offsets]);

  const totalPasos = pasos.length;
  const pasoActual = pasos[seccionActual];

  const updateAnswer = (globalIdx: number, value: string) => {
    setAnswers((prev) => {
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

  const handleStartTest = () => {
    if (!name.trim() || !role.trim()) {
      setErrorMessage("Por favor, ingresa tu nombre completo y el cargo al que postulas.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Ingresa un correo electrónico válido, es necesario para identificar tu evaluación.");
      return;
    }
    if (!consentimiento) {
      setErrorMessage("Debes aceptar el tratamiento de tus datos personales para continuar.");
      return;
    }
    setErrorMessage("");
    setStep(2);
    setSeccionActual(0);
    setStarted(true);
  };

  const pasoCompleto = (idx: number) => {
    const paso = pasos[idx];
    if (paso.tipo === "abierta") {
      const inicio = paso.offset;
      const fin = inicio + paso.seccion.preguntas.length;
      return answers.slice(inicio, fin).every((a) => a.trim().length > 0);
    }
    return respuestasEscalas[paso.escala.id].every((v) => v !== null);
  };

  const handleNextSection = () => {
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

  const handlePrevSection = () => {
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
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name,
          correo: email,
          cargo: role,
          respuestas: answers,
          escalas: respuestasEscalas,
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
        throw new Error(data?.error || "No se pudo procesar la evaluación.");
      }

      setStep(3);
    } catch (e: any) {
      setErrorMessage(e.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const blockClipboard = (e: React.SyntheticEvent) => {
    e.preventDefault();
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

  if (blocked) {
    return (
      <main style={{ ...shellStyle, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Card>
          <h1 style={{ color: "#d9534f", marginBottom: 15 }}>Evaluación bloqueada</h1>
          <p style={{ color: "#475569", lineHeight: 1.6 }}>
            La sesión se cerró por pérdida de foco de la ventana o intento de cambio de pestaña. Contacta a Gaman
            Global Consultores si necesitas reiniciar tu evaluación.
          </p>
        </Card>
      </main>
    );
  }

  if (step === 3) {
    return (
      <main style={{ ...shellStyle, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Logo size={40} />
          </div>
          <h1 style={{ color: NAVY, marginBottom: 10 }}>Evaluación completada</h1>
          <p style={{ color: GRAY, lineHeight: 1.6 }}>
            Gracias, {name}. Tu evaluación fue registrada correctamente. Nuestro equipo la revisará y se
            pondrá en contacto contigo según los siguientes pasos del proceso de selección.
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

          <h1 style={{ color: NAVY, marginBottom: 10, fontSize: 28 }}>Evaluación Ejecutiva Profunda y de Liderazgo</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 25, fontSize: 16 }}>
            Evaluación exhaustiva que mide autenticidad, consistencia psicológica y criterio directivo, incluyendo
            instrumentos de personalidad validados. Duración máxima sugerida: 90 minutos, organizada en {totalPasos}{" "}
            secciones.
          </p>

          <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", padding: 20, borderRadius: 8, marginBottom: 30 }}>
            <h3 style={{ color: "#991b1b", margin: "0 0 8px 0", fontSize: 16 }}>Advertencia importante de seguridad</h3>
            <p style={{ color: "#7f1d1d", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Al ingresar a la evaluación, el sistema activará restricciones estrictas: no está permitido salir de la
              pestaña, cambiar de ventana, ni copiar o pegar texto. Si el sistema detecta alguna de estas acciones, la
              evaluación se bloqueará automáticamente.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            style={{ width: "100%", padding: 16, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16 }}
          >
            Entrar al test
          </button>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div style={{ marginBottom: 20 }}>
            <Logo size={40} />
          </div>

          <h1 style={{ color: NAVY, marginBottom: 10, fontSize: 28 }}>Registro del candidato</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 25, fontSize: 16 }}>
            Ingresa tus datos para iniciar oficialmente la evaluación.
          </p>

          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />
            <input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />
            <input
              placeholder="Cargo al que postula"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15 }}
            />

            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                Autorizo a Gaman Global Consultores a tratar mis datos personales y las respuestas de esta evaluación
                psicológica-laboral, incluyendo datos sensibles, con la finalidad exclusiva de este proceso de
                selección, conforme a la Ley N.º 19.628 sobre Protección de la Vida Privada.
              </span>
            </label>

            <button
              onClick={handleStartTest}
              style={{ width: "100%", padding: 16, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, marginTop: 10 }}
            >
              Iniciar test
            </button>
          </div>
        </Card>
      )}

      {step === 2 && pasoActual && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNextSection();
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(5px)",
              padding: "16px 24px",
              fontWeight: 700,
              borderBottom: "1px solid #e2e8f0",
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              marginBottom: 24,
            }}
          >
            <Logo size={20} />
            <span style={{ color: NAVY, fontSize: 14, background: "#f1f5f9", padding: "6px 12px", borderRadius: 6 }}>
              Sección {seccionActual + 1} de {totalPasos}
            </span>
            <span style={{ color: NAVY, fontSize: 14, background: "#f1f5f9", padding: "6px 12px", borderRadius: 6 }}>
              Tiempo restante: {timer}
            </span>
          </div>

          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {errorMessage}
            </div>
          )}

          {pasoActual.tipo === "abierta" ? (
            <>
              <h2 style={{ color: NAVY, marginBottom: 16 }}>{pasoActual.seccion.titulo}</h2>
              {pasoActual.seccion.preguntas.map((q, localIdx) => {
                const globalIdx = pasoActual.offset + localIdx;
                return (
                  <div key={globalIdx} style={{ background: "#ffffff", padding: 28, borderRadius: 16, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", marginBottom: 12, fontWeight: 700, color: NAVY, fontSize: 16, lineHeight: 1.5 }}>
                      <span style={{ color: ORANGE, marginRight: 8 }}>{globalIdx + 1}.</span> {q}
                    </label>
                    <textarea
                      value={answers[globalIdx]}
                      onChange={(e) => updateAnswer(globalIdx, e.target.value)}
                      onCopy={blockClipboard}
                      onCut={blockClipboard}
                      onPaste={blockClipboard}
                      required
                      rows={5}
                      placeholder="Escriba su respuesta de forma clara y detallada..."
                      style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15, lineHeight: 1.5, resize: "vertical", fontFamily: "Arial, sans-serif" }}
                    />
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <h2 style={{ color: NAVY, marginBottom: 4 }}>{pasoActual.escala.nombre}</h2>
              <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>{pasoActual.escala.instrucciones}</p>
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
                            padding: "10px 14px",
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: "pointer",
                            border: seleccionado ? `2px solid ${ORANGE}` : "1px solid #cbd5e1",
                            background: seleccionado ? "#fff3e6" : "#fff",
                            color: seleccionado ? ORANGE : "#475569",
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

          <div style={{ display: "flex", gap: 12 }}>
            {seccionActual > 0 && (
              <button
                type="button"
                onClick={handlePrevSection}
                style={{ flex: 1, padding: 16, fontWeight: 700, background: "#e2e8f0", color: NAVY, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16 }}
              >
                Sección anterior
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 2, padding: 18, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16, boxShadow: "0 4px 14px rgba(255,107,0,0.3)" }}
            >
              {loading
                ? "Analizando perfil y generando reporte..."
                : seccionActual < totalPasos - 1
                ? "Siguiente sección"
                : "Enviar evaluación"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
