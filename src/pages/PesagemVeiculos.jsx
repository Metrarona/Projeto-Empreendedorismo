import { useState, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Printer, 
  X, 
  Layers
} from 'lucide-react';
import { 
  TIPOS_RESIDUOS, 
  INITIAL_PESAGENS, 
  INITIAL_VEICULOS 
} from '../data/veiculosData';

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_SUCCESS = '#34AC4C';
const COLOR_WARNING = '#F5C344';

const PesagemVeiculos = ({ onNavigateToVeiculos }) => {
  const [pesagensList, setPesagensList] = useState(INITIAL_PESAGENS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResiduo, setSelectedResiduo] = useState('Todos');
  const [selectedBalanca, setSelectedBalanca] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Modais
  const [isNovaPesagemModalOpen, setIsNovaPesagemModalOpen] = useState(false);
  const [selectedTicketImpressao, setSelectedTicketImpressao] = useState(null);

  // Form Nova Pesagem
  const [novaPesagem, setNovaPesagem] = useState({
    ticket: `TCK-2026-04${INITIAL_PESAGENS.length + 13}`,
    veiculoId: '',
    placa: '',
    veiculoNome: '',
    motorista: '',
    balanca: 'Balança 01 - Aterro Sanitário',
    tipoResiduo: 'RSU - Resíduo Sólido Urbano',
    origem: '',
    pesoBrutoKg: '',
    taraKg: '',
    status: 'Concluída',
    observacoes: ''
  });

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalPesagens = pesagensList.length;
    const pesoLiquidoTotalKg = pesagensList.reduce((acc, p) => acc + (p.pesoLiquidoKg || 0), 0);
    const pesoLiquidoTotalTon = (pesoLiquidoTotalKg / 1000).toFixed(2);
    const mediaPorCargaKg = totalPesagens > 0 ? Math.round(pesoLiquidoTotalKg / totalPesagens) : 0;
    const placasUnicas = new Set(pesagensList.map(p => p.placa)).size;
    const aguardandoSaida = pesagensList.filter(p => p.status === 'Aguardando Tara (Saída)').length;

    return {
      totalPesagens,
      pesoLiquidoTotalKg,
      pesoLiquidoTotalTon,
      mediaPorCargaKg,
      placasUnicas,
      aguardandoSaida
    };
  }, [pesagensList]);

  // Lista Filtrada
  const filteredPesagens = useMemo(() => {
    return pesagensList.filter(p => {
      const matchResiduo = selectedResiduo === 'Todos' || p.tipoResiduo === selectedResiduo;
      const matchBalanca = selectedBalanca === 'Todas' || p.balanca === selectedBalanca;
      const matchStatus = selectedStatus === 'Todos' || p.status === selectedStatus;
      
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        p.ticket.toLowerCase().includes(term) ||
        p.placa.toLowerCase().includes(term) ||
        p.veiculoNome.toLowerCase().includes(term) ||
        p.motorista.toLowerCase().includes(term) ||
        p.origem.toLowerCase().includes(term);

      return matchResiduo && matchBalanca && matchStatus && matchSearch;
    });
  }, [pesagensList, selectedResiduo, selectedBalanca, selectedStatus, searchTerm]);

  // Ao selecionar um veículo no modal, auto-preenche placa, tara e motorista
  const handleSelectVeiculo = (veicId) => {
    const veic = INITIAL_VEICULOS.find(v => v.id === veicId);
    if (veic) {
      setNovaPesagem(prev => ({
        ...prev,
        veiculoId: veic.id,
        placa: veic.placa,
        veiculoNome: `${veic.modelo} (${veic.codigo})`,
        motorista: veic.operador || prev.motorista,
        taraKg: veic.taraKg || prev.taraKg
      }));
    } else {
      setNovaPesagem(prev => ({ ...prev, veiculoId: '' }));
    }
  };

  // Peso líquido calculado no modal em tempo real
  const modalPesoLiquido = useMemo(() => {
    const bruto = parseFloat(novaPesagem.pesoBrutoKg) || 0;
    const tara = parseFloat(novaPesagem.taraKg) || 0;
    return Math.max(0, bruto - tara);
  }, [novaPesagem.pesoBrutoKg, novaPesagem.taraKg]);

  const handleSalvarPesagem = (e) => {
    e.preventDefault();
    if (!novaPesagem.placa || !novaPesagem.pesoBrutoKg) {
      alert('Informe a placa do veículo e o Peso Bruto de entrada.');
      return;
    }

    const bruto = parseFloat(novaPesagem.pesoBrutoKg) || 0;
    const tara = parseFloat(novaPesagem.taraKg) || 0;
    const liquido = Math.max(0, bruto - tara);

    const now = new Date();
    const dataStr = now.toLocaleDateString('pt-BR');
    const horaStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const nova = {
      id: `PES-${Date.now()}`,
      ticket: novaPesagem.ticket || `TCK-2026-04${pesagensList.length + 14}`,
      data: dataStr,
      horaEntrada: horaStr,
      horaSaida: novaPesagem.status === 'Concluída' ? horaStr : '',
      placa: novaPesagem.placa.toUpperCase(),
      veiculoNome: novaPesagem.veiculoNome || novaPesagem.placa,
      motorista: novaPesagem.motorista || 'Motorista Padrão',
      balanca: novaPesagem.balanca,
      tipoResiduo: novaPesagem.tipoResiduo,
      origem: novaPesagem.origem || 'Setor Urbano',
      pesoBrutoKg: bruto,
      taraKg: tara,
      pesoLiquidoKg: liquido,
      status: novaPesagem.status,
      observacoes: novaPesagem.observacoes
    };

    setPesagensList(prev => [nova, ...prev]);
    setIsNovaPesagemModalOpen(false);

    // Abre direto para visualização do ticket
    setSelectedTicketImpressao(nova);

    // Reseta form
    setNovaPesagem({
      ticket: `TCK-2026-04${pesagensList.length + 15}`,
      veiculoId: '',
      placa: '',
      veiculoNome: '',
      motorista: '',
      balanca: 'Balança 01 - Aterro Sanitário',
      tipoResiduo: 'RSU - Resíduo Sólido Urbano',
      origem: '',
      pesoBrutoKg: '',
      taraKg: '',
      status: 'Concluída',
      observacoes: ''
    });
  };

  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: COLOR_BG_LIGHT, 
      borderRadius: '20px', 
      padding: '16px', 
      boxSizing: 'border-box', 
      overflowY: 'auto', 
      WebkitOverflowScrolling: 'touch',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>

      {/* CABEÇALHO */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              backgroundColor: '#0F1C2C', 
              color: '#FFFFFF', 
              padding: '6px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scale size={20} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
              Pesagem de Veículos & Balança
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
            Controle de balança rodoviária, pesagem de cargas, emissão de tickets e relatórios de descargas
          </p>
        </div>

        {/* Botão de Nova Pesagem e Atalho para Frota */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateToVeiculos && (
            <button
              type="button"
              onClick={onNavigateToVeiculos}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                color: '#0F1C2C',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Truck size={15} />
              Ver Frota
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsNovaPesagemModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: COLOR_PRIMARY,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(35, 129, 253, 0.25)'
            }}
          >
            <Plus size={16} />
            Nova Pesagem
          </button>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS DA BALANÇA */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '10px' 
      }}>
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Peso Líquido Total</span>
            <Scale size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.pesoLiquidoTotalTon} t</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>{metrics.pesoLiquidoTotalKg.toLocaleString()} kg hoje</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Total de Pesagens</span>
            <CheckCircle2 size={16} color={COLOR_SUCCESS} />
          </div>
          <span style={{ ...metricValueStyle, color: COLOR_SUCCESS }}>{metrics.totalPesagens}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Viagens registradas</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Média por Carga</span>
            <Layers size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.mediaPorCargaKg.toLocaleString()} kg</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Média de peso líquido</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Veículos Ativos</span>
            <Truck size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.placasUnicas}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Caminhões diferentes</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Aguardando Saída</span>
            <Clock size={16} color={metrics.aguardandoSaida > 0 ? COLOR_WARNING : '#94A3B8'} />
          </div>
          <span style={{ ...metricValueStyle, color: metrics.aguardandoSaida > 0 ? '#B45309' : '#0F1C2C' }}>
            {metrics.aguardandoSaida}
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Em descarga no pátio</span>
        </div>
      </div>

      {/* CHIPS DE TIPOS DE RESÍDUO / CARGA (ROLAGEM HORIZONTAL SUAVE) */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '4px'
      }}>
        {TIPOS_RESIDUOS.map(tipo => {
          const isSelected = selectedResiduo === tipo;

          return (
            <button
              key={tipo}
              type="button"
              onClick={() => setSelectedResiduo(tipo)}
              style={{
                backgroundColor: isSelected ? '#0F1C2C' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#334155',
                border: isSelected ? '1px solid #0F1C2C' : '1px solid #CBD5E1',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: isSelected ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
            >
              {tipo}
            </button>
          );
        })}
      </div>

      {/* BARRA DE FILTROS E PESQUISA */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '10px 14px',
        border: '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flex: '1 1 240px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          padding: '6px 10px',
          border: '1px solid #E2E8F0'
        }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Ticket, Placa, Veículo, Motorista ou Origem..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              color: '#0F1C2C'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} color="#94A3B8" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Balança */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>Balança:</span>
            <select
              value={selectedBalanca}
              onChange={(e) => setSelectedBalanca(e.target.value)}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#0F1C2C',
                outline: 'none',
                fontWeight: '600'
              }}
            >
              <option value="Todas">Todas as Balanças</option>
              <option value="Balança 01 - Aterro Sanitário">Balança 01 - Aterro Sanitário</option>
              <option value="Balança 02 - Estação de Transbordo">Balança 02 - Estação Transbordo</option>
              <option value="Balança 03 - Pátio Operacional Juazeiro">Balança 03 - Pátio Juazeiro</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#0F1C2C',
                outline: 'none',
                fontWeight: '600'
              }}
            >
              <option value="Todos">Todos</option>
              <option value="Concluída">Concluída</option>
              <option value="Aguardando Tara (Saída)">Aguardando Saída</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA DE PESAGENS */}
      {filteredPesagens.length === 0 ? (
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '40px 20px', 
          textAlign: 'center',
          border: '1px solid #CBD5E1',
          color: '#64748B'
        }}>
          <Scale size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#0F1C2C' }}>
            Nenhum registro de pesagem encontrado
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            Verifique os termos de busca ou clique em "+ Nova Pesagem" para emitir uma nova entrada.
          </p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          border: '1px solid #CBD5E1', 
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800' }}>
                <th style={{ padding: '10px 14px' }}>TICKET / DATA</th>
                <th style={{ padding: '10px 14px' }}>PLACA & VEÍCULO</th>
                <th style={{ padding: '10px 14px' }}>TIPO DE CARGA & BALANÇA</th>
                <th style={{ padding: '10px 14px' }}>MOTORISTA</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>BRUTO (KG)</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>TARA (KG)</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>LÍQUIDO (KG)</th>
                <th style={{ padding: '10px 14px' }}>STATUS</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>COMPROVANTE</th>
              </tr>
            </thead>
            <tbody>
              {filteredPesagens.map((p, idx) => (
                <tr 
                  key={p.id}
                  style={{ 
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '800', color: COLOR_PRIMARY, fontFamily: 'monospace' }}>
                      {p.ticket}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {p.data} {p.horaEntrada}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        backgroundColor: '#0F1C2C', 
                        color: '#FFFFFF', 
                        fontFamily: 'monospace', 
                        fontWeight: '800', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {p.placa}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      {p.veiculoNome}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{p.tipoResiduo}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{p.balanca}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>
                    <div style={{ fontWeight: '600' }}>{p.motorista}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{p.origem}</div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B' }}>
                    {p.pesoBrutoKg.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B' }}>
                    {p.taraKg.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ 
                      backgroundColor: '#DCFCE7', 
                      color: '#15803D', 
                      border: '1px solid #86EFAC',
                      padding: '3px 7px',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '12px'
                    }}>
                      +{p.pesoLiquidoKg.toLocaleString()} kg
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      backgroundColor: p.status === 'Concluída' ? '#DCFCE7' : '#FEF3C7',
                      color: p.status === 'Concluída' ? '#15803D' : '#B45309',
                      border: p.status === 'Concluída' ? '1px solid #86EFAC' : '1px solid #FCD34D',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicketImpressao(p)}
                      title="Visualizar Comprovante / Ticket de Pesagem"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#0F1C2C',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Printer size={13} />
                      Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NOVA PESAGEM */}
      {isNovaPesagemModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          backgroundColor: 'rgba(15, 28, 44, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '12px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            <div style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Registrar Pesagem de Veículo</h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Aferição de balança rodoviária de entrada/saída</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNovaPesagemModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarPesagem} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Nº do Ticket</label>
                  <input
                    type="text"
                    value={novaPesagem.ticket}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, ticket: e.target.value })}
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Balança Operacional</label>
                  <select
                    value={novaPesagem.balanca}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, balanca: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Balança 01 - Aterro Sanitário">Balança 01 - Aterro Sanitário</option>
                    <option value="Balança 02 - Estação de Transbordo">Balança 02 - Estação de Transbordo</option>
                    <option value="Balança 03 - Pátio Operacional Juazeiro">Balança 03 - Pátio Juazeiro</option>
                  </select>
                </div>
              </div>

              {/* Seleção de Veículo da Frota */}
              <div>
                <label style={formLabelStyle}>Selecionar Veículo Cadastrado (Opcional - preenche automático)</label>
                <select
                  value={novaPesagem.veiculoId}
                  onChange={(e) => handleSelectVeiculo(e.target.value)}
                  style={formInputStyle}
                >
                  <option value="">Selecione para puxar dados da frota...</option>
                  {INITIAL_VEICULOS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} (Tara: {v.taraKg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={novaPesagem.placa}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, placa: e.target.value.toUpperCase() })}
                    placeholder="Ex: BRA-2041"
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Nome do Motorista</label>
                  <input
                    type="text"
                    value={novaPesagem.motorista}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, motorista: e.target.value })}
                    placeholder="Ex: Carlos Santos"
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Tipo de Carga / Resíduo *</label>
                  <select
                    value={novaPesagem.tipoResiduo}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, tipoResiduo: e.target.value })}
                    style={formInputStyle}
                  >
                    {TIPOS_RESIDUOS.filter(t => t !== 'Todos').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Origem / Setor / Rota</label>
                  <input
                    type="text"
                    value={novaPesagem.origem}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, origem: e.target.value })}
                    placeholder="Ex: Setor 4 - Juazeiro Norte"
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* CARD DE AFERIÇÃO DE PESO */}
              <div style={{ 
                backgroundColor: '#F8FAFC', 
                borderRadius: '12px', 
                padding: '12px', 
                border: '1px solid #CBD5E1',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F1C2C', display: 'block', marginBottom: '8px' }}>
                  AFERIÇÃO DE PESOS DA BALANÇA
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={formLabelStyle}>Peso Bruto (kg) *</label>
                    <input
                      type="number"
                      required
                      value={novaPesagem.pesoBrutoKg}
                      onChange={(e) => setNovaPesagem({ ...novaPesagem, pesoBrutoKg: e.target.value })}
                      placeholder="Ex: 18920"
                      style={{ ...formInputStyle, fontSize: '13px', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Entrada carregado</span>
                  </div>

                  <div>
                    <label style={formLabelStyle}>Tara do Veículo (kg)</label>
                    <input
                      type="number"
                      value={novaPesagem.taraKg}
                      onChange={(e) => setNovaPesagem({ ...novaPesagem, taraKg: e.target.value })}
                      placeholder="Ex: 12450"
                      style={{ ...formInputStyle, fontSize: '13px', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Peso vazio</span>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #86EFAC',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#15803D' }}>PESO LÍQUIDO</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#15803D' }}>
                      {modalPesoLiquido.toLocaleString()} kg
                    </span>
                    <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '600' }}>
                      {(modalPesoLiquido / 1000).toFixed(2)} toneladas
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Observações da Carga</label>
                <textarea
                  rows={2}
                  value={novaPesagem.observacoes}
                  onChange={(e) => setNovaPesagem({ ...novaPesagem, observacoes: e.target.value })}
                  placeholder="Ex: Box de descarga, umidade da carga, lona ou ocorrências..."
                  style={{ ...formInputStyle, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsNovaPesagemModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Concluir & Emitir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPROVANTE / TICKET DE PESAGEM DIGITAL */}
      {selectedTicketImpressao && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          backgroundColor: 'rgba(15, 28, 44, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '12px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            {/* Topo Modal */}
            <div style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>Ticket de Pesagem Rodoviária</span>
              <button
                type="button"
                onClick={() => setSelectedTicketImpressao(null)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Recibo Estilizado (Visual de Ticket Térmico Oficial) */}
            <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#FAFAFA' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px dashed #94A3B8',
                padding: '18px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#0F1C2C',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}>
                {/* Cabeçalho do Ticket */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: '10px' }}>
                  <h2 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '900', letterSpacing: '1px' }}>
                    NIX CORE OPERAÇÕES
                  </h2>
                  <p style={{ margin: 0, fontSize: '10px', color: '#475569' }}>SISTEMA DE GESTÃO E BALANÇA RODOVIÁRIA</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '700' }}>{selectedTicketImpressao.balanca}</p>
                </div>

                {/* Dados da Pesagem */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>TICKET: <strong>{selectedTicketImpressao.ticket}</strong></span>
                  <span>DATA: {selectedTicketImpressao.data}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ENTRADA: {selectedTicketImpressao.horaEntrada}</span>
                  <span>SAÍDA: {selectedTicketImpressao.horaSaida || '--:--'}</span>
                </div>

                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '6px' }}>
                  <div>PLACA: <strong>{selectedTicketImpressao.placa}</strong></div>
                  <div>VEÍCULO: {selectedTicketImpressao.veiculoNome}</div>
                  <div>MOTORISTA: {selectedTicketImpressao.motorista}</div>
                  <div>ORIGEM: {selectedTicketImpressao.origem}</div>
                  <div>RESÍDUO: <strong>{selectedTicketImpressao.tipoResiduo}</strong></div>
                </div>

                {/* Bloco de Pesos */}
                <div style={{
                  backgroundColor: '#F1F5F9',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  margin: '6px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PESO BRUTO:</span>
                    <span>{selectedTicketImpressao.pesoBrutoKg.toLocaleString()} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TARA:</span>
                    <span>{selectedTicketImpressao.taraKg.toLocaleString()} kg</span>
                  </div>
                  <div style={{
                    borderTop: '1px solid #CBD5E1',
                    paddingTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: '900',
                    color: '#15803D'
                  }}>
                    <span>PESO LÍQUIDO:</span>
                    <span>+{selectedTicketImpressao.pesoLiquidoKg.toLocaleString()} kg</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10px', color: '#16A34A', fontWeight: '700' }}>
                    ({(selectedTicketImpressao.pesoLiquidoKg / 1000).toFixed(2)} toneladas)
                  </div>
                </div>

                {selectedTicketImpressao.observacoes && (
                  <div style={{ fontSize: '10px', color: '#475569' }}>
                    OBS: {selectedTicketImpressao.observacoes}
                  </div>
                )}

                {/* Código de Barras / Rodapé */}
                <div style={{ textAlign: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ letterSpacing: '4px', fontSize: '16px', fontWeight: '900' }}>
                    ||||| | |||| ||| ||||||| | ||||
                  </div>
                  <span style={{ fontSize: '9px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    AUTENTICAÇÃO DIGITAL: {selectedTicketImpressao.ticket}-NC99
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rodapé */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedTicketImpressao(null)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Enviando ticket para impressão na balança...');
                  setSelectedTicketImpressao(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0F1C2C',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} />
                Imprimir Comprovante
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Estilos de Métricas e Formulários
const metricCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '12px 14px',
  border: '1px solid #CBD5E1',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const metricLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748B'
};

const metricValueStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: '#0F1C2C'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '4px'
};

const formInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#F8FAFC',
  fontSize: '12px',
  boxSizing: 'border-box',
  outline: 'none',
  color: '#0F1C2C'
};

export default PesagemVeiculos;
