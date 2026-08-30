// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { DIMENSIONES, DIMENSION_LABELS, TEMPERAMENTOS, TEMPERAMENTO_LABELS } from "@/lib/scoring";

const NAVY = "#0F172A";
const ORANGE = "#FF6B00";
const GRAY = "#64748b";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", marginBottom: 24 }}>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [invitaciones, setInvitaciones] = useState<any[]>([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(true);
  const [error, setError] = useState("");

  const [nombrePerfil, setNombrePerfil] = useState("");
  const [cargoPerfil, setCargoPerfil] = useState("");
  const [minimos, setMinimos] = useState<Record<string, string>>({});
  const [temperamentoPreferido, setTemperamentoPreferido] = useState("");
  const [creandoPerfil, setCreandoPerfil] = useState(false);

  const [perfilInvitacion, setPerfilInvitacion] = useState("");
  const [cargoInvitacion, setCargoInvitacion] = useState("");
  const [creandoInvitacion, setCreandoInvitacion] = useState(false);
  const [ultimoLink, setUltimoLink] = useState("");

  const cargarPerfiles = async () => {
    setLoadingPerfiles(true);
    try {
      const res = await fetch("/api/admin/perfiles");
      const data = await res.json();
      if (data.ok) setPerfiles(data.perfiles);
    } finally {
      setLoadingPerfiles(false);
    }
  };

  const cargarInvitaciones = async () => {
    const res = await fetch("/api/admin/invitaciones");
    const data = await res.json();
    if (data.ok) setInvitaciones(data.invitaciones);
  };

  useEffect(() => {
    cargarPerfiles();
    cargarInvitaciones();
  }, []);

  const handleCrearPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreandoPerfil(true);
    setError("");
    try {
      const res = await fetch("/api/admin/perfiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombrePerfil,
          cargo: cargoPerfil,
          puntajes_minimos: minimos,
          temperamento_preferido: temperamentoPreferido || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "No se pudo crear el perfil.");

      setNombrePerfil("");
      setCargoPerfil("");
      setMinimos({});
      setTemperamentoPreferido("");
      await cargarPerfiles();
    } catch (e: any) {
      setError(e.message || "Error inesperado.");
    } finally {
      setCreandoPerfil(false);
    }
  };

  const handleCrearInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreandoInvitacion(true);
    setError("");
    setUltimoLink("");
    try {
      const res = await fetch("/api/admin/invitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfil_id: perfilInvitacion || null, cargo: cargoInvitacion }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "No se pudo crear la invitación.");

      const link = `${window.location.origin}/?token=${data.invitacion.token}`;
      setUltimoLink(link);
      await cargarInvitaciones();
    } catch (e: any) {
      setError(e.message || "Error inesperado.");
    } finally {
      setCreandoInvitacion(false);
    }
  };

  const copiarLink = (link: string) => {
    navigator.clipboard.writeText(link).catch(() => {});
  };

  return (
    <main style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <img src="/LOGO.png" alt="Gaman Global Consultores" style={{ height: 36 }} />
        <h1 style={{ color: NAVY, fontSize: 22 }}>Panel de administración — Test de Liderazgo</h1>
      </div>
      <a href="/admin" style={{ color: GRAY, fontSize: 13, display: "inline-block", marginBottom: 20 }}>← Volver al panel principal</a>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 6 }}>Crear perfil deseado</h2>
        <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>
          Define el puntaje mínimo aceptable (0-100) solo para las dimensiones que importan a este cargo. Deja en
          blanco las que no apliquen.
        </p>

        <form onSubmit={handleCrearPerfil}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <input
              placeholder="Nombre del perfil (ej. Gerente Comercial)"
              value={nombrePerfil}
              onChange={(e) => setNombrePerfil(e.target.value)}
              required
              style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
            />
            <input
              placeholder="Cargo (opcional)"
              value={cargoPerfil}
              onChange={(e) => setCargoPerfil(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {DIMENSIONES.map((d) => (
              <div key={d}>
                <label style={{ display: "block", fontSize: 12, color: GRAY, marginBottom: 4 }}>{DIMENSION_LABELS[d]}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="—"
                  value={minimos[d] ?? ""}
                  onChange={(e) => setMinimos((prev) => ({ ...prev, [d]: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: GRAY, marginBottom: 4 }}>Temperamento preferido (opcional)</label>
            <select
              value={temperamentoPreferido}
              onChange={(e) => setTemperamentoPreferido(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
            >
              <option value="">Sin preferencia</option>
              {TEMPERAMENTOS.map((t) => (
                <option key={t} value={t}>{TEMPERAMENTO_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creandoPerfil}
            style={{ padding: "12px 24px", fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
          >
            {creandoPerfil ? "Creando..." : "Crear perfil"}
          </button>
        </form>
      </Card>

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 12 }}>Perfiles existentes</h2>
        {loadingPerfiles ? (
          <p style={{ color: GRAY, fontSize: 14 }}>Cargando...</p>
        ) : perfiles.length === 0 ? (
          <p style={{ color: GRAY, fontSize: 14 }}>Aún no has creado ningún perfil.</p>
        ) : (
          perfiles.map((p) => (
            <div key={p.id} style={{ padding: 12, borderRadius: 8, background: "#f8fafc", marginBottom: 8, fontSize: 13 }}>
              <strong style={{ color: NAVY }}>{p.nombre}</strong>
              {p.cargo ? <span style={{ color: GRAY }}> · {p.cargo}</span> : null}
              <div style={{ color: GRAY, marginTop: 4 }}>
                {Object.entries(p.puntajes_minimos || {}).map(([k, v]) => `${DIMENSION_LABELS[k] || k}: ≥${v}`).join(" · ")}
              </div>
            </div>
          ))
        )}
      </Card>

      <Card>
        <h2 style={{ color: NAVY, fontSize: 17, marginBottom: 6 }}>Generar link de invitación</h2>
        <p style={{ color: GRAY, fontSize: 13, marginBottom: 16 }}>
          Cada link es de un solo uso. Si eliges un perfil, el informe que recibas por correo incluirá el % de
          compatibilidad del candidato con ese perfil.
        </p>

        <form onSubmit={handleCrearInvitacion} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            value={perfilInvitacion}
            onChange={(e) => setPerfilInvitacion(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, flex: 1, minWidth: 200 }}
          >
            <option value="">Sin perfil (solo análisis)</option>
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <input
            placeholder="Cargo (opcional, informativo)"
            value={cargoInvitacion}
            onChange={(e) => setCargoInvitacion(e.target.value)}
            style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, flex: 1, minWidth: 200 }}
          />
          <button
            type="submit"
            disabled={creandoInvitacion}
            style={{ padding: "12px 24px", fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
          >
            {creandoInvitacion ? "Generando..." : "Generar link"}
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
              <div>
                <span style={{ color: NAVY, fontWeight: 700 }}>{inv.perfiles_deseados?.nombre || "Sin perfil"}</span>
                {inv.cargo ? <span style={{ color: GRAY }}> · {inv.cargo}</span> : null}
              </div>
              <span style={{ color: inv.usado ? "#16a34a" : GRAY, fontWeight: 700 }}>
                {inv.usado ? "Usado" : "Pendiente"}
              </span>
            </div>
          ))
        )}
      </Card>
    </main>
  );
}
