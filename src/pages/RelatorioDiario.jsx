import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Minimize2, Maximize2, Send, ArrowLeft } from 'lucide-react';

const LISTA_ATIVIDADES = [
  { codigo: 'D', descricao: 'Deslocamento' },
  { codigo: 'B', descricao: 'Balança / Descarga' },
  { codigo: 'G', descricao: 'Garagem / Recolhe' },
  { codigo: 'C', descricao: 'Coleta' },
  { codigo: 'E', descricao: 'Espera' },
  { codigo: 'A', descricao: 'Abastecimento Combust.' },
  { codigo: 'RF', descricao: 'Refeição' },
  { codigo: 'O', descricao: 'Outro' },
  { codigo: 'S', descricao: 'Socorro mec. / Pneu' },
  { codigo: 'M', descricao: 'Mudança de motorista' },
  { codigo: 'P', descricao: 'Pintura' },
  { codigo: 'T', descricao: 'Transbordo' },
  { codigo: 'V', descricao: 'Varrição mecanizada' },
  { codigo: 'L', descricao: 'Lavagem (pipas)' },
  { codigo: 'AP', descricao: 'Abastec. pintura (pipas)' }
];

// Estilos isolados para reuso
const labelStyle = { fontSize: '11px', fontWeight: '700', fontStyle: 'italic', color: '#333', marginBottom: '4px', display: 'block' };
const cardInputStyle = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '12px', boxSizing: 'border-box', outline: 'none' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' };
const thStyle = { padding: '6px', fontSize: '11px', fontWeight: '700', fontStyle: 'italic', border: 'none', outline: 'none' };
const tdStyle = { padding: '4px', border: '1px solid #E2E8F0', outline: 'none' };
const tableInputStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '11px', textAlign: 'center' };
const selectAtividadeStyle = { width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '11px', textAlign: 'center', cursor: 'pointer' };

// Estilo para destacar os campos digitáveis de Litros e Qtde. viagens
const highlightedInputStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: '6px',
  padding: '3px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#0F1C2C',
  outline: 'none',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
  textAlign: 'center'
};

