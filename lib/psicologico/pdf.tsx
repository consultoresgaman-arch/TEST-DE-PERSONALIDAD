import fs from "fs";
import path from "path";
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { TEMPERAMENTO_LABELS, TEMPERAMENTO_DISCLAIMER, type Temperamento } from "../scoring";
import type { ResultadoEscala } from "./escalas";

const COLOR_NAVY = "#0F172A";
const COLOR_BLUE = "#0ea5e9";
const COLOR_GRAY = "#64748b";
const COLOR_BORDER = "#e2e8f0";
const COLOR_RED = "#dc2626";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLOR_NAVY, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 90, height: 70, objectFit: "contain" },
  headerMeta: { textAlign: "right" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4, color: COLOR_NAVY },
  subtitle: { fontSize: 10, color: COLOR_GRAY, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: COLOR_NAVY, marginTop: 18, marginBottom: 8, borderBottom: `2px solid ${COLOR_BLUE}`, paddingBottom: 4 },
  infoBox: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, marginBottom: 6 },
  infoItem: { width: "50%", marginBottom: 6 },
  infoLabel: { fontSize: 8, color: COLOR_GRAY, textTransform: "uppercase" },
  infoValue: { fontSize: 11, fontWeight: 700, color: COLOR_NAVY },
  crisisBox: { backgroundColor: "#fef2f2", border: `2px solid ${COLOR_RED}`, borderRadius: 8, padding: 14, marginBottom: 16 },
  crisisTitle: { fontSize: 12, fontWeight: 700, color: COLOR_RED, marginBottom: 6 },
  crisisText: { fontSize: 9.5, color: "#7f1d1d", lineHeight: 1.5 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barLabel: { width: 220, fontSize: 9, color: COLOR_NAVY },
  barTrack: { flex: 1, height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: COLOR_BLUE, borderRadius: 4 },
  barValue: { width: 130, textAlign: "right", fontSize: 8.5, color: COLOR_GRAY },
  paragraph: { fontSize: 9.5, lineHeight: 1.6, color: "#1e293b", marginBottom: 4 },
  bullet: { fontSize: 9.5, lineHeight: 1.6, color: "#1e293b", marginBottom: 4 },
  hipotesisBox: { backgroundColor: "#f0f9ff", borderLeft: `3px solid ${COLOR_BLUE}`, padding: 10, borderRadius: 4, marginBottom: 8 },
  hipotesisTexto: { fontSize: 9.5, color: "#0c4a6e", lineHeight: 1.5, marginBottom: 4 },
  hipotesisPregunta: { fontSize: 9, color: COLOR_GRAY, fontStyle: "italic", lineHeight: 1.4 },
  notaMetodologica: { fontSize: 8, color: COLOR_GRAY, fontStyle: "italic", lineHeight: 1.4, marginTop: 4, marginBottom: 6 },
  protectorBox: { backgroundColor: "#f0fdf4", borderLeft: "3px solid #16a34a", padding: 8, borderRadius: 4, marginBottom: 6 },
  protectorTexto: { fontSize: 9.5, color: "#14532d", lineHeight: 1.5 },
  disclaimer: { fontSize: 7.5, color: COLOR_GRAY, marginTop: 24, borderTop: `1px solid ${COLOR_BORDER}`, paddingTop: 8, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7.5, color: COLOR_GRAY, textAlign: "center", borderTop: `1px solid ${COLOR_BORDER}`, paddingTop: 6 },
});

export interface ReporteClinicoData {
  nombre: string;
  correo?: string;
  motivoConsulta: string;
  fecha: string;
  escalas: ResultadoEscala[];
  riesgoDetectado: boolean;
  riesgoDetalle: string[];
  miedosNucleares: string[];
  patronesRepetitivos: string;
  temperamento: { dominante: Temperamento; justificacion: string };
  observacionesSomaticas: string;
  factoresProtectores: string[];
  eventoIndicePCL5?: string;
  puntosAtencionClinica: string[];
  hipotesisClinicas: { hipotesis: string; pregunta_sesion: string }[];
  resumenClinico: string;
}

let logoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (logoDataUri) return logoDataUri;
  const logoPath = path.join(process.cwd(), "public", "LOGO.png");
  const buffer = fs.readFileSync(logoPath);
  logoDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
  return logoDataUri;
}

function Barra({ label, valor, maximo, nivel }: { label: string; valor: number; maximo: number; nivel: string }) {
  const pct = maximo > 0 ? Math.min(100, (valor / maximo) * 100) : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.barValue}>{valor}/{maximo} · {nivel}</Text>
    </View>
  );
}

