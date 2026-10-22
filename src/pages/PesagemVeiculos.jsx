import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Plus, 
  Clock, 
  Truck, 
  Printer, 
  X, 
  Layers, 
  Filter, 
  Check, 
  ChevronDown, 
  Building2,
  Edit2,
  Trash2,
  MapPin,
  Building
} from 'lucide-react';
import { 
  TIPOS_RESIDUOS, 
  INITIAL_PESAGENS, 
  INITIAL_VEICULOS,
  INITIAL_EMPRESAS_EXTERNAS,
  INITIAL_CONFIG_EMPRESA,
  roundTo10Kg
} from '../data/veiculosData';
import ThermalTicketReceipt from './ThermalTicketReceipt';

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

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_SUCCESS = '#34AC4C';
const COLOR_WARNING = '#F5C344';

const PesagemVeiculos = ({ onNavigateToVeiculos }) => {
  // Estado de Pesagens com persistência em localStorage
  const [pesagensList, setPesagensList] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_pesagens_list');
      return saved ? JSON.parse(saved) : INITIAL_PESAGENS;
    } catch {
      return INITIAL_PESAGENS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sustentare_pesagens_list', JSON.stringify(pesagensList));
    } catch (e) {
      console.error(e);
    }
  }, [pesagensList]);

  // Estado de Empresas Externas com persistência em localStorage
  const [empresasExternas, setEmpresasExternas] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_empresas_externas');
      return saved ? JSON.parse(saved) : INITIAL_EMPRESAS_EXTERNAS;
    } catch {
      return INITIAL_EMPRESAS_EXTERNAS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sustentare_empresas_externas', JSON.stringify(empresasExternas));
    } catch (e) {
      console.error(e);
    }
  }, [empresasExternas]);

  // Configuração da Empresa Interna
  const [empresaConfig, setEmpresaConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_empresa_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG_EMPRESA;
    } catch {
      return INITIAL_CONFIG_EMPRESA;
    }
  });

  // Lista da Frota Interna com sincronização
  const [frotaInternaList, setFrotaInternaList] = useState(() => {
    try {
      const saved = localStorage.getItem('sustentare_veiculos_list');
      return saved ? JSON.parse(saved) : INITIAL_VEICULOS;
    } catch {
      return INITIAL_VEICULOS;
    }
  });

  // Escuta alterações de outras abas ou da tela de Configurações
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedEmp = localStorage.getItem('sustentare_empresa_config');
        if (savedEmp) setEmpresaConfig(JSON.parse(savedEmp));
        const savedVeic = localStorage.getItem('sustentare_veiculos_list');
        if (savedVeic) setFrotaInternaList(JSON.parse(savedVeic));
        const savedPes = localStorage.getItem('sustentare_pesagens_list');
        if (savedPes) setPesagensList(JSON.parse(savedPes));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filtros
  const [selectedTipoFrota, setSelectedTipoFrota] = useState('Todos'); // 'Todos' | 'Interna' | 'Externa'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResiduo, setSelectedResiduo] = useState('Todos');
  const [selectedBalanca, setSelectedBalanca] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  // Modais
  const [isNovaPesagemModalOpen, setIsNovaPesagemModalOpen] = useState(false);
  const [selectedTicketImpressao, setSelectedTicketImpressao] = useState(null);
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);

  // Estados para CRUD de Empresas Externas
  const [empresaEmEdicao, setEmpresaEmEdicao] = useState(null);
  const [isFormEmpresaAberto, setIsFormEmpresaAberto] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({
    id: '',
    nome: '',
    cnpj: '',
    empresaOrigem: '',
    cidadeUf: '',
    contato: '',
    tipoResiduoPadrao: 'RSU - Resíduo Sólido Urbano',
    codigoProduto: '15'
  });

  // Estado para adicionar veículo a uma empresa externa
  const [empresaIdAdicionarVeiculo, setEmpresaIdAdicionarVeiculo] = useState(null);
  const [novoVeiculoForm, setNovoVeiculoForm] = useState({
    placa: '',
    placaCarreta: '',
    modelo: '',
    taraPadraoKg: '',
    motoristaVinculado: ''
  });

  // Fecha menu flutuante de filtros ao clicar fora
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

  // Form Nova Pesagem
  const [novaPesagem, setNovaPesagem] = useState({
    ticket: `TCK-2026-04${pesagensList.length + 14}`,
    contador: `${11979 + pesagensList.length}`,
    tipoFrota: 'Interna', // 'Interna' | 'Externa'
    empresaExternaId: '',
    empresaOrigem: '',
    veiculoId: '',
    placa: '',
    placaCarreta: '',
    veiculoNome: '',
    motorista: '',
    balanca: 'Balança 01 - CTR Cariri',
    codigoProduto: '15',
    tipoResiduo: 'RSU - Resíduo Sólido Urbano',
    produto: 'RESIDUOS DOMICILIARES',
    clienteFornecedor: 'SUSTENTARE SANEAMENTO',
    transportadora: 'SUSTENTARE SANEAMENTO',
    origem: 'Setor 4 - CTR Cariri',
    pesoBrutoKg: '',
    taraKg: '',
    status: 'Concluída',
    observacoes: ''
  });

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalPesagens = pesagensList.length;
    const internaList = pesagensList.filter(p => p.tipoFrota === 'Interna');
    const externaList = pesagensList.filter(p => p.tipoFrota === 'Externa');

    const pesoLiquidoTotalKg = pesagensList.reduce((acc, p) => acc + (Number(p.pesoLiquidoKg) || 0), 0);
    const pesoLiquidoTotalTon = (pesoLiquidoTotalKg / 1000).toFixed(2);

    const pesoLiquidoInternaKg = internaList.reduce((acc, p) => acc + (Number(p.pesoLiquidoKg) || 0), 0);
    const pesoLiquidoInternaTon = (pesoLiquidoInternaKg / 1000).toFixed(2);

    const pesoLiquidoExternaKg = externaList.reduce((acc, p) => acc + (Number(p.pesoLiquidoKg) || 0), 0);
    const pesoLiquidoExternaTon = (pesoLiquidoExternaKg / 1000).toFixed(2);

    const mediaPorCargaKg = totalPesagens > 0 ? roundTo10Kg(pesoLiquidoTotalKg / totalPesagens) : 0;
    const placasUnicas = new Set(pesagensList.map(p => p.placa)).size;
    const aguardandoSaida = pesagensList.filter(p => p.status === 'Aguardando Tara (Saída)').length;

    return {
      totalPesagens,
      totalInterna: internaList.length,
      totalExterna: externaList.length,
      pesoLiquidoTotalKg,
      pesoLiquidoTotalTon,
      pesoLiquidoInternaKg,
      pesoLiquidoInternaTon,
      pesoLiquidoExternaKg,
      pesoLiquidoExternaTon,
      mediaPorCargaKg,
      placasUnicas,
      aguardandoSaida
    };
  }, [pesagensList]);

  // Lista Filtrada por Tipo de Frota, Resíduo, Balança, Status e Busca
  const filteredPesagens = useMemo(() => {
    return pesagensList.filter(p => {
      const matchTipoFrota = selectedTipoFrota === 'Todos' || p.tipoFrota === selectedTipoFrota;
      const matchResiduo = selectedResiduo === 'Todos' || p.tipoResiduo === selectedResiduo;
      const matchBalanca = selectedBalanca === 'Todas' || p.balanca === selectedBalanca;
      const matchStatus = selectedStatus === 'Todos' || p.status === selectedStatus;
      
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        (p.ticket && p.ticket.toLowerCase().includes(term)) ||
        (p.contador && p.contador.includes(term)) ||
        (p.placa && p.placa.toLowerCase().includes(term)) ||
        (p.placaCarreta && p.placaCarreta.toLowerCase().includes(term)) ||
        (p.veiculoNome && p.veiculoNome.toLowerCase().includes(term)) ||
        (p.motorista && p.motorista.toLowerCase().includes(term)) ||
        (p.origem && p.origem.toLowerCase().includes(term)) ||
        (p.empresaOrigem && p.empresaOrigem.toLowerCase().includes(term)) ||
        (p.clienteFornecedor && p.clienteFornecedor.toLowerCase().includes(term)) ||
        (p.transportadora && p.transportadora.toLowerCase().includes(term));

      return matchTipoFrota && matchResiduo && matchBalanca && matchStatus && matchSearch;
    });
  }, [pesagensList, selectedTipoFrota, selectedResiduo, selectedBalanca, selectedStatus, searchTerm]);

  // Ao selecionar um veículo da frota interna
  const handleSelectVeiculoInterno = (veicId) => {
    const veic = frotaInternaList.find(v => v.id === veicId);
    if (veic) {
      const nomeEmp = empresaConfig?.nomeInterno || 'SUSTENTARE SANEAMENTO';
      setNovaPesagem(prev => ({
        ...prev,
        veiculoId: veic.id,
        placa: veic.placa,
        placaCarreta: '',
        veiculoNome: `${veic.modelo} (${veic.codigo})`,
        motorista: veic.operador || prev.motorista || 'MARCOS LIMA',
        taraKg: roundTo10Kg(veic.taraKg) || prev.taraKg,
        transportadora: nomeEmp,
        clienteFornecedor: nomeEmp,
        origem: 'Setor 4 - CTR Cariri'
      }));
    } else {
      setNovaPesagem(prev => ({ ...prev, veiculoId: '' }));
    }
  };

  // Ao selecionar uma Empresa Externa
  const handleSelectEmpresaExterna = (empresaId) => {
    const emp = empresasExternas.find(e => e.id === empresaId);
    if (emp) {
      const primeiroVeic = emp.veiculos && emp.veiculos.length > 0 ? emp.veiculos[0] : null;
      const resInfo = RESIDUO_CTR_MAP[emp.tipoResiduoPadrao] || { cod: emp.codigoProduto || '15', nome: 'RESIDUOS DOMICILIARES' };

      setNovaPesagem(prev => ({
        ...prev,
        empresaExternaId: emp.id,
        clienteFornecedor: emp.nome,
        transportadora: emp.nome,
        empresaOrigem: emp.empresaOrigem || '',
        origem: emp.empresaOrigem || '',
        tipoResiduo: emp.tipoResiduoPadrao || prev.tipoResiduo,
        codigoProduto: resInfo.cod,
        produto: resInfo.nome,
        // Auto-seleciona primeiro veículo se houver
        placa: primeiroVeic ? primeiroVeic.placa : prev.placa,
        placaCarreta: primeiroVeic ? (primeiroVeic.placaCarreta || '') : '',
        veiculoNome: primeiroVeic ? `${primeiroVeic.modelo} (${emp.nome})` : `${emp.nome} - Carga`,
        motorista: primeiroVeic ? primeiroVeic.motoristaVinculado : prev.motorista,
        taraKg: primeiroVeic ? roundTo10Kg(primeiroVeic.taraPadraoKg) : prev.taraKg
      }));
    } else {
      setNovaPesagem(prev => ({ ...prev, empresaExternaId: '' }));
    }
  };

  // Ao selecionar um veículo específico da Empresa Externa
  const handleSelectVeiculoExterno = (veicId) => {
    const emp = empresasExternas.find(e => e.id === novaPesagem.empresaExternaId);
    if (!emp) return;
    const veic = emp.veiculos?.find(v => v.id === veicId);
    if (veic) {
      setNovaPesagem(prev => ({
        ...prev,
        placa: veic.placa,
        placaCarreta: veic.placaCarreta || '',
        veiculoNome: `${veic.modelo} (${emp.nome})`,
        motorista: veic.motoristaVinculado,
        taraKg: roundTo10Kg(veic.taraPadraoKg)
      }));
    }
  };

  // Peso líquido calculado no modal em tempo real (estritamente múltiplo de 10)
  const modalPesoLiquido = useMemo(() => {
    const bruto = roundTo10Kg(novaPesagem.pesoBrutoKg);
    const tara = roundTo10Kg(novaPesagem.taraKg);
    return roundTo10Kg(Math.max(0, bruto - tara));
  }, [novaPesagem.pesoBrutoKg, novaPesagem.taraKg]);

  // Salvar Nova Pesagem com valores estritamente múltiplos de 10
  const handleSalvarPesagem = (e) => {
    e.preventDefault();
    if (!novaPesagem.placa || !novaPesagem.pesoBrutoKg) {
      alert('Informe a placa do veículo e o Peso Bruto de entrada.');
      return;
    }

    const bruto = roundTo10Kg(novaPesagem.pesoBrutoKg);
    const tara = roundTo10Kg(novaPesagem.taraKg);
    const liquido = roundTo10Kg(Math.max(0, bruto - tara));

    const now = new Date();
    const dataStr = now.toLocaleDateString('pt-BR');
    const horaStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const prodInfo = RESIDUO_CTR_MAP[novaPesagem.tipoResiduo] || { cod: '15', nome: 'RESIDUOS DOMICILIARES' };

    const nova = {
      id: `PES-${Date.now()}`,
      ticket: novaPesagem.ticket || `TCK-2026-04${pesagensList.length + 15}`,
      contador: novaPesagem.contador || `${11980 + pesagensList.length}`,
      data: dataStr,
      horaEntrada: horaStr,
      horaSaida: novaPesagem.status === 'Concluída' ? horaStr : '',
      tipoFrota: novaPesagem.tipoFrota,
      empresaExternaId: novaPesagem.tipoFrota === 'Externa' ? novaPesagem.empresaExternaId : undefined,
      empresaOrigem: novaPesagem.empresaOrigem || novaPesagem.origem || 'Setor 4 - CTR Cariri',
      placa: novaPesagem.placa.toUpperCase().trim(),
      placaCarreta: (novaPesagem.placaCarreta || '').toUpperCase().trim(),
      veiculoNome: novaPesagem.veiculoNome || novaPesagem.placa.toUpperCase().trim(),
      motorista: (novaPesagem.motorista || 'MOTORISTA').toUpperCase().trim(),
      balanca: novaPesagem.balanca,
      codigoProduto: novaPesagem.codigoProduto || prodInfo.cod,
      tipoResiduo: novaPesagem.tipoResiduo,
      produto: novaPesagem.produto || prodInfo.nome,
      clienteFornecedor: (novaPesagem.clienteFornecedor || 'SUSTENTARE SANEAMENTO').toUpperCase().trim(),
      transportadora: (novaPesagem.transportadora || 'SUSTENTARE SANEAMENTO').toUpperCase().trim(),
      origem: novaPesagem.empresaOrigem || novaPesagem.origem || 'Setor 4 - CTR Cariri',
      pesoBrutoKg: bruto,
      taraKg: tara,
      pesoLiquidoKg: liquido,
      valorUnit: 0,
      operador: 'Bruno',
      status: novaPesagem.status,
      observacoes: novaPesagem.observacoes || `CARREGADO ${dataStr}`
    };

    setPesagensList(prev => [nova, ...prev]);
    setIsNovaPesagemModalOpen(false);

    // Abre direto para visualização do ticket térmico oficial
    setSelectedTicketImpressao(nova);

    // Reseta form com o próximo contador
    setNovaPesagem({
      ticket: `TCK-2026-04${pesagensList.length + 16}`,
      contador: `${11981 + pesagensList.length}`,
      tipoFrota: 'Interna',
      empresaExternaId: '',
      empresaOrigem: '',
      veiculoId: '',
      placa: '',
      placaCarreta: '',
      veiculoNome: '',
      motorista: '',
      balanca: 'Balança 01 - CTR Cariri',
      codigoProduto: '15',
      tipoResiduo: 'RSU - Resíduo Sólido Urbano',
      produto: 'RESIDUOS DOMICILIARES',
      clienteFornecedor: 'SUSTENTARE SANEAMENTO',
      transportadora: 'SUSTENTARE SANEAMENTO',
      origem: '',
      pesoBrutoKg: '',
      taraKg: '',
      status: 'Concluída',
      observacoes: ''
    });
  };

  // Funções de Gestão de Empresas Externas
  const handleAbrirNovaEmpresa = () => {
    setEmpresaEmEdicao(null);
    setFormEmpresa({
      id: `EMP-${Date.now().toString().slice(-4)}`,
      nome: '',
      cnpj: '',
      empresaOrigem: '',
      cidadeUf: '',
      contato: '',
      tipoResiduoPadrao: 'RSU - Resíduo Sólido Urbano',
      codigoProduto: '15'
    });
    setIsFormEmpresaAberto(true);
  };

  const handleEditarEmpresa = (emp) => {
    setEmpresaEmEdicao(emp);
    setFormEmpresa({
      id: emp.id,
      nome: emp.nome,
      cnpj: emp.cnpj,
      empresaOrigem: emp.empresaOrigem || '',
      cidadeUf: emp.cidadeUf || '',
      contato: emp.contato || '',
      tipoResiduoPadrao: emp.tipoResiduoPadrao || 'RSU - Resíduo Sólido Urbano',
      codigoProduto: emp.codigoProduto || '15'
    });
    setIsFormEmpresaAberto(true);
  };

  const handleSalvarEmpresa = (e) => {
    e.preventDefault();
    if (!formEmpresa.nome.trim()) {
      alert('Informe o Nome da Empresa.');
      return;
    }

    if (empresaEmEdicao) {
      // Atualizar existente
      setEmpresasExternas(prev => prev.map(emp => {
        if (emp.id === empresaEmEdicao.id) {
          return {
            ...emp,
            nome: formEmpresa.nome.toUpperCase().trim(),
            cnpj: formEmpresa.cnpj.trim(),
            empresaOrigem: formEmpresa.empresaOrigem.trim(),
            cidadeUf: formEmpresa.cidadeUf.trim(),
            contato: formEmpresa.contato.trim(),
            tipoResiduoPadrao: formEmpresa.tipoResiduoPadrao,
            codigoProduto: RESIDUO_CTR_MAP[formEmpresa.tipoResiduoPadrao]?.cod || '15'
          };
        }
        return emp;
      }));
    } else {
      // Criar nova
      const novaEmpresa = {
        id: formEmpresa.id || `EMP-${Date.now().toString().slice(-4)}`,
        nome: formEmpresa.nome.toUpperCase().trim(),
        cnpj: formEmpresa.cnpj.trim(),
        empresaOrigem: formEmpresa.empresaOrigem.trim(),
        cidadeUf: formEmpresa.cidadeUf.trim(),
        contato: formEmpresa.contato.trim(),
        tipoResiduoPadrao: formEmpresa.tipoResiduoPadrao,
        codigoProduto: RESIDUO_CTR_MAP[formEmpresa.tipoResiduoPadrao]?.cod || '15',
        veiculos: []
      };
      setEmpresasExternas(prev => [novaEmpresa, ...prev]);
    }

    setIsFormEmpresaAberto(false);
    setEmpresaEmEdicao(null);
  };

  const handleExcluirEmpresa = (empId) => {
    if (confirm('Deseja realmente remover esta empresa externa e seus veículos vinculados?')) {
      setEmpresasExternas(prev => prev.filter(e => e.id !== empId));
    }
  };

  // Funções de Veículos da Empresa Externa
  const handleAdicionarVeiculoEmpresa = (e, empId) => {
    e.preventDefault();
    if (!novoVeiculoForm.placa.trim()) {
      alert('Informe a placa do veículo.');
      return;
    }

    const taraMultiplo10 = roundTo10Kg(novoVeiculoForm.taraPadraoKg || 0);

    const novoVeic = {
      id: `VEXT-${Date.now().toString().slice(-4)}`,
      placa: novoVeiculoForm.placa.toUpperCase().trim(),
      placaCarreta: novoVeiculoForm.placaCarreta.toUpperCase().trim(),
      modelo: novoVeiculoForm.modelo.trim() || 'Caminhão Caçamba',
      taraPadraoKg: taraMultiplo10,
      motoristaVinculado: novoVeiculoForm.motoristaVinculado.toUpperCase().trim() || 'MOTORISTA'
    };

    setEmpresasExternas(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          veiculos: [...(emp.veiculos || []), novoVeic]
        };
      }
      return emp;
    }));

    // Reset
    setNovoVeiculoForm({
      placa: '',
      placaCarreta: '',
      modelo: '',
      taraPadraoKg: '',
      motoristaVinculado: ''
    });
    setEmpresaIdAdicionarVeiculo(null);
  };

  const handleRemoverVeiculoEmpresa = (empId, veicId) => {
    setEmpresasExternas(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          veiculos: (emp.veiculos || []).filter(v => v.id !== veicId)
        };
      }
      return emp;
    }));
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
              Pesagem de Veículos & Balança CTR
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
            Aferição rodoviária graduada em múltiplos de 10 kg • Frota Interna & Pesagens Externas com emissão de e-Ticket
          </p>
        </div>

        {/* Botões de Ação: Gerenciar Empresas, Frota e Nova Pesagem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsEmpresasModalOpen(true)}
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
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Building2 size={15} color="#D97706" />
            <span>Empresas Externas</span>
            <span style={{ 
              backgroundColor: '#FEF3C7', 
              color: '#B45309', 
              padding: '1px 6px', 
              borderRadius: '12px', 
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {empresasExternas.length}
            </span>
          </button>

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
              Frota Interna
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

      {/* CARDS DE MÉTRICAS DA BALANÇA (COM DIVISÃO FROTA INTERNA & EXTERNA) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '10px' 
      }}>
        {/* Card 1: Total Geral */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Peso Líquido Total</span>
            <Scale size={16} color={COLOR_PRIMARY} />
          </div>
          <span style={metricValueStyle}>{metrics.pesoLiquidoTotalTon} t</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {metrics.pesoLiquidoTotalKg.toLocaleString()} kg em {metrics.totalPesagens} viagens
          </span>
        </div>

        {/* Card 2: Frota Interna */}
        <div style={{ ...metricCardStyle, borderLeft: '4px solid #2381FD' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Frota Interna</span>
            <Truck size={16} color="#2381FD" />
          </div>
          <span style={{ ...metricValueStyle, color: '#1E40AF' }}>{metrics.pesoLiquidoInternaTon} t</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {metrics.totalInterna} descargas Sustentare
          </span>
        </div>

        {/* Card 3: Pesagens Externas */}
        <div style={{ ...metricCardStyle, borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Pesagens Externas</span>
            <Building2 size={16} color="#D97706" />
          </div>
          <span style={{ ...metricValueStyle, color: '#B45309' }}>{metrics.pesoLiquidoExternaTon} t</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {metrics.totalExterna} descargas de terceiros
          </span>
        </div>

        {/* Card 4: Média por Carga (múltiplo de 10) */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Média por Carga</span>
            <Layers size={16} color={COLOR_SUCCESS} />
          </div>
          <span style={{ ...metricValueStyle, color: COLOR_SUCCESS }}>
            {metrics.mediaPorCargaKg.toLocaleString()} kg
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>{metrics.placasUnicas} veículos distintos</span>
        </div>

        {/* Card 5: Aguardando Saída */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={metricLabelStyle}>Pátio / Saída</span>
            <Clock size={16} color={metrics.aguardandoSaida > 0 ? COLOR_WARNING : '#94A3B8'} />
          </div>
          <span style={{ ...metricValueStyle, color: metrics.aguardandoSaida > 0 ? '#B45309' : '#0F1C2C' }}>
            {metrics.aguardandoSaida}
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Aguardando pesagem tara</span>
        </div>
      </div>

      {/* SEGMENTED CONTROL: DIVISÃO FROTA INTERNA vs PESAGENS EXTERNAS */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '6px',
        border: '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Tabs de Divisão */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedTipoFrota('Todos')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedTipoFrota === 'Todos' ? '#0F1C2C' : 'transparent',
              color: selectedTipoFrota === 'Todos' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Todas as Pesagens</span>
            <span style={{
              backgroundColor: selectedTipoFrota === 'Todos' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              color: selectedTipoFrota === 'Todos' ? '#FFFFFF' : '#475569',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {pesagensList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTipoFrota('Interna')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedTipoFrota === 'Interna' ? '#2381FD' : 'transparent',
              color: selectedTipoFrota === 'Interna' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Truck size={14} />
            <span>Frota Interna (Sustentare)</span>
            <span style={{
              backgroundColor: selectedTipoFrota === 'Interna' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              color: selectedTipoFrota === 'Interna' ? '#FFFFFF' : '#475569',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {metrics.totalInterna}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTipoFrota('Externa')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedTipoFrota === 'Externa' ? '#D97706' : 'transparent',
              color: selectedTipoFrota === 'Externa' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={14} />
            <span>Pesagens Externas (Terceiros & Clientes)</span>
            <span style={{
              backgroundColor: selectedTipoFrota === 'Externa' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              color: selectedTipoFrota === 'Externa' ? '#FFFFFF' : '#475569',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {metrics.totalExterna}
            </span>
          </button>
        </div>

        {/* Botão de Atalho Rápido para Cadastrar Empresa */}
        <button
          type="button"
          onClick={() => {
            setIsEmpresasModalOpen(true);
            handleAbrirNovaEmpresa();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px dashed #D97706',
            backgroundColor: '#FFFBEB',
            color: '#B45309',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <Plus size={13} />
          Cadastrar Empresa Externa
        </button>
      </div>

      {/* BARRA DE PESQUISA, FILTROS FLUTUANTES E ALTERNADOR DE VISUALIZAÇÃO */}
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
            flex: '1 1 240px',
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
              placeholder="Buscar por Ticket, Placa, Empresa de Origem, Motorista..."
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

          {/* Botões de Ação: Filtro Flutuante + Alternador Cards / Tabela */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Botão de Filtro com Menu Flutuante */}
            <div style={{ position: 'relative' }} ref={filterMenuRef}>
              <button
                type="button"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                title="Filtrar por Resíduo, Balança e Status"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: (selectedResiduo !== 'Todos' || selectedBalanca !== 'Todas' || selectedStatus !== 'Todos') ? '#0F1C2C' : '#FFFFFF',
                  color: (selectedResiduo !== 'Todos' || selectedBalanca !== 'Todas' || selectedStatus !== 'Todos') ? '#FFFFFF' : '#0F1C2C',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Filter size={14} />
                <span>Filtros</span>
                <ChevronDown size={14} />
              </button>

              {/* MENU FLUTUANTE */}
              {isFilterMenuOpen && (
                <>
                  <div
                    onClick={() => setIsFilterMenuOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100dvh',
                      backgroundColor: 'rgba(15, 28, 44, 0.25)',
                      zIndex: 999
                    }}
                  />

                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                    border: '1px solid #CBD5E1',
                    width: 'min(320px, calc(100vw - 32px))',
                    maxHeight: 'min(580px, calc(100dvh - 36px))',
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
                        <div style={{ backgroundColor: '#EFF6FF', padding: '6px', borderRadius: '8px' }}>
                          <Scale size={16} color={COLOR_PRIMARY} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F1C2C' }}>
                            Filtros de Pesagem
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Resíduos, balança e status
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsFilterMenuOpen(false)}
                        style={{ border: 'none', background: '#F1F5F9', color: '#64748B', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Filtro: Tipo de Resíduo */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Tipo de Carga / Resíduo
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '160px', overflowY: 'auto' }}>
                        {TIPOS_RESIDUOS.map(tipo => {
                          const isSel = selectedResiduo === tipo;
                          return (
                            <button
                              key={tipo}
                              type="button"
                              onClick={() => setSelectedResiduo(tipo)}
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
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{tipo}</span>
                              {isSel && <Check size={14} color="#2381FD" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filtro: Balança */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Balança Rodoviária
                      </div>
                      <select
                        value={selectedBalanca}
                        onChange={(e) => setSelectedBalanca(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '12px',
                          color: '#0F1C2C',
                          fontWeight: '600'
                        }}
                      >
                        <option value="Todas">Todas as Balanças</option>
                        <option value="Balança 01 - CTR Cariri">Balança 01 - CTR Cariri</option>
                        <option value="Balança 02 - Estação de Transbordo">Balança 02 - Transbordo</option>
                        <option value="Balança 03 - Pátio Operacional Juazeiro">Balança 03 - Pátio Juazeiro</option>
                      </select>
                    </div>

                    {/* Filtro: Status */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Status da Pesagem
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {['Todos', 'Concluída', 'Aguardando Tara (Saída)'].map(st => {
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
                                cursor: 'pointer'
                              }}
                            >
                              <span>{st === 'Aguardando Tara (Saída)' ? 'Aguardando' : st}</span>
                              {isSel && <Check size={13} color="#FFFFFF" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResiduo('Todos');
                          setSelectedBalanca('Todas');
                          setSelectedStatus('Todos');
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Limpar
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
                          padding: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Alternador Cards vs Tabela */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
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

        {/* Badges de Filtros Ativos */}
        {(selectedResiduo !== 'Todos' || selectedBalanca !== 'Todas' || selectedStatus !== 'Todos' || selectedTipoFrota !== 'Todos') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Filtros ativos:</span>
            {selectedTipoFrota !== 'Todos' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: selectedTipoFrota === 'Interna' ? '#2381FD' : '#D97706',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                <span>Frota: {selectedTipoFrota === 'Interna' ? 'Frota Interna' : 'Pesagens Externas'}</span>
                <button type="button" onClick={() => setSelectedTipoFrota('Todos')} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', padding: 0 }}>✕</button>
              </span>
            )}
            {selectedResiduo !== 'Todos' && (
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
                <span>Resíduo: {selectedResiduo}</span>
                <button type="button" onClick={() => setSelectedResiduo('Todos')} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', padding: 0 }}>✕</button>
              </span>
            )}
            {selectedBalanca !== 'Todas' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                <span>Balança: {selectedBalanca}</span>
                <button type="button" onClick={() => setSelectedBalanca('Todas')} style={{ border: 'none', background: 'transparent', color: '#FFF', cursor: 'pointer', padding: 0 }}>✕</button>
              </span>
            )}
            {selectedStatus !== 'Todos' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#F5C344',
                color: '#0F1C2C',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                <span>Status: {selectedStatus}</span>
                <button type="button" onClick={() => setSelectedStatus('Todos')} style={{ border: 'none', background: 'transparent', color: '#0F1C2C', cursor: 'pointer', padding: 0 }}>✕</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedTipoFrota('Todos');
                setSelectedResiduo('Todos');
                setSelectedBalanca('Todas');
                setSelectedStatus('Todos');
              }}
              style={{ border: 'none', background: 'transparent', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            >
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* LISTA / TABELA DE PESAGENS */}
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
            Nenhum registro de pesagem encontrado com os filtros selecionados
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            Alterne entre Frota Interna / Pesagens Externas ou clique em "+ Nova Pesagem".
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* VISUALIZAÇÃO EM CARDS DE PESAGEM */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
          gap: '12px'
        }}>
          {filteredPesagens.map((p) => {
            const isExterna = p.tipoFrota === 'Externa';
            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: isExterna ? '1px solid #FCD34D' : '1px solid #CBD5E1',
                  borderTop: isExterna ? '4px solid #D97706' : '4px solid #2381FD',
                  padding: '14px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  {/* Linha 1: Ticket, Tag Frota Interna/Externa e Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        backgroundColor: '#EFF6FF',
                        color: COLOR_PRIMARY,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #BFDBFE'
                      }}>
                        {p.ticket}
                      </span>

                      {/* Tag de Frota */}
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
                        {isExterna ? <Building2 size={11} /> : <Truck size={11} />}
                        {isExterna ? 'PESAGEM EXTERNA' : 'FROTA INTERNA'}
                      </span>
                    </div>
                    
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
                  </div>

                  {/* Linha 2: Placas e Veículo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#0F1C2C',
                      color: '#FFFFFF',
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {p.placa}
                    </span>
                    {p.placaCarreta && (
                      <span style={{
                        backgroundColor: '#334155',
                        color: '#FFFFFF',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        fontSize: '10px',
                        padding: '2px 5px',
                        borderRadius: '4px'
                      }}>
                        Carreta: {p.placaCarreta}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F1C2C' }}>
                      {p.veiculoNome}
                    </span>
                  </div>

                  {/* Linha 3: Empresa de Origem & Cliente */}
                  <div style={{
                    backgroundColor: isExterna ? '#FFFBEB' : '#F8FAFC',
                    borderRadius: '8px',
                    padding: '8px',
                    border: isExterna ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: isExterna ? '#92400E' : '#1E293B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} />
                      {p.clienteFornecedor}
                    </div>
                    {(p.empresaOrigem || p.origem) && (
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} color="#94A3B8" />
                        <span>Origem do Produto: <strong>{p.empresaOrigem || p.origem}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Linha 4: Carga / Resíduo */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#F1F5F9',
                      color: '#334155',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {p.tipoResiduo}
                    </span>
                    <span style={{
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0'
                    }}>
                      {p.balanca}
                    </span>
                  </div>

                  {/* Linha 5: Pesagens (Múltiplos de 10) e Motorista */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                      <span>Bruto: <strong>{roundTo10Kg(p.pesoBrutoKg).toLocaleString()} kg</strong></span>
                      <span>Tara: <strong>{roundTo10Kg(p.taraKg).toLocaleString()} kg</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F1C2C' }}>
                        PESO LÍQUIDO:
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#15803D' }}>
                        +{roundTo10Kg(p.pesoLiquidoKg).toLocaleString()} kg ({(roundTo10Kg(p.pesoLiquidoKg) / 1000).toFixed(2)} t)
                      </span>
                    </div>

                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Motorista: <strong>{p.motorista}</strong></span>
                      <span>{p.data} {p.horaEntrada}</span>
                    </div>
                  </div>
                </div>

                {/* Botão Ticket */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketImpressao(p)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#0F1C2C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={13} />
                  Visualizar e-Ticket Térmico
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISUALIZAÇÃO EM TABELA DE PESAGEM */
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          border: '1px solid #CBD5E1', 
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '880px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800' }}>
                <th style={{ padding: '10px 12px' }}>TICKET & DATA</th>
                <th style={{ padding: '10px 12px' }}>FROTA</th>
                <th style={{ padding: '10px 12px' }}>PLACA & VEÍCULO</th>
                <th style={{ padding: '10px 12px' }}>EMPRESA & ORIGEM</th>
                <th style={{ padding: '10px 12px' }}>MOTORISTA</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>BRUTO (KG)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>TARA (KG)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>LÍQUIDO (KG)</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>COMPROVANTE</th>
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
                        {p.data} {p.horaEntrada}
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
                            {p.placaCarreta}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        {p.veiculoNome}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{p.clienteFornecedor}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{p.empresaOrigem || p.origem}</div>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTicketImpressao(p)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#0F1C2C',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={12} />
                        e-Ticket
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: REGISTRAR NOVA PESAGEM (COM DIVISÃO INTERNA/EXTERNA E MÚLTIPLOS DE 10) */}
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
            maxWidth: '680px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            {/* Header do Modal */}
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
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Aferição de balança rodoviária graduada em múltiplos de 10 kg
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNovaPesagemModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarPesagem} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* SELETOR PRINCIPAL: FROTA INTERNA OU PESAGEM EXTERNA */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '10px 12px',
                border: '1px solid #CBD5E1'
              }}>
                <label style={{ ...formLabelStyle, marginBottom: '6px' }}>Origem da Carga / Categoria do Veículo *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNovaPesagem(prev => ({
                        ...prev,
                        tipoFrota: 'Interna',
                        empresaExternaId: '',
                        clienteFornecedor: 'SUSTENTARE SANEAMENTO',
                        transportadora: 'SUSTENTARE SANEAMENTO',
                        origem: 'Setor 4 - CTR Cariri'
                      }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: novaPesagem.tipoFrota === 'Interna' ? '2px solid #2381FD' : '1px solid #CBD5E1',
                      backgroundColor: novaPesagem.tipoFrota === 'Interna' ? '#EFF6FF' : '#FFFFFF',
                      color: novaPesagem.tipoFrota === 'Interna' ? '#1E40AF' : '#475569',
                      cursor: 'pointer',
                      fontWeight: '800',
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <Truck size={18} color={novaPesagem.tipoFrota === 'Interna' ? '#2381FD' : '#64748B'} />
                    <div>
                      <div>Frota Interna</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', color: '#64748B' }}>Veículos Sustentare Saneamento</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNovaPesagem(prev => ({
                        ...prev,
                        tipoFrota: 'Externa',
                        veiculoId: ''
                      }));
                      if (empresasExternas.length > 0) {
                        handleSelectEmpresaExterna(empresasExternas[0].id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: novaPesagem.tipoFrota === 'Externa' ? '2px solid #D97706' : '1px solid #CBD5E1',
                      backgroundColor: novaPesagem.tipoFrota === 'Externa' ? '#FFFBEB' : '#FFFFFF',
                      color: novaPesagem.tipoFrota === 'Externa' ? '#B45309' : '#475569',
                      cursor: 'pointer',
                      fontWeight: '800',
                      fontSize: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <Building2 size={18} color={novaPesagem.tipoFrota === 'Externa' ? '#D97706' : '#64748B'} />
                    <div>
                      <div>Pesagem Externa</div>
                      <div style={{ fontSize: '10px', fontWeight: '500', color: '#64748B' }}>Empresas terceiras e parceiros</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SELEÇÃO ESPECÍFICA CONFORME TIPO */}
              {novaPesagem.tipoFrota === 'Interna' ? (
                /* Seleção de Veículo da Frota Interna */
                <div>
                  <label style={formLabelStyle}>
                    Selecionar Veículo da Frota ({empresaConfig.nomeInterno}) - Auto-preenche Tara e Motorista
                  </label>
                  <select
                    value={novaPesagem.veiculoId}
                    onChange={(e) => handleSelectVeiculoInterno(e.target.value)}
                    style={formInputStyle}
                  >
                    <option value="">Selecione para puxar dados da frota interna...</option>
                    {frotaInternaList.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.placa} - {v.modelo} (Tara: {roundTo10Kg(v.taraKg)} kg) - Op: {v.operador}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Seleção de Empresa Externa Cadastrada */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'flex-end' }}>
                    <div>
                      <label style={formLabelStyle}>Empresa Externa Cadastrada *</label>
                      <select
                        value={novaPesagem.empresaExternaId}
                        onChange={(e) => handleSelectEmpresaExterna(e.target.value)}
                        style={formInputStyle}
                      >
                        <option value="">Selecione a empresa cadastrada...</option>
                        {empresasExternas.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.nome} ({emp.cidadeUf || 'CE'}) - {emp.veiculos?.length || 0} veículos
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEmpresasModalOpen(true);
                        handleAbrirNovaEmpresa();
                      }}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: '#FFFBEB',
                        color: '#B45309',
                        border: '1px solid #FCD34D',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Nova Empresa
                    </button>
                  </div>

                  {/* Veículos vinculados à empresa selecionada */}
                  {novaPesagem.empresaExternaId && (
                    <div>
                      <label style={formLabelStyle}>
                        Placas / Veículos Vinculados à Empresa:
                      </label>
                      {(() => {
                        const empSel = empresasExternas.find(e => e.id === novaPesagem.empresaExternaId);
                        const veics = empSel?.veiculos || [];
                        if (veics.length === 0) {
                          return (
                            <div style={{ fontSize: '11px', color: '#64748B', padding: '6px 0' }}>
                              Nenhum veículo cadastrado para esta empresa. Digite a placa abaixo ou cadastre na gestão de empresas.
                            </div>
                          );
                        }
                        return (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {veics.map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleSelectVeiculoExterno(v.id)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: novaPesagem.placa === v.placa ? '2px solid #D97706' : '1px solid #CBD5E1',
                                  backgroundColor: novaPesagem.placa === v.placa ? '#FEF3C7' : '#FFFFFF',
                                  color: '#0F1C2C',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <span style={{ fontFamily: 'monospace', fontWeight: '800' }}>{v.placa}</span>
                                {v.placaCarreta && <span style={{ fontSize: '9px', color: '#64748B' }}>+{v.placaCarreta}</span>}
                                <span style={{ fontSize: '10px', color: '#475569' }}>({v.motoristaVinculado})</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Empresa de Origem do Produto Carregado */}
                  <div>
                    <label style={formLabelStyle}>Empresa / Local de Origem do Produto Carregado *</label>
                    <input
                      type="text"
                      required
                      value={novaPesagem.empresaOrigem}
                      onChange={(e) => setNovaPesagem({ ...novaPesagem, empresaOrigem: e.target.value, origem: e.target.value })}
                      placeholder="Ex: Consórcio Público CORES - Brejo Santo / Canteiro Obras"
                      style={formInputStyle}
                    />
                  </div>
                </div>
              )}

              {/* DADOS DO TICKET, CONTADOR E BALANÇA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
                  <label style={formLabelStyle}>Contador</label>
                  <input
                    type="text"
                    value={novaPesagem.contador}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, contador: e.target.value })}
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
                    <option value="Balança 01 - CTR Cariri">Balança 01 - CTR Cariri</option>
                    <option value="Balança 02 - Estação de Transbordo">Balança 02 - Transbordo</option>
                    <option value="Balança 03 - Pátio Juazeiro">Balança 03 - Pátio Juazeiro</option>
                  </select>
                </div>
              </div>

              {/* PLACAS E MOTORISTA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={novaPesagem.placa}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, placa: e.target.value.toUpperCase() })}
                    placeholder="Ex: GII8H27"
                    style={{ ...formInputStyle, fontWeight: '800', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Placa da Carreta</label>
                  <input
                    type="text"
                    value={novaPesagem.placaCarreta}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, placaCarreta: e.target.value.toUpperCase() })}
                    placeholder="Ex: PLK9933"
                    style={{ ...formInputStyle, fontWeight: '700', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Motorista Vinculado *</label>
                  <input
                    type="text"
                    required
                    value={novaPesagem.motorista}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, motorista: e.target.value.toUpperCase() })}
                    placeholder="Ex: ROBERTO"
                    style={formInputStyle}
                  />
                </div>
              </div>

              {/* CLIENTE / TRANSPORTADORA E TIPO DE CARGA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Cliente / Fornecedor</label>
                  <input
                    type="text"
                    value={novaPesagem.clienteFornecedor}
                    onChange={(e) => setNovaPesagem({ ...novaPesagem, clienteFornecedor: e.target.value.toUpperCase() })}
                    placeholder="Ex: CORES CARIRI ORIENTAL"
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Tipo de Carga / Resíduo *</label>
                  <select
                    value={novaPesagem.tipoResiduo}
                    onChange={(e) => {
                      const res = e.target.value;
                      const info = RESIDUO_CTR_MAP[res] || { cod: '15', nome: 'RESIDUOS DOMICILIARES' };
                      setNovaPesagem({ 
                        ...novaPesagem, 
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
              </div>

              {/* CARD DE AFERIÇÃO DE PESO - ESTRITAMENTE MÚLTIPLOS DE 10 */}
              <div style={{ 
                backgroundColor: '#F8FAFC', 
                borderRadius: '12px', 
                padding: '12px', 
                border: '1px solid #CBD5E1',
                marginTop: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F1C2C' }}>
                    AFERIÇÃO DE PESOS DA BALANÇA (KG)
                  </span>
                  <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: '700', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    Divisão Balança d = 10 kg
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {/* Peso Bruto */}
                  <div>
                    <label style={formLabelStyle}>Peso Bruto (kg) *</label>
                    <input
                      type="number"
                      step="10"
                      required
                      value={novaPesagem.pesoBrutoKg}
                      onChange={(e) => setNovaPesagem({ ...novaPesagem, pesoBrutoKg: e.target.value })}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setNovaPesagem(prev => ({ ...prev, pesoBrutoKg: roundTo10Kg(e.target.value) }));
                        }
                      }}
                      placeholder="Ex: 24800"
                      style={{ ...formInputStyle, fontSize: '13px', fontWeight: '800', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Múltiplo de 10 kg</span>
                  </div>

                  {/* Tara */}
                  <div>
                    <label style={formLabelStyle}>Tara do Veículo (kg)</label>
                    <input
                      type="number"
                      step="10"
                      value={novaPesagem.taraKg}
                      onChange={(e) => setNovaPesagem({ ...novaPesagem, taraKg: e.target.value })}
                      onBlur={(e) => {
                        if (e.target.value) {
                          setNovaPesagem(prev => ({ ...prev, taraKg: roundTo10Kg(e.target.value) }));
                        }
                      }}
                      placeholder="Ex: 12020"
                      style={{ ...formInputStyle, fontSize: '13px', fontWeight: '800', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Múltiplo de 10 kg</span>
                  </div>

                  {/* Líquido Calculado */}
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
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D' }}>PESO LÍQUIDO</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#15803D', fontFamily: 'monospace' }}>
                      {modalPesoLiquido.toLocaleString()} kg
                    </span>
                    <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '600' }}>
                      {(modalPesoLiquido / 1000).toFixed(2)} toneladas
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={formLabelStyle}>Observações da Carga</label>
                <textarea
                  rows={2}
                  value={novaPesagem.observacoes}
                  onChange={(e) => setNovaPesagem({ ...novaPesagem, observacoes: e.target.value })}
                  placeholder="Ex: Setor de descarrego, notas fiscais, conferência..."
                  style={{ ...formInputStyle, resize: 'none' }}
                />
              </div>

              {/* Botões do Rodapé */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
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
                  Concluir & Emitir e-Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GESTÃO COMPLETA DE EMPRESAS EXTERNAS & VEÍCULOS VINCULADOS */}
      {isEmpresasModalOpen && (
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
            maxWidth: '820px',
            maxHeight: '94dvh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #CBD5E1'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#F59E0B" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    Cadastro & Gestão de Empresas Externas
                  </h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Empresas que descarregam no CTR, placas de veículos, motoristas vinculados e origem do produto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEmpresasModalOpen(false);
                  setIsFormEmpresaAberto(false);
                  setEmpresaIdAdicionarVeiculo(null);
                }}
                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Barra de ação do topo do modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F1C2C' }}>
                  {empresasExternas.length} Empresas Externas Cadastradas
                </span>
                
                {!isFormEmpresaAberto && (
                  <button
                    type="button"
                    onClick={handleAbrirNovaEmpresa}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#D97706',
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
                    Cadastrar Nova Empresa
                  </button>
                )}
              </div>

              {/* FORMULÁRIO DE CADASTRO / EDIÇÃO DE EMPRESA */}
              {isFormEmpresaAberto && (
                <div style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid #FCD34D'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>
                      {empresaEmEdicao ? `Editar Empresa: ${empresaEmEdicao.nome}` : 'Cadastrar Nova Empresa Externa'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormEmpresaAberto(false)}
                      style={{ border: 'none', background: 'transparent', color: '#B45309', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                    >
                      Cancelar
                    </button>
                  </div>

                  <form onSubmit={handleSalvarEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={formLabelStyle}>Razão Social / Nome da Empresa *</label>
                        <input
                          type="text"
                          required
                          value={formEmpresa.nome}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
                          placeholder="Ex: CORES CARIRI ORIENTAL"
                          style={formInputStyle}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyle}>CNPJ</label>
                        <input
                          type="text"
                          value={formEmpresa.cnpj}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, cnpj: e.target.value })}
                          placeholder="Ex: 00.000.000/0001-00"
                          style={formInputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={formLabelStyle}>Empresa de Origem do Produto Carregado *</label>
                        <input
                          type="text"
                          required
                          value={formEmpresa.empresaOrigem}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, empresaOrigem: e.target.value })}
                          placeholder="Ex: Consórcio Público CORES - Brejo Santo / Canteiro Obras"
                          style={formInputStyle}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyle}>Cidade / UF</label>
                        <input
                          type="text"
                          value={formEmpresa.cidadeUf}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, cidadeUf: e.target.value })}
                          placeholder="Ex: Brejo Santo / CE"
                          style={formInputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={formLabelStyle}>Contato / Telefone / Responsável</label>
                        <input
                          type="text"
                          value={formEmpresa.contato}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, contato: e.target.value })}
                          placeholder="Ex: (88) 3531-0000 - Carlos"
                          style={formInputStyle}
                        />
                      </div>
                      <div>
                        <label style={formLabelStyle}>Tipo de Carga / Resíduo Padrão</label>
                        <select
                          value={formEmpresa.tipoResiduoPadrao}
                          onChange={(e) => setFormEmpresa({ ...formEmpresa, tipoResiduoPadrao: e.target.value })}
                          style={formInputStyle}
                        >
                          {TIPOS_RESIDUOS.filter(t => t !== 'Todos').map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setIsFormEmpresaAberto(false)}
                        style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#D97706', color: '#FFFFFF', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                      >
                        {empresaEmEdicao ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LISTAGEM DAS EMPRESAS EXTERNAS E SEUS VEÍCULOS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {empresasExternas.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {/* Cabeçalho da Empresa */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F1C2C' }}>
                            {emp.nome}
                          </span>
                          {emp.cnpj && (
                            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                              CNPJ: {emp.cnpj}
                            </span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <span>Origem do Produto: <strong>{emp.empresaOrigem || 'Não definida'}</strong></span>
                          {emp.cidadeUf && <span>Local: <strong>{emp.cidadeUf}</strong></span>}
                          {emp.contato && <span>Contato: <strong>{emp.contato}</strong></span>}
                          <span>Resíduo: <strong>{emp.tipoResiduoPadrao}</strong></span>
                        </div>
                      </div>

                      {/* Ações da Empresa */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditarEmpresa(emp)}
                          title="Editar Empresa"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#F1F5F9',
                            color: '#0F1C2C',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={12} /> Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluirEmpresa(emp.id)}
                          title="Excluir Empresa"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* SEÇÃO DE VEÍCULOS & PLACAS POR EMPRESA */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '10px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={13} />
                          Placas e Veículos Cadastrados ({emp.veiculos?.length || 0})
                        </span>

                        <button
                          type="button"
                          onClick={() => setEmpresaIdAdicionarVeiculo(empresaIdAdicionarVeiculo === emp.id ? null : emp.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#FFFFFF',
                            color: '#D97706',
                            border: '1px solid #FCD34D',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={12} />
                          Adicionar Veículo
                        </button>
                      </div>

                      {/* Form Inline para Adicionar Veículo */}
                      {empresaIdAdicionarVeiculo === emp.id && (
                        <form
                          onSubmit={(e) => handleAdicionarVeiculoEmpresa(e, emp.id)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '10px',
                            border: '1px solid #CBD5E1',
                            marginBottom: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F1C2C' }}>
                            Novo Veículo para {emp.nome}
                          </span>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            <div>
                              <label style={formLabelStyle}>Placa Caminhão *</label>
                              <input
                                type="text"
                                required
                                value={novoVeiculoForm.placa}
                                onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, placa: e.target.value.toUpperCase() })}
                                placeholder="Ex: GII8H27"
                                style={{ ...formInputStyle, fontFamily: 'monospace', fontWeight: '800' }}
                              />
                            </div>
                            <div>
                              <label style={formLabelStyle}>Placa Carreta</label>
                              <input
                                type="text"
                                value={novoVeiculoForm.placaCarreta}
                                onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, placaCarreta: e.target.value.toUpperCase() })}
                                placeholder="Ex: PLK9933"
                                style={{ ...formInputStyle, fontFamily: 'monospace' }}
                              />
                            </div>
                            <div>
                              <label style={formLabelStyle}>Modelo do Veículo</label>
                              <input
                                type="text"
                                value={novoVeiculoForm.modelo}
                                onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, modelo: e.target.value })}
                                placeholder="Ex: VW 24.260"
                                style={formInputStyle}
                              />
                            </div>
                            <div>
                              <label style={formLabelStyle}>Tara Padrão (kg)</label>
                              <input
                                type="number"
                                step="10"
                                value={novoVeiculoForm.taraPadraoKg}
                                onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, taraPadraoKg: e.target.value })}
                                onBlur={(e) => {
                                  if (e.target.value) {
                                    setNovoVeiculoForm(prev => ({ ...prev, taraPadraoKg: roundTo10Kg(e.target.value) }));
                                  }
                                }}
                                placeholder="Ex: 12020"
                                style={formInputStyle}
                              />
                            </div>
                            <div>
                              <label style={formLabelStyle}>Motorista Vinculado</label>
                              <input
                                type="text"
                                value={novoVeiculoForm.motoristaVinculado}
                                onChange={(e) => setNovoVeiculoForm({ ...novoVeiculoForm, motoristaVinculado: e.target.value.toUpperCase() })}
                                placeholder="Ex: ROBERTO"
                                style={formInputStyle}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setEmpresaIdAdicionarVeiculo(null)}
                              style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#D97706', color: '#FFF', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Salvar Veículo
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Lista de veículos cadastrados na empresa */}
                      {emp.veiculos && emp.veiculos.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {emp.veiculos.map(v => (
                            <div
                              key={v.id}
                              style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  backgroundColor: '#0F1C2C',
                                  color: '#FFFFFF',
                                  fontFamily: 'monospace',
                                  fontWeight: '800',
                                  fontSize: '11px',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {v.placa}
                                </span>
                                {v.placaCarreta && (
                                  <span style={{ backgroundColor: '#475569', color: '#FFF', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                                    Carreta: {v.placaCarreta}
                                  </span>
                                )}
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F1C2C' }}>
                                  {v.modelo}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '11px', color: '#475569' }}>
                                  Motorista: <strong>{v.motoristaVinculado}</strong>
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  Tara: <strong>{roundTo10Kg(v.taraPadraoKg).toLocaleString()} kg</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoverVeiculoEmpresa(emp.id, v.id)}
                                  title="Remover Veículo"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    padding: '2px'
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                          Nenhum veículo cadastrado. Clique em "+ Adicionar Veículo" para cadastrar placas e motoristas desta empresa.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPROVANTE / TICKET TÉRMICO OFICIAL CTR CARIRI */}
      {selectedTicketImpressao && (
        <ThermalTicketReceipt
          ticket={selectedTicketImpressao}
          onClose={() => setSelectedTicketImpressao(null)}
        />
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
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
};

const metricLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
};

const metricValueStyle = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#0F1C2C'
};

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

export default PesagemVeiculos;
