import { useState, useEffect } from 'react';
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
  ChevronRight,
  Menu,
  X,
  Scale
} from 'lucide-react';
import OrdemServico from './OrdemServico';
import RelatorioDiario from './RelatorioDiario';
import HomeDashboard from './HomeDashboard';
import EstoqueAlmoxarifado from './EstoqueAlmoxarifado';
import Veiculos from './Veiculos';
import PesagemVeiculos from './PesagemVeiculos';
import Configuracoes from './Configuracoes';

const COR_FUNDO_CLARO = '#D8E0E5'; 

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 && window.innerWidth <= 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile) {
        setIsCollapsed(false);
      } else if (tablet) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ordem-servico', label: 'Ordem de Serviço', icon: ClipboardList },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'entrada-saida', label: 'Entrada/Saída', icon: ArrowLeftRight },
    { id: 'relatorio-diario', label: 'Relatório Diário', icon: FileText },
    { id: 'veiculos', label: 'Veículos', icon: Truck },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'pesagem', label: 'Pesagem de Veículos', icon: Scale },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleSelectMenu = (id) => {
    setActiveMenu(id);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const getMenuTitle = () => {
    const item = menuItems.find(m => m.id === activeMenu);
    return item ? item.label : 'Nix Core';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      height: '100dvh',
      width: '100vw', 
      backgroundColor: '#0F1C2C', 
      overflow: 'hidden', 
      fontFamily: 'sans-serif' 
    }}>
      
      {activeMenu === 'relatorio-diario' && (
        <RelatorioDiario onVoltar={() => setActiveMenu('dashboard')} />
      )}

      {/* Barra Superior Mobile (Smartphone) */}
      {isMobile && (
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F1C2C',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              backgroundColor: COR_FUNDO_CLARO, 
              padding: '4px 10px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo-topo.png" 
                alt="Nix Core" 
                style={{ height: '22px', width: 'auto', display: 'block' }}
              />
            </div>
            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '700' }}>
              {getMenuTitle()}
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu de navegação"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Menu size={20} />
          </button>
        </header>
      )}

      {/* Backdrop para Menu Mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 90
          }}
        />
      )}

      {/* Sidebar Desktop OU Drawer Lateral no Mobile */}
      <aside 
        style={isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: '#0F1C2C',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          boxSizing: 'border-box',
          zIndex: 100,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mobileMenuOpen ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : 'none'
        } : { 
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
        {/* Botão de Alternar Minimizar / Expandir apenas no Desktop */}
        {!isMobile && (
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
        )}

        <div>
          {/* Logo e Botão Fechar no Mobile */}
          <div style={{ 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <div style={{ 
              backgroundColor: COR_FUNDO_CLARO, 
              padding: isCollapsed ? '8px' : '10px 16px', 
              borderRadius: '12px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              maxWidth: isCollapsed ? '50px' : '160px',
              width: isMobile ? '160px' : '100%',
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

            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={22} />
              </button>
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
                  onClick={() => handleSelectMenu(item.id)}
                  title={isCollapsed && !isMobile ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
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
                  <Icon size={18} style={{ flexShrink: 0, color: isActive ? '#2381FD' : '#94A3B8' }} />
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé Sidebar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', paddingLeft: isCollapsed && !isMobile ? '0' : '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start', gap: '12px', color: '#FFFFFF' }}>
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={20} color="#FFFFFF" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden' }}>Operador Nix</span>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Unidade Juazeiro</span>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* Área de Conteúdo Principal */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '8px' : isTablet ? '12px' : '16px', 
        boxSizing: 'border-box', 
        height: isMobile ? 'calc(100dvh - 57px)' : '100dvh', 
        maxHeight: isMobile ? 'calc(100dvh - 57px)' : '100dvh',
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0
      }}>
        
        {/* TELA 1: HOME / DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <HomeDashboard 
            onNavigateToOS={() => setActiveMenu('ordem-servico')}
            onNavigateToRDA={() => setActiveMenu('relatorio-diario')}
            onNavigateToEstoque={() => setActiveMenu('estoque')}
            onNavigateToVeiculos={() => setActiveMenu('veiculos')}
            onNavigateToPesagem={() => setActiveMenu('pesagem')}
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

        {/* TELA 5: VEÍCULOS (FROTA) */}
        {activeMenu === 'veiculos' && (
          <Veiculos 
            key="veiculos-frota" 
            initialTab="veiculos" 
            onNavigateToOS={() => setActiveMenu('ordem-servico')}
            onNavigateToPesagem={() => setActiveMenu('pesagem')}
          />
        )}

        {/* TELA 6: HISTÓRICO GERAL DA FROTA */}
        {activeMenu === 'historico' && (
          <Veiculos 
            key="veiculos-hist" 
            initialTab="historico" 
            onNavigateToOS={() => setActiveMenu('ordem-servico')}
            onNavigateToPesagem={() => setActiveMenu('pesagem')}
          />
        )}

        {/* TELA 7: PESAGEM DE VEÍCULOS / BALANÇA */}
        {activeMenu === 'pesagem' && (
          <PesagemVeiculos 
            onNavigateToVeiculos={() => setActiveMenu('veiculos')}
          />
        )}

        {/* TELA 8: CONFIGURAÇÕES & ADMINISTRAÇÃO */}
        {activeMenu === 'configuracoes' && (
          <Configuracoes />
        )}

      </main>

    </div>
  );
};

export default Dashboard;
