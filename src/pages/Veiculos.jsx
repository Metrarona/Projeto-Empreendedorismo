import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Truck, 
  History, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Fuel, 
  Wrench, 
  Calendar, 
  User, 
  Gauge, 
  X, 
  Eye, 
  Scale, 
  ClipboardList,
  Filter,
  Check,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { 
  CATEGORIAS_VEICULOS, 
  INITIAL_VEICULOS, 
  INITIAL_HISTORICO 
} from '../data/veiculosData';

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_OPERACIONAL = '#34AC4C';
const COLOR_MANUTENCAO = '#7A55D3';
const COLOR_AGUARDANDO = '#F5C344';
const COLOR_CRITICO = '#FF4D4D';

const Veiculos = ({ initialTab = 'veiculos', onNavigateToOS, onNavigateToPesagem }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'veiculos' | 'historico'
  const [veiculosList, setVeiculosList] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_veiculos_list');
      return saved ? JSON.parse(saved) : INITIAL_VEICULOS;
    } catch {
      return INITIAL_VEICULOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sustentare_veiculos_list', JSON.stringify(veiculosList));
    } catch (e) {
      console.error(e);
    }
  }, [veiculosList]);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('sustentare_veiculos_list');
        if (saved) setVeiculosList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [historicoList, setHistoricoList] = useState(INITIAL_HISTORICO);
  
  // Filtros de Veículos
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  // Fecha o menu flutuante ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    };
    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  // Filtros de Histórico
  const [historicoTipo, setHistoricoTipo] = useState('Todos'); // 'Todos' | 'OS' | 'RDA' | 'Pesagem' | 'Abastecimento'
  const [historicoVeiculoFilter, setHistoricoVeiculoFilter] = useState('Todos');
  const [historicoSearch, setHistoricoSearch] = useState('');
  const [isHistoricoFilterMenuOpen, setIsHistoricoFilterMenuOpen] = useState(false);
  const historicoFilterMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historicoFilterMenuRef.current && !historicoFilterMenuRef.current.contains(event.target)) {
        setIsHistoricoFilterMenuOpen(false);
      }
    };
    if (isHistoricoFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isHistoricoFilterMenuOpen]);

  // Modais
  const [selectedVeiculoDetalhes, setSelectedVeiculoDetalhes] = useState(null);
  const [isNovoVeiculoModalOpen, setIsNovoVeiculoModalOpen] = useState(false);
  const [isNovaOcorrenciaModalOpen, setIsNovaOcorrenciaModalOpen] = useState(false);

  // Form Novo Veículo
  const [novoVeiculo, setNovoVeiculo] = useState({
    codigo: '',
    placa: '',
    modelo: '',
    categoria: 'Caminhões Compactadores',
    tipoUso: '',
    ano: '2024',
    horimetro: '0 h',
    kmAtual: '0 km',
    combustivel: 100,
    status: 'Operacional',
    operador: '',
    taraKg: 12000,
    proximaRevisaoH: 250,
    oficinaPadrao: '014 - Oficina Mecânica Juazeiro',
    observacoes: ''
  });

  // Form Nova Ocorrência de Histórico
  const [novaOcorrencia, setNovaOcorrencia] = useState({
    veiculoId: '',
    tipo: 'OS',
    titulo: '',
    horimetroOuKm: '',
    responsavel: '',
    detalhes: '',
    status: 'Concluído'
  });

  // Métricas de Frota
  const metrics = useMemo(() => {
    const total = veiculosList.length;
    const operacional = veiculosList.filter(v => v.status === 'Operacional').length;
    const manutencao = veiculosList.filter(v => v.status === 'Em Manutenção').length;
    const aguardando = veiculosList.filter(v => v.status === 'Aguardando OS').length;
    const standby = veiculosList.filter(v => v.status === 'Standby / Reserva').length;
    const taxaDisponibilidade = total > 0 ? Math.round(((operacional + standby) / total) * 100) : 0;
    
    return { total, operacional, manutencao, aguardando, standby, taxaDisponibilidade };
  }, [veiculosList]);

  // Contagem por Categoria
  const contagemPorCategoria = useMemo(() => {
    const counts = { Todos: veiculosList.length };
    CATEGORIAS_VEICULOS.forEach(cat => {
      if (cat !== 'Todos') {
        counts[cat] = veiculosList.filter(v => v.categoria === cat).length;
      }
    });
    return counts;
  }, [veiculosList]);

  // Lista Filtrada de Veículos
  const filteredVeiculos = useMemo(() => {
    return veiculosList.filter(v => {
      const matchCat = selectedCategoria === 'Todos' || v.categoria === selectedCategoria;
      const matchStatus = selectedStatus === 'Todos' || v.status === selectedStatus;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        v.modelo.toLowerCase().includes(term) || 
        v.placa.toLowerCase().includes(term) || 
        v.codigo.toLowerCase().includes(term) ||
        v.operador.toLowerCase().includes(term) ||
        v.categoria.toLowerCase().includes(term);

      return matchCat && matchStatus && matchSearch;
    });
  }, [veiculosList, selectedCategoria, selectedStatus, searchTerm]);

  // Lista Filtrada de Histórico
  const filteredHistorico = useMemo(() => {
    return historicoList.filter(h => {
      const matchTipo = historicoTipo === 'Todos' || h.tipo === historicoTipo;
      const matchVeic = historicoVeiculoFilter === 'Todos' || h.veiculoId === historicoVeiculoFilter;
      const term = historicoSearch.toLowerCase().trim();
      const matchSearch = !term || 
        h.titulo.toLowerCase().includes(term) || 
        h.placa.toLowerCase().includes(term) || 
        h.veiculoNome.toLowerCase().includes(term) || 
        h.responsavel.toLowerCase().includes(term) ||
        h.detalhes.toLowerCase().includes(term);

      return matchTipo && matchVeic && matchSearch;
    });
  }, [historicoList, historicoTipo, historicoVeiculoFilter, historicoSearch]);

  const getStatusBadgeStyle = (status) => {
    let bg = '#E2E8F0';
    let text = '#0F1C2C';
    let border = '#CBD5E1';

    if (status === 'Operacional') {
      bg = '#DCFCE7';
      text = '#15803D';
      border = '#86EFAC';
    } else if (status === 'Em Manutenção') {
      bg = '#F3E8FF';
      text = '#7E22CE';
      border = '#D8B4FE';
    } else if (status === 'Aguardando OS') {
      bg = '#FEF3C7';
      text = '#B45309';
      border = '#FCD34D';
    } else if (status === 'Standby / Reserva') {
      bg = '#F1F5F9';
      text = '#475569';
      border = '#CBD5E1';
    }

    return {
      backgroundColor: bg,
      color: text,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      padding: '3px 8px',
      fontSize: '11px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
  };

  const handleSalvarNovoVeiculo = (e) => {
    e.preventDefault();
    if (!novoVeiculo.placa || !novoVeiculo.modelo) {
      alert('Por favor, informe ao menos a Placa e o Modelo do veículo.');
      return;
    }

    const id = `VEIC-00${veiculosList.length + 1}`;
    const item = {
      ...novoVeiculo,
      id,
      taraKg: parseFloat(novoVeiculo.taraKg) || 10000,
      horimetroNum: parseFloat(String(novoVeiculo.horimetro).replace(/[^\d.]/g, '')) || 0,
      kmNum: parseFloat(String(novoVeiculo.kmAtual).replace(/[^\d.]/g, '')) || 0
    };

    setVeiculosList(prev => [item, ...prev]);

    // Registro automático de histórico
    const logInicial = {
      id: `HIST-${Date.now()}`,
      veiculoId: id,
      placa: item.placa,
      veiculoNome: `${item.modelo} (${item.codigo})`,
      tipo: 'OS',
      titulo: 'Cadastro Inicial e Inspeção de Entrada na Frota',
      data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horimetroOuKm: `${item.horimetro} / ${item.kmAtual}`,
      responsavel: 'Gestão de Frotas Nix Core',
      detalhes: `Veículo integrado à categoria ${item.categoria}. Tara cadastrada: ${item.taraKg} kg.`,
      status: 'Concluído',
      badgeCor: COLOR_OPERACIONAL
    };

    setHistoricoList(prev => [logInicial, ...prev]);
    setIsNovoVeiculoModalOpen(false);
    setNovoVeiculo({
      codigo: '',
      placa: '',
      modelo: '',
      categoria: 'Caminhões Compactadores',
      tipoUso: '',
      ano: '2024',
      horimetro: '0 h',
      kmAtual: '0 km',
      combustivel: 100,
      status: 'Operacional',
      operador: '',
      taraKg: 12000,
      proximaRevisaoH: 250,
      oficinaPadrao: '014 - Oficina Mecânica Juazeiro',
      observacoes: ''
    });
  };

  const handleSalvarNovaOcorrencia = (e) => {
    e.preventDefault();
    if (!novaOcorrencia.veiculoId || !novaOcorrencia.titulo) {
      alert('Selecione o veículo e preencha o título da ocorrência.');
      return;
    }

    const veic = veiculosList.find(v => v.id === novaOcorrencia.veiculoId);
    if (!veic) return;

    let badgeCor = COLOR_PRIMARY;
    if (novaOcorrencia.tipo === 'OS') badgeCor = COLOR_MANUTENCAO;
    if (novaOcorrencia.tipo === 'RDA') badgeCor = COLOR_OPERACIONAL;
    if (novaOcorrencia.tipo === 'Pesagem') badgeCor = COLOR_PRIMARY;
    if (novaOcorrencia.tipo === 'Abastecimento') badgeCor = COLOR_AGUARDANDO;

    const itemHist = {
      id: `HIST-${Date.now()}`,
      veiculoId: veic.id,
      placa: veic.placa,
      veiculoNome: `${veic.modelo} (${veic.codigo})`,
      tipo: novaOcorrencia.tipo,
      titulo: novaOcorrencia.titulo,
      data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horimetroOuKm: novaOcorrencia.horimetroOuKm || veic.horimetro,
      responsavel: novaOcorrencia.responsavel || 'Operador',
      detalhes: novaOcorrencia.detalhes,
      status: novaOcorrencia.status,
      badgeCor
    };

    setHistoricoList(prev => [itemHist, ...prev]);
    setIsNovaOcorrenciaModalOpen(false);
    setNovaOcorrencia({
      veiculoId: '',
      tipo: 'OS',
      titulo: '',
      horimetroOuKm: '',
      responsavel: '',
      detalhes: '',
      status: 'Concluído'
    });
  };

  const abrirHistoricoDoVeiculo = (veic) => {
    setHistoricoVeiculoFilter(veic.id);
    setActiveTab('historico');
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
      height: '100%',
      maxHeight: '100%',
      minHeight: 0,
      minWidth: 0,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>

      {/* CABEÇALHO PRINCIPAL COM ABAS */}
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
              <Truck size={20} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
              Gestão de Frota & Histórico
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
            Controle de veículos, máquinas pesadas, categorias operacionais e histórico integrado
          </p>
        </div>

        {/* Alternador de Abas Principais e Botão de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '10px', 
            padding: '4px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('veiculos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'veiculos' ? '#0F1C2C' : 'transparent',
                color: activeTab === 'veiculos' ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Truck size={15} />
              Frota de Veículos ({veiculosList.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('historico');
                setHistoricoVeiculoFilter('Todos');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'historico' ? '#0F1C2C' : 'transparent',
                color: activeTab === 'historico' ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <History size={15} />
              Histórico Operacional ({historicoList.length})
            </button>
          </div>

          {activeTab === 'veiculos' ? (
            <button
              type="button"
              onClick={() => setIsNovoVeiculoModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: COLOR_PRIMARY,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(35, 129, 253, 0.25)'
              }}
            >
              <Plus size={16} />
              Novo Veículo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNovaOcorrenciaModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: COLOR_PRIMARY,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(35, 129, 253, 0.25)'
              }}
            >
              <Plus size={16} />
              Nova Ocorrência
            </button>
          )}
        </div>
      </div>

      {/* CARDS DE MÉTRICAS DA FROTA */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '10px' 
      }}>
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Total da Frota</span>
            <Truck size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.total}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Veículos cadastrados</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Operando</span>
            <CheckCircle2 size={16} color={COLOR_OPERACIONAL} />
          </div>
          <span style={{ ...metricValueStyle, color: COLOR_OPERACIONAL }}>{metrics.operacional}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Em rotas ativas</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Em Manutenção</span>
            <Wrench size={16} color={COLOR_MANUTENCAO} />
          </div>
          <span style={{ ...metricValueStyle, color: COLOR_MANUTENCAO }}>{metrics.manutencao}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Oficina e serviços</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Aguardando OS</span>
            <Clock size={16} color={COLOR_AGUARDANDO} />
          </div>
          <span style={{ ...metricValueStyle, color: '#B45309' }}>{metrics.aguardando}</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Fila para reparo</span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Disponibilidade</span>
            <Gauge size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.taxaDisponibilidade}%</span>
          <span style={{ fontSize: '11px', color: COLOR_OPERACIONAL, fontWeight: '700' }}>Frota operacional</span>
        </div>
      </div>

      {/* ABA 1: FROTA DE VEÍCULOS */}
      {activeTab === 'veiculos' && (
        <>
          {/* BARRA DE PESQUISA, FILTROS FLUTUANTES E CONTROLES (100% RESPONSIVA) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '10px 14px',
            border: '1px solid #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Campo de Busca */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                flex: '1 1 200px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '7px 12px',
                border: '1px solid #E2E8F0'
              }}>
                <Search size={16} color="#94A3B8" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por placa, modelo, código, operador..."
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

              {/* Botões de Ação: Ícone com Menu Flutuante + Alternador de Visualização */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* ÍCONE DE FILTRO COM MENU FLUTUANTE */}
                <div style={{ position: 'relative' }} ref={filterMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    title="Filtrar por Categoria e Status"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: (selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') ? '#0F1C2C' : '#FFFFFF',
                      color: (selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') ? '#FFFFFF' : '#0F1C2C',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <Filter size={15} color={(selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') ? '#FFFFFF' : '#0F1C2C'} />
                    <span>Filtrar</span>
                    {(selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') && (
                      <span style={{
                        backgroundColor: '#2381FD',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '1px 6px',
                        fontSize: '10px',
                        fontWeight: '800'
                      }}>
                        {(selectedCategoria !== 'Todos' ? 1 : 0) + (selectedStatus !== 'Todos' ? 1 : 0)}
                      </span>
                    )}
                    <ChevronDown size={14} style={{ opacity: 0.7 }} />
                  </button>

                  {/* MENU FLUTUANTE DE FILTROS (100% RESPONSIVO COM BACKDROP) */}
                  {isFilterMenuOpen && (
                    <>
                      {/* Backdrop que fecha o menu ao tocar fora */}
                      <div 
                        onClick={() => setIsFilterMenuOpen(false)}
                        style={{
                          position: 'fixed',
                          inset: 0,
                          backgroundColor: 'rgba(15, 28, 44, 0.5)',
                          backdropFilter: 'blur(3px)',
                          WebkitBackdropFilter: 'blur(3px)',
                          zIndex: 999
                        }}
                      />

                      {/* Modal / Popover Flutuante Centralizado e Responsivo */}
                      <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(15, 28, 44, 0.4), 0 0 0 1px rgba(15, 28, 44, 0.1)',
                        border: '1px solid #CBD5E1',
                        width: 'min(420px, calc(100vw - 28px))',
                        maxHeight: 'min(580px, calc(100dvh - 36px))',
                        zIndex: 1000,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        overflowY: 'auto',
                        boxSizing: 'border-box'
                      }}>
                        {/* Cabeçalho do Menu Flutuante */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ backgroundColor: '#EFF6FF', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Filter size={16} color={COLOR_PRIMARY} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F1C2C' }}>
                                Filtros da Frota
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                Categorias e status operacional
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {(selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategoria('Todos');
                                  setSelectedStatus('Todos');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#EF4444',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                <RotateCcw size={12} /> Limpar
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setIsFilterMenuOpen(false)}
                              aria-label="Fechar filtros"
                              style={{
                                border: 'none',
                                background: '#F1F5F9',
                                color: '#64748B',
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Grupo: Status Operacional */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                            Status do Veículo
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '5px' }}>
                            {['Todos', 'Operacional', 'Em Manutenção', 'Aguardando OS', 'Standby / Reserva'].map(st => {
                              const isSel = selectedStatus === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setSelectedStatus(st)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '7px 9px',
                                    borderRadius: '8px',
                                    border: isSel ? '1px solid #0F1C2C' : '1px solid #E2E8F0',
                                    backgroundColor: isSel ? '#0F1C2C' : '#F8FAFC',
                                    color: isSel ? '#FFFFFF' : '#334155',
                                    fontSize: '11px',
                                    fontWeight: isSel ? '700' : '500',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{st}</span>
                                  {isSel && <Check size={13} color="#FFFFFF" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Grupo: Categorias da Plataforma */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                            Categorias da Frota
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                            {CATEGORIAS_VEICULOS.map(cat => {
                              const isSel = selectedCategoria === cat;
                              const count = contagemPorCategoria[cat] || 0;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setSelectedCategoria(cat)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '7px 10px',
                                    borderRadius: '8px',
                                    border: isSel ? '1px solid #2381FD' : '1px solid #F1F5F9',
                                    backgroundColor: isSel ? '#EFF6FF' : '#FAFAFA',
                                    color: isSel ? '#1E40AF' : '#334155',
                                    fontSize: '12px',
                                    fontWeight: isSel ? '700' : '500',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.15s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    {isSel ? <Check size={14} color="#2381FD" /> : <div style={{ width: '14px' }} />}
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{cat}</span>
                                  </div>
                                  <span style={{
                                    backgroundColor: isSel ? '#2381FD' : '#E2E8F0',
                                    color: isSel ? '#FFFFFF' : '#475569',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    marginLeft: '6px',
                                    flexShrink: 0
                                  }}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Botão Aplicar / Concluir */}
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategoria('Todos');
                              setSelectedStatus('Todos');
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                              padding: '10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Limpar Filtros
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFilterMenuOpen(false)}
                            style={{
                              flex: 2,
                              backgroundColor: '#0F1C2C',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={14} /> Aplicar Filtros ({filteredVeiculos.length} veículos)
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Alternador de Visualização Cards vs Tabela */}
                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    title="Visualização em Cards"
                    style={{
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: viewMode === 'cards' ? '#0F1C2C' : 'transparent',
                      color: viewMode === 'cards' ? '#FFFFFF' : '#64748B',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    title="Visualização em Tabela"
                    style={{
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: viewMode === 'table' ? '#0F1C2C' : 'transparent',
                      color: viewMode === 'table' ? '#FFFFFF' : '#64748B',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}
                  >
                    Tabela
                  </button>
                </div>
              </div>
            </div>

            {/* Badges de Filtros Ativos (Exibidos apenas quando houver filtros aplicados) */}
            {(selectedCategoria !== 'Todos' || selectedStatus !== 'Todos') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Filtros ativos:</span>
                
                {selectedCategoria !== 'Todos' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#0F1C2C',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    <span>{selectedCategoria}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoria('Todos')}
                      style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {selectedStatus !== 'Todos' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#2381FD',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    <span>Status: {selectedStatus}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStatus('Todos')}
                      style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoria('Todos');
                    setSelectedStatus('Todos');
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>

          {/* LISTAGEM DOS VEÍCULOS */}
          {filteredVeiculos.length === 0 ? (
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '40px 20px', 
              textAlign: 'center',
              border: '1px solid #CBD5E1',
              color: '#64748B'
            }}>
              <Truck size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#0F1C2C' }}>
                Nenhum veículo encontrado
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                Tente ajustar os filtros de categoria, status ou os termos de pesquisa.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
              gap: '12px' 
            }}>
              {filteredVeiculos.map(v => (
                <div 
                  key={v.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    padding: '14px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Linha Superior: Placa e Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          backgroundColor: '#0F1C2C', 
                          color: '#FFFFFF', 
                          fontFamily: 'monospace', 
                          fontSize: '12px', 
                          fontWeight: '800', 
                          padding: '3px 7px', 
                          borderRadius: '6px',
                          letterSpacing: '0.5px'
                        }}>
                          {v.placa}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                          #{v.codigo}
                        </span>
                      </div>
                      <span style={getStatusBadgeStyle(v.status)}>
                        {v.status}
                      </span>
                    </div>

                    {/* Modelo & Categoria */}
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F1C2C', margin: '4px 0 2px 0' }}>
                      {v.modelo}
                    </h3>
                    <span style={{ 
                      fontSize: '11px', 
                      color: COLOR_PRIMARY, 
                      fontWeight: '700',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}>
                      {v.categoria}
                    </span>

                    {/* Métricas do Veículo */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '6px', 
                      backgroundColor: '#F8FAFC', 
                      padding: '8px 10px', 
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '11px'
                    }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block' }}>Horímetro / KM:</span>
                        <span style={{ fontWeight: '700', color: '#0F1C2C' }}>{v.horimetro}</span>
                        <span style={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>{v.kmAtual}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block' }}>Tara Balança:</span>
                        <span style={{ fontWeight: '700', color: '#0F1C2C' }}>{v.taraKg.toLocaleString()} kg</span>
                        <span style={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>Ano: {v.ano}</span>
                      </div>
                    </div>

                    {/* Combustível & Operador */}
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Fuel size={12} color={COLOR_PRIMARY} /> Diesel
                        </span>
                        <span style={{ fontWeight: '700', color: '#0F1C2C' }}>{v.combustivel}%</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${v.combustivel}%`, 
                          height: '100%', 
                          backgroundColor: v.combustivel > 50 ? COLOR_OPERACIONAL : v.combustivel > 25 ? COLOR_AGUARDANDO : COLOR_CRITICO,
                          borderRadius: '3px'
                        }} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        <User size={12} color="#94A3B8" />
                        <span>Operador: <strong>{v.operador || 'Não atribuído'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Card */}
                  <div style={{ 
                    borderTop: '1px solid #E2E8F0', 
                    paddingTop: '8px', 
                    display: 'flex', 
                    gap: '6px', 
                    marginTop: '4px' 
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedVeiculoDetalhes(v)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        backgroundColor: '#F1F5F9',
                        color: '#0F1C2C',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={13} />
                      Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirHistoricoDoVeiculo(v)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        backgroundColor: '#0F1C2C',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <History size={13} />
                      Histórico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABELA DE VEÍCULOS */
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '12px', 
              border: '1px solid #CBD5E1', 
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '720px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800' }}>
                    <th style={{ padding: '10px 14px' }}>PLACA / CÓDIGO</th>
                    <th style={{ padding: '10px 14px' }}>MODELO & CATEGORIA</th>
                    <th style={{ padding: '10px 14px' }}>STATUS</th>
                    <th style={{ padding: '10px 14px' }}>HORÍMETRO / KM</th>
                    <th style={{ padding: '10px 14px' }}>TARA (KG)</th>
                    <th style={{ padding: '10px 14px' }}>OPERADOR ATUAL</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVeiculos.map((v, idx) => (
                    <tr 
                      key={v.id}
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                      }}
                    >
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          backgroundColor: '#0F1C2C', 
                          color: '#FFFFFF', 
                          fontFamily: 'monospace', 
                          fontWeight: '800', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          marginRight: '6px'
                        }}>
                          {v.placa}
                        </span>
                        <span style={{ color: '#64748B', fontWeight: '700' }}>#{v.codigo}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{v.modelo}</div>
                        <div style={{ fontSize: '11px', color: COLOR_PRIMARY }}>{v.categoria}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={getStatusBadgeStyle(v.status)}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{v.horimetro}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>{v.kmAtual}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F1C2C' }}>
                        {v.taraKg.toLocaleString()} kg
                      </td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>
                        {v.operador || 'Não atribuído'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedVeiculoDetalhes(v)}
                            title="Ver Detalhes do Veículo"
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              color: '#0F1C2C'
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirHistoricoDoVeiculo(v)}
                            title="Histórico deste Veículo"
                            style={{
                              border: 'none',
                              backgroundColor: '#0F1C2C',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              color: '#FFFFFF'
                            }}
                          >
                            <History size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ABA 2: HISTÓRICO INTEGRADO */}
      {activeTab === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* BARRA DE FILTROS DO HISTÓRICO */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Busca rápida no histórico */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '7px 12px',
                border: '1px solid #CBD5E1',
                flex: '1 1 200px'
              }}>
                <Search size={15} color="#94A3B8" />
                <input
                  type="text"
                  value={historicoSearch}
                  onChange={(e) => setHistoricoSearch(e.target.value)}
                  placeholder="Buscar no histórico por placa, título, responsável..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '12px',
                    width: '100%',
                    color: '#0F1C2C'
                  }}
                />
                {historicoSearch && (
                  <button
                    type="button"
                    onClick={() => setHistoricoSearch('')}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} color="#94A3B8" />
                  </button>
                )}
              </div>

              {/* Ícone com Menu Flutuante para Filtrar Histórico */}
              <div style={{ position: 'relative' }} ref={historicoFilterMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsHistoricoFilterMenuOpen(!isHistoricoFilterMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: (historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') ? '#0F1C2C' : '#FFFFFF',
                    color: (historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') ? '#FFFFFF' : '#0F1C2C',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <Filter size={15} color={(historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') ? '#FFFFFF' : '#0F1C2C'} />
                  <span>Filtrar</span>
                  {(historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') && (
                    <span style={{
                      backgroundColor: '#2381FD',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}>
                      {(historicoTipo !== 'Todos' ? 1 : 0) + (historicoVeiculoFilter !== 'Todos' ? 1 : 0)}
                    </span>
                  )}
                  <ChevronDown size={14} style={{ opacity: 0.7 }} />
                </button>

                {/* Menu Flutuante do Histórico (100% Responsivo com Backdrop) */}
                {isHistoricoFilterMenuOpen && (
                  <>
                    <div 
                      onClick={() => setIsHistoricoFilterMenuOpen(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(15, 28, 44, 0.5)',
                        backdropFilter: 'blur(3px)',
                        WebkitBackdropFilter: 'blur(3px)',
                        zIndex: 999
                      }}
                    />

                    <div style={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(15, 28, 44, 0.4), 0 0 0 1px rgba(15, 28, 44, 0.1)',
                      border: '1px solid #CBD5E1',
                      width: 'min(380px, calc(100vw - 28px))',
                      maxHeight: 'min(560px, calc(100dvh - 36px))',
                      zIndex: 1000,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      overflowY: 'auto',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ backgroundColor: '#EFF6FF', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Filter size={16} color={COLOR_PRIMARY} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F1C2C' }}>
                              Filtros do Histórico
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Tipo de evento e veículo
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {(historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') && (
                            <button
                              type="button"
                              onClick={() => {
                                setHistoricoTipo('Todos');
                                setHistoricoVeiculoFilter('Todos');
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#EF4444',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: '4px 8px'
                              }}
                            >
                              <RotateCcw size={12} /> Limpar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsHistoricoFilterMenuOpen(false)}
                            aria-label="Fechar filtros"
                            style={{
                              border: 'none',
                              background: '#F1F5F9',
                              color: '#64748B',
                              borderRadius: '8px',
                              padding: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Filtro por Tipo */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                          Tipo de Registro
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {['Todos', 'OS', 'RDA', 'Pesagem', 'Abastecimento'].map(t => {
                            const isSel = historicoTipo === t;
                            const label = t === 'Todos' ? 'Todos os Registros' : t === 'OS' ? 'Ordens de Serviço (OS)' : t === 'RDA' ? 'Relatórios Diários (RDA)' : t === 'Pesagem' ? 'Pesagens de Balança' : 'Abastecimentos';
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setHistoricoTipo(t)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  border: isSel ? '1px solid #2381FD' : '1px solid #F1F5F9',
                                  backgroundColor: isSel ? '#EFF6FF' : '#FAFAFA',
                                  color: isSel ? '#1E40AF' : '#334155',
                                  fontSize: '12px',
                                  fontWeight: isSel ? '700' : '500',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <span>{label}</span>
                                {isSel && <Check size={14} color="#2381FD" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filtro por Veículo */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                          Veículo Específico
                        </div>
                        <select
                          value={historicoVeiculoFilter}
                          onChange={(e) => setHistoricoVeiculoFilter(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            fontSize: '12px',
                            color: '#0F1C2C',
                            fontWeight: '600',
                            outline: 'none'
                          }}
                        >
                          <option value="Todos">Toda a Frota (Consolidado)</option>
                          {veiculosList.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.placa} - {v.modelo}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Botão Aplicar / Concluir */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoricoTipo('Todos');
                            setHistoricoVeiculoFilter('Todos');
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Limpar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHistoricoFilterMenuOpen(false)}
                          style={{
                            flex: 2,
                            backgroundColor: '#0F1C2C',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Check size={14} /> Aplicar ({filteredHistorico.length} eventos)
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badges de Filtros Ativos no Histórico */}
            {(historicoTipo !== 'Todos' || historicoVeiculoFilter !== 'Todos') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Filtros ativos:</span>
                {historicoTipo !== 'Todos' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#0F1C2C',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    <span>Tipo: {historicoTipo}</span>
                    <button type="button" onClick={() => setHistoricoTipo('Todos')} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', padding: 0 }}>✕</button>
                  </span>
                )}
                {historicoVeiculoFilter !== 'Todos' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#2381FD',
                    color: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    <span>Veículo: {veiculosList.find(v => v.id === historicoVeiculoFilter)?.placa || historicoVeiculoFilter}</span>
                    <button type="button" onClick={() => setHistoricoVeiculoFilter('Todos')} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', padding: 0 }}>✕</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setHistoricoTipo('Todos');
                    setHistoricoVeiculoFilter('Todos');
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>

          {/* TIMELINE DE EVENTOS DO HISTÓRICO */}
          {filteredHistorico.length === 0 ? (
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '40px 20px', 
              textAlign: 'center',
              border: '1px solid #CBD5E1',
              color: '#64748B'
            }}>
              <History size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#0F1C2C' }}>
                Nenhuma ocorrência registrada com os filtros aplicados
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredHistorico.map(item => (
                <div 
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    padding: '12px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        backgroundColor: '#0F1C2C', 
                        color: '#FFFFFF', 
                        fontFamily: 'monospace', 
                        fontWeight: '800', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {item.placa}
                      </span>
                      <span style={{ 
                        backgroundColor: `${item.badgeCor}20`,
                        color: item.badgeCor,
                        border: `1px solid ${item.badgeCor}`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {item.tipo}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0F1C2C' }}>
                        {item.titulo}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
                      <Calendar size={13} />
                      <span>{item.data}</span>
                    </div>
                  </div>

                  <p style={{ margin: '2px 0 4px 0', fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                    {item.detalhes}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    fontSize: '11px', 
                    color: '#64748B',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '6px'
                  }}>
                    <span>Veículo: <strong>{item.veiculoNome}</strong></span>
                    <span>Apontamento: <strong>{item.horimetroOuKm}</strong></span>
                    <span>Responsável: <strong>{item.responsavel}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DETALHES COMPLETOS DO VEÍCULO */}
      {selectedVeiculoDetalhes && (
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
            maxWidth: '600px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            {/* Topo do Modal */}
            <div style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Ficha Técnica do Equipamento</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                  {selectedVeiculoDetalhes.modelo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVeiculoDetalhes(null)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#0F1C2C', color: '#FFFFFF', fontFamily: 'monospace', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>
                  {selectedVeiculoDetalhes.placa}
                </span>
                <span style={{ backgroundColor: '#F1F5F9', color: '#334155', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                  Cód: #{selectedVeiculoDetalhes.codigo}
                </span>
                <span style={getStatusBadgeStyle(selectedVeiculoDetalhes.status)}>
                  {selectedVeiculoDetalhes.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginTop: '4px' }}>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Categoria Operacional</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.categoria}</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Aplicação / Tipo de Uso</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.tipoUso || 'Operação Padrão'}</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Horímetro Atual</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.horimetro}</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Quilometragem Acumulada</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.kmAtual}</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Tara Padrão para Balança</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.taraKg.toLocaleString()} kg</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Próxima Revisão Programada</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.proximaRevisaoH} h</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Motorista / Operador Padrão</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.operador || 'Não atribuído'}</strong>
                </div>
                <div style={detailBoxStyle}>
                  <span style={detailLabelStyle}>Oficina de Lotação</span>
                  <strong style={{ color: '#0F1C2C' }}>{selectedVeiculoDetalhes.oficinaPadrao}</strong>
                </div>
              </div>

              {/* Ações Integradas no Modal */}
              <div style={{ 
                backgroundColor: '#F8FAFC', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {onNavigateToOS && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVeiculoDetalhes(null);
                      onNavigateToOS();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#0F1C2C'
                    }}
                  >
                    <ClipboardList size={13} color={COLOR_PRIMARY} />
                    Abrir Ordem de Serviço
                  </button>
                )}

                {onNavigateToPesagem && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVeiculoDetalhes(null);
                      onNavigateToPesagem();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: '#0F1C2C'
                    }}
                  >
                    <Scale size={13} color={COLOR_PRIMARY} />
                    Pesar na Balança
                  </button>
                )}
              </div>

              {selectedVeiculoDetalhes.observacoes && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                  <span style={detailLabelStyle}>Observações Técnicas:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{selectedVeiculoDetalhes.observacoes}</p>
                </div>
              )}
            </div>

            {/* Rodapé com atalho para histórico */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedVeiculoDetalhes(null)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  abrirHistoricoDoVeiculo(selectedVeiculoDetalhes);
                  setSelectedVeiculoDetalhes(null);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0F1C2C', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <History size={14} />
                Ver Todo o Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CADASTRAR NOVO VEÍCULO */}
      {isNovoVeiculoModalOpen && (
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
            maxWidth: '650px',
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Cadastrar Novo Veículo / Equipamento</h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Adicione novos ativos à frota da plataforma</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoVeiculoModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoVeiculo} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Placa *</label>
                  <input
                    type="text"
                    required
                    value={novoVeiculo.placa}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })}
                    placeholder="Ex: BRA-2041"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Código / Prefixo *</label>
                  <input
                    type="text"
                    required
                    value={novoVeiculo.codigo}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, codigo: e.target.value })}
                    placeholder="Ex: 77-31934"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Ano de Fabricação</label>
                  <input
                    type="text"
                    value={novoVeiculo.ano}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })}
                    placeholder="Ex: 2024"
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Modelo e Fabricante *</label>
                <input
                  type="text"
                  required
                  value={novoVeiculo.modelo}
                  onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                  placeholder="Ex: VW 24.260 CONSTELLATION ou Escavadeira CAT 320"
                  style={formInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Categoria da Frota *</label>
                  <select
                    value={novoVeiculo.categoria}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, categoria: e.target.value })}
                    style={formInputStyle}
                  >
                    {CATEGORIAS_VEICULOS.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Status Inicial</label>
                  <select
                    value={novoVeiculo.status}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, status: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Aguardando OS">Aguardando OS</option>
                    <option value="Standby / Reserva">Standby / Reserva</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Horímetro Inicial (h)</label>
                  <input
                    type="text"
                    value={novoVeiculo.horimetro}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, horimetro: e.target.value })}
                    placeholder="Ex: 150 h"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Quilometragem (km)</label>
                  <input
                    type="text"
                    value={novoVeiculo.kmAtual}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, kmAtual: e.target.value })}
                    placeholder="Ex: 12.000 km"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Tara Padrão Balança (kg)</label>
                  <input
                    type="number"
                    value={novoVeiculo.taraKg}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, taraKg: e.target.value })}
                    placeholder="Ex: 12450"
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Motorista / Operador Padrão</label>
                  <input
                    type="text"
                    value={novoVeiculo.operador}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, operador: e.target.value })}
                    placeholder="Nome do motorista ou operador"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Oficina Responsável</label>
                  <input
                    type="text"
                    value={novoVeiculo.oficinaPadrao}
                    onChange={(e) => setNovoVeiculo({ ...novoVeiculo, oficinaPadrao: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Observações Gerais</label>
                <textarea
                  rows={2}
                  value={novoVeiculo.observacoes}
                  onChange={(e) => setNovoVeiculo({ ...novoVeiculo, observacoes: e.target.value })}
                  placeholder="Informações adicionais do veículo ou equipamento..."
                  style={{ ...formInputStyle, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNovoVeiculoModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOVA OCORRÊNCIA DE HISTÓRICO */}
      {isNovaOcorrenciaModalOpen && (
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
            maxWidth: '550px',
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Registrar Ocorrência no Histórico</h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Anotação técnica ou operacional para a frota</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNovaOcorrenciaModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaOcorrencia} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={formLabelStyle}>Veículo / Equipamento *</label>
                <select
                  required
                  value={novaOcorrencia.veiculoId}
                  onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, veiculoId: e.target.value })}
                  style={formInputStyle}
                >
                  <option value="">Selecione o veículo...</option>
                  {veiculosList.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} (#{v.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Tipo de Ocorrência</label>
                  <select
                    value={novaOcorrencia.tipo}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, tipo: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="OS">Ordem de Serviço (OS)</option>
                    <option value="RDA">Relatório Diário (RDA)</option>
                    <option value="Pesagem">Pesagem na Balança</option>
                    <option value="Abastecimento">Abastecimento</option>
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Status do Evento</label>
                  <select
                    value={novaOcorrencia.status}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, status: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Concluído">Concluído</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Aberto">Aberto</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Título / Descrição Resumida *</label>
                <input
                  type="text"
                  required
                  value={novaOcorrencia.titulo}
                  onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, titulo: e.target.value })}
                  placeholder="Ex: Troca de pastilhas de freio ou Pesagem de descarga"
                  style={formInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Horímetro ou KM no momento</label>
                  <input
                    type="text"
                    value={novaOcorrencia.horimetroOuKm}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, horimetroOuKm: e.target.value })}
                    placeholder="Ex: 1.820 h ou 87.167 km"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Responsável</label>
                  <input
                    type="text"
                    value={novaOcorrencia.responsavel}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, responsavel: e.target.value })}
                    placeholder="Nome do encarregado ou mecânico"
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Detalhes Completos da Ocorrência</label>
                <textarea
                  rows={3}
                  value={novaOcorrencia.detalhes}
                  onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, detalhes: e.target.value })}
                  placeholder="Descreva o serviço executado, peças utilizadas, pesagem ou condições..."
                  style={{ ...formInputStyle, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNovaOcorrenciaModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Gravar Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Estilos Reutilizáveis
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

const detailBoxStyle = {
  backgroundColor: '#F8FAFC',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const detailLabelStyle = {
  fontSize: '10px',
  color: '#64748B',
  fontWeight: '700'
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

export default Veiculos;
