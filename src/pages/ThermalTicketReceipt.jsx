import { useState } from 'react';
import { Printer, Copy, Check, Eye, X, Download } from 'lucide-react';
import { INITIAL_CONFIG_EMPRESA } from '../data/veiculosData';

export const SustentareLogo = () => (
  <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#F0FDF4" stroke="#16A34A" strokeWidth="3" />
    {/* Folhas estilizadas Sustentare */}
    <path 
      d="M26 68C24 45 42 24 68 20C65 42 48 64 26 68Z" 
      fill="#15803D" 
    />
    <path 
      d="M38 74C38 56 50 38 72 32C70 50 56 68 38 74Z" 
      fill="#22C55E" 
    />
    <path 
      d="M50 78C50 64 58 50 75 44C74 58 64 72 50 78Z" 
      fill="#86EFAC" 
    />
    <path 
      d="M20 74C35 68 50 66 80 66" 
      stroke="#166534" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
  </svg>
);

// Assinatura manuscrita estilizada do Bruno / Operador
export const SignatureSvg = () => (
  <svg width="150" height="42" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
    <path
      d="M15 42 C 25 38, 30 18, 38 12 C 45 6, 52 14, 48 30 C 44 44, 38 52, 54 44 C 68 36, 75 22, 85 24 C 95 26, 92 40, 105 38 C 115 36, 128 16, 138 20 C 145 23, 142 38, 155 36 C 168 34, 180 28, 192 32"
      stroke="#1E293B"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M30 46 C 70 42, 120 44, 175 40"
      stroke="#1E293B"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ThermalTicketReceipt = ({ ticket, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(false);

  if (!ticket) return null;

  // Formatações e mapeamentos para fidelidade total ao ticket impresso da Sustentare
  const contador = ticket.contador || ticket.ticket?.replace(/\D/g, '').slice(-5) || '11978';
  const placa = (ticket.placa || 'GII8H27').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const placaCarreta = (ticket.placaCarreta || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const codigoProduto = ticket.codigoProduto || '15';
  const produto = (ticket.produto || ticket.tipoResiduo || 'RESIDUOS DOMICILIARES').toUpperCase();
  const clienteFornecedor = (ticket.clienteFornecedor || ticket.origem || 'CORES CARIRI ORIENTAL BREJO SANTO').toUpperCase();
  const motorista = (ticket.motorista || 'ROBERTO').toUpperCase();
  const transportadora = (ticket.transportadora || 'SUSTENTARE SANEAMENTO').toUpperCase();
  
  // Datas e Horários
  const data = ticket.data || '22/09/2026';
  const horaEntrada = ticket.horaEntrada ? (ticket.horaEntrada.length === 5 ? `${ticket.horaEntrada}:00` : ticket.horaEntrada) : '13:42:04';
  const horaSaida = ticket.horaSaida ? (ticket.horaSaida.length === 5 ? `${ticket.horaSaida}:00` : ticket.horaSaida) : '14:15:22';
  
  const observacao = ticket.observacoes ? ticket.observacoes.toUpperCase() : `CARREGADO ${data}`;
  const origemProduto = (ticket.empresaOrigem || ticket.origem || '').toUpperCase();

  // Pesagens estritamente em múltiplos de 10 kg
  const pesoBruto = Math.round((Number(ticket.pesoBrutoKg) || 24800) / 10) * 10;
  const tara = Math.round((Number(ticket.taraKg) || 12020) / 10) * 10;
  const pesoLiquido = Math.round((Number(ticket.pesoLiquidoKg) || Math.max(0, pesoBruto - tara)) / 10) * 10;
  const valorUnit = ticket.valorUnit !== undefined ? ticket.valorUnit : 0;

  const formatNumberPtBR = (num, decimals = 2) => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const empresaConfig = (() => {
    try {
      const saved = localStorage.getItem('sustentare_empresa_config');
      return saved ? JSON.parse(saved) : INITIAL_CONFIG_EMPRESA;
    } catch {
      return INITIAL_CONFIG_EMPRESA;
    }
  })();

  const nomeEmpresaTopo = (empresaConfig?.nomeInterno || 'SUSTENTARE SANEAMENTO').toUpperCase();
  const nomeUnidadeTopo = (empresaConfig?.unidadeOperacional || 'CTR CARIRI').toUpperCase();
  const enderecoTopo = (empresaConfig?.endereco || 'RODOVIA CE 060 Nº 1100').toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const getPlainTextReceipt = () => {
    return `${nomeEmpresaTopo}
${nomeUnidadeTopo}
${enderecoTopo}

PESSAGEM AUTOMÁTICA
------------------------------------------------
CONTADOR: ${contador}
PLACA DO VEÍCULO: ${placa}
PLACA DA CARRETA: ${placaCarreta}
CÓDIGO DO PRODUTO: ${codigoProduto}
PRODUTO: ${produto}
CLIENTE/FORNECEDOR:
${clienteFornecedor}
ORIGEM DO PRODUTO:
${origemProduto || clienteFornecedor}
MOTORISTA:
${motorista}
TRANSPORTADORA:
${transportadora}
OBS: ${observacao}
------------------------------------------------
PRIMEIRA PESAGEM                ${formatNumberPtBR(pesoBruto, 2)}
DATA/HORA: ${data} ${horaEntrada}
SEGUNDA PESAGEM                 ${formatNumberPtBR(tara, 2)}
DATA/HORA: ${data} ${horaSaida}
------------------------------------------------
PESO LÍQUIDO KG:                    ${pesoLiquido.toLocaleString('pt-BR')}
PESO LÍQUIDO COM DESC.:         ${formatNumberPtBR(pesoLiquido, 2)}
PESAGEM X VALOR UNIT...:                ${valorUnit}
------------------------------------------------
ASSINATURA:
________________________________________________
`;
  };

  const handleCopyText = () => {
    const text = getPlainTextReceipt();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const text = getPlainTextReceipt();
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `ticket_pesagem_${contador}_${placa}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs no-print"
      style={{ overflowY: 'auto' }}
    >
      <div 
        className="relative bg-white rounded-2xl w-full max-w-xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho da Janela Modal */}
        <div className="bg-[#0F1C2C] text-white px-4 py-3 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Comprovante Oficial de Balança • CTR Cariri
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOriginalPhoto(!showOriginalPhoto)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Comparar com foto original"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">
                {showOriginalPhoto ? 'Ocultar Referência' : 'Ver Foto Original'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal com Rolagem */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col md:flex-row gap-4 items-center md:items-start justify-center">
          
          {/* Se o usuário quiser comparar com a foto original */}
          {showOriginalPhoto && (
            <div className="w-full md:w-64 shrink-0 bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase">
                Foto de Referência (Ticket Real)
              </span>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img 
                  src="/assets/aistudio/image_7a06826b.png" 
                  alt="Ticket Térmico Original" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] text-slate-500 italic">
                Formato padrão Sustentare Saneamento CTR Cariri
              </span>
            </div>
          )}

          {/* O TICKET TÉRMICO IMPRESSO (Fiel à Imagem) */}
          <div 
            className="thermal-receipt-printable bg-white text-black p-5 sm:p-6 shadow-md border border-slate-300 w-full max-w-[340px] shrink-0"
            style={{
              fontFamily: '"Courier New", Courier, "Lucida Console", Monaco, monospace',
              fontSize: '11px',
              lineHeight: '1.3',
              color: '#000000',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          >
            {/* TOPO: Logo Sustentare Saneamento CTR Cariri */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <SustentareLogo />
              <div style={{ textTransform: 'uppercase' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.2px' }}>
                  {nomeEmpresaTopo}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '900' }}>
                  {nomeUnidadeTopo}
                </div>
                <div style={{ fontSize: '9px', fontWeight: '700', color: '#111827' }}>
                  {enderecoTopo}
                </div>
              </div>
            </div>

            {/* Título de pesagem */}
            <div style={{ textAlign: 'center', margin: '8px 0 4px 0' }}>
              <span style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>
                PESSAGEM AUTOMÁTICA
              </span>
            </div>

            {/* Linha divisória térmica */}
            <div style={{ borderBottom: '1.5px solid #000000', margin: '4px 0 8px 0' }} />

            {/* Campos do ticket */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ fontWeight: '800' }}>CONTADOR: </span>
                <span>{contador}</span>
              </div>

              <div>
                <span style={{ fontWeight: '800' }}>PLACA DO VEÍCULO: </span>
                <span style={{ fontWeight: '900' }}>{placa}</span>
              </div>

              <div>
                <span style={{ fontWeight: '800' }}>PLACA DA CARRETA: </span>
                <span>{placaCarreta}</span>
              </div>

              <div>
                <span style={{ fontWeight: '800' }}>CÓDIGO DO PRODUTO: </span>
                <span>{codigoProduto}</span>
              </div>

              <div>
                <span style={{ fontWeight: '800' }}>PRODUTO: </span>
                <span style={{ fontWeight: '800' }}>{produto}</span>
              </div>

              <div style={{ marginTop: '2px' }}>
                <div style={{ fontWeight: '800' }}>CLIENTE/FORNECEDOR:</div>
                <div style={{ fontWeight: '800' }}>{clienteFornecedor}</div>
              </div>

              {origemProduto && (
                <div style={{ marginTop: '2px' }}>
                  <div style={{ fontWeight: '800' }}>ORIGEM DO PRODUTO:</div>
                  <div style={{ fontWeight: '800' }}>{origemProduto}</div>
                </div>
              )}

              <div style={{ marginTop: '2px' }}>
                <div style={{ fontWeight: '800' }}>MOTORISTA:</div>
                <div style={{ fontWeight: '800' }}>{motorista}</div>
              </div>

              <div style={{ marginTop: '2px' }}>
                <div style={{ fontWeight: '800' }}>TRANSPORTADORA:</div>
                <div style={{ fontWeight: '800' }}>{transportadora}</div>
              </div>

              <div style={{ marginTop: '2px' }}>
                <span style={{ fontWeight: '800' }}>OBS: </span>
                <span>{observacao}</span>
              </div>
            </div>

            {/* Linha divisória térmica */}
            <div style={{ borderBottom: '1.5px solid #000000', margin: '8px 0' }} />

            {/* Seção de Pesagens (Primeira / Segunda) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '800' }}>PRIMEIRA PESAGEM</span>
                <span style={{ fontWeight: '900', fontSize: '12px' }}>
                  {formatNumberPtBR(pesoBruto, 2)}
                </span>
              </div>
              <div style={{ fontSize: '10px' }}>
                DATA/HORA: {data} {horaEntrada}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <span style={{ fontWeight: '800' }}>SEGUNDA PESAGEM</span>
                <span style={{ fontWeight: '900', fontSize: '12px' }}>
                  {formatNumberPtBR(tara, 2)}
                </span>
              </div>
              <div style={{ fontSize: '10px' }}>
                DATA/HORA: {data} {horaSaida}
              </div>
            </div>

            {/* Linha divisória térmica */}
            <div style={{ borderBottom: '1.5px solid #000000', margin: '8px 0' }} />

            {/* Bloco de Destaque: PESO LÍQUIDO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '2px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '900', fontSize: '12px' }}>PESO LÍQUIDO KG:</span>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>
                  {pesoLiquido.toLocaleString('pt-BR')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '800' }}>PESO LÍQUIDO COM DESC.:</span>
                <span style={{ fontWeight: '800' }}>
                  {formatNumberPtBR(pesoLiquido, 2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '800' }}>PESAGEM X VALOR UNIT...:</span>
                <span style={{ fontWeight: '800' }}>
                  {valorUnit}
                </span>
              </div>
            </div>

            {/* Linha divisória térmica */}
            <div style={{ borderBottom: '1.5px solid #000000', margin: '8px 0 12px 0' }} />

            {/* Assinatura Manuscrita do Operador / Motorista */}
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <SignatureSvg />
              <div style={{ borderTop: '1px solid #000000', width: '85%', margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px' }}>
                ASSINATURA DO OPERADOR / MOTORISTA
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 no-print shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            >
              <Download size={14} />
              <span>Baixar .TXT</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir Ticket Térmico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalTicketReceipt;
