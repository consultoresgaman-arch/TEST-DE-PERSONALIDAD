import fs from "fs";
import path from "path";
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import {
  DIMENSIONES,
  DIMENSION_LABELS,
  NIVEL_LABELS,
  TEMPERAMENTO_LABELS,
  type Puntajes,
  type Alerta,
  type NivelLiderazgo,
  type AnalisisCualitativo,
  type ResultadoCompatibilidad,
} from "./scoring";

const COLOR_NAVY = "#0F172A";
const COLOR_ORANGE = "#FF6B00";
const COLOR_GRAY = "#64748b";
const COLOR_BORDER = "#e2e8f0";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: COLOR_NAVY, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 90, height: 70, objectFit: "contain" },
  headerMeta: { textAlign: "right" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4, color: COLOR_NAVY },
  subtitle: { fontSize: 10, color: COLOR_GRAY, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: COLOR_NAVY, marginTop: 18, marginBottom: 8, borderBottom: `2px solid ${COLOR_ORANGE}`, paddingBottom: 4 },
  infoBox: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, marginBottom: 6 },
  infoItem: { width: "50%", marginBottom: 6 },
  infoLabel: { fontSize: 8, color: COLOR_GRAY, textTransform: "uppercase" },
  infoValue: { fontSize: 11, fontWeight: 700, color: COLOR_NAVY },
  levelBox: { backgroundColor: COLOR_NAVY, borderRadius: 8, padding: 16, marginBottom: 10 },
  levelLabel: { color: "#cbd5e1", fontSize: 9, marginBottom: 4 },
  levelValue: { color: "#ffffff", fontSize: 16, fontWeight: 700 },
  levelIndex: { color: COLOR_ORANGE, fontSize: 11, marginTop: 4 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barLabel: { width: 190, fontSize: 9, color: COLOR_NAVY },
  barTrack: { flex: 1, height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: COLOR_ORANGE, borderRadius: 4 },
  barValue: { width: 30, textAlign: "right", fontSize: 9, color: COLOR_GRAY },
  alertBox: { borderLeft: `3px solid #ef4444`, backgroundColor: "#fef2f2", padding: 10, borderRadius: 4, marginBottom: 8 },
  alertBoxMedia: { borderLeft: `3px solid #f59e0b`, backgroundColor: "#fffbeb", padding: 10, borderRadius: 4, marginBottom: 8 },
  alertTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  alertText: { fontSize: 9, color: "#334155", lineHeight: 1.4 },
  paragraph: { fontSize: 9.5, lineHeight: 1.6, color: "#1e293b", marginBottom: 4 },
  resumenBox: { backgroundColor: "#fff7ed", borderLeft: `3px solid ${COLOR_ORANGE}`, padding: 14, borderRadius: 6, marginBottom: 10 },
  resumenTitle: { fontSize: 10, fontWeight: 700, color: COLOR_NAVY, marginBottom: 6, textTransform: "uppercase" },
  disclaimer: { fontSize: 7.5, color: COLOR_GRAY, marginTop: 24, borderTop: `1px solid ${COLOR_BORDER}`, paddingTop: 8, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7.5, color: COLOR_GRAY, textAlign: "center", borderTop: `1px solid ${COLOR_BORDER}`, paddingTop: 6 },
});

export interface ReporteData {
  nombre: string;
  correo?: string;
  cargo: string;
  fecha: string;
  puntajes: Puntajes;
  nivel: NivelLiderazgo;
  indice: number;
  alertas: Alerta[];
  indiceDeseabilidadSocial: number;
  analisisIA: string;
  resumenEjecutivo: string;
  cualitativo: AnalisisCualitativo;
  compatibilidad?: ResultadoCompatibilidad | null;
}

