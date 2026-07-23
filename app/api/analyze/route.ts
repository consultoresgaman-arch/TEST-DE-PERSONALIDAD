import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nombre, empresa, puesto } = data;

    // Estructura del informe ejecutivo optimizado para la evaluación
    const analysisResult = {
      titulo: "Evaluación Ejecutiva C-Level",
      perfil: {
        nombre,
        empresa,
        puesto,
        liderazgo: "Transformacional con alta orientación a la eficiencia operativa y gestión de equipos.",
        tomaDeDecisiones: "Basada en análisis crítico y mitigación de riesgos bajo presión.",
        competenciasClave: [
          "Comunicación directiva y alineación estratégica",
          "Gestión de relaciones y clima organizacional",
          "Resolución de conflictos complejos"
        ],
        recomendaciones: [
          "Fortalecer los espacios de retroalimentación estructurada con mandos medios.",
          "Establecer métricas de seguimiento claras para mantener la cohesión del equipo."
        ]
      },
      fecha: new Date().toLocaleDateString()
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar el análisis' }, { status: 500 });
  }
}