const RelatorioDiario = ({ onVoltar, onEnviar }) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const [etapa, setEtapa] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cabeçalho
  const [headerData, setHeaderData] = useState({
    motorista: '', veiculo: '', placa: '', data: '', regional: '', procedencia: '', horimetroInicial: '', horimetroFinal: '', hora: ''
  });

  // Coletores
  const [coletores, setColetores] = useState(['']);
  const [coletorParaExcluir, setColetorParaExcluir] = useState(null);

  // Tabelas Atividades (20 linhas cada)
  const createEmptyRows = (count) => Array.from({ length: count }, () => ({ atividade: '', hora: '', quilometragem: '' }));
  const [atividadesEsq, setAtividadesEsq] = useState(createEmptyRows(20));
  const [atividadesDir, setAtividadesDir] = useState(createEmptyRows(20));

  // Tabela Descargas (6 linhas)
  const [descargas, setDescargas] = useState(Array.from({ length: 6 }, () => ({ local: '', ticket: '', peso: '' })));

  // Abastecimento / Pessoal
  const [abastecimento, setAbastecimento] = useState({
    litros: '',
    motorista1: '', horaMotorista1: '',
    motorista2: '', horaMotorista2: '',
    motorista3: '', horaMotorista3: '',
    motorista4: '', horaMotorista4: '',
    fiscal1: '', horaFiscal1: '',
    fiscal2: '', horaFiscal2: '',
    auxTrafego: '', horaAuxTrafego: '',
    qtdeViagens: ''
  });

  const handleAddColetor = () => setColetores(prev => [...prev, '']);
  const handleUpdateColetor = (index, value) => {
    setColetores(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };
  
  const handleConfirmRemoveColetor = () => {
    if (coletorParaExcluir !== null) {
      setColetores(prev => prev.filter((_, idx) => idx !== coletorParaExcluir));
      setColetorParaExcluir(null);
    }
  };

  const handleAtividadeChange = (side, index, field, value) => {
    const updater = (prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    };

    if (side === 'esq') setAtividadesEsq(updater);
    else setAtividadesDir(updater);
  };

  const handleDescargaChange = (index, field, value) => {
    setDescargas(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const totalPeso = descargas.reduce((acc, curr) => {
    const rawVal = String(curr.peso || '').replace(',', '.');
    return acc + (parseFloat(rawVal) || 0);
  }, 0);

  const handleEnviar = () => {
    const payload = { headerData, coletores, atividadesEsq, atividadesDir, descargas, abastecimento };
    if (onEnviar) {
      onEnviar(payload);
    } else {
      console.log('Relatório Enviado:', payload);
      alert('Relatório enviado com sucesso!');
    }
  };

  const renderCardDadosOperacao = () => (
    <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0F1C2C' }}>Dados da Operação</h2>
        {!isMobile && (
          <button 
            type="button"
            onClick={() => setIsMinimized(!isMinimized)} 
            title={isMinimized ? "Expandir" : "Minimizar"}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
        )}
      </div>

      {!isMinimized && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Motorista</label>
              <input type="text" value={headerData.motorista} onChange={e => setHeaderData({...headerData, motorista: e.target.value})} style={cardInputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Veículo</label>
              <input type="text" value={headerData.veiculo} onChange={e => setHeaderData({...headerData, veiculo: e.target.value})} style={cardInputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Placa</label>
              <input type="text" value={headerData.placa} onChange={e => setHeaderData({...headerData, placa: e.target.value})} style={cardInputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data</label>
              <input type="date" value={headerData.data} onChange={e => setHeaderData({...headerData, data: e.target.value})} style={cardInputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Regional</label>
            <input type="text" value={headerData.regional} onChange={e => setHeaderData({...headerData, regional: e.target.value})} style={cardInputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Procedência</label>
            <input type="text" value={headerData.procedencia} onChange={e => setHeaderData({...headerData, procedencia: e.target.value})} style={cardInputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Horímetro Inicial</label>
              <input type="text" value={headerData.horimetroInicial} onChange={e => setHeaderData({...headerData, horimetroInicial: e.target.value})} style={cardInputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Horímetro Final</label>
              <input type="text" value={headerData.horimetroFinal} onChange={e => setHeaderData({...headerData, horimetroFinal: e.target.value})} style={cardInputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Coletores (Total: {coletores.length})</label>
            <div style={{ maxHeight: '140px', overflowY: 'auto', paddingRight: '4px', marginBottom: '8px' }}>
              {coletores.map((coletor, idx) => (
                <div key={idx} style={{ marginBottom: '8px', display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder={`Coletor ${idx + 1}`} value={coletor} onChange={(e) => handleUpdateColetor(idx, e.target.value)} style={cardInputStyle} />
                  {idx > 0 && (
                    <button type="button" onClick={() => setColetorParaExcluir(idx)} style={{ backgroundColor: '#FF4D4D', border: 'none', borderRadius: '8px', padding: '0 10px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddColetor} style={{ width: '100%', backgroundColor: '#E2E8F0', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#333' }}>
              <Plus size={16} /> Adicionar Coletor
            </button>
          </div>

          <div>
            <label style={labelStyle}>Hora</label>
            <input type="time" value={headerData.hora} onChange={e => setHeaderData({...headerData, hora: e.target.value})} style={cardInputStyle} />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px' }}>
        <button type="button" onClick={onVoltar} style={{ flex: 1, backgroundColor: '#0F1C2C', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        {isMobile ? (
          <button type="button" onClick={() => setEtapa(2)} style={{ flex: 1, backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            Continuar
          </button>
        ) : (
          <button type="button" onClick={handleEnviar} style={{ flex: 1, backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Send size={16} /> Enviar
          </button>
        )}
      </div>
    </div>
  );

  const renderCardTabelas = () => (
    <div style={{ backgroundColor: '#B2C0CC', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
        
        {/* Tabela Esquerda */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#94A3B8', color: '#FFF' }}>
                <th style={{ ...thStyle, width: '40%' }}>Atividade</th>
                <th style={{ ...thStyle, width: '30%' }}>Hora</th>
                <th style={{ ...thStyle, width: '30%' }}>Quilometragem</th>
              </tr>
            </thead>
            <tbody>
              {atividadesEsq.map((row, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFF' }}>
                  <td style={tdStyle}>
                    <select value={row.atividade} onChange={(e) => handleAtividadeChange('esq', idx, 'atividade', e.target.value)} style={selectAtividadeStyle}>
                      <option value="">-</option>
                      {LISTA_ATIVIDADES.map(item => <option key={item.codigo} value={item.codigo}>{row.atividade === item.codigo ? item.codigo : `${item.codigo} - ${item.descricao}`}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}><input type="text" value={row.hora} onChange={(e) => handleAtividadeChange('esq', idx, 'hora', e.target.value)} style={tableInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={row.quilometragem} onChange={(e) => handleAtividadeChange('esq', idx, 'quilometragem', e.target.value)} style={tableInputStyle} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela Direita */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#94A3B8', color: '#FFF' }}>
                <th style={{ ...thStyle, width: '40%' }}>Atividade</th>
                <th style={{ ...thStyle, width: '30%' }}>Hora</th>
                <th style={{ ...thStyle, width: '30%' }}>Quilometragem</th>
              </tr>
            </thead>
            <tbody>
              {atividadesDir.map((row, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#F8FAFC' : '#FFF' }}>
                  <td style={tdStyle}>
                    <select value={row.atividade} onChange={(e) => handleAtividadeChange('dir', idx, 'atividade', e.target.value)} style={selectAtividadeStyle}>
                      <option value="">-</option>
                      {LISTA_ATIVIDADES.map(item => <option key={item.codigo} value={item.codigo}>{row.atividade === item.codigo ? item.codigo : `${item.codigo} - ${item.descricao}`}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}><input type="text" value={row.hora} onChange={(e) => handleAtividadeChange('dir', idx, 'hora', e.target.value)} style={tableInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={row.quilometragem} onChange={(e) => handleAtividadeChange('dir', idx, 'quilometragem', e.target.value)} style={tableInputStyle} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
        
        {/* Descargas (Sem a barra branca no rodapé) */}
        <div style={{ backgroundColor: '#E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#94A3B8', color: '#FFF' }}>
                <th colSpan="4" style={{ ...thStyle, textAlign: 'center' }}>Descargas</th>
              </tr>
              <tr style={{ backgroundColor: '#CBD5E1' }}>
                <th style={{ ...thStyle, width: '15%' }}>Nº</th>
                <th style={{ ...thStyle, width: '35%' }}>Local</th>
                <th style={{ ...thStyle, width: '25%' }}>Ticket</th>
                <th style={{ ...thStyle, width: '25%' }}>Peso</th>
              </tr>
            </thead>
            <tbody>
              {descargas.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: '#FFF' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700' }}>{idx + 1}º</td>
                  <td style={tdStyle}><input type="text" value={item.local} onChange={e => handleDescargaChange(idx, 'local', e.target.value)} style={tableInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={item.ticket} onChange={e => handleDescargaChange(idx, 'ticket', e.target.value)} style={tableInputStyle} /></td>
                  <td style={tdStyle}><input type="text" value={item.peso} onChange={e => handleDescargaChange(idx, 'peso', e.target.value)} style={tableInputStyle} /></td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#E2E8F0', fontWeight: '700' }}>
                <td colSpan="3" style={{ ...tdStyle, paddingLeft: '8px', borderBottom: 'none' }}>Total do peso coletado:</td>
                <td style={{ ...tdStyle, color: '#2563EB', textAlign: 'center', borderBottom: 'none' }}>{totalPeso.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Abastecimento / Pessoal */}
        <div style={{ backgroundColor: '#FFF', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#94A3B8', color: '#FFF' }}>
                <th colSpan="2" style={{ ...thStyle, textAlign: 'center', padding: '6px' }}>
                  Abastecimento
                </th>
                <th style={{ ...thStyle, textAlign: 'center', padding: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="0"
                      value={abastecimento.litros} 
                      onChange={e => setAbastecimento({...abastecimento, litros: e.target.value})} 
                      style={{ ...highlightedInputStyle, width: '65px' }} 
                    />
                    <span>Litros</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px', width: '30%' }}>Motorista:</td>
                <td style={{ ...tdStyle, width: '20%' }}>
                  <input type="text" value={abastecimento.horaMotorista1} onChange={e => setAbastecimento({...abastecimento, horaMotorista1: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={{ ...tdStyle, width: '50%' }}>
                  <input type="text" value={abastecimento.motorista1} onChange={e => setAbastecimento({...abastecimento, motorista1: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Motorista:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaMotorista2} onChange={e => setAbastecimento({...abastecimento, horaMotorista2: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.motorista2} onChange={e => setAbastecimento({...abastecimento, motorista2: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Motorista:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaMotorista3} onChange={e => setAbastecimento({...abastecimento, horaMotorista3: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.motorista3} onChange={e => setAbastecimento({...abastecimento, motorista3: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Motorista:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaMotorista4} onChange={e => setAbastecimento({...abastecimento, horaMotorista4: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.motorista4} onChange={e => setAbastecimento({...abastecimento, motorista4: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Fiscal:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaFiscal1} onChange={e => setAbastecimento({...abastecimento, horaFiscal1: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.fiscal1} onChange={e => setAbastecimento({...abastecimento, fiscal1: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Fiscal:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaFiscal2} onChange={e => setAbastecimento({...abastecimento, horaFiscal2: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.fiscal2} onChange={e => setAbastecimento({...abastecimento, fiscal2: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>
              <tr>
                <td style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px' }}>Aux.tráfego:</td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.horaAuxTrafego} onChange={e => setAbastecimento({...abastecimento, horaAuxTrafego: e.target.value})} style={tableInputStyle} />
                </td>
                <td style={tdStyle}>
                  <input type="text" value={abastecimento.auxTrafego} onChange={e => setAbastecimento({...abastecimento, auxTrafego: e.target.value})} style={{ ...tableInputStyle, textAlign: 'left', paddingLeft: '6px' }} />
                </td>
              </tr>

              {/* Linha final: Qtde. viagens */}
              <tr style={{ backgroundColor: '#E2E8F0' }}>
                <td colSpan="2" style={{ ...tdStyle, fontWeight: 'bold', paddingLeft: '8px', borderBottom: 'none' }}>Qtde. viagens:</td>
                <td style={{ ...tdStyle, padding: '4px 6px', borderBottom: 'none' }}>
                  <input 
                    type="text" 
                    placeholder="0"
                    value={abastecimento.qtdeViagens} 
                    onChange={e => setAbastecimento({...abastecimento, qtdeViagens: e.target.value})} 
                    style={{ ...highlightedInputStyle, width: '100%', boxSizing: 'border-box' }} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {isMobile && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={() => setEtapa(1)} style={{ flex: 1, backgroundColor: '#0F1C2C', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer' }}>
            Voltar para Dados
          </button>
          <button type="button" onClick={handleEnviar} style={{ flex: 1, backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Send size={16} /> Enviar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#0F1C2C', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', overflowY: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#FFF', fontSize: '28px', fontWeight: '800', textAlign: 'center', marginBottom: '20px' }}>Relatório Diário</h1>

      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1 }}>
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: isMinimized ? '260px 1fr' : '360px 1fr', gap: '20px', alignItems: 'start', transition: 'grid-template-columns 0.3s ease' }}>
            {renderCardDadosOperacao()}
            {renderCardTabelas()}
          </div>
        )}

        {isMobile && (
          <>
            {etapa === 1 && renderCardDadosOperacao()}
            {etapa === 2 && renderCardTabelas()}
          </>
        )}
      </div>

      {coletorParaExcluir !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '24px', width: '300px', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#FF4D4D" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 8px 0' }}>Confirmar Exclusão</h4>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>Deseja remover o Coletor {coletorParaExcluir + 1}?</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setColetorParaExcluir(null)} style={{ flex: 1, backgroundColor: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button type="button" onClick={handleConfirmRemoveColetor} style={{ flex: 1, backgroundColor: '#FF4D4D', color: '#FFF', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioDiario;