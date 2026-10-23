# Nix Core • Sustentare CTR Cariri

> **Sistema Integrado de Gestão Operacional, Controle de Frota, Almoxarifado e Balança Rodoviária com Emissão de e-Ticket Térmico**

Plataforma desenvolvida para a operação da **Sustentare Saneamento** no **CTR Cariri** (Centro de Tratamento de Resíduos em Juazeiro do Norte / CE). Centraliza a aferição de balança rodoviária, emissão de tickets térmicos 80mm, gestão de frotas interna e externa, ordens de serviço (OS) e almoxarifado.

---

## 📖 Documentação Completa

Para ler o guia técnico detalhado, regras de negócio, modelagem de dados e arquitetura, consulte:

👉 **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**

---

## 🚀 Principais Módulos

* **Balança Rodoviária & Pesagem (`PesagemVeiculos.jsx`):**
  * Divisão entre **Frota Interna** e **Pesagens Externas** com filtros e KPIs dedicados.
  * Cálculos em KG estritamente em **múltiplos de 10 kg** (divisão metrológica $d = 10\text{ kg}$).
  * Gestão de empresas externas com placas vinculadas, motoristas e **Empresa de Origem do Produto Carregado**.
* **Comprovante Térmico Oficial (`ThermalTicketReceipt.jsx`):**
  * Formatação idêntica ao ticket físico de 80mm da Sustentare CTR Cariri.
  * Impressão direta (`@media print`), cópia em texto ou download `.txt`.
* **Painel Administrativo (`Configuracoes.jsx`):**
  * **Edição Irrestrita de Pesagens:** O ADM pode editar qualquer informação de pesagens concluídas.
  * **Parametrização da Empresa:** Alteração do nome interno da empresa com reflexo automático nos tickets e na frota.
  * **Gestão da Frota Interna:** Cadastro e edição de veículos próprios e taras.
* **Ordens de Serviço - OS (`OrdemServico.jsx`):** Kanban interativo, diagnósticos e controle de manutenção.
* **Almoxarifado & Estoque (`EstoqueAlmoxarifado.jsx`):** 9 categorias de peças, controle de saldo e estoque mínimo.
* **Relatório Diário de Atividades - RDA (`RelatorioDiario.jsx`):** Apontamento de jornada, viagens e horímetros.

---

## 🛠️ Instalação e Execução

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar em modo de desenvolvimento
npm run dev

# 3. Validar sintaxe e código (Linter)
npm run lint

# 4. Gerar build para produção
npm run build
```

---

*Desenvolvido para Sustentare Saneamento • Unidade CTR Cariri*
