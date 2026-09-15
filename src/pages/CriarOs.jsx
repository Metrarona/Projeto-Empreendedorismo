import { useState } from 'react';

const CriarOs = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('dados');

  const [formData, setFormData] = useState({
    ordem: '772.954',
    oficina: '014',
    nomeOficina: 'OFICINA MECANICA JUAZEIRO',
    tipoSelecao: 'equipamento',
    codEquipamento: '77',
    subCodEquipamento: '31934',
    nomeEquipamento: 'VW 24.260 CONSTELLATION',
    contador: '87.167,0',
    unidadeContador: 'KM',
    contadorSecundario: '2.755,0',
    unidadeSecundaria: 'HR',
    subSistema: '',
    componente: '',
    tipoManutencao: 'CORRETIVA',
    setor: '015 - OFICINA MECANICA JUAZEIRO',
    planejador: '028 - EDIVAR',
    causa: '010 - FALTA DE LUBRIFICACAO',
    sintoma: '1 - CORRETIVA',
    omOrigem: '0',
    entradaData: '2026-08-25',
    entradaHora: '14:21',
    prevTerminoData: '2026-08-27',
    prevTerminoHora: '23:59',
    estabelecimento: '003',
    unidadeNegocio: '380',
    contaOrdem: '77 - 11100211',
    contaDespesa: '77 - 41020401 - 12201',
    // Ajustado chave 'equipamento' para ser reconhecido na tela de detalhes
    equipamento: 'VW 24.260 CONSTELLATION (77-31934)',
    horimetro: '1820 h',
    local: 'Pátio Principal',
    prioridade: 'Média',
    solicitante: '',
    responsavel: 'Não atribuído',
    descricao: 'Troca de vazamento hidráulico'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Mantém 'equipamento' atualizado caso o usuário altere o nome do equipamento na barra superior
      if (name === 'nomeEquipamento' || name === 'codEquipamento' || name === 'subCodEquipamento') {
        updated.equipamento = `${updated.nomeEquipamento} (${updated.codEquipamento}-${updated.subCodEquipamento})`;
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 28, 44, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #D8E0E5'
      }}>
        
        {/* Cabeçalho */}
        <div style={{
          backgroundColor: '#0F1C2C',
          color: '#FFFFFF',
          padding: '16px 24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Abertura de Ordem de Serviço</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#D8E0E5' }}>Preencha as informações para registrar uma nova OS</p>
        </div>

        {/* Corpo com Scroll */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          
          {/* Seção Superior - Informações Gerais */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Ordem</label>
                <input type="text" name="ordem" value={formData.ordem} onChange={handleChange} style={inputStyle} readOnly />
              </div>
              <div>
                <label style={labelStyle}>Oficina</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" name="oficina" value={formData.oficina} onChange={handleChange} style={{ ...inputStyle, width: '60px' }} />
                  <input type="text" name="nomeOficina" value={formData.nomeOficina} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input type="text" value="Não Iniciada" style={{ ...inputStyle, backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '600' }} readOnly />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', fontWeight: '500', color: '#0F1C2C', padding: '4px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="tipoSelecao" value="equipamento" checked={formData.tipoSelecao === 'equipamento'} onChange={handleChange} />
                Equipamento
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="tipoSelecao" value="componente" checked={formData.tipoSelecao === 'componente'} onChange={handleChange} />
                Componente
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="radio" name="tipoSelecao" value="centroCusto" checked={formData.tipoSelecao === 'centroCusto'} onChange={handleChange} />
                Centro de Custo
              </label>
            </div>

            <div>
              <label style={labelStyle}>Equipamento Selecionado</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" name="codEquipamento" value={formData.codEquipamento} onChange={handleChange} style={{ ...inputStyle, width: '50px' }} />
                <input type="text" name="subCodEquipamento" value={formData.subCodEquipamento} onChange={handleChange} style={{ ...inputStyle, width: '90px' }} />
                <input type="text" name="nomeEquipamento" value={formData.nomeEquipamento} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
          </div>

          {/* Navegação de Abas */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #E2E8F0', marginBottom: '16px' }}>
            {['dados', 'descricao', 'tarefas', 'espec', 'anexos', 'materiais', 'observacao'].map((tab) => {
              const labels = {
                dados: 'Dados',
                descricao: 'Descrição',
                tarefas: 'Tarefas',
                espec: 'Espec',
                anexos: 'Anexos',
                materiais: 'Materiais',
                observacao: 'Observação'
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: isActive ? '3px solid #2381FD' : '3px solid transparent',
                    color: isActive ? '#0F1C2C' : '#64748B',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginBottom: '-2px'
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Aba DADOS */}
          {activeTab === 'dados' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Contador</label>
                    <input type="text" name="contador" value={formData.contador} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ width: '60px' }}>
                    <label style={labelStyle}>Unid.</label>
                    <input type="text" name="unidadeContador" value={formData.unidadeContador} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Sub-Sistema</label>
                  <input type="text" name="subSistema" value={formData.subSistema} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Componente</label>
                  <input type="text" name="componente" value={formData.componente} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Tipo Manutenção</label>
                  <select name="tipoManutencao" value={formData.tipoManutencao} onChange={handleChange} style={inputStyle}>
                    <option value="CORRETIVA">CORRETIVA</option>
                    <option value="PREVENTIVA">PREVENTIVA</option>
                    <option value="INSPECAO">INSPEÇÃO</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Setor</label>
                  <input type="text" name="setor" value={formData.setor} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Planejador</label>
                  <input type="text" name="planejador" value={formData.planejador} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Causa</label>
                  <input type="text" name="causa" value={formData.causa} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Sintoma</label>
                  <input type="text" name="sintoma" value={formData.sintoma} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Contador Secundário</label>
                    <input type="text" name="contadorSecundario" value={formData.contadorSecundario} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ width: '60px' }}>
                    <label style={labelStyle}>Unid.</label>
                    <input type="text" name="unidadeSecundaria" value={formData.unidadeSecundaria} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>OM Origem</label>
                  <input type="text" name="omOrigem" value={formData.omOrigem} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={labelStyle}>Data Entrada</label>
                    <input type="date" name="entradaData" value={formData.entradaData} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora</label>
                    <input type="time" name="entradaHora" value={formData.entradaHora} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={labelStyle}>Prev. Término</label>
                    <input type="date" name="prevTerminoData" value={formData.prevTerminoData} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora</label>
                    <input type="time" name="prevTerminoHora" value={formData.prevTerminoHora} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>Estabelecimento</label>
                    <input type="text" name="estabelecimento" value={formData.estabelecimento} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Unid. Negócio</label>
                    <input type="text" name="unidadeNegocio" value={formData.unidadeNegocio} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#FFFFFF',
                  marginTop: '4px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>CONTAS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '10px' }}>Ordem</label>
                      <input type="text" name="contaOrdem" value={formData.contaOrdem} onChange={handleChange} style={{ ...inputStyle, padding: '4px 8px' }} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '10px' }}>Despesa</label>
                      <input type="text" name="contaDespesa" value={formData.contaDespesa} onChange={handleChange} style={{ ...inputStyle, padding: '4px 8px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba DESCRIÇÃO */}
          {activeTab === 'descricao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Equipamento</label>
                  <input 
                    type="text" 
                    name="equipamento" 
                    value={formData.equipamento} 
                    onChange={handleChange} 
                    placeholder="Ex: VW 24.260 CONSTELLATION" 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Horímetro</label>
                  <input 
                    type="text" 
                    name="horimetro" 
                    value={formData.horimetro} 
                    onChange={handleChange} 
                    placeholder="Ex: 1820 h" 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Local</label>
                  <input 
                    type="text" 
                    name="local" 
                    value={formData.local} 
                    onChange={handleChange} 
                    placeholder="Ex: Pátio Principal" 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Prioridade</label>
                  <select 
                    name="prioridade" 
                    value={formData.prioridade} 
                    onChange={handleChange} 
                    style={inputStyle}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Solicitante</label>
                  <input 
                    type="text" 
                    name="solicitante" 
                    value={formData.solicitante} 
                    onChange={handleChange} 
                    placeholder="Nome do solicitante" 
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Responsável</label>
                  <input 
                    type="text" 
                    name="responsavel" 
                    value={formData.responsavel} 
                    onChange={handleChange} 
                    placeholder="Nome do responsável" 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descrição do Serviço</label>
                <textarea 
                  name="descricao" 
                  value={formData.descricao} 
                  onChange={handleChange} 
                  rows={4} 
                  placeholder="Ex: Troca de vazamento hidráulico" 
                  style={{ 
                    ...inputStyle, 
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }} 
                />
              </div>
            </div>
          )}

          {/* Demais Abas */}
          {activeTab !== 'dados' && activeTab !== 'descricao' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
              Aba em desenvolvimento...
            </div>
          )}

        </div>

        {/* Rodapé de Ações */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2381FD',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(35, 129, 253, 0.2)'
            }}
          >
            Salvar Ordem de Serviço
          </button>
        </div>

      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '2px'
};

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #CBD5E1',
  fontSize: '12px',
  color: '#0F1C2C',
  outline: 'none',
  boxSizing: 'border-box'
};

export default CriarOs;