import { NextResponse } from 'next/server';

// Lista temporal para guardar los códigos que ya respondieron (luego lo pasaremos a una base de datos definitiva)
const codigosUsados = new Set<string>();

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { token } = data; // El código único del participante

        // Verificamos si ya usó este enlace
        if (token && codigosUsados.has(token)) {
            return NextResponse.json(
                { error: 'Este enlace ya ha sido utilizado anteriormente y no puede volver a responderse.' }, 
                { status: 400 }
            );
        }

        // Si es la primera vez, guardamos el código como usado
        if (token) {
            codigosUsados.add(token);
        }

        // Aquí continúa tu proceso normal de guardado
        return NextResponse.json({
            success: true,
            message: 'Informe y datos guardados de forma segura en el servidor.'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error al guardar la información' }, { status: 500 });
    }
}