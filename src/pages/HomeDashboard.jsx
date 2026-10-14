import { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Truck, 
  Fuel, 
  Activity, 
  ChevronRight, 
  FileText,
  Plus,
  Package,
  Scale
} from 'lucide-react';

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_TOTAL = '#95BDFB';
const COLOR_ABERTO = '#FECB65';
const COLOR_EXECUCAO = '#7A55D3';
const COLOR_CONCLUIDO = '#34AC4C';
const COLOR_ALTA = '#FF4D4D';

const MOCK_ACTIVITIES = [
  { id: 1, tipo: 'OS', descricao: 'OS-0128 iniciou manutenção preventiva 250h', equipamento: 'Escavadeira CAT 320', hora: '10:15', status: 'Em Execução', operador: 'João Silva' },
  { id: 2, tipo: 'RDA', descricao: 'Relatório Diário enviado - Rota Coleta Setor 4', equipamento: 'Caminhão Scania G450', hora: '09:40', status: 'Concluído', operador: 'Carlos Santos' },
  { id: 3, tipo: 'OS', descricao: 'OS-0129 cadastrada: vazamento hidráulico', equipamento: 'Carregadeira Volvo L120', hora: '08:50', status: 'Aberto', operador: 'Marcos Lima' },
  { id: 4, tipo: 'Abastecimento', descricao: 'Abastecimento 180L Diesel S10 registrado', equipamento: 'Trator D6T', hora: '08:15', status: 'Concluído', operador: 'Ana Souza' },
  { id: 5, tipo: 'OS', descricao: 'OS-0127 finalizada e liberada para o pátio', equipamento: 'Caminhão Scania G450', hora: '07:30', status: 'Concluído', operador: 'Roberto Mendes' }
];

const MOCK_FLEET_STATUS = [
  { veiculo: 'Escavadeira CAT 320', placa: 'BRA-2041', horimetro: '4.256 h', status: 'Em Manutenção', combustivel: '65%', operador: 'João Silva' },
  { veiculo: 'Carregadeira Volvo L120', placa: 'OXK-8812', horimetro: '1.820 h', status: 'Aguardando OS', combustivel: '40%', operador: 'Carlos Eduardo' },
  { veiculo: 'Caminhão Scania G450', placa: 'PLK-9932', horimetro: '8.900 h', status: 'Operacional', combustivel: '88%', operador: 'Roberto Mendes' },
  { veiculo: 'Trator Caterpillar D6T', placa: 'EQP-5521', horimetro: '3.110 h', status: 'Operacional', combustivel: '92%', operador: 'Ana Souza' },
];

const MOCK_MONTHLY_DATA = [
  { dia: 'Seg', concluidas: 8, abertas: 3 },
  { dia: 'Ter', concluidas: 12, abertas: 5 },
  { dia: 'Qua', concluidas: 10, abertas: 4 },
  { dia: 'Qui', concluidas: 15, abertas: 6 },
  { dia: 'Sex', concluidas: 14, abertas: 2 },
  { dia: 'Sáb', concluidas: 6, abertas: 1 },
  { dia: 'Dom', concluidas: 3, abertas: 1 }
];

