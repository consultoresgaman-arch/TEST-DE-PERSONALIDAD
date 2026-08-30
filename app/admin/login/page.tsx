// @ts-nocheck
"use client";

import { useState } from "react";

const NAVY = "#0F172A";
const ORANGE = "#FF6B00";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "No se pudo iniciar sesión.");
      }
      window.location.href = "/admin";
    } catch (e: any) {
      setError(e.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          maxWidth: 380,
          width: "100%",
        }}
      >
        <img src="/LOGO.png" alt="Gaman Global Consultores" style={{ height: 40, marginBottom: 20 }} />
        <h1 style={{ color: NAVY, fontSize: 20, marginBottom: 20 }}>Panel de administración</h1>

        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 14, borderRadius: 8, border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: 15, marginBottom: 16 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 14, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 }}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
