import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, cargo, respuestas } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Falta configurar la llave GEMINI_API_KEY en Vercel." }, { status: 500 });
    }

    const prompt = `Actúa como un psicólogo experto en selección ejecutiva. Analiza las respuestas de este candidato para el cargo de ${cargo}.
Nombre del candidato: ${nombre}

Respuestas a la evaluación:
${respuestas.map((r: string, i: number) => `Pregunta ${i + 1}: ${r || "Sin respuesta"}`).join("\n")}

Por favor, proporciona un informe psicológico y ejecutivo detallado sobre su perfil de liderazgo, fortalezas y puntos de atención bajo presión.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: data.error?.message || "Error al conectar con Google Gemini." }, { status: 500 });
    }

    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!analysis) {
      return NextResponse.json({ ok: false, error: "La inteligencia artificial no devolvió texto de respuesta." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}