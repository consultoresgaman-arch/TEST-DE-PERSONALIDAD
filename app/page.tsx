"use client";

import { useEffect, useMemo, useState } from "react";

const QUESTIONS = [
  "¿Cómo se describiría a usted mismo cuando está en su mejor versión como líder y cuando está bajo presión?",
  "En este momento, ¿cómo llega emocionalmente a esta entrevista y qué factores podrían estar afectando su rendimiento hoy?",
  "Cuénteme una situación reciente de alta presión donde su resultado dependía de su capacidad para sostener criterio y equilibrio emocional. ¿Qué hizo exactamente?",
  "Cuando un superior o un colaborador le cuestiona una decisión, ¿qué ocurre internamente en usted y cómo responde?",
  "Describa un conflicto fuerte con un par o subordinado. ¿Qué hizo usted para resolverlo y qué aprendió?",
  "¿Qué hace cuando siente ganas de responder de inmediato, corregir en público o tomar una decisión rápida por enojo?",
  "¿Cómo organiza varias prioridades exigentes al mismo tiempo y qué suele pasar cuando se le acumulan tareas?",
  "¿Qué tipo de tareas le exigen más concentración y qué estrategias usa para no distraerse o desconectarse?",
  "¿Usted trabaja mejor con estructura o con flexibilidad? ¿Qué le ocurre cuando el entorno cambia abruptamente?",
  "Si tuviera que describir su temperamento, ¿diría que es más colérico, sanguíneo, flemático o melancólico? Explique cómo se manifiesta eso en su liderazgo.",
  "¿Qué límites no está dispuesto a cruzar, incluso si eso le hiciera ganar poder, dinero o aprobación?",
  "Cuando algo no sale como espera, qué patrón se activa en usted: insiste, se irrita, se bloquea o redefine el plan?",
  "¿Le ha pasado tomar decisiones apresuradas y luego descubrir que faltaba información clave? ¿Cómo lo corrigió?",
  "¿Su energía se mantiene estable durante jornadas largas o tiende a subir y bajar de forma marcada?",
  "¿Cómo se relaciona con la autoridad cuando no está de acuerdo con una instrucción?",
  "Cuando comete un error visible, ¿tiende a reconocerlo rápido o a justificarlo primero?",
  "¿Qué hace con un colaborador talentoso pero emocionalmente difícil o inestable?",
  "¿Cómo se da cuenta de que una persona de su equipo está desmotivada, saturada o en riesgo de caer en conflicto?",
  "Cuando la organización le exige resultados muy agresivos, ¿qué hace para no sacrificar personas, cultura ni criterio?",
  "¿Qué tipo de líder no le gustaría ser nunca, aunque lograra buenos resultados?",
];

export default function Page() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(20).fill(""));
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(18 * 60);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenUrl = params.get("token") || "";
    setToken(tokenUrl);
  }, []);

  useEffect(() => {
    if (!started || blocked) return;
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
  }, [started, blocked]);

  useEffect(() => {
    const onBlur = () => {
      if (started) setBlocked(true);
    };
    const onVis = () => {
      if (document.visibilityState === "hidden" && started) setBlocked(true);
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [started]);

  const timer = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const updateAnswer = (idx: number, value: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleStart = () => {
    if (!name.trim() || !role.trim()) return;
    setStarted(true);
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const resAnalyze = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name,
          cargo: role,
          respuestas: answers,
          modo: "multi",
          motor: "gemini",
        }),
      });
      const dataAnalyze = await resAnalyze.json();
      if (!dataAnalyze.ok) throw new Error(dataAnalyze.error || "Error analizando");

      setAnalysis(dataAnalyze.analysis);

      const resSave = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_candidato: name,
          cargo_postula: role,
          respuestas: answers,
          preanalisis_ia: dataAnalyze.analysis,
          token: token,
        }),
      });
      const dataSave = await resSave.json();
      
      if (!resSave.ok) {
        throw new Error(dataSave.error || "Este enlace ya fue utilizado.");
      }

    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const blockPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  if (blocked) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial", textAlign: "center" }}>
        <h1 style={{ color: "#d9534f" }}>Evaluación Bloqueada</h1>
        <p>La sesión se cerró por pérdida de foco de la ventana o intento de cambio de pestaña.</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ color: "#d9534f" }}>Acceso denegado</h1>
        <p style={{ background: "#f8d7da", color: "#721c24", padding: 20, borderRadius: 8, marginTop: 20 }}>
          {errorMessage}
        </p>
      </main>
    );
  }

  if (analysis) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
        <h1>Resultado del análisis</h1>
        <pre style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", padding: 20, borderRadius: 12 }}>
          {analysis}
        </pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 900, margin: "0 auto" }}>
      <h1>Evaluación Ejecutiva y de Liderazgo</h1>
      <p>Esta evaluación mide autenticidad, consistencia y criterio de liderazgo bajo presión temporal.</p>

      {!started ? (
        <section style={{ background: "#f8fafc", padding: 20, borderRadius: 12, marginTop: 20 }}>
          <input
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <input
            placeholder="Cargo al que postula"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button onClick={handleStart} style={{ width: "100%", padding: 14, fontWeight: 700, background: "#FF6B00", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Comenzar evaluación
          </button>
        </section>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div style={{ position: "sticky", top: 0, background: "#fff", padding: "15px 0", fontWeight: 700, borderBottom: "1px solid #eee", zIndex: 10 }}>
            Tiempo restante: {timer}
          </div>

          {QUESTIONS.map((q, i) => (
            <div key={i} style={{ marginBottom: 20, marginTop: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                {i + 1}. {q}
              </label>
              <textarea
                value={answers[i]}
                onChange={(e) => updateAnswer(i, e.target.value)}
                onPaste={blockPaste}
                required
                rows={5}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, fontWeight: 700, background: "#FF6B00", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            {loading ? "Analizando..." : "Enviar evaluación"}
          </button>
        </form>
      )}
    </main>
  );
}