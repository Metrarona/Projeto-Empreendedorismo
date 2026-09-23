import { useState, useMemo } from 'react';
import { 
  Package, 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Plus, 
  AlertTriangle, 
  UserCheck, 
  Filter, 
  X,
  Check,
  Building2
} from 'lucide-react';

const COLOR_PRIMARY = '#2381FD';
const COLOR_BG_LIGHT = '#D8E0E5';
const COLOR_TOTAL = '#95BDFB';
const COLOR_EXECUCAO = '#7A55D3';
const COLOR_CONCLUIDO = '#34AC4C';
const COLOR_ALTA = '#FF4D4D';

const CATEGORIAS_ESTOQUE = [
  'Todos',
  'EPIs',
  'Ferramentas',
  'Material para escritório',
  'Ferramentas de jardinagem',
  'Ferramentas da Mecânica',
  'Peças de reposição',
  'Óleos de lubrificação e Hidráulicos',
  'Material de construção',
  'Material de Limpeza'
];

const INITIAL_ITENS = [
  { id: 'EST-001', nome: 'Capacete de Segurança c/ Carneira', categoria: 'EPIs', quantidade: 42, un: 'un', estoqueMin: 15, localizacao: 'Prateleira A1', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-002', nome: 'Óculos de Proteção Incolor', categoria: 'EPIs', quantidade: 8, un: 'un', estoqueMin: 20, localizacao: 'Prateleira A2', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-003', nome: 'Luva de Vaqueta Mista', categoria: 'EPIs', quantidade: 55, un: 'par', estoqueMin: 25, localizacao: 'Prateleira A3', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-004', nome: 'Chave de Fenda Cruzada 1/4x6"', categoria: 'Ferramentas', quantidade: 14, un: 'un', estoqueMin: 5, localizacao: 'Painel 02', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-005', nome: 'Martelo Unha 27mm Cabo Fibra', categoria: 'Ferramentas', quantidade: 6, un: 'un', estoqueMin: 4, localizacao: 'Painel 02', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-006', nome: 'Chave de Impacto Pneumática 1/2"', categoria: 'Ferramentas da Mecânica', quantidade: 3, un: 'un', estoqueMin: 2, localizacao: 'Armário Mecânica', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-007', nome: 'Torquímetro de Estalo 40-200Nm', categoria: 'Ferramentas da Mecânica', quantidade: 2, un: 'un', estoqueMin: 2, localizacao: 'Armário Mecânica', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-008', nome: 'Tesoura de Poda Profissional', categoria: 'Ferramentas de jardinagem', quantidade: 5, un: 'un', estoqueMin: 3, localizacao: 'Gaveteiro J1', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-009', nome: 'Fio de Nylon para Roçadeira 3mm (Rolo)', categoria: 'Ferramentas de jardinagem', quantidade: 11, un: 'rolo', estoqueMin: 4, localizacao: 'Gaveteiro J2', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-010', nome: 'Papel A4 Sulfite 75g (Caixa c/ 10 resmas)', categoria: 'Material para escritório', quantidade: 18, un: 'cx', estoqueMin: 5, localizacao: 'Armário Escritório', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-011', nome: 'Caneta Esferográfica Azul (Caixa 50un)', categoria: 'Material para escritório', quantidade: 7, un: 'cx', estoqueMin: 3, localizacao: 'Armário Escritório', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-012', nome: 'Filtro de Óleo Hidráulico HF6510', categoria: 'Peças de reposição', quantidade: 4, un: 'un', estoqueMin: 6, localizacao: 'Rack Peças B', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-013', nome: 'Correia Alternador CAT 320', categoria: 'Peças de reposição', quantidade: 3, un: 'un', estoqueMin: 5, localizacao: 'Rack Peças B', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-014', nome: 'Óleo Hidráulico ISO VG 68 (Tambor 200L)', categoria: 'Óleos de lubrificação e Hidráulicos', quantidade: 3, un: 'tambor', estoqueMin: 2, localizacao: 'Bacia de Contenção L1', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-015', nome: 'Graxa Automotiva Base Lítio EP-2 (Balde 18kg)', categoria: 'Óleos de lubrificação e Hidráulicos', quantidade: 5, un: 'balde', estoqueMin: 3, localizacao: 'Bacia de Contenção L2', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-016', nome: 'Cimento Portland CP-II (Saco 50kg)', categoria: 'Material de construção', quantidade: 30, un: 'saco', estoqueMin: 15, localizacao: 'Depósito Alvenaria', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-017', nome: 'Argamassa AC-II Cinza (Saco 20kg)', categoria: 'Material de construção', quantidade: 12, un: 'saco', estoqueMin: 10, localizacao: 'Depósito Alvenaria', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-018', nome: 'Detergente Desengraxante Industrial 5L', categoria: 'Material de Limpeza', quantidade: 16, un: 'gl', estoqueMin: 6, localizacao: 'Almoxarifado Químicos', responsavel: 'Carlos Almoxarife' },
  { id: 'EST-019', nome: 'Pano de Limpeza Industrial / Estopa (Fardo 5kg)', categoria: 'Material de Limpeza', quantidade: 9, un: 'fd', estoqueMin: 4, localizacao: 'Almoxarifado Químicos', responsavel: 'Carlos Almoxarife' },
];

const INITIAL_MOVIMENTACOES = [
  {
    id: 'MOV-0101',
    data: '15/09/2026 09:20',
    tipo: 'Saída',
    materialId: 'EST-001',
    materialNome: 'Capacete de Segurança c/ Carneira',
    categoria: 'EPIs',
    quantidade: 2,
    un: 'un',
    solicitante: 'Marcos Lima (Frente de Lavra)',
    responsavelEntrega: 'Carlos Almoxarife',
    observacao: 'Troca de EPI avariado em operação'
  },
  {
    id: 'MOV-0102',
    data: '15/09/2026 08:45',
    tipo: 'Saída',
    materialId: 'EST-014',
    materialNome: 'Óleo Hidráulico ISO VG 68 (Tambor 200L)',
    categoria: 'Óleos de lubrificação e Hidráulicos',
    quantidade: 1,
    un: 'tambor',
    solicitante: 'João Silva (Mecânica Central)',
    responsavelEntrega: 'Carlos Almoxarife',
    observacao: 'Atendimento à OS-0128 CAT 320'
  },
  {
    id: 'MOV-0103',
    data: '14/09/2026 16:10',
    tipo: 'Entrada',
    materialId: 'EST-010',
    materialNome: 'Papel A4 Sulfite 75g (Caixa c/ 10 resmas)',
    categoria: 'Material para escritório',
    quantidade: 10,
    un: 'cx',
    solicitante: 'Suprimentos / NF 8412',
    responsavelEntrega: 'Carlos Almoxarife',
    observacao: 'Recebimento de compra mensal'
  },
  {
    id: 'MOV-0104',
    data: '14/09/2026 14:30',
    tipo: 'Saída',
    materialId: 'EST-006',
    materialNome: 'Chave de Impacto Pneumática 1/2"',
    categoria: 'Ferramentas da Mecânica',
    quantidade: 1,
    un: 'un',
    solicitante: 'Ana Souza (Oficina)',
    responsavelEntrega: 'Carlos Almoxarife',
    observacao: 'Empréstimo para manutenção de caminhões'
  },
  {
    id: 'MOV-0105',
    data: '13/09/2026 11:15',
    tipo: 'Entrada',
    materialId: 'EST-018',
    materialNome: 'Detergente Desengraxante Industrial 5L',
    categoria: 'Material de Limpeza',
    quantidade: 10,
    un: 'gl',
    solicitante: 'Fornecedor Químicos / NF 1198',
    responsavelEntrega: 'Carlos Almoxarife',
    observacao: 'Reposição de estoque de limpeza'
  }
];

const EstoqueAlmoxarifado = ({ initialTab = 'itens' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'itens' | 'movimentacoes'
  const [itens, setItens] = useState(INITIAL_ITENS);
  const [movimentacoes, setMovimentacoes] = useState(INITIAL_MOVIMENTACOES);
  const [selectedCategoria, setSelectedCategoria] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [responsavelGeral, setResponsavelGeral] = useState('Carlos Almoxarife');
  const [isEditingResponsavel, setIsEditingResponsavel] = useState(false);
  const [tempResponsavel, setTempResponsavel] = useState(responsavelGeral);

  // Modais
  const [isNovoItemModalOpen, setIsNovoItemModalOpen] = useState(false);
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);

  // Form Novo Item
  const [novoItem, setNovoItem] = useState({
    nome: '',
    categoria: 'EPIs',
    quantidade: 1,
    un: 'un',
    estoqueMin: 5,
    localizacao: 'Setor Geral'
  });

  // Form Nova Movimentação
  const [novaMov, setNovaMov] = useState({
    tipo: 'Saída', // 'Entrada' | 'Saída'
    materialId: '',
    quantidade: 1,
    solicitante: '',
    responsavelEntrega: responsavelGeral,
    observacao: ''
  });

  const [movError, setMovError] = useState('');

  // Estatísticas do Almoxarifado
  const stats = useMemo(() => {
    const totalItensDistintos = itens.length;
    const totalPecas = itens.reduce((acc, curr) => acc + curr.quantidade, 0);
    const itensEmAlerta = itens.filter(i => i.quantidade <= i.estoqueMin).length;
    const totalMovimentacoes = movimentacoes.length;
    return {
      totalItensDistintos,
      totalPecas,
      itensEmAlerta,
      totalMovimentacoes
    };
  }, [itens, movimentacoes]);

  // Filtro de Itens
  const filteredItens = useMemo(() => {
    return itens.filter(item => {
      const matchCat = selectedCategoria === 'Todos' || item.categoria === selectedCategoria;
      const term = searchTerm.toLowerCase();
      const matchSearch = item.nome.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.categoria.toLowerCase().includes(term) ||
        item.localizacao.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [itens, selectedCategoria, searchTerm]);

  // Filtro de Movimentações
  const filteredMovimentacoes = useMemo(() => {
    return movimentacoes.filter(mov => {
      const term = searchTerm.toLowerCase();
      const matchCat = selectedCategoria === 'Todos' || mov.categoria === selectedCategoria;
      const matchSearch = mov.materialNome.toLowerCase().includes(term) ||
        mov.id.toLowerCase().includes(term) ||
        mov.solicitante.toLowerCase().includes(term) ||
        mov.responsavelEntrega.toLowerCase().includes(term) ||
        mov.tipo.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [movimentacoes, selectedCategoria, searchTerm]);

  // Handler Salvar Novo Item
  const handleSalvarItem = (e) => {
    e.preventDefault();
    if (!novoItem.nome.trim()) return;

    const nextIdNum = itens.length + 1;
    const newItemObj = {
      id: `EST-0${nextIdNum < 100 ? (nextIdNum < 10 ? '0' + nextIdNum : nextIdNum) : nextIdNum}`,
      nome: novoItem.nome,
      categoria: novoItem.categoria,
      quantidade: Number(novoItem.quantidade) || 0,
      un: novoItem.un || 'un',
      estoqueMin: Number(novoItem.estoqueMin) || 0,
      localizacao: novoItem.localizacao || 'Almoxarifado',
      responsavel: responsavelGeral
    };

    setItens(prev => [newItemObj, ...prev]);
    setIsNovoItemModalOpen(false);
    setNovoItem({
      nome: '',
      categoria: 'EPIs',
      quantidade: 1,
      un: 'un',
      estoqueMin: 5,
      localizacao: 'Setor Geral'
    });
  };

  // Handler Registrar Movimentação (Entrada/Saída)
  const handleSalvarMovimentacao = (e) => {
    e.preventDefault();
    setMovError('');

    if (!novaMov.materialId) {
      setMovError('Selecione um material.');
      return;
    }
    if (!novaMov.solicitante.trim()) {
      setMovError('Informe o solicitante do material.');
      return;
    }
    if (!novaMov.responsavelEntrega.trim()) {
      setMovError('Informe o responsável pela entrega.');
      return;
    }

    const qtd = Number(novaMov.quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      setMovError('Quantidade inválida.');
      return;
    }

    const itemAlvo = itens.find(i => i.id === novaMov.materialId);
    if (!itemAlvo) {
      setMovError('Item não encontrado.');
      return;
    }

    if (novaMov.tipo === 'Saída' && itemAlvo.quantidade < qtd) {
      setMovError(`Saldo insuficiente em estoque. Disponível: ${itemAlvo.quantidade} ${itemAlvo.un}`);
      return;
    }

    // Atualiza Estoque
    setItens(prev => prev.map(item => {
      if (item.id === itemAlvo.id) {
        const novaQtd = novaMov.tipo === 'Entrada' ? item.quantidade + qtd : item.quantidade - qtd;
        return { ...item, quantidade: Math.max(0, novaQtd) };
      }
      return item;
    }));

    // Registra Histórico de Movimentação
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

    const nextMovId = movimentacoes.length + 101;
    const newMovRecord = {
      id: `MOV-0${nextMovId}`,
      data: formattedDate,
      tipo: novaMov.tipo,
      materialId: itemAlvo.id,
      materialNome: itemAlvo.nome,
      categoria: itemAlvo.categoria,
      quantidade: qtd,
      un: itemAlvo.un,
      solicitante: novaMov.solicitante,
      responsavelEntrega: novaMov.responsavelEntrega,
      observacao: novaMov.observacao || 'Sem observações adicionais'
    };

    setMovimentacoes(prev => [newMovRecord, ...prev]);
    setIsMovimentacaoModalOpen(false);
    setNovaMov({
      tipo: 'Saída',
      materialId: '',
      quantidade: 1,
      solicitante: '',
      responsavelEntrega: responsavelGeral,
      observacao: ''
    });
  };

  const handleSalvarResponsavel = () => {
    if (tempResponsavel.trim()) {
      setResponsavelGeral(tempResponsavel.trim());
      setIsEditingResponsavel(false);
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
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      width: '100%', 
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: 0 }}>
              Gestão de Estoque & Almoxarifado
            </h1>
            <span style={{ 
              backgroundColor: '#2381FD1C', 
              color: COLOR_PRIMARY, 
              border: `1px solid ${COLOR_PRIMARY}`, 
              borderRadius: '8px', 
              padding: '2px 8px', 
              fontSize: '11px', 
              fontWeight: '700' 
            }}>
              Nix Core Logística
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#555555', margin: '4px 0 0 0' }}>
            Controle de insumos, peças, ferramentas e apontamentos de entrada/saída de materiais
          </p>
        </div>

        {/* Card do Responsável Pelo Almoxarifado */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '12px', 
          padding: '8px 14px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          border: '1px solid #E2E8F0',
          width: '100%',
          maxWidth: '380px'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            backgroundColor: `${COLOR_PRIMARY}20`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: COLOR_PRIMARY
          }}>
            <UserCheck size={20} />
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Responsável pelo Almoxarifado
            </span>
            {isEditingResponsavel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <input 
                  type="text" 
                  value={tempResponsavel}
                  onChange={(e) => setTempResponsavel(e.target.value)}
                  style={{ 
                    border: '1px solid #CBD5E1', 
                    borderRadius: '4px', 
                    padding: '2px 6px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    outline: 'none'
                  }} 
                />
                <button 
                  onClick={handleSalvarResponsavel}
                  style={{ backgroundColor: COLOR_CONCLUIDO, color: '#FFF', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                >
                  <Check size={12} />
                </button>
                <button 
                  onClick={() => { setTempResponsavel(responsavelGeral); setIsEditingResponsavel(false); }}
                  style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F1C2C' }}>
                  {responsavelGeral}
                </span>
                <button 
                  onClick={() => setIsEditingResponsavel(true)}
                  style={{ background: 'none', border: 'none', color: COLOR_PRIMARY, fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Alterar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação Rápida e Abas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        {/* Alternância de Abas: Itens do Almoxarifado x Movimentações Entrada/Saída */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setActiveTab('itens')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'itens' ? COLOR_PRIMARY : 'transparent',
              color: activeTab === 'itens' ? '#FFFFFF' : '#64748B',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Package size={16} /> Catálogo de Materiais ({itens.length})
          </button>

          <button
            onClick={() => setActiveTab('movimentacoes')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'movimentacoes' ? COLOR_PRIMARY : 'transparent',
              color: activeTab === 'movimentacoes' ? '#FFFFFF' : '#64748B',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeftRight size={16} /> Movimentações (Entrada / Saída)
          </button>
        </div>

        {/* Botões Cadastrar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setNovaMov(prev => ({ ...prev, responsavelEntrega: responsavelGeral }));
              setMovError('');
              setIsMovimentacaoModalOpen(true);
            }}
            style={{
              backgroundColor: '#0F1C2C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 28, 44, 0.2)'
            }}
          >
            <ArrowLeftRight size={16} /> Registrar Entrada / Saída
          </button>

          <button
            onClick={() => setIsNovoItemModalOpen(true)}
            style={{
              backgroundColor: COLOR_PRIMARY,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(35, 129, 253, 0.3)'
            }}
          >
            <Plus size={16} /> Novo Item
          </button>
        </div>
      </div>

      {/* Cards de Métricas do Estoque */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: COLOR_TOTAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={16} color="#0F1C2C" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666' }}>Itens Cadastrados</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#000' }}>{stats.totalItensDistintos}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>9 Categorias ativas</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: COLOR_CONCLUIDO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={16} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666' }}>Volume Físico Total</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#000' }}>{stats.totalPecas} un/lts</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Saldo disponível</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: stats.itensEmAlerta > 0 ? COLOR_ALTA : COLOR_CONCLUIDO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={16} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666' }}>Estoque Crítico / Mínimo</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: stats.itensEmAlerta > 0 ? COLOR_ALTA : '#000' }}>{stats.itensEmAlerta} itens</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Abaixo do estoque mín.</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: COLOR_EXECUCAO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeftRight size={16} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666' }}>Movimentações Registradas</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#000' }}>{stats.totalMovimentacoes}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>Entradas e saídas</div>
          </div>
        </div>
      </div>

      {/* Barra de Filtro por Categoria (Todas as solicitadas pelo usuário) */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '14px', 
        padding: '12px 16px', 
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Filter size={14} color="#64748B" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
            Filtrar por Categoria de Almoxarifado:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIAS_ESTOQUE.map((cat) => {
            const isSelected = selectedCategoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: isSelected ? `1px solid ${COLOR_PRIMARY}` : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? `${COLOR_PRIMARY}18` : '#F8FAFC',
                  color: isSelected ? COLOR_PRIMARY : '#475569',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caixa de Pesquisa e Área de Tabela Principal */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, borderBottom: `2px solid ${COLOR_PRIMARY}`, paddingBottom: '4px' }}>
              {activeTab === 'itens' ? `Materiais e Equipamentos (${filteredItens.length})` : `Histórico de Entrada e Saída (${filteredMovimentacoes.length})`}
            </h2>
          </div>

          <div style={{ width: '280px', display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={15} color="#888" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder={activeTab === 'itens' ? 'Buscar código, material, local...' : 'Buscar solicitante, material, tipo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '12px' }}
            />
            {searchTerm && (
              <X size={14} color="#888" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
            )}
          </div>
        </div>

        {/* TAB 1: ITENS E MATERIAIS */}
        {activeTab === 'itens' && (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Cód.</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Descrição do Material</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Categoria</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Localização</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700', textAlign: 'center' }}>Saldo em Estoque</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700', textAlign: 'center' }}>Estoque Mínimo</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700', textAlign: 'right' }}>Ação Rápida</th>
                </tr>
              </thead>
              <tbody>
                {filteredItens.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                      Nenhum item encontrado no estoque com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredItens.map((item) => {
                    const isCritico = item.quantidade <= item.estoqueMin;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s ease' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: COLOR_PRIMARY }}>{item.id}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0F1C2C' }}>
                          {item.nome}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ 
                            backgroundColor: '#F1F5F9', 
                            color: '#334155', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontSize: '11px',
                            fontWeight: '600' 
                          }}>
                            {item.categoria}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748B' }}>{item.localizacao}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '800', 
                            color: isCritico ? COLOR_ALTA : '#0F1C2C' 
                          }}>
                            {item.quantidade} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>{item.un}</span>
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748B' }}>
                          {item.estoqueMin} {item.un}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {isCritico ? (
                            <span style={{ 
                              backgroundColor: `${COLOR_ALTA}18`, 
                              border: `1px solid ${COLOR_ALTA}`, 
                              color: COLOR_ALTA, 
                              borderRadius: '6px', 
                              padding: '2px 8px', 
                              fontSize: '11px', 
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <AlertTriangle size={12} /> Crítico
                            </span>
                          ) : (
                            <span style={{ 
                              backgroundColor: `${COLOR_CONCLUIDO}18`, 
                              border: `1px solid ${COLOR_CONCLUIDO}`, 
                              color: COLOR_CONCLUIDO, 
                              borderRadius: '6px', 
                              padding: '2px 8px', 
                              fontSize: '11px', 
                              fontWeight: '700' 
                            }}>
                              Normal
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setNovaMov({
                                tipo: 'Saída',
                                materialId: item.id,
                                quantidade: 1,
                                solicitante: '',
                                responsavelEntrega: responsavelGeral,
                                observacao: ''
                              });
                              setMovError('');
                              setIsMovimentacaoModalOpen(true);
                            }}
                            title="Registrar saída rápida deste item"
                            style={{ 
                              backgroundColor: '#F8FAFC', 
                              border: '1px solid #CBD5E1', 
                              color: '#0F1C2C', 
                              borderRadius: '6px', 
                              padding: '4px 8px', 
                              fontSize: '11px', 
                              fontWeight: '600',
                              cursor: 'pointer' 
                            }}
                          >
                            Dar Saída
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: APONTAMENTOS DE ENTRADA E SAÍDA */}
        {activeTab === 'movimentacoes' && (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Cód. Mov</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Data / Hora</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Tipo</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Material / Equipamento</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700', textAlign: 'center' }}>Qtd.</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Solicitante do Material</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Responsável pela Entrega</th>
                  <th style={{ padding: '10px 12px', color: '#64748B', fontWeight: '700' }}>Observação / Destino</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                      Nenhuma movimentação de entrada ou saída encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredMovimentacoes.map((mov) => {
                    const isSaida = mov.tipo === 'Saída';
                    return (
                      <tr key={mov.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#64748B' }}>{mov.id}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{mov.data}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ 
                            backgroundColor: isSaida ? `${COLOR_ALTA}18` : `${COLOR_CONCLUIDO}18`,
                            border: `1px solid ${isSaida ? COLOR_ALTA : COLOR_CONCLUIDO}`,
                            color: isSaida ? COLOR_ALTA : COLOR_CONCLUIDO,
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isSaida ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            {mov.tipo}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '700', color: '#0F1C2C' }}>{mov.materialNome}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>{mov.categoria}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: isSaida ? '#DC2626' : '#16A34A' }}>
                          {isSaida ? `-${mov.quantidade}` : `+${mov.quantidade}`} {mov.un}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '600', color: '#0F1C2C' }}>{mov.solicitante}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: '500' }}>
                            <UserCheck size={14} color={COLOR_PRIMARY} />
                            {mov.responsavelEntrega}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748B', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={mov.observacao}>
                          {mov.observacao}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: REGISTRAR ENTRADA OU SAÍDA */}
      {isMovimentacaoModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100dvh',
          backgroundColor: 'rgba(15, 28, 44, 0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '12px' 
        }}>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '520px', 
            maxHeight: '94dvh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Anotação de Movimentação de Estoque
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Entrada ou saída de material com rastreabilidade</span>
              </div>
              <button 
                onClick={() => setIsMovimentacaoModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {movError && (
              <div style={{ 
                backgroundColor: '#FEF2F2', 
                border: '1px solid #F87171', 
                color: '#DC2626', 
                borderRadius: '8px', 
                padding: '8px 12px', 
                fontSize: '12px', 
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertTriangle size={14} /> {movError}
              </div>
            )}

            <form onSubmit={handleSalvarMovimentacao} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tipo de Operação */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  TIPO DE MOVIMENTAÇÃO *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNovaMov(prev => ({ ...prev, tipo: 'Saída' }))}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: novaMov.tipo === 'Saída' ? `2px solid ${COLOR_ALTA}` : '1px solid #CBD5E1',
                      backgroundColor: novaMov.tipo === 'Saída' ? `${COLOR_ALTA}15` : '#F8FAFC',
                      color: novaMov.tipo === 'Saída' ? COLOR_ALTA : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowUpRight size={16} /> SAÍDA (Entrega)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNovaMov(prev => ({ ...prev, tipo: 'Entrada' }))}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: novaMov.tipo === 'Entrada' ? `2px solid ${COLOR_CONCLUIDO}` : '1px solid #CBD5E1',
                      backgroundColor: novaMov.tipo === 'Entrada' ? `${COLOR_CONCLUIDO}15` : '#F8FAFC',
                      color: novaMov.tipo === 'Entrada' ? COLOR_CONCLUIDO : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowDownLeft size={16} /> ENTRADA (Recebimento)
                  </button>
                </div>
              </div>

              {/* Seleção do Material */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  MATERIAL / EQUIPAMENTO *
                </label>
                <select
                  value={novaMov.materialId}
                  onChange={(e) => setNovaMov(prev => ({ ...prev, materialId: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                >
                  <option value="">-- Selecione o item --</option>
                  {itens.map(item => (
                    <option key={item.id} value={item.id}>
                      [{item.categoria}] {item.nome} (Atual: {item.quantidade} {item.un})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  QUANTIDADE *
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={novaMov.quantidade}
                  onChange={(e) => setNovaMov(prev => ({ ...prev, quantidade: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                />
              </div>

              {/* Solicitante */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  QUEM FOI O SOLICITANTE DO MATERIAL? *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Marcos Lima (Operador CAT 320) ou Depto Mecânica"
                  value={novaMov.solicitante}
                  onChange={(e) => setNovaMov(prev => ({ ...prev, solicitante: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                />
              </div>

              {/* Responsável pela Entrega */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  RESPONSÁVEL PELA ENTREGA / REGISTRO *
                </label>
                <input 
                  type="text" 
                  value={novaMov.responsavelEntrega}
                  onChange={(e) => setNovaMov(prev => ({ ...prev, responsavelEntrega: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                />
              </div>

              {/* Observação / Destino */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  OBSERVAÇÃO OU DESTINO DO MATERIAL
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Aplicação em OS-0128, reposição de estoque, uso em setor..."
                  value={novaMov.observacao}
                  onChange={(e) => setNovaMov(prev => ({ ...prev, observacao: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsMovimentacaoModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Confirmar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CADASTRAR NOVO ITEM */}
      {isNovoItemModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100dvh',
          backgroundColor: 'rgba(15, 28, 44, 0.7)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '12px' 
        }}>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '480px', 
            maxHeight: '94dvh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F1C2C', margin: 0 }}>
                  Cadastrar Item no Estoque
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Adicione novo material ao almoxarifado</span>
              </div>
              <button 
                onClick={() => setIsNovoItemModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  NOME / DESCRIÇÃO DO MATERIAL *
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Chave de Fenda Estrela, Óleo 68, etc."
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  CATEGORIA *
                </label>
                <select
                  value={novoItem.categoria}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, categoria: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                >
                  {CATEGORIAS_ESTOQUE.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    QUANTIDADE INICIAL *
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    UNIDADE (un, kg, lts, cx)
                  </label>
                  <input 
                    type="text" 
                    placeholder="un, lts, tambor..."
                    value={novoItem.un}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, un: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    ESTOQUE MÍNIMO DE ALERTA
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={novoItem.estoqueMin}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, estoqueMin: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    LOCALIZAÇÃO FÍSICA
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Prateleira B2, Bacia 1"
                    value={novoItem.localizacao}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, localizacao: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNovoItemModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: COLOR_PRIMARY, color: '#FFFFFF', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cadastrar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EstoqueAlmoxarifado;
