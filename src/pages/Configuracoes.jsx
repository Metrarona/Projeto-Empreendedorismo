import { useState, useMemo, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Scale, 
  Truck, 
  Building2, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Printer, 
  Save, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  INITIAL_PESAGENS, 
  INITIAL_VEICULOS, 
  CATEGORIAS_VEICULOS, 
  TIPOS_RESIDUOS, 
  INITIAL_CONFIG_EMPRESA, 
  roundTo10Kg 
} from '../data/veiculosData';
import ThermalTicketReceipt from './ThermalTicketReceipt';

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_SUCCESS = '#34AC4C';

const RESIDUO_CTR_MAP = {
  'RSU - Resíduo Sólido Urbano': { cod: '15', nome: 'RESIDUOS DOMICILIARES' },
  'RCC - Entulho / Construção Civil': { cod: '08', nome: 'RCC - ENTULHO DA CONSTRUÇÃO CIVIL' },
  'Lodo de ETE & Efluentes': { cod: '22', nome: 'LODO DE ETE TRATADO' },
  'Podas & Vegetação': { cod: '18', nome: 'RESÍDUOS VEGETAIS E PODAS' },
  'Recicláveis & Triagem': { cod: '10', nome: 'RESÍDUOS INDUSTRIAIS CLASSE II' },
  'Material Orgânico / Composto': { cod: '18', nome: 'MATERIAL ORGÂNICO / COMPOSTAGEM' },
  'Resíduos Industriais / Não Perigosos': { cod: '10', nome: 'RESÍDUOS INDUSTRIAIS CLASSE II' },
  'Outros / Especiais': { cod: '99', nome: 'RESÍDUOS DIVERSOS' }
};

const Configuracoes = () => {
  // Aba ativa nas configurações
  const [activeTab, setActiveTab] = useState('pesagens'); // 'pesagens' | 'frota-empresa' | 'parametros'

  // Mensagem de feedback de salvamento
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // 1. CONFIGURAÇÃO DA EMPRESA INTERNA
  const [empresaConfig, setEmpresaConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_empresa_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG_EMPRESA;
    } catch {
      return INITIAL_CONFIG_EMPRESA;
    }
  });

  const handleSalvarEmpresaConfig = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('sustentare_empresa_config', JSON.stringify(empresaConfig));
      window.dispatchEvent(new Event('storage'));
      showFeedback('Configurações da empresa interna salvas com sucesso!');
    } catch {
      showFeedback('Erro ao salvar configurações da empresa.', 'error');
    }
  };

  // 2. GESTÃO DE PESAGENS (ADM - Edição irrestrita)
  const [pesagensList, setPesagensList] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_pesagens_list');
      return saved ? JSON.parse(saved) : INITIAL_PESAGENS;
    } catch {
      return INITIAL_PESAGENS;
    }
  });

  // Salva no localStorage quando pesagens mudar
  useEffect(() => {
    try {
      localStorage.setItem('sustentare_pesagens_list', JSON.stringify(pesagensList));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  }, [pesagensList]);

  // Filtros de Pesagem na tela ADM
  const [pesagemSearch, setPesagemSearch] = useState('');
  const [filtroTipoFrota, setFiltroTipoFrota] = useState('Todos'); // 'Todos' | 'Interna' | 'Externa'
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Modal de Edição de Pesagem ADM
  const [pesagemEmEdicao, setPesagemEmEdicao] = useState(null);
  const [isEditPesagemModalOpen, setIsEditPesagemModalOpen] = useState(false);
  const [ticketParaImprimir, setTicketParaImprimir] = useState(null);

  // Lista Filtrada de Pesagens
  const filteredPesagens = useMemo(() => {
    return pesagensList.filter(p => {
      const matchFrota = filtroTipoFrota === 'Todos' || p.tipoFrota === filtroTipoFrota;
      const matchStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
      
      const term = pesagemSearch.toLowerCase().trim();
      const matchSearch = !term ||
        (p.ticket && p.ticket.toLowerCase().includes(term)) ||
        (p.contador && p.contador.includes(term)) ||
        (p.placa && p.placa.toLowerCase().includes(term)) ||
        (p.placaCarreta && p.placaCarreta.toLowerCase().includes(term)) ||
        (p.veiculoNome && p.veiculoNome.toLowerCase().includes(term)) ||
        (p.motorista && p.motorista.toLowerCase().includes(term)) ||
        (p.clienteFornecedor && p.clienteFornecedor.toLowerCase().includes(term)) ||
        (p.empresaOrigem && p.empresaOrigem.toLowerCase().includes(term)) ||
        (p.origem && p.origem.toLowerCase().includes(term)) ||
        (p.operador && p.operador.toLowerCase().includes(term));

      return matchFrota && matchStatus && matchSearch;
    });
  }, [pesagensList, filtroTipoFrota, filtroStatus, pesagemSearch]);

  const handleAbrirEdicaoPesagem = (pesagem) => {
    setPesagemEmEdicao({
      ...pesagem,
      pesoBrutoKg: roundTo10Kg(pesagem.pesoBrutoKg),
      taraKg: roundTo10Kg(pesagem.taraKg),
      pesoLiquidoKg: roundTo10Kg(pesagem.pesoLiquidoKg)
    });
    setIsEditPesagemModalOpen(true);
  };

  const handleSalvarEdicaoPesagem = (e) => {
    e.preventDefault();
    if (!pesagemEmEdicao) return;

    const bruto = roundTo10Kg(pesagemEmEdicao.pesoBrutoKg || 0);
    const tara = roundTo10Kg(pesagemEmEdicao.taraKg || 0);
    const liquido = roundTo10Kg(Math.max(0, bruto - tara));

    const pesagemAtualizada = {
      ...pesagemEmEdicao,
      ticket: pesagemEmEdicao.ticket.trim().toUpperCase(),
      contador: String(pesagemEmEdicao.contador).trim(),
      placa: pesagemEmEdicao.placa.trim().toUpperCase(),
      placaCarreta: (pesagemEmEdicao.placaCarreta || '').trim().toUpperCase(),
      veiculoNome: pesagemEmEdicao.veiculoNome.trim(),
      motorista: pesagemEmEdicao.motorista.trim().toUpperCase(),
      clienteFornecedor: pesagemEmEdicao.clienteFornecedor.trim().toUpperCase(),
      empresaOrigem: (pesagemEmEdicao.empresaOrigem || pesagemEmEdicao.origem || '').trim(),
      origem: (pesagemEmEdicao.empresaOrigem || pesagemEmEdicao.origem || '').trim(),
      transportadora: (pesagemEmEdicao.transportadora || empresaConfig.nomeInterno).trim().toUpperCase(),
      pesoBrutoKg: bruto,
      taraKg: tara,
      pesoLiquidoKg: liquido,
      observacoes: pesagemEmEdicao.observacoes || ''
    };

    setPesagensList(prev => prev.map(p => p.id === pesagemAtualizada.id ? pesagemAtualizada : p));
    setIsEditPesagemModalOpen(false);
    showFeedback(`Pesagem ${pesagemAtualizada.ticket} atualizada com sucesso pelo ADM!`);
  };

  const handleExcluirPesagem = (id, ticket) => {
    if (confirm(`Atenção ADM: Deseja realmente excluir permanentemente o registro de pesagem ${ticket}?`)) {
      setPesagensList(prev => prev.filter(p => p.id !== id));
      showFeedback(`Registro de pesagem ${ticket} excluído com sucesso.`);
    }
  };

  // 3. GESTÃO DA FROTA INTERNA DE VEÍCULOS
  const [frotaInternaList, setFrotaInternaList] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_veiculos_list');
      return saved ? JSON.parse(saved) : INITIAL_VEICULOS;
    } catch {
      return INITIAL_VEICULOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sustentare_veiculos_list', JSON.stringify(frotaInternaList));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  }, [frotaInternaList]);

  const [frotaSearch, setFrotaSearch] = useState('');
  const [frotaCategoriaFiltro, setFrotaCategoriaFiltro] = useState('Todos');
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null);
  const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);

  const filteredFrotaInterna = useMemo(() => {
    return frotaInternaList.filter(v => {
      const matchCat = frotaCategoriaFiltro === 'Todos' || v.categoria === frotaCategoriaFiltro;
      const term = frotaSearch.toLowerCase().trim();
      const matchSearch = !term ||
        (v.codigo && v.codigo.toLowerCase().includes(term)) ||
        (v.placa && v.placa.toLowerCase().includes(term)) ||
        (v.modelo && v.modelo.toLowerCase().includes(term)) ||
        (v.operador && v.operador.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [frotaInternaList, frotaCategoriaFiltro, frotaSearch]);

  const handleAbrirNovoVeiculo = () => {
    setVeiculoEmEdicao({
      id: `VEIC-${Date.now()}`,
      codigo: `77-${Math.floor(10000 + Math.random() * 90000)}`,
      placa: '',
      modelo: '',
      categoria: 'Caminhões Compactadores',
      tipoUso: 'Coleta e Transporte de Resíduos',
      ano: '2024',
      status: 'Operacional',
      operador: '',
      taraKg: 12000,
      observacoes: ''
    });
    setIsVeiculoModalOpen(true);
  };

  const handleAbrirEditarVeiculo = (veic) => {
    setVeiculoEmEdicao({
      ...veic,
      taraKg: roundTo10Kg(veic.taraKg || 0)
    });
    setIsVeiculoModalOpen(true);
  };

  const handleSalvarVeiculo = (e) => {
    e.preventDefault();
    if (!veiculoEmEdicao.placa || !veiculoEmEdicao.modelo) {
      alert('Informe a placa e o modelo do veículo.');
      return;
    }

    const veicFormatado = {
      ...veiculoEmEdicao,
      placa: veiculoEmEdicao.placa.trim().toUpperCase(),
      modelo: veiculoEmEdicao.modelo.trim(),
      taraKg: roundTo10Kg(veiculoEmEdicao.taraKg || 0),
      operador: (veiculoEmEdicao.operador || 'OPERADOR').trim().toUpperCase()
    };

    const existe = frotaInternaList.some(v => v.id === veicFormatado.id);
    if (existe) {
      setFrotaInternaList(prev => prev.map(v => v.id === veicFormatado.id ? veicFormatado : v));
      showFeedback(`Veículo ${veicFormatado.placa} atualizado com sucesso!`);
    } else {
      setFrotaInternaList(prev => [veicFormatado, ...prev]);
      showFeedback(`Novo veículo ${veicFormatado.placa} adicionado à frota interna!`);
    }

    setIsVeiculoModalOpen(false);
  };

  const handleExcluirVeiculo = (id, placa) => {
    if (confirm(`Deseja remover o veículo ${placa} da frota interna?`)) {
      setFrotaInternaList(prev => prev.filter(v => v.id !== id));
      showFeedback(`Veículo ${placa} removido da frota interna.`);
    }
  };

  // Reset para padrões de fábrica
  const handleResetarDados = () => {
    if (confirm('Atenção: Isso redefinirá todas as pesagens, frota e configurações para os padrões de demonstração. Continuar?')) {
      localStorage.removeItem('sustentare_pesagens_list');
      localStorage.removeItem('sustentare_empresa_config');
      localStorage.removeItem('sustentare_veiculos_list');
      localStorage.removeItem('sustentare_empresas_externas');
      setPesagensList(INITIAL_PESAGENS);
      setEmpresaConfig(INITIAL_CONFIG_EMPRESA);
      setFrotaInternaList(INITIAL_VEICULOS);
      showFeedback('Dados redefinidos para os padrões iniciais do sistema.');
    }
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

      {/* FEEDBACK TOAST NOTIFICATION */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: feedbackMsg.type === 'error' ? '#EF4444' : '#15803D',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: '700',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {feedbackMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* CABEÇALHO DO PAINEL DE CONFIGURAÇÕES ADM */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '14px 18px',
        border: '1px solid #CBD5E1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#0F1C2C',
            color: '#F59E0B',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                Painel de Configurações & Administração (ADM)
              </h1>
              <span style={{
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FCD34D',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.4px'
              }}>
                MODO ADM ATIVO
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
              Edição irrestrita de pesagens, gerenciamento da frota interna e alteração do nome interno da empresa
            </p>
          </div>
        </div>

        {/* Botão de Redefinir Dados */}
        <button
          type="button"
          onClick={handleResetarDados}
          title="Restaurar dados iniciais de demonstração"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F8FAFC',
            color: '#64748B',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          Restaurar Padrões
        </button>
      </div>

      {/* ABAS DO PAINEL DE CONFIGURAÇÕES */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#FFFFFF',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('pesagens')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'pesagens' ? '#0F1C2C' : 'transparent',
            color: activeTab === 'pesagens' ? '#FFFFFF' : '#475569',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Scale size={15} color={activeTab === 'pesagens' ? '#2381FD' : '#64748B'} />
          <span>Gestão de Pesagens (Editar Informações)</span>
          <span style={{
            backgroundColor: activeTab === 'pesagens' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
            color: activeTab === 'pesagens' ? '#FFFFFF' : '#475569',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '11px'
          }}>
            {pesagensList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frota-empresa')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'frota-empresa' ? '#0F1C2C' : 'transparent',
            color: activeTab === 'frota-empresa' ? '#FFFFFF' : '#475569',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Truck size={15} color={activeTab === 'frota-empresa' ? '#F59E0B' : '#64748B'} />
          <span>Frota Interna & Nome da Empresa</span>
          <span style={{
            backgroundColor: activeTab === 'frota-empresa' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
            color: activeTab === 'frota-empresa' ? '#FFFFFF' : '#475569',
            padding: '1px 6px',
            borderRadius: '10px',
            fontSize: '11px'
          }}>
            {frotaInternaList.length} veículos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parametros')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'parametros' ? '#0F1C2C' : 'transparent',
            color: activeTab === 'parametros' ? '#FFFFFF' : '#475569',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Settings size={15} color={activeTab === 'parametros' ? '#10B981' : '#64748B'} />
          <span>Parâmetros da Balança (10 kg) & e-Ticket</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: GESTÃO E EDIÇÃO DE PESAGENS (ADM) */}
      {activeTab === 'pesagens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Barra de Filtros e Busca de Pesagens */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {/* Campo de Busca */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: '1 1 260px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '8px 12px',
              border: '1px solid #E2E8F0'
            }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                value={pesagemSearch}
                onChange={(e) => setPesagemSearch(e.target.value)}
                placeholder="ADM: Buscar por Ticket, Placa, Motorista, Origem, Cliente..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  width: '100%',
                  color: '#0F1C2C'
                }}
              />
              {pesagemSearch && (
                <button
                  type="button"
                  onClick={() => setPesagemSearch('')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} color="#94A3B8" />
                </button>
              )}
            </div>

            {/* Filtros rápidos: Frota Interna / Externa e Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={filtroTipoFrota}
                onChange={(e) => setFiltroTipoFrota(e.target.value)}
                style={formInputStyleSmall}
              >
                <option value="Todos">Todas as Frotas</option>
                <option value="Interna">Apenas Frota Interna</option>
                <option value="Externa">Apenas Pesagens Externas</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                style={formInputStyleSmall}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Concluída">Concluída</option>
                <option value="Aguardando Tara (Saída)">Aguardando Tara</option>
              </select>

              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>
                Exibindo <strong>{filteredPesagens.length}</strong> de {pesagensList.length} registros
              </div>
            </div>
          </div>

          {/* TABELA DE GESTÃO E EDIÇÃO DAS PESAGENS */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #CBD5E1',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '940px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800' }}>
                  <th style={{ padding: '10px 12px' }}>TICKET / CONTADOR</th>
                  <th style={{ padding: '10px 12px' }}>CATEGORIA</th>
                  <th style={{ padding: '10px 12px' }}>PLACA & VEÍCULO</th>
                  <th style={{ padding: '10px 12px' }}>EMPRESA & ORIGEM DO PRODUTO</th>
                  <th style={{ padding: '10px 12px' }}>MOTORISTA</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>BRUTO (KG)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>TARA (KG)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>LÍQUIDO (KG)</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>AÇÕES ADM</th>
                </tr>
              </thead>
              <tbody>
                {filteredPesagens.map((p, idx) => {
                  const isExterna = p.tipoFrota === 'Externa';
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                      }}
                    >
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '800', color: COLOR_PRIMARY, fontFamily: 'monospace' }}>
                          {p.ticket}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          Cont: {p.contador} • {p.data} {p.horaEntrada}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          backgroundColor: isExterna ? '#FEF3C7' : '#EFF6FF',
                          color: isExterna ? '#B45309' : '#1D4ED8',
                          border: isExterna ? '1px solid #FCD34D' : '1px solid #BFDBFE',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}>
                          {isExterna ? 'EXTERNA' : 'INTERNA'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            backgroundColor: '#0F1C2C',
                            color: '#FFFFFF',
                            fontFamily: 'monospace',
                            fontWeight: '800',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {p.placa}
                          </span>
                          {p.placaCarreta && (
                            <span style={{ backgroundColor: '#475569', color: '#FFF', padding: '1px 4px', borderRadius: '3px', fontSize: '10px', fontFamily: 'monospace' }}>
                              +{p.placaCarreta}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                          {p.veiculoNome}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{p.clienteFornecedor}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          Origem: <strong>{p.empresaOrigem || p.origem}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        <div style={{ fontWeight: '600' }}>{p.motorista}</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>{p.tipoResiduo}</div>
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B', fontFamily: 'monospace', fontWeight: '600' }}>
                        {roundTo10Kg(p.pesoBrutoKg).toLocaleString()}
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B', fontFamily: 'monospace', fontWeight: '600' }}>
                        {roundTo10Kg(p.taraKg).toLocaleString()}
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #86EFAC',
                          padding: '3px 7px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}>
                          +{roundTo10Kg(p.pesoLiquidoKg).toLocaleString()} kg
                        </span>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          backgroundColor: p.status === 'Concluída' ? '#DCFCE7' : '#FEF3C7',
                          color: p.status === 'Concluída' ? '#15803D' : '#B45309',
                          border: p.status === 'Concluída' ? '1px solid #86EFAC' : '1px solid #FCD34D',
                          borderRadius: '8px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}>
                          {p.status}
                        </span>
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleAbrirEdicaoPesagem(p)}
                            title="Editar qualquer dado desta pesagem (ADM)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={12} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => setTicketParaImprimir(p)}
                            title="Visualizar e-Ticket Térmico Oficial"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              backgroundColor: '#0F1C2C',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 7px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExcluirPesagem(p.id, p.ticket)}
                            title="Excluir Pesagem (ADM)"
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 7px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: FROTA INTERNA & NOME DA EMPRESA */}
      {activeTab === 'frota-empresa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* BLOCO 1: NOME INTERNO DA EMPRESA E DADOS CADASTRAIS DA UNIDADE */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 size={20} color="#D97706" />
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Parametrização da Empresa Interna & Unidade CTR
                </h2>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Altere o nome interno da empresa exibido nas pesagens, relatórios, transportadora padrão e no cabeçalho do e-Ticket
                </span>
              </div>
            </div>

            <form onSubmit={handleSalvarEmpresaConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                
                {/* Nome Interno da Empresa */}
                <div>
                  <label style={formLabelStyle}>
                    Nome Interno da Empresa (Exibido no Cabeçalho e Tickets) *
                  </label>
                  <input
                    type="text"
                    required
                    value={empresaConfig.nomeInterno}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, nomeInterno: e.target.value.toUpperCase() })}
                    placeholder="Ex: SUSTENTARE SANEAMENTO"
                    style={{ ...formInputStyle, fontWeight: '800', borderColor: '#2381FD' }}
                  />
                  <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: '600' }}>
                    Altera o nome nos comprovantes térmicos, tickets e frota interna
                  </span>
                </div>

                {/* Razão Social Completa */}
                <div>
                  <label style={formLabelStyle}>Razão Social Completa</label>
                  <input
                    type="text"
                    value={empresaConfig.razaoSocial}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, razaoSocial: e.target.value.toUpperCase() })}
                    placeholder="Ex: SUSTENTARE SANEAMENTO S.A."
                    style={formInputStyle}
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label style={formLabelStyle}>CNPJ da Unidade</label>
                  <input
                    type="text"
                    value={empresaConfig.cnpj}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, cnpj: e.target.value })}
                    placeholder="Ex: 04.123.456/0001-78"
                    style={formInputStyle}
                  />
                </div>

                {/* Nome da Unidade / CTR */}
                <div>
                  <label style={formLabelStyle}>Nome da Unidade Operacional / CTR</label>
                  <input
                    type="text"
                    value={empresaConfig.unidadeOperacional}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, unidadeOperacional: e.target.value.toUpperCase() })}
                    placeholder="Ex: CTR CARIRI"
                    style={formInputStyle}
                  />
                </div>

                {/* Endereço da Unidade */}
                <div>
                  <label style={formLabelStyle}>Endereço da Unidade / Rodovia</label>
                  <input
                    type="text"
                    value={empresaConfig.endereco}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, endereco: e.target.value.toUpperCase() })}
                    placeholder="Ex: RODOVIA CE 060 Nº 1100"
                    style={formInputStyle}
                  />
                </div>

                {/* Cidade / UF */}
                <div>
                  <label style={formLabelStyle}>Cidade / UF</label>
                  <input
                    type="text"
                    value={empresaConfig.cidadeUf}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, cidadeUf: e.target.value })}
                    placeholder="Ex: Juazeiro do Norte / CE"
                    style={formInputStyle}
                  />
                </div>

                {/* Balancista / Operador Padrão */}
                <div>
                  <label style={formLabelStyle}>Operador / Balancista Padrão</label>
                  <input
                    type="text"
                    value={empresaConfig.operadorPadrao}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, operadorPadrao: e.target.value })}
                    placeholder="Ex: Bruno"
                    style={formInputStyle}
                  />
                </div>

                {/* Telefone / Contato */}
                <div>
                  <label style={formLabelStyle}>Telefone / Contato</label>
                  <input
                    type="text"
                    value={empresaConfig.telefoneContato}
                    onChange={(e) => setEmpresaConfig({ ...empresaConfig, telefoneContato: e.target.value })}
                    placeholder="Ex: (88) 3571-9200"
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* Botão de Salvar Alterações da Empresa */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <Save size={15} />
                  Salvar Alterações da Empresa
                </button>
              </div>
            </form>
          </div>

          {/* BLOCO 2: GESTÃO DA FROTA INTERNA DE VEÍCULOS */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #CBD5E1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Gerenciamento da Frota Interna de Veículos
                </h2>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Veículos cadastrados pertencentes à empresa ({empresaConfig.nomeInterno})
                </span>
              </div>

              <button
                type="button"
                onClick={handleAbrirNovoVeiculo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: COLOR_PRIMARY,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                Novo Veículo na Frota
              </button>
            </div>

            {/* Barra de Filtros da Frota Interna */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: '1 1 200px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '6px 10px',
                border: '1px solid #E2E8F0'
              }}>
                <Search size={14} color="#94A3B8" />
                <input
                  type="text"
                  value={frotaSearch}
                  onChange={(e) => setFrotaSearch(e.target.value)}
                  placeholder="Buscar veículo por placa, código ou modelo..."
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' }}
                />
              </div>

              <select
                value={frotaCategoriaFiltro}
                onChange={(e) => setFrotaCategoriaFiltro(e.target.value)}
                style={formInputStyleSmall}
              >
                {CATEGORIAS_VEICULOS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tabela de Veículos da Frota Interna */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '760px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800' }}>
                    <th style={{ padding: '8px 10px' }}>CÓDIGO</th>
                    <th style={{ padding: '8px 10px' }}>PLACA</th>
                    <th style={{ padding: '8px 10px' }}>MODELO / VEÍCULO</th>
                    <th style={{ padding: '8px 10px' }}>CATEGORIA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>TARA PADRÃO (KG)</th>
                    <th style={{ padding: '8px 10px' }}>OPERADOR / MOTORISTA</th>
                    <th style={{ padding: '8px 10px' }}>STATUS</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFrotaInterna.map((v, idx) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: '800', color: COLOR_PRIMARY }}>
                        {v.codigo}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ backgroundColor: '#0F1C2C', color: '#FFF', fontFamily: 'monospace', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                          {v.placa}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0F1C2C' }}>
                        {v.modelo}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#475569', fontSize: '11px' }}>
                        {v.categoria}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700' }}>
                        {roundTo10Kg(v.taraKg).toLocaleString()} kg
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155', fontWeight: '600' }}>
                        {v.operador || 'Sem operador fixo'}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          backgroundColor: v.status === 'Operacional' ? '#DCFCE7' : '#FEF3C7',
                          color: v.status === 'Operacional' ? '#15803D' : '#B45309',
                          border: v.status === 'Operacional' ? '1px solid #86EFAC' : '1px solid #FCD34D',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleAbrirEditarVeiculo(v)}
                            title="Editar Veículo"
                            style={{
                              backgroundColor: '#F1F5F9',
                              color: '#0F1C2C',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '4px 7px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirVeiculo(v.id, v.placa)}
                            title="Excluir Veículo"
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 7px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: PARÂMETROS DA BALANÇA & AUDITORIA */}
      {activeTab === 'parametros' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #CBD5E1'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F1C2C', margin: '0 0 4px 0' }}>
              Parâmetros de Metrologia & Aferição Rodoviária
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0' }}>
              Regras normativas e operacionais para pesagens no CTR Cariri
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Scale size={16} color={COLOR_PRIMARY} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F1C2C' }}>
                    Graduação da Balança (Divisão d = 10 kg)
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  Todos os cálculos (Peso Bruto, Tara e Peso Líquido) são estritamente forçados a múltiplos de 10 kg, respeitando a escala do indicador digital rodoviário industrial.
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Printer size={16} color="#D97706" />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F1C2C' }}>
                    Padrão de Impressão Térmica (80mm)
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  Comprovante oficial em formato de bobina térmica com logotipo oficial, código do produto, primeira/segunda pesagem, campo de assinatura e cópia de texto direta.
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield size={16} color={COLOR_SUCCESS} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F1C2C' }}>
                    Controle de Acesso & Auditoria ADM
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  Apenas o perfil de Administrador tem autorização para alterar registros de pesagens já concluídos, garantindo a integridade dos relatórios fiscais e ambientais.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIÇÃO COMPLETA DA PESAGEM PELO ADM */}
      {isEditPesagemModalOpen && pesagemEmEdicao && (
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
            maxWidth: '720px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            {/* Header Modal ADM */}
            <div style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#F59E0B" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                    Edição Irrestrita de Pesagem (ADM) - Ticket {pesagemEmEdicao.ticket}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Altere qualquer informação: tickets, placas, pesos, motorista, cliente, origem e status
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditPesagemModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form de Edição Completa */}
            <form onSubmit={handleSalvarEdicaoPesagem} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Linha 1: Ticket, Contador e Categoria Frota */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Nº do Ticket</label>
                  <input
                    type="text"
                    required
                    value={pesagemEmEdicao.ticket}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, ticket: e.target.value.toUpperCase() })}
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Contador da Balança</label>
                  <input
                    type="text"
                    required
                    value={pesagemEmEdicao.contador}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, contador: e.target.value })}
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Categoria de Frota</label>
                  <select
                    value={pesagemEmEdicao.tipoFrota}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, tipoFrota: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Interna">Frota Interna</option>
                    <option value="Externa">Pesagem Externa</option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Data, Hora Entrada e Hora Saída */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Data da Pesagem</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.data}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, data: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Hora de Entrada (Bruto)</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.horaEntrada}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, horaEntrada: e.target.value })}
                    placeholder="HH:MM:SS"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Hora de Saída (Tara)</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.horaSaida || ''}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, horaSaida: e.target.value })}
                    placeholder="HH:MM:SS"
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* Linha 3: Placas e Veículo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={pesagemEmEdicao.placa}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, placa: e.target.value.toUpperCase() })}
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Placa Carreta</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.placaCarreta || ''}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, placaCarreta: e.target.value.toUpperCase() })}
                    placeholder="Ex: GII8H28"
                    style={{ ...formInputStyle, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Modelo / Descrição do Veículo</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.veiculoNome}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, veiculoNome: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* Linha 4: Motorista, Cliente e Empresa de Origem */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Motorista *</label>
                  <input
                    type="text"
                    required
                    value={pesagemEmEdicao.motorista}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, motorista: e.target.value.toUpperCase() })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Cliente / Fornecedor</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.clienteFornecedor}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, clienteFornecedor: e.target.value.toUpperCase() })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Empresa / Origem do Produto *</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.empresaOrigem || pesagemEmEdicao.origem || ''}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, empresaOrigem: e.target.value, origem: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* Linha 5: Transportadora, Balança e Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Transportadora</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.transportadora || ''}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, transportadora: e.target.value.toUpperCase() })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Balança Operacional</label>
                  <select
                    value={pesagemEmEdicao.balanca}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, balanca: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Balança 01 - CTR Cariri">Balança 01 - CTR Cariri</option>
                    <option value="Balança 02 - Estação de Transbordo">Balança 02 - Transbordo</option>
                    <option value="Balança 03 - Pátio Operacional Juazeiro">Balança 03 - Pátio Juazeiro</option>
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Status da Pesagem</label>
                  <select
                    value={pesagemEmEdicao.status}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, status: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Concluída">Concluída</option>
                    <option value="Aguardando Tara (Saída)">Aguardando Tara (Saída)</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Linha 6: Tipo de Resíduo & Código */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Tipo de Carga / Resíduo</label>
                  <select
                    value={pesagemEmEdicao.tipoResiduo}
                    onChange={(e) => {
                      const res = e.target.value;
                      const info = RESIDUO_CTR_MAP[res] || { cod: '15', nome: 'RESIDUOS DOMICILIARES' };
                      setPesagemEmEdicao({
                        ...pesagemEmEdicao,
                        tipoResiduo: res,
                        codigoProduto: info.cod,
                        produto: info.nome
                      });
                    }}
                    style={formInputStyle}
                  >
                    {TIPOS_RESIDUOS.filter(t => t !== 'Todos').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Cód. Produto</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.codigoProduto || '15'}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, codigoProduto: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Operador Balança</label>
                  <input
                    type="text"
                    value={pesagemEmEdicao.operador || 'Bruno'}
                    onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, operador: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* CARD DE PESOS (KG) - ESTRITAMENTE MÚLTIPLOS DE 10 */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '12px',
                border: '1px solid #CBD5E1',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F1C2C' }}>
                    AFERIÇÃO DE PESOS EM KG (ADM - MÚLTIPLOS DE 10 KG)
                  </span>
                  <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '700', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                    Balança Graduada d = 10 kg
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={formLabelStyle}>Peso Bruto (kg) *</label>
                    <input
                      type="number"
                      step="10"
                      required
                      value={pesagemEmEdicao.pesoBrutoKg}
                      onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, pesoBrutoKg: e.target.value })}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setPesagemEmEdicao(prev => ({ ...prev, pesoBrutoKg: roundTo10Kg(e.target.value) }));
                        }
                      }}
                      style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={formLabelStyle}>Tara do Veículo (kg) *</label>
                    <input
                      type="number"
                      step="10"
                      required
                      value={pesagemEmEdicao.taraKg}
                      onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, taraKg: e.target.value })}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setPesagemEmEdicao(prev => ({ ...prev, taraKg: roundTo10Kg(e.target.value) }));
                        }
                      }}
                      style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Peso Líquido Calculado */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #86EFAC',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D' }}>LÍQUIDO (KG)</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#15803D', fontFamily: 'monospace' }}>
                      {roundTo10Kg(Math.max(0, (pesagemEmEdicao.pesoBrutoKg || 0) - (pesagemEmEdicao.taraKg || 0))).toLocaleString()} kg
                    </span>
                    <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '600' }}>
                      {(roundTo10Kg(Math.max(0, (pesagemEmEdicao.pesoBrutoKg || 0) - (pesagemEmEdicao.taraKg || 0))) / 1000).toFixed(2)} t
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={formLabelStyle}>Observações da Pesagem / Carga</label>
                <textarea
                  rows={2}
                  value={pesagemEmEdicao.observacoes || ''}
                  onChange={(e) => setPesagemEmEdicao({ ...pesagemEmEdicao, observacoes: e.target.value })}
                  style={{ ...formInputStyle, resize: 'none' }}
                />
              </div>

              {/* Botões do Rodapé */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditPesagemModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2381FD', color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Salvar Alterações (ADM)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CADASTRO / EDIÇÃO DE VEÍCULO DA FROTA INTERNA */}
      {isVeiculoModalOpen && veiculoEmEdicao && (
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
            maxWidth: '560px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#2381FD" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                  {frotaInternaList.some(v => v.id === veiculoEmEdicao.id) ? 'Editar Veículo da Frota Interna' : 'Cadastrar Veículo na Frota Interna'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVeiculoModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarVeiculo} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Código Interno *</label>
                  <input
                    type="text"
                    required
                    value={veiculoEmEdicao.codigo}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, codigo: e.target.value })}
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={veiculoEmEdicao.placa}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, placa: e.target.value.toUpperCase() })}
                    placeholder="Ex: BRA-2041"
                    style={{ ...formInputStyle, fontFamily: 'monospace', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Modelo / Marca do Veículo *</label>
                <input
                  type="text"
                  required
                  value={veiculoEmEdicao.modelo}
                  onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, modelo: e.target.value })}
                  placeholder="Ex: VW 24.260 CONSTELLATION"
                  style={formInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Categoria</label>
                  <select
                    value={veiculoEmEdicao.categoria}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, categoria: e.target.value })}
                    style={formInputStyle}
                  >
                    {CATEGORIAS_VEICULOS.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={formLabelStyle}>Status Operacional</label>
                  <select
                    value={veiculoEmEdicao.status}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, status: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Aguardando Peça">Aguardando Peça</option>
                    <option value="Reserva">Reserva</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Tara Padrão em KG (Múltiplo de 10) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={veiculoEmEdicao.taraKg}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, taraKg: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setVeiculoEmEdicao(prev => ({ ...prev, taraKg: roundTo10Kg(e.target.value) }));
                      }
                    }}
                    placeholder="Ex: 12450"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Operador / Motorista Padrão</label>
                  <input
                    type="text"
                    value={veiculoEmEdicao.operador}
                    onChange={(e) => setVeiculoEmEdicao({ ...veiculoEmEdicao, operador: e.target.value.toUpperCase() })}
                    placeholder="Ex: CARLOS SANTOS"
                    style={formInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsVeiculoModalOpen(false)}
                  style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISUALIZAR / IMPRIMIR E-TICKET TÉRMICO */}
      {ticketParaImprimir && (
        <ThermalTicketReceipt
          ticket={ticketParaImprimir}
          onClose={() => setTicketParaImprimir(null)}
        />
      )}

    </div>
  );
};

// Estilos Reutilizáveis
const formLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '3px'
};

const formInputStyle = {
  width: '100%',
  backgroundColor: '#F8FAFC',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  padding: '8px 10px',
  fontSize: '12px',
  color: '#0F1C2C',
  outline: 'none',
  boxSizing: 'border-box'
};

const formInputStyleSmall = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '11px',
  color: '#0F1C2C',
  fontWeight: '600',
  outline: 'none'
};

export default Configuracoes;