function Barra({ label, valor }: { label: string; valor: number }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${valor}%` }]} />
      </View>
      <Text style={styles.barValue}>{valor}</Text>
    </View>
  );
}

let logoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (logoDataUri) return logoDataUri;
  const logoPath = path.join(process.cwd(), "public", "LOGO.png");
  const buffer = fs.readFileSync(logoPath);
  logoDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
  return logoDataUri;
}

function ReportePDF({ data }: { data: ReporteData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src={getLogoDataUri()} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={{ fontSize: 8, color: COLOR_GRAY }}>Informe confidencial</Text>
            <Text style={{ fontSize: 8, color: COLOR_GRAY }}>{data.fecha}</Text>
          </View>
        </View>

        <Text style={styles.title}>Informe de Evaluación Ejecutiva y de Liderazgo</Text>
        <Text style={styles.subtitle}>Gaman Global Consultores — Documento de uso interno / RR.HH.</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Candidato</Text>
            <Text style={styles.infoValue}>{data.nombre}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cargo evaluado</Text>
            <Text style={styles.infoValue}>{data.cargo}</Text>
          </View>
          {data.correo ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{data.correo}</Text>
            </View>
          ) : null}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fecha de evaluación</Text>
            <Text style={styles.infoValue}>{data.fecha}</Text>
          </View>
        </View>

        <View style={styles.levelBox}>
          <Text style={styles.levelLabel}>Clasificación de nivel de liderazgo (borrador metodológico)</Text>
          <Text style={styles.levelValue}>{NIVEL_LABELS[data.nivel]}</Text>
          <Text style={styles.levelIndex}>Índice compuesto: {data.indice} / 100</Text>
        </View>

        {!!data.resumenEjecutivo && (
          <View style={styles.resumenBox}>
            <Text style={styles.resumenTitle}>Resumen ejecutivo</Text>
            <Text style={styles.paragraph}>{data.resumenEjecutivo}</Text>
          </View>
        )}

        {data.compatibilidad && (
          <>
            <Text style={styles.sectionTitle}>Compatibilidad con el perfil buscado</Text>
            <View style={styles.levelBox}>
              <Text style={styles.levelLabel}>% de compatibilidad (umbrales mínimos por dimensión)</Text>
              <Text style={styles.levelValue}>{data.compatibilidad.porcentaje}%</Text>
              {data.compatibilidad.temperamentoCoincide !== null && (
                <Text style={styles.levelIndex}>
                  Temperamento {data.compatibilidad.temperamentoCoincide ? "coincide" : "no coincide"} con el
                  preferido para el cargo
                </Text>
              )}
            </View>
            {data.compatibilidad.detalle.map((d) => (
              <View key={d.dimension} style={styles.barRow}>
                <Text style={styles.barLabel}>{DIMENSION_LABELS[d.dimension]}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${d.obtenido}%`, backgroundColor: d.cumple ? COLOR_ORANGE : "#ef4444" }]} />
                </View>
                <Text style={styles.barValue}>{d.obtenido} / ≥{d.minimo}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Perfil por dimensión</Text>
        {DIMENSIONES.map((d) => (
          <Barra key={d} label={DIMENSION_LABELS[d]} valor={data.puntajes[d]} />
        ))}

        {data.alertas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Alertas a considerar</Text>
            {data.alertas.map((a, i) => (
              <View key={i} style={a.severidad === "alta" ? styles.alertBox : styles.alertBoxMedia}>
                <Text style={styles.alertTitle}>
                  {a.tipo.replace(/_/g, " ").toUpperCase()} — severidad {a.severidad}
                </Text>
                <Text style={styles.alertText}>{a.descripcion}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Deseabilidad social / consistencia de respuestas</Text>
        <Text style={styles.paragraph}>
          Índice heurístico de posible respuesta idealizada: {data.indiceDeseabilidadSocial} / 100.{" "}
          {data.indiceDeseabilidadSocial >= 50
            ? "Se recomienda contrastar en entrevista conductual, dado un patrón de respuestas con baja auto-revelación negativa o alta uniformidad."
            : "No se observan señales relevantes de respuesta idealizada."}
        </Text>

        <Text style={styles.sectionTitle}>Temperamento dominante</Text>
        <Text style={styles.paragraph}>
          {TEMPERAMENTO_LABELS[data.cualitativo.temperamento.dominante]}
        </Text>
        <Text style={styles.paragraph}>{data.cualitativo.temperamento.justificacion}</Text>

        {data.cualitativo.miedosNucleares.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Miedos nucleares</Text>
            {data.cualitativo.miedosNucleares.map((m, i) => (
              <Text key={i} style={styles.paragraph}>• {m}</Text>
            ))}
          </>
        )}

        {data.cualitativo.patronesRepetitivos && (
          <>
            <Text style={styles.sectionTitle}>Patrones repetitivos / bucles</Text>
            {data.cualitativo.patronesRepetitivos.split("\n").filter(Boolean).map((line, i) => (
              <Text key={i} style={styles.paragraph}>{line}</Text>
            ))}
          </>
        )}

        {data.cualitativo.patronesCognitivosSensoriales && (
          <>
            <Text style={styles.sectionTitle}>Observaciones cognitivas y sensoriales</Text>
            <Text style={styles.paragraph}>{data.cualitativo.patronesCognitivosSensoriales}</Text>
            <Text style={[styles.paragraph, { fontSize: 8, color: COLOR_GRAY, fontStyle: "italic" }]}>
              Nota: observación puramente descriptiva, sin valor diagnóstico. No constituye ni sugiere una
              condición clínica, discapacidad o trastorno.
            </Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Análisis clínico y ejecutivo</Text>
        {data.analisisIA.split("\n").filter(Boolean).map((line, i) => (
          <Text key={i} style={styles.paragraph}>{line}</Text>
        ))}

        <Text style={styles.disclaimer}>
          Este informe fue generado con apoyo de inteligencia artificial sobre respuestas cualitativas
          autorreportadas por el candidato, complementado con un modelo de puntuación (baremos) en fase
          de calibración por Gaman Global Consultores. No constituye un diagnóstico clínico ni un
          instrumento psicométrico validado de forma independiente; debe usarse como insumo de apoyo a
          la decisión humana en el proceso de selección, junto con entrevistas y verificación de
          referencias. Los datos personales y sensibles contenidos en este documento se tratan conforme
          a la Ley N.º 19.628 sobre Protección de la Vida Privada. Distribución restringida.
        </Text>

        <Text style={styles.footer} fixed>
          Gaman Global Consultores · Informe generado automáticamente · Confidencial
        </Text>
      </Page>
    </Document>
  );
}

export async function generarReportePDF(data: ReporteData): Promise<Buffer> {
  return renderToBuffer(<ReportePDF data={data} />);
}