function ReporteClinicoPDF({ data }: { data: ReporteClinicoData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={getLogoDataUri()} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={{ fontSize: 8, color: COLOR_GRAY }}>Ficha clínica confidencial</Text>
            <Text style={{ fontSize: 8, color: COLOR_GRAY }}>{data.fecha}</Text>
          </View>
        </View>

        <Text style={styles.title}>Informe de Intake Clínico</Text>
        <Text style={styles.subtitle}>Documento de uso exclusivo del profesional tratante — dato de salud sensible</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Paciente</Text>
            <Text style={styles.infoValue}>{data.nombre}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{data.fecha}</Text>
          </View>
          <View style={{ width: "100%" }}>
            <Text style={styles.infoLabel}>Motivo de consulta</Text>
            <Text style={styles.infoValue}>{data.motivoConsulta}</Text>
          </View>
        </View>

        {data.riesgoDetectado && (
          <View style={styles.crisisBox}>
            <Text style={styles.crisisTitle}>⚠ ALERTA DE RIESGO DETECTADA</Text>
            <Text style={styles.crisisText}>
              El paciente marcó presencia de ideación de muerte/autolesión en el ítem 9 del PHQ-9 y/o se detectaron
              expresiones de riesgo en sus respuestas abiertas. Requiere evaluación de riesgo suicida inmediata por
              el profesional tratante.
            </Text>
            {data.riesgoDetalle.length > 0 && (
              <Text style={[styles.crisisText, { marginTop: 6 }]}>
                Expresiones detectadas en el texto: {data.riesgoDetalle.join(", ")}
              </Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Instrumentos de tamizaje validados</Text>
        {!!data.eventoIndicePCL5 && (
          <Text style={styles.notaMetodologica}>
            Evento de referencia identificado por el paciente para el PCL-5 (LEC-5): "{data.eventoIndicePCL5}"
          </Text>
        )}
        {data.escalas.map((e) => (
          <Barra key={e.id} label={e.nombre} valor={e.puntaje} maximo={e.puntajeMaximo} nivel={e.nivel} />
        ))}

        <Text style={styles.sectionTitle}>Temperamento (marco narrativo, no validado)</Text>
        <Text style={styles.paragraph}>{TEMPERAMENTO_LABELS[data.temperamento.dominante]}</Text>
        <Text style={styles.paragraph}>{data.temperamento.justificacion}</Text>
        <Text style={styles.notaMetodologica}>{TEMPERAMENTO_DISCLAIMER}</Text>

        {data.factoresProtectores.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Factores protectores</Text>
            {data.factoresProtectores.map((f, i) => (
              <View key={i} style={styles.protectorBox}>
                <Text style={styles.protectorTexto}>• {f}</Text>
              </View>
            ))}
          </>
        )}

        {data.miedosNucleares.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Miedos nucleares</Text>
            {data.miedosNucleares.map((m, i) => (
              <Text key={i} style={styles.bullet}>• {m}</Text>
            ))}
          </>
        )}

        {!!data.patronesRepetitivos && (
          <>
            <Text style={styles.sectionTitle}>Patrones repetitivos / bucles</Text>
            {data.patronesRepetitivos.split("\n").filter(Boolean).map((line, i) => (
              <Text key={i} style={styles.paragraph}>{line}</Text>
            ))}
          </>
        )}

        {!!data.observacionesSomaticas && (
          <>
            <Text style={styles.sectionTitle}>Observaciones somáticas</Text>
            <Text style={styles.paragraph}>{data.observacionesSomaticas}</Text>
          </>
        )}

        {data.puntosAtencionClinica.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Puntos de atención sugeridos para próximas sesiones</Text>
            {data.puntosAtencionClinica.map((p, i) => (
              <Text key={i} style={styles.bullet}>• {p}</Text>
            ))}
          </>
        )}

        {data.hipotesisClinicas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Hipótesis clínicas de trabajo (no diagnósticas)</Text>
            {data.hipotesisClinicas.map((h, i) => (
              <View key={i} style={styles.hipotesisBox}>
                <Text style={styles.hipotesisTexto}>{h.hipotesis}</Text>
                <Text style={styles.hipotesisPregunta}>Para contrastar en sesión: {h.pregunta_sesion}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Resumen de intake</Text>
        {data.resumenClinico.split("\n").filter(Boolean).map((line, i) => (
          <Text key={i} style={styles.paragraph}>{line}</Text>
        ))}

        <Text style={styles.disclaimer}>
          Este documento es un insumo de organización de información de intake, generado con apoyo de inteligencia
          artificial, y NO constituye un diagnóstico clínico. El sistema tiene prohibido emitir términos
          diagnósticos formales; cualquier diagnóstico es responsabilidad exclusiva del profesional tratante en
          base a su propio juicio clínico, entrevista y los instrumentos validados aquí incluidos. Los puntajes de
          tamizaje son orientativos, no diagnósticos por sí solos. Este documento contiene datos de salud sensibles
          y se trata conforme a la Ley N.º 19.628 y la Ley N.º 20.584 sobre derechos y deberes de los pacientes.
          Distribución estrictamente restringida al equipo tratante.
        </Text>

        <Text style={styles.footer} fixed>
          Ficha clínica confidencial · Generada automáticamente · Uso exclusivo profesional
        </Text>
      </Page>
    </Document>
  );
}

export async function generarReporteClinicoPDF(data: ReporteClinicoData): Promise<Buffer> {
  return renderToBuffer(<ReporteClinicoPDF data={data} />);
}
