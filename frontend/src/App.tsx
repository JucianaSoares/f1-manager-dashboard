import { useEffect, useState } from 'react';
import type { Piloto, Equipe } from './types/piloto';

export default function App() {
  const [pilotos, setPilotos] = useState<Piloto[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'pilotos' | 'equipes'>('pilotos');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const [resPilotos, resEquipes] = await Promise.all([
       fetch('https://f1-manager-dashboard.onrender.com/pilotos'),
       fetch('https://f1-manager-dashboard.onrender.com/equipes')
 ]);

        if (!resPilotos.ok || !resEquipes.ok) {
          throw new Error('Não foi possível carregar os dados da API.');
        }

        const dadosPilotos = await resPilotos.json();
        const dadosEquipes = await resEquipes.json();

        setPilotos(dadosPilotos);
        setEquipes(dadosEquipes);
        setCarregando(false);
      } catch (err: any) {
        setErro(err.message || 'Erro desconhecido');
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: '#e10600', margin: '0 0 10px 0' }}>🏎️ F1 Manager Dashboard</h1>
        <p style={{ color: '#aaa', margin: 0 }}>Gerencie pilotos e equipes conectados à minha API Fastify.</p>
      </header>

      {/* Botões de Navegação entre Abas */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setAbaAtiva('pilotos')}
          style={{
            padding: '10px 20px',
            background: abaAtiva === 'pilotos' ? '#e10600' : '#222',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Pilotos ({pilotos.length})
        </button>
        <button 
          onClick={() => setAbaAtiva('equipes')}
          style={{
            padding: '10px 20px',
            background: abaAtiva === 'equipes' ? '#00d2be' : '#222',
            color: abaAtiva === 'equipes' ? '#000' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Equipes ({equipes.length})
        </button>
      </div>

      {carregando && <p style={{ textAlign: 'center' }}>Carregando dados...</p>}
      {erro && <p style={{ color: '#ff6b6b', textAlign: 'center' }}><strong>Erro:</strong> {erro}</p>}

      {/* Aba de Pilotos */}
      {!carregando && !erro && abaAtiva === 'pilotos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {pilotos.map((piloto) => (
            <div 
              key={piloto.id} 
              style={{ 
                border: '1px solid #333', 
                borderRadius: '8px', 
                padding: '16px', 
                background: '#1e1e1e',
                borderLeft: '4px solid #e10600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{piloto.nome}</h3>
              <p style={{ margin: '4px 0', color: '#ccc' }}><strong>Equipe:</strong> {piloto.equipe}</p>
              <p style={{ margin: '4px 0', color: '#ccc' }}><strong>País:</strong> {piloto.pais}</p>
            </div>
          ))}
        </div>
      )}

      {/* Aba de Equipes */}
      {!carregando && !erro && abaAtiva === 'equipes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {equipes.map((equipe) => (
            <div 
              key={equipe.id} 
              style={{ 
                border: '1px solid #333', 
                borderRadius: '8px', 
                padding: '16px', 
                background: '#1e1e1e',
                borderLeft: '4px solid #00d2be',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{equipe.nome}</h3>
              <p style={{ margin: '4px 0', color: '#ccc' }}><strong>Base:</strong> {equipe.base}</p>
              <p style={{ margin: '4px 0', color: '#ccc' }}><strong>Motor:</strong> {equipe.motor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
