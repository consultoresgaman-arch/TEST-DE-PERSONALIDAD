'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    puesto: '',
    token: '',
    respuestas: {
      pregunta1: '',
      pregunta2: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  useEffect(() => {
    const tokenUrl = searchParams.get('token') || '';
    setToken(tokenUrl);
    setFormData(prev => ({ ...prev, token: tokenUrl }));
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRespuestaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      respuestas: {
        ...formData.respuestas,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMensaje(null);

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMensaje(data.error || 'Ocurrió un error');
        setLoading(false);
        return;
      }

      setResultado(data);
      setStep(2);
    } catch (error) {
      setErrorMensaje('Hubo un error al procesar el envío.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1B2A38', textAlign: 'center' }}>Evaluación Ejecutiva y de Liderazgo</h1>

      {errorMensaje && (
        <div style={{ background: '#F8D7DA', color: '#721C24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #F5C6CB', textAlign: 'center', fontWeight: 'bold' }}>
          {errorMensaje}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleAnalyze} style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Nombre Completo:</label>
            <input type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Empresa:</label>
            <input type="text" name="empresa" required value={formData.empresa} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Puesto Actual:</label>
            <input type="text" name="puesto" required value={formData.puesto} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

          <h3 style={{ color: '#1B2A38', marginBottom: '15px' }}>Preguntas de Evaluación</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>1. ¿Cómo manejas una situación de alta presión con tu equipo?</label>
            <input type="text" name="pregunta1" required value={formData.respuestas.pregunta1} onChange={handleRespuestaChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>2. ¿Cuál consideras que es tu mayor pilar de liderazgo?</label>
            <input type="text" name="pregunta2" required value={formData.respuestas.pregunta2} onChange={handleRespuestaChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Guardando evaluación...' : 'Enviar Evaluación'}
          </button>
        </form>
      ) : (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h2 style={{ color: '#28A745' }}>¡Evaluación enviada con éxito!</h2>
          <p style={{ marginTop: '10px', color: '#555' }}>Gracias por completar el proceso, {formData.nombre}. Tus respuestas han sido registradas de forma segura.</p>
        </div>
      )}
    </main>
  );
}