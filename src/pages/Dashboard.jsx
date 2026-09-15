import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Truck, 
  History, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import OrdemServico from './OrdemServico';
import RelatorioDiario from './RelatorioDiario';
import HomeDashboard from './HomeDashboard';
import EstoqueAlmoxarifado from './EstoqueAlmoxarifado';

const COR_FUNDO_CLARO = '#D8E0E5'; 

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ordem-servico', label: 'Ordem de Serviço', icon: ClipboardList },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'entrada-saida', label: 'Entrada/Saída', icon: ArrowLeftRight },
    { id: 'relatorio-diario', label: 'Relatório Diário', icon: FileText },
    { id: 'veiculos', label: 'Veículos', icon: Truck },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0F1C2C', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {activeMenu === 'relatorio-diario' && (
        <RelatorioDiario onVoltar={() => setActiveMenu('dashboard')} />
      )}

      {/* Sidebar Lateral Retrátil */}
      <aside 
        style={{ 
          width: isCollapsed ? '72px' : '240px', 
          backgroundColor: '#0F1C2C', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: isCollapsed ? '20px 10px' : '20px 16px', 
          boxSizing: 'border-box', 
          flexShrink: 0,
          transition: 'width 0.3s ease, padding 0.3s ease',
          position: 'relative'
        }}
      >
        {/* Botão de Alternar Minimizar / Expandir */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu" : "Minimizar menu"}
          style={{
            position: 'absolute',
            top: '24px',
            right: '-12px',
            backgroundColor: '#2381FD',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            zIndex: 10
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div>
          {/* Logo */}
          <div style={{ 
            marginBottom: '28px', 
            backgroundColor: COR_FUNDO_CLARO, 
            padding: isCollapsed ? '8px' : '10px 16px', 
            borderRadius: '12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            maxWidth: isCollapsed ? '50px' : '160px',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {isCollapsed ? (
              <span style={{ fontWeight: '800', color: '#0F1C2C', fontSize: '14px' }}>NC</span>
            ) : (
              <img 
                src="/logo-topo.png" 
                alt="Nix Core Logo" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            )}
          </div>

          {/* Navegação */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  title={isCollapsed ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé Sidebar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', paddingLeft: isCollapsed ? '0' : '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '12px', color: '#FFFFFF' }}>
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={20} color="#FFFFFF" />
            </div>
            {!isCollapsed && <span style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden' }}>Nome</span>}
          </div>
        </div>

      </aside>

      {/* Área de Conteúdo Principal */}
      <main style={{ flex: 1, padding: '16px', boxSizing: 'border-box', height: '100vh', overflow: 'hidden', display: 'flex' }}>
        
        {/* TELA 1: HOME / DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <HomeDashboard 
            onNavigateToOS={() => setActiveMenu('ordem-servico')}
            onNavigateToRDA={() => setActiveMenu('relatorio-diario')}
            onNavigateToEstoque={() => setActiveMenu('estoque')}
          />
        )}

        {/* TELA 2: ORDEM DE SERVIÇO */}
        {activeMenu === 'ordem-servico' && (
          <OrdemServico />
        )}

        {/* TELA 3: ESTOQUE / ALMOXARIFADO */}
        {activeMenu === 'estoque' && (
          <EstoqueAlmoxarifado key="estoque-itens" initialTab="itens" />
        )}

        {/* TELA 4: ENTRADA / SAÍDA DE MATERIAIS */}
        {activeMenu === 'entrada-saida' && (
          <EstoqueAlmoxarifado key="estoque-mov" initialTab="movimentacoes" />
        )}

      </main>

    </div>
  );
};

export default Dashboard;