const HomeDashboard = ({ 
  onNavigateToOS, 
  onNavigateToRDA, 
  onNavigateToEstoque,
  onNavigateToVeiculos,
  onNavigateToPesagem
}) => {
  const [periodo, setPeriodo] = useState('Hoje');

  const metricCards = useMemo(() => [
    {
      id: 'total',
      titulo: 'Total de OS Ativas',
      valor: '24',
      subtexto: '+3 novas hoje',
      indicador: '+12%',
      positivo: true,
      corDot: COLOR_TOTAL,
      icon: ClipboardList
    },
    {
      id: 'abertas',
      titulo: 'Aguardando Início',
      valor: '7',
      subtexto: '2 com prioridade alta',
      indicador: '-5%',
      positivo: false,
      corDot: COLOR_ABERTO,
      icon: Clock
    },
    {
      id: 'execucao',
      titulo: 'Em Execução',
      valor: '11',
      subtexto: 'Equipes em campo',
      indicador: '+8%',
      positivo: true,
      corDot: COLOR_EXECUCAO,
      icon: Activity
    },
    {
      id: 'concluidas',
      titulo: 'Concluídas no Mês',
      valor: '98',
      subtexto: 'Taxa de eficácia 94%',
      indicador: '+15%',
      positivo: true,
      corDot: COLOR_CONCLUIDO,
      icon: CheckCircle2
    }
  ], []);

  const getStatusBadge = (status) => {
    let cor = COLOR_PRIMARY;
    if (status === 'Em Execução' || status === 'Em Manutenção') cor = COLOR_EXECUCAO;
    if (status === 'Aberto' || status === 'Aguardando OS') cor = COLOR_ABERTO;
    if (status === 'Concluído' || status === 'Operacional') cor = COLOR_CONCLUIDO;

    return {
      backgroundColor: `${cor}18`,
      border: `1px solid ${cor}`,
      color: cor,
      borderRadius: '8px',
      padding: '3px 10px',
      fontSize: '11px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: COLOR_BG_LIGHT, 
      borderRadius: '20px', 
      padding: '16px', 
      boxSizing: 'border-box', 
      display: 'flex', 
      flexDirection: 'column',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Cabeçalho Principal */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        <div style={{ minWidth: '200px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '0 0 2px 0' }}>
            Painel Geral Operacional
          </h1>
          <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>
            Visão consolidada de ordens de serviço, produtividade e frota
          </p>
        </div>

        {/* Controles de Período e Ações Rápidas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            padding: '3px', 
            display: 'flex', 
            alignItems: 'center', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
          }}>
            {['Hoje', 'Semana', 'Mês'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: periodo === p ? COLOR_PRIMARY : 'transparent',
                  color: periodo === p ? '#FFFFFF' : '#64748B',
                  fontWeight: periodo === p ? '700' : '500',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={onNavigateToOS}
            style={{
              backgroundColor: COLOR_PRIMARY,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(35, 129, 253, 0.3)',
              flex: '1 1 auto',
              justifyContent: 'center'
            }}
          >
            <Plus size={15} /> Nova OS
          </button>

          <button
            onClick={onNavigateToRDA}
            style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flex: '1 1 auto',
              justifyContent: 'center'
            }}
          >
            <FileText size={15} /> Novo RDA
          </button>

          <button
            onClick={onNavigateToEstoque}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F1C2C',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              flex: '1 1 auto',
              justifyContent: 'center'
            }}
          >
            <Package size={15} color={COLOR_PRIMARY} /> Almoxarifado
          </button>

          {onNavigateToVeiculos && (
            <button
              onClick={onNavigateToVeiculos}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F1C2C',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontWeight: '700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flex: '1 1 auto',
                justifyContent: 'center'
              }}
            >
              <Truck size={15} color={COLOR_PRIMARY} /> Frota & Veículos
            </button>
          )}

          {onNavigateToPesagem && (
            <button
              onClick={onNavigateToPesagem}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F1C2C',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontWeight: '700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flex: '1 1 auto',
                justifyContent: 'center'
              }}
            >
              <Scale size={15} color={COLOR_PRIMARY} /> Balança
            </button>
          )}
        </div>
      </div>

      {/* Grid de Métricas Principais (Responsivo com minmax seguro para smartphone) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '10px', 
        marginBottom: '16px' 
      }}>
        {metricCards.map((card) => {
          return (
            <div 
              key={card.id}
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '12px', 
                padding: '14px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: card.corDot, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}>
                  <card.icon size={16} color="#0F1C2C" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{card.titulo}</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F1C2C', lineHeight: '1.2' }}>{card.valor}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{card.subtexto}</div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '11px', 
                fontWeight: '700',
                color: card.positivo ? COLOR_CONCLUIDO : COLOR_ALTA,
                backgroundColor: card.positivo ? '#34AC4C15' : '#FF4D4D15',
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                {card.positivo ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.indicador}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Central: Gráficos de Produção & Monitoramento de Frota */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '14px', 
        marginBottom: '16px' 
      }}>
        {/* Painel 1: Produtividade Semanal de OS */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '18px 20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Volume Operacional da Semana
                </h2>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Ordens finalizadas vs abertas por dia</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F1C2C', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLOR_PRIMARY }} /> Concluídas
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLOR_ABERTO }} /> Abertas
                </span>
              </div>
            </div>

            {/* Barras de Desempenho Customizadas */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '10px' }}>
              {MOCK_MONTHLY_DATA.map((item) => {
                const heightConcluidas = Math.min(item.concluidas * 8, 110);
                const heightAbertas = Math.min(item.abertas * 8, 80);

                return (
                  <div key={item.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '110px' }}>
                      <div 
                        title={`Concluídas: ${item.concluidas}`}
                        style={{ 
                          width: '14px', 
                          height: `${heightConcluidas}px`, 
                          backgroundColor: COLOR_PRIMARY, 
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }} 
                      />
                      <div 
                        title={`Abertas: ${item.abertas}`}
                        style={{ 
                          width: '14px', 
                          height: `${heightAbertas}px`, 
                          backgroundColor: COLOR_ABERTO, 
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{item.dia}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid #F1F5F9', 
            paddingTop: '12px', 
            marginTop: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px' 
          }}>
            <span style={{ color: '#64748B' }}>Total da semana: <strong>78 chamados</strong></span>
            <span style={{ color: COLOR_CONCLUIDO, fontWeight: '700' }}>Meta atingida: 104%</span>
          </div>
        </div>

        {/* Painel 2: Indicadores Rápidos de Frota e Manutenção */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '18px 20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Resumo de Frota & Disponibilidade
                </h2>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Status operacional das máquinas ativas</span>
              </div>
              <Truck size={18} color="#64748B" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Operando</span>
                <p style={{ fontSize: '18px', fontWeight: '800', color: COLOR_CONCLUIDO, margin: '2px 0 0 0' }}>82%</p>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>28 máquinas</span>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Paradas/OS</span>
                <p style={{ fontSize: '18px', fontWeight: '800', color: COLOR_ALTA, margin: '2px 0 0 0' }}>12%</p>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>4 máquinas</span>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Standby</span>
                <p style={{ fontSize: '18px', fontWeight: '800', color: COLOR_ABERTO, margin: '2px 0 0 0' }}>6%</p>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>2 máquinas</span>
              </div>
            </div>

            {/* Destaque Alerta */}
            <div style={{ 
              backgroundColor: '#FFF7ED', 
              border: '1px solid #FED7AA', 
              borderRadius: '8px', 
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} color="#EA580C" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#9A3412', lineHeight: '1.4' }}>
                <strong>Atenção preventiva:</strong> 3 veículos atingirão o limite de 250h de horímetro nos próximos 2 dias.
              </div>
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid #F1F5F9', 
            paddingTop: '12px', 
            marginTop: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '12px' 
          }}>
            <span style={{ color: '#64748B' }}>Combustível médio na frota: <strong>72%</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLOR_PRIMARY, fontWeight: '700' }}>
              <Fuel size={14} /> Abastecimento OK
            </span>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Linha do Tempo de Atividades Recentes e Frota */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '14px' 
      }}>
        {/* Atividades Recentes */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '18px 20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
              Últimas Ocorrências & Ações
            </h2>
            <button 
              onClick={onNavigateToOS}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: COLOR_PRIMARY, 
                fontSize: '12px', 
                fontWeight: '700', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_ACTIVITIES.map((act) => (
              <div 
                key={act.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '32px', 
                    borderRadius: '4px',
                    backgroundColor: act.tipo === 'OS' ? COLOR_PRIMARY : act.tipo === 'RDA' ? COLOR_EXECUCAO : COLOR_CONCLUIDO,
                    flexShrink: 0
                  }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F1C2C' }}>{act.descricao}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{act.equipamento} • {act.operador}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{act.hora}</span>
                  <span style={getStatusBadge(act.status)}>{act.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status da Frota */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '18px 20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
              Equipamentos Críticos em Monitoramento
            </h2>
            {onNavigateToVeiculos ? (
              <button 
                onClick={onNavigateToVeiculos}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: COLOR_PRIMARY, 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                Ver frota <ChevronRight size={14} />
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748B' }}>Atualizado há 5 min</span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px', color: '#64748B', fontWeight: '600' }}>Equipamento</th>
                  <th style={{ padding: '8px 6px', color: '#64748B', fontWeight: '600' }}>Horímetro</th>
                  <th style={{ padding: '8px 6px', color: '#64748B', fontWeight: '600' }}>Operador</th>
                  <th style={{ padding: '8px 6px', color: '#64748B', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FLEET_STATUS.map((f, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{f.veiculo}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>Placa: {f.placa}</div>
                    </td>
                    <td style={{ padding: '8px 6px', color: '#334155', fontWeight: '600' }}>{f.horimetro}</td>
                    <td style={{ padding: '8px 6px', color: '#64748B' }}>{f.operador}</td>
                    <td style={{ padding: '8px 6px' }}>
                      <span style={getStatusBadge(f.status)}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
