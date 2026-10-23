# DOCUMENTAÇÃO COMPLETA DO SISTEMA NIX CORE / SUSTENTARE CTR CARIRI

> **Sistema Integrado de Gestão Operacional, Controle de Frota, Almoxarifado e Balança Rodoviária com Emissão de e-Ticket Térmico**

---

## 1. VISÃO GERAL DO PROJETO

O **Nix Core** é uma plataforma web completa desenvolvida para a gestão e automação operacional de aterros sanitários, frentes de coleta pública e estações de transbordo regional. Customizado para a operação da **Sustentare Saneamento** no **CTR Cariri** (Centro de Tratamento de Resíduos localizado em Juazeiro do Norte / CE), o sistema centraliza o controle de pesagem rodoviária, manutenção de frota, ordens de serviço (OS), almoxarifado/estoque e relatórios diários de atividades (RDA).

### Principais Objetivos:
1. **Automação da Balança Rodoviária:** Aferição de peso de veículos pesados com precisão metrológica industrial em múltiplos de 10 kg ($d = 10\text{ kg}$), controle de entrada/saída (Bruto e Tara) e cálculo instantâneo do Peso Líquido.
2. **Divisão Operacional de Cargas:** Separação clara entre **Frota Interna** (veículos próprios da empresa) e **Pesagens Externas** (empresas contratantes, municípios conveniados e consórcios como o CORES Cariri Oriental).
3. **Rastreabilidade e Origem do Produto:** Cadastro de empresas que descarregam no CTR com suas respectivas placas, motoristas vinculados e a **Empresa de Origem do Produto Carregado**.
4. **Emissão de e-Ticket Térmico Oficial:** Reprodução fiel em formato de 80mm com logotipo, cabeçalho dinâmico da empresa, primeira/segunda pesagem com data/hora, assinaturas e exportação em texto puro (`.txt`) ou impressão física.
5. **Painel de Configurações ADM:** Módulo administrativo restrito que permite alterar qualquer dado de pesagens já registradas, gerenciar veículos da frota e **modificar o nome interno da empresa** (com reflexo imediato nos e-Tickets e novos cadastros).

---

## 2. ARQUITETURA E STACK TECNOLÓGICA

O projeto foi construído seguindo as melhores práticas de desenvolvimento frontend moderno, garantindo alto desempenho, responsividade e robustez:

