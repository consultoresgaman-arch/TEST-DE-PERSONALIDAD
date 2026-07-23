'use client';
import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    puesto: '',
    respuestas: {}
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResultado(data);
      setStep(2);
    } catch (error) {
      alert('Hubo un error al procesar el análisis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1B2A38', textAlign: 'center' }}>Evaluación Ejecutiva C-Level</h1>
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
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Analizando perfil...' : 'Generar Informe Ejecutivo'}
          </button>
        </form>
      ) : (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2>Informe Generado para {formData.nombre}</h2>
          <p><strong>Empresa:</strong> {formData.empresa} ({formData.puesto})</p>
          <div style={{ background: '#F8F9FA', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(resultado, null, 2)}</pre>
          </div>
          <button onClick={() => setStep(1)} style={{ marginTop: '20px', padding: '10px 20px', background: '#1B2A38', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Volver
          </button>
        </div>
      )}
    </main>
  );
}