// @ts-nocheck
"use client";

const NAVY = "#0F172A";
const ORANGE = "#FF6B00";
const GRAY = "#64748b";

function OpcionCard({ href, titulo, descripcion, color }: { href: string; titulo: string; descripcion: string; color: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        background: "#fff",
        padding: 28,
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        border: "1px solid #e2e8f0",
        textDecoration: "none",
        borderTop: `4px solid ${color}`,
      }}
    >
      <h2 style={{ color: NAVY, fontSize: 18, marginBottom: 8 }}>{titulo}</h2>
      <p style={{ color: GRAY, fontSize: 14, lineHeight: 1.5, margin: 0 }}>{descripcion}</p>
    </a>
  );
}

export default function AdminHubPage() {
  return (
    <main
      style={{
        padding: "40px 20px",
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <img src="/LOGO.png" alt="Gaman Global" style={{ height: 40 }} />
        <h1 style={{ color: NAVY, fontSize: 22 }}>Panel de administración</h1>
      </div>
      <p style={{ color: GRAY, fontSize: 14, marginBottom: 28 }}>Elige qué sistema quieres administrar.</p>

      <div style={{ display: "grid", gap: 20 }}>
        <OpcionCard
          href="/admin/liderazgo"
          titulo="Test de Liderazgo"
          descripcion="Evaluación ejecutiva para candidatos: perfiles de cargo, compatibilidad, y links de invitación para procesos de selección."
          color={ORANGE}
        />
        <OpcionCard
          href="/admin/psicologico"
          titulo="Test Psicológico"
          descripcion="Intake clínico para pacientes: historia de vida, estado emocional, tamizajes validados (PHQ-9, GAD-7, PCL-5, ASRS, AQ-10) y links de invitación de un solo uso, para uso exclusivo en consulta."
          color="#0ea5e9"
        />
      </div>
    </main>
  );
}