* **Framework Principal:** [React 19](https://react.dev/) (Single Page Application - SPA).
* **Build Tool & Bundler:** [Vite](https://vitejs.dev/) para compilação ultrarrápida e hot module replacement (HMR).
* **Roteamento:** [React Router DOM v7](https://reactrouter.com/) com rotas protegidas e navegação fluida.
* **Estilização & Design System:**
  * [Tailwind CSS v4](https://tailwindcss.com/) com suporte a variáveis CSS e tema customizado.
  * Paleta de cores corporativa baseada no padrão institucional:
    * Fundo Escuro Principal: `#0F1C2C` (Navy profundo).
    * Fundo de Painéis: `#D8E0E5` (Cinza azulado suave).
    * Azul Primário: `#2381FD`.
    * Cores Semânticas de Status: Verde (`#34AC4C`), Âmbar (`#F5C344`), Vermelho (`#FF4D4D`).
* **Iconografia:** [Lucide React](https://lucide.dev/) com ícones semânticos vetoriais.
* **Persistência de Dados & Sincronização Reativa:**
  * Utilização de `localStorage` para persistência local dos dados (Pesagens, Frota Interna, Configurações da Empresa e Empresas Externas).
  * Ouvintes de eventos `window.addEventListener('storage', ...)` garantem que alterações feitas na aba de Configurações ADM reflitam instantaneamente nas demais abas e componentes sem necessidade de recarregar a página.
* **Design Responsivo & Mobile First:**
  * Uso de unidades dinâmicas `100dvh` para evitar problemas com barras de navegação de navegadores mobile (Safari/Chrome).
  * Menu retrátil no desktop e menu deslizante (*Drawer*) com fundo translúcido no mobile.

---

## 3. MÓDULOS DO SISTEMA E COMO FUNCIONAM

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NIX CORE - ARQUITETURA                          │
├───────────────────┬────────────────────────────────────────────────────┤
│ Autenticação      │ Login, 2FA (6 dígitos), Recuperação, 1º Acesso     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Home Dashboard    │ KPIs Operacionais, Gráficos, Alertas Preventivos  │
├───────────────────┼────────────────────────────────────────────────────┤
│ Ordens de Serviço │ Gestão de OS, Manutenção Preventiva e Corretiva    │
├───────────────────┼────────────────────────────────────────────────────┤
│ Estoque           │ Almoxarifado, 9 Categorias, Entradas e Saídas      │
├───────────────────┼────────────────────────────────────────────────────┤
│ Relatório Diário  │ RDA para Coleta, Tráfego e Horas Operacionais     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Frota de Veículos │ Monitoramento, Horímetro, Combustível, Histórico   │
├───────────────────┼────────────────────────────────────────────────────┤
│ Pesagem & Balança │ Balança Rodoviária, Frota Interna vs Externa, 10kg │
├───────────────────┼────────────────────────────────────────────────────┤
│ e-Ticket Térmico  │ Comprovante Térmico 80mm Sustentare CTR Cariri     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Configurações ADM │ Edição Irrestrita de Pesagens, Nome Empresa, Frota │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

### 3.1. Autenticação e Segurança (`Login.jsx`)
O módulo de acesso controla a entrada dos operadores, mecânicos, balancistas e gestores:
* **Validação de Credenciais:** Entrada com e-mail/usuário e senha criptografada.
* **Autenticação em Duas Etapas (2FA):** Validação com código de segurança de 6 dígitos.
* **Recuperação de Senha em 3 Etapas:**
  1. Solicitação informando o e-mail cadastrado.
  2. Inserção do código temporário recebido.
  3. Redefinição e confirmação da nova senha.
* **Primeiro Acesso:** Permite que novos operadores criem seu registro com nome, matrícula/código de colaborador e senha de acesso.

---

### 3.2. Painel Geral Operacional (`HomeDashboard.jsx`)
O painel inicial consolida os indicadores-chave de performance (KPIs) da unidade:
* **Filtros Temporais:** Alternância dinâmica entre "Hoje", "Semana" e "Mês".
* **Cards de Métricas:**
  * Total de Ordens de Serviço abertas e concluídas.
  * Ordens em execução imediata nas oficinas mecânicas.
  * Disponibilidade percentual da frota de veículos (%).
  * Média de combustível e equipamentos com manutenção preventiva próxima.
* **Gráficos Operacionais:** Visão semanal de ordens concluídas versus abertas.
* **Monitoramento Crítico:** Tabela de equipamentos em alerta com horímetro acumulado e operador responsável.

---

### 3.3. Gestão de Ordens de Serviço - OS (`OrdemServico.jsx` e `CriarOs.jsx`)
Controle das intervenções mecânicas, elétricas e de manutenção na frota:
* **Visualização Kanban & Tabela:** Visualização em cartões ou tabela com ordenação e reordenação de colunas via Drag-and-Drop.
* **Abertura de Nova OS:** Seleção de equipamento/veículo, oficina (ex: *014 - Oficina Mecânica Juazeiro*), horímetro/odômetro atual, nível de criticidade e diagnóstico inicial da falha.
* **Ciclo de Vida da OS:** Transição direta de status entre *Aberto* $\rightarrow$ *Em Execução* $\rightarrow$ *Concluído*.

---

### 3.4. Almoxarifado e Controle de Estoque (`EstoqueAlmoxarifado.jsx`)
Gestão de peças de reposição, filtros, óleos lubrificantes, pneus e insumos:
* **9 Categorias Padronizadas:** Filtros, Óleos & Fluidos, Freios, Suspensão & Direção, Motor & Câmbio, Elétrica & Baterias, Pneus & Rodas, EPIs e Ferramentas.
* **Controle de Saldo & Estoque Mínimo:** Alertas visuais automáticos para itens com estoque em nível de alerta ou zerado.
* **Movimentações de Entrada e Saída:** Registro completo com data, responsável, número de nota fiscal e centro de custo.

---

### 3.5. Relatório Diário de Atividades - RDA (`RelatorioDiario.jsx`)
Formulário operacional para registro das rotas de coleta urbana e transporte:
* Apontamento de jornada de trabalho (horário inicial, pausas para almoço e término).
* Horímetro e quilometragem inicial e final dos caminhões compactadores.
* Quantidade de viagens realizadas, bairros/setores atendidos e ocorrências de trânsito.

---

### 3.6. Monitoramento da Frota de Veículos (`Veiculos.jsx`)
Controle dos veículos próprios da empresa:
* **Visão por Categoria:** Caminhões compactadores, poliguindaste roll-on, basculantes, pipa/lavagem, varredeiras mecânicas e máquinas pesadas (escavadeiras, pás-carregadeiras e tratores de esteira).
* **Métricas Individuais:** Placa Mercosul, código da frota (ex: `77-31934`), tara aferida, horímetro atual e próxima revisão programada.
* **Histórico Unificado:** Linha do tempo com todas as OS, abastecimentos e registros de pesagem associados ao veículo.

---

### 3.7. Módulo de Pesagem de Veículos & Balança Rodoviária (`PesagemVeiculos.jsx`)
O coração operacional do CTR Cariri para entrada e saída de resíduos sólidos.

#### A. Divisão em Frota Interna e Pesagens Externas:
* **Abas de Filtragem:** Alternador com contadores em tempo real entre:
  * `Todas as Pesagens`
  * `Frota Interna (Sustentare)`
  * `Pesagens Externas (Terceiros & Clientes)`
* **Badges Distintivos:** Cada card ou linha da tabela exibe um selo claro:
  * **Frota Interna:** Selo azul com ícone de caminhão (`Truck`).
  * **Pesagem Externa:** Selo âmbar/dourado com ícone de empresa (`Building2`), exibindo a razão social do cliente e a **Empresa de Origem do Produto**.

#### B. Regra Metrológica de Aferição em KG (Múltiplos de 10):
Em conformidade com a regulamentação metrológica de balanças rodoviárias industriais (divisão $d = 10\text{ kg}$):
* Todos os inputs numéricos de Peso Bruto e Tara utilizam `step="10"`.
* Ao perder o foco (`onBlur`) ou salvar, a função `roundTo10Kg` força o arredondamento para a dezena mais próxima:
  $$\text{Valor Final} = \text{round}\left(\frac{\text{Valor}}{10}\right) \times 10$$
* O Peso Líquido é calculado em tempo real respeitando a regra:
  $$\text{Peso Líquido} = \text{roundTo10Kg}(\text{Peso Bruto} - \text{Tara})$$

#### C. Gestão de Empresas Externas Cadastradas:
* Painel interativo acessível pelo cabeçalho ("Empresas Externas"):
  * Cadastro e edição de empresas que descarregam resíduos no aterro.
  * Campos: Razão Social, CNPJ, **Empresa de Origem do Produto Carregado**, Cidade/UF, Contato e Tipo de Resíduo Padrão.
  * **Veículos por Empresa:** Permite cadastrar múltiplas placas de caminhão, placa da carreta, modelo, tara padrão (em múltiplos de 10) e motorista vinculado.
* **Preenchimento Automático na Balança:**
  * Ao criar uma nova pesagem e escolher *Pesagem Externa*, o operador seleciona a empresa externa.
  * O sistema preenche automaticamente o Cliente, a Transportadora, a **Empresa de Origem do Produto** e exibe botões com as placas vinculadas.
  * Com 1 clique na placa desejada, o sistema preenche placa do caminhão, placa da carreta, modelo, motorista e tara pré-cadastrada.

---

### 3.8. Emissão de e-Ticket Térmico Oficial (`ThermalTicketReceipt.jsx`)
Baseado no formato físico dos comprovantes emitidos nas balanças rodoviárias do CTR Cariri:
* **Design Fiel à Bobina de 80mm:** Layout monocromático de alta densidade, tipografia monospace e logotipo estilizado de folhas verdes da Sustentare.
* **Cabeçalho Dinâmico da Empresa:** Exibe o Nome Interno da Empresa, o Nome da Unidade e o Endereço/Rodovia (lidos das configurações salvas pelo ADM).
* **Campos Padronizados:**
  * Contador sequencial e Nº do Ticket.
  * Placa do Veículo e Placa da Carreta.
  * Código do Produto (ex: `15`) e Descrição (ex: `RESIDUOS DOMICILIARES`).
  * Cliente/Fornecedor e **Origem do Produto**.
  * Motorista e Transportadora.
  * **Primeira Pesagem (Bruto):** Valor em kg com duas casas decimais e Data/Hora de entrada.
  * **Segunda Pesagem (Tara):** Valor em kg com duas casas decimais e Data/Hora de saída.
  * **Peso Líquido KG:** Destaque em negrito com separador de milhar.
  * Assinatura manuscrita vetorial do operador/balancista.
* **Recursos do Modal:**
  * Visualização na tela com simulação da textura de papel térmico.
  * **Imprimir:** Dispara o driver de impressão do navegador já configurado com CSS `@media print` para impressoras térmicas de 80mm (Zebra, Bematech, Epson, Elgin).
  * **Copiar Texto:** Copia a formatação pura do comprovante para a área de transferência.
  * **Baixar TXT:** Faz o download imediato de um arquivo `.txt` nomeado com o contador e a placa.

---

### 3.9. Configurações & Painel Administrativo ADM (`Configuracoes.jsx`)
Módulo exclusivo para administradores, estruturado em 3 abas principais:

#### Aba 1: Gestão de Pesagens (Editar Informações - ADM)
* Permite ao ADM localizar qualquer pesagem via busca textual global ou filtros de status/frota.
* **Modal de Edição Completa:** O ADM pode editar **todos os campos** do registro sem restrições:
  * Número do Ticket, Contador e Categoria da Frota (*Interna* / *Externa*).
  * Data, Horário de Entrada e Horário de Saída.
  * Placa do Veículo e Placa da Carreta.
  * Motorista Vinculado, Operador e Balança Operacional.
  * Cliente, Transportadora e Empresa de Origem do Produto.
  * Tipo de Resíduo e Código do Produto.
  * Pesos Bruto e Tara (com cálculo automático do Líquido em múltiplos de 10 kg).
  * Status e Observações.
* Possibilidade de exclusão permanente com confirmação e botão de reemissão do ticket.

#### Aba 2: Frota Interna & Nome da Empresa
* **Alterar Nome Interno da Empresa:**
  * O ADM pode renomear a empresa interna (por exemplo, de *SUSTENTARE SANEAMENTO* para outro nome corporativo ou filial).
  * Edição de Razão Social, CNPJ da Unidade, Nome da Unidade CTR, Endereço/Rodovia, Município/UF e Balancista Chefe.
  * **Reflexo Universal:** O novo nome passa a constar imediatamente em todas as novas pesagens internas e no cabeçalho do e-Ticket térmico.
* **Gerenciar Veículos da Frota Interna:**
  * Cadastro de novos caminhões e equipamentos próprios da empresa.
  * Edição de placas, códigos internos (`77-XXXX`), modelos, tara padrão (em múltiplos de 10 kg), operadores fixos e status operacional.
  * Sincronização direta com a seleção de veículos da tela de pesagem.

#### Aba 3: Parâmetros da Balança & Metrologia
* Consulta e validação das regras metrológicas (divisão de balança $d = 10\text{ kg}$).
* Especificações do padrão de impressão térmica 80mm.
* Botão para restaurar os dados de demonstração iniciais caso necessário.

---

## 4. DICIONÁRIO DE DADOS & ESTRUTURA DOS OBJETOS

### 4.1. Objeto de Pesagem (`Pesagem`)
```javascript
{
  id: 'PES-001',
  ticket: 'TCK-2026-0419',
  contador: '11978',
  data: '22/09/2026',
  horaEntrada: '13:42:04',
  horaSaida: '14:15:22',
  tipoFrota: 'Externa', // 'Interna' | 'Externa'
  empresaExternaId: 'EMP-001',
  empresaOrigem: 'Consórcio Público CORES - Brejo Santo',
  placa: 'GII8H27',
  placaCarreta: '',
  veiculoNome: 'VW 24.260 CONSTELLATION (CORES)',
  motorista: 'ROBERTO',
  balanca: 'Balança 01 - CTR Cariri',
  codigoProduto: '15',
  tipoResiduo: 'RSU - Resíduo Sólido Urbano',
  produto: 'RESIDUOS DOMICILIARES',
  clienteFornecedor: 'CORES CARIRI ORIENTAL BREJO SANTO',
  transportadora: 'CORES LOGÍSTICA REGIONAL',
  origem: 'Setor 4 - Brejo Santo',
  pesoBrutoKg: 24800, // Estritamente múltiplo de 10
  taraKg: 12020,      // Estritamente múltiplo de 10
  pesoLiquidoKg: 12780, // Bruto - Tara (múltiplo de 10)
  valorUnit: 0,
  operador: 'Bruno',
  status: 'Concluída', // 'Concluída' | 'Aguardando Tara (Saída)' | 'Cancelada'
  observacoes: 'CARREGADO 22/09/2026'
}
```

### 4.2. Objeto de Empresa Externa (`EmpresaExterna`)
```javascript
{
  id: 'EMP-001',
  nome: 'CORES CARIRI ORIENTAL',
  cnpj: '07.892.431/0001-55',
  empresaOrigem: 'Consórcio Público CORES - Brejo Santo',
  cidadeUf: 'Brejo Santo / CE',
  contato: '(88) 3531-8890 - Carlos Diretor Operações',
  tipoResiduoPadrao: 'RSU - Resíduo Sólido Urbano',
  codigoProduto: '15',
  veiculos: [
    {
      id: 'VEXT-01',
      placa: 'GII8H27',
      placaCarreta: '',
      modelo: 'VW 24.260 CONSTELLATION',
      taraPadraoKg: 12020,
      motoristaVinculado: 'ROBERTO'
    }
  ]
}
```

### 4.3. Objeto de Configuração da Empresa Interna (`ConfigEmpresa`)
```javascript
{
  nomeInterno: 'SUSTENTARE SANEAMENTO',
  razaoSocial: 'SUSTENTARE SANEAMENTO S.A.',
  cnpj: '04.123.456/0001-78',
  unidadeOperacional: 'CTR Cariri - Aterro Sanitário & Transbordo',
  endereco: 'Rodovia CE 060, Nº 1100',
  cidadeUf: 'Juazeiro do Norte / CE',
  operadorPadrao: 'Bruno - Balancista Chefe',
  telefoneContato: '(88) 3571-9200',
  balancaPadrao: 'Balança 01 - CTR Cariri'
}
```

---

## 5. TABELA DE CÓDIGOS DE RESÍDUOS CTR

| Código | Descrição Operacional CTR | Tipo de Carga / Aplicação |
|---|---|---|
| **15** | `RESIDUOS DOMICILIARES` | RSU - Resíduo Sólido Urbano |
| **08** | `RCC - ENTULHO DA CONSTRUÇÃO CIVIL` | RCC - Entulho, concreto e alvenaria |
| **22** | `LODO DE ETE TRATADO` | Lodo de Estações de Tratamento de Efluentes |
| **18** | `RESÍDUOS VEGETAIS E PODAS` | Podas urbanas, galhos e vegetação |
| **10** | `RESÍDUOS INDUSTRIAIS CLASSE II` | Recicláveis, triagem e indústrias não perigosas |
| **18** | `MATERIAL ORGÂNICO / COMPOSTAGEM` | Fração orgânica para pátio de compostagem |
| **99** | `RESÍDUOS DIVERSOS` | Outros / Especiais |

---

## 6. ESTRUTURA DE DIRETÓRIOS DO CÓDIGO FONTE

```
├── public/
│   ├── assets/aistudio/image_7a06826b.png  # Referência do ticket impresso original
│   ├── favicon.svg                         # Ícone da aplicação
│   └── logo-topo.png                       # Logotipo Nix Core
├── src/
│   ├── data/
│   │   └── veiculosData.js                 # Dados iniciais, constantes e helper roundTo10Kg
│   ├── pages/
│   │   ├── Configuracoes.jsx               # Painel ADM (edição pesagens, nome empresa, frota)
│   │   ├── CriarOs.jsx                     # Modal/Formulário de abertura de OS
│   │   ├── Dashboard.jsx                   # Shell principal, sidebar e roteamento de menus
│   │   ├── EstoqueAlmoxarifado.jsx         # Gestão de peças e movimentações de almoxarifado
│   │   ├── HomeDashboard.jsx               # Dashboard com indicadores e gráficos
│   │   ├── Login.jsx                       # Autenticação, 2FA e recuperação de senha
│   │   ├── OrdemServico.jsx                # Tabela e Kanban de Ordens de Serviço
│   │   ├── PesagemVeiculos.jsx             # Balança rodoviária, Frota Interna vs Externa
│   │   ├── RelatorioDiario.jsx             # Relatório Diário de Atividades (RDA)
│   │   ├── ThermalTicketReceipt.jsx        # Emissão e renderização do e-Ticket térmico 80mm
│   │   └── Veiculos.jsx                    # Monitoramento da frota, horímetro e manutenção
│   ├── services/
│   │   └── api.js                          # Configuração de clientes HTTP/Axios
│   ├── App.css
│   ├── App.jsx                             # Configuração de rotas raiz
│   ├── index.css                           # Configurações globais e importação do Tailwind
│   └── main.jsx                            # Ponto de entrada React
├── DOCUMENTACAO.md                         # Esta documentação completa
├── package.json
└── vite.config.js
```

---

## 7. GUIA DE EXECUÇÃO E INSTALAÇÃO

### Pré-requisitos:
* **Node.js** na versão 18.x ou superior.
* Gerenciador de pacotes **npm** ou **bun**.

### Passo a Passo:

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o Servidor em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em: `http://localhost:3000` (ou na porta configurada pelo Vite).

3. **Verificar Regras de Código (Linter):**
   ```bash
   npm run lint
   ```

4. **Gerar Build Otimizado para Produção:**
   ```bash
   npm run build
   ```
   Os arquivos compilados estarão localizados no diretório `/dist`.

---

## 8. PERGUNTAS FREQUENTES (FAQ) & OPERAÇÃO

#### Como mudar o nome da empresa que sai no ticket térmico?
Acesse o menu lateral **Configurações** $\rightarrow$ selecione a aba **Frota Interna & Nome da Empresa** $\rightarrow$ altere o campo **Nome Interno da Empresa** $\rightarrow$ clique em **Salvar Alterações da Empresa**. O novo nome será automaticamente utilizado nos próximos comprovantes emitidos e nas pesagens da frota interna.

#### Como o ADM edita uma pesagem incorreta ou com peso digitado errado?
Acesse o menu lateral **Configurações** $\rightarrow$ aba **Gestão de Pesagens** $\rightarrow$ localize a pesagem pela busca ou filtros $\rightarrow$ clique no botão **Editar** $\rightarrow$ ajuste as placas, motorista, cliente ou os pesos $\rightarrow$ clique em **Salvar Alterações (ADM)**. O registro é corrigido imediatamente no banco local.

#### Por que os pesos sempre terminam em zero (múltiplos de 10)?
Porque as balanças rodoviárias industriais do CTR Cariri possuem célula de carga com divisão calibrada de $10\text{ kg}$ ($d = 10\text{ kg}$). O sistema enforce essa regra metrológica tanto na digitação quanto no cálculo do peso líquido, evitando divergências fiscais e operacionais.

---

*Documentação mantida pela equipe de Engenharia de Software da Sustentare Saneamento / Nix Core.*
