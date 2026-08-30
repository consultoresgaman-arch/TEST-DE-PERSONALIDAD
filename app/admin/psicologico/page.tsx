// @ts-nocheck
"use client";

import { useEffect, useState } from "react";

const NAVY = "#0F172A";
const BLUE = "#0ea5e9";
const GRAY = "#64748b";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", marginBottom: 24 }}>
      {children}
    </div>
  );
}

export default function AdminPsicologicoPage() {
  const [invitaciones, setInvitaciones] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [creando, setCreando] = useState(false);
  const [ultimoLink, setUltimoLink] = useState("");

  const cargarInvitaciones = async () => {
    const res = await fetch("/api/admin/psicologico/invitaciones");
    const data = await res.json();
    if (data.ok) setInvitaciones(data.invitaciones);
  };

  const cargarEvaluaciones = async () => {
    const res = await fetch("/api/admin/psicologico/evaluaciones");
    const data = await res.json();
    if (data.ok) setEvaluaciones(data.evaluaciones);
  };

  useEffect(() => {
    cargarInvitaciones();
    cargarEvaluaciones();
  }, []);

  const evaluacionesConRiesgo = evaluaciones.filter((e) => e.riesgo_detectado);

  const handleCrearInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setError("");
    setUltimoLink("");
    try {
      const res = await fetch("/api/admin/psicologico/invitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo_consulta: motivoConsulta }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "No se pudo crear la invitación.");

      const link = `${window.location.origin}/psicologico?token=${data.invitacion.token}`;
      setUltimoLink(link);
      setMotivoConsulta("");
      await cargarInvitaciones();
    } catch (e: any) {
      setError(e.message || "Error inesperado.");
    } finally {
      setCreando(false);
    }
  };

  const copiarLink = (link: string) => {
    navigator.clipboard.writeText(link).catch(() => {});
  };

  return (
    <main style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <img src="/LOGO.png" alt="Gaman Global" style={{ height: 36 }} />
        <h1 style={{ color: NAVY, fontSize: 22 }}>Panel de administración — Test Psicológico</h1>
      </div>
      <a href="/admin" style={{ color: GRAY, fontSize: 13, display: "inline-block", marginBottom: 20 }}>← Volver al panel principal</a>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#1e40af" }}>
        Este intake está diseñado para aplicarse en consulta, con el profesional presente. El paciente nunca ve su
        resultado en pantalla; el informe completo llega solo a tu correo, junto con una alerta separada e
        inmediata si se detecta riesgo de autolesión.
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {evaluacionesConRiesgo.length > 0 && (
        <div style={{ background: "#fef2f2", border: "2px solid #dc2626", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ color: "#dc2626", fontSize: 16, marginBottom: 4 }}>⚠ Alertas de riesgo activas</h2>
          <p style={{ color: "#7f1d1d", fontSize: 13, marginBottom: 12 }}>
            Respaldo independiente del correo — revisa esto si sospechas que una alerta pudo no llegar a tu bandeja.
          </p>
          {evaluacionesConRiesgo.map((e) => (
            <div key={e.id} style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
              <strong style={{ color: NAVY }}>{e.pacientes?.nombre || "Sin nombre"}</strong>
              <span style={{ color: GRAY }}> · {e.pacientes?.correo}</span>
              <div style={{ color: GRAY, fontSize: 12, marginTop: 4 }}>
                {new Date(e.created_at).toLocaleString("es-CL")}
                {e.riesgo_detalle?.length > 0 ? ` · Expresiones detectadas: ${e.riesgo_detalle.join(", ")}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 6 }}>Generar link de intake</h2>
        <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>
          Cada link es de un solo uso. Opcionalmente puedes anotar el motivo de consulta para tu propia referencia.
        </p>

        <form onSubmit={handleCrearInvitacion} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            placeholder="Motivo de consulta (opcional)"
            value={motivoConsulta}
            onChange={(e) => setMotivoConsulta(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, flex: 1, minWidth: 240 }}
          />
          <button
            type="submit"
            disabled={creando}
            style={{ padding: "12px 24px", fontWeight: 700, background: BLUE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
          >
            {creando ? "Generando..." : "Generar link"}
          </button>
        </form>

        {ultimoLink && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <code style={{ fontSize: 13, wordBreak: "break-all" }}>{ultimoLink}</code>
            <button
              onClick={() => copiarLink(ultimoLink)}
              style={{ padding: "8px 14px", background: NAVY, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" }}
            >
              Copiar
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 12 }}>Invitaciones recientes</h2>
        {invitaciones.length === 0 ? (
          <p style={{ color: GRAY, fontSize: 14 }}>Aún no has generado ninguna invitación.</p>
        ) : (
          invitaciones.map((inv) => (
            <div key={inv.id} style={{ padding: 12, borderRadius: 8, background: "#f8fafc", marginBottom: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: NAVY }}>{inv.motivo_consulta || "Sin motivo anotado"}</span>
              <span style={{ color: inv.usado ? "#16a34a" : GRAY, fontWeight: 700 }}>
                {inv.usado ? "Usado" : "Pendiente"}
              </span>
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 6 }}>Evaluaciones recientes</h2>
        <p style={{ color: GRAY, fontSize: 13, marginBottom: 12 }}>
          Vista de respaldo independiente del correo — el detalle completo de cada evaluación solo está en el PDF
          enviado, no aquí.
        </p>
        {evaluaciones.length === 0 ? (
          <p style={{ color: GRAY, fontSize: 14 }}>Aún no hay evaluaciones registradas.</p>
        ) : (
          evaluaciones.map((e) => (
            <div key={e.id} style={{ padding: 12, borderRadius: 8, background: "#f8fafc", marginBottom: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ color: NAVY, fontWeight: 700 }}>{e.pacientes?.nombre || "Sin nombre"}</span>
                <span style={{ color: GRAY }}> · {new Date(e.created_at).toLocaleDateString("es-CL")}</span>
              </div>
              <span style={{ color: e.riesgo_detectado ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                {e.riesgo_detectado ? "⚠ Riesgo" : "Sin riesgo"}
              </span>
            </div>
          ))
        )}
      </Card>
    </main>
  );
}
