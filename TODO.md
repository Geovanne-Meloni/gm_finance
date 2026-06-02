# TODO GM Finance

Atualizado em: 2026-06-02

Legenda:
- `[x]` concluido
- `[-]` parcial
- `[ ]` faltando

## Resumo da varredura

### Frontend `gm_finance`

- `[-]` Login migrado para telefone + senha com sessao JWT por dispositivo; biometria ainda nao foi integrada no app.
- `[x]` Tela de resumo mensal consumindo `/api/users/:id/summary`.
- `[x]` Tela de lancamentos com envio para `/api/revenue-entries` e `/api/extra-transactions`.
- `[x]` Tela de metas consumindo `/api/savings-goals`.
- `[x]` Tipos e chamadas da API alinhados com o contrato atual de metas.
- `[x]` Tela para editar faixas percentuais.
- `[x]` Tela para editar `monthlySalary`.
- `[-]` Documentacao real do app e `.env.example` criados; fluxo completo de build/release Android ainda parcial.

### Backend `gm_back`

- `[x]` Endpoints principais de usuarios, faixas percentuais, rendas mensais, extras, metas e summary.
- `[x]` Swagger em `/docs`.
- `[x]` Prisma com `monthlySalary` e `targetMonths`.
- `[x]` Seed e `docker-compose` para ambiente local.
- `[-]` Base de autenticacao iniciada com telefone, senha, sessao por dispositivo e refresh token vinculado ao device.
- `[-]` Pipeline minimo existe so em partes via scripts e README; nao existe CI nem script unico de validacao.
- `[ ]` Multi-tenant.
- `[ ]` Vinculo com WhatsApp.
- `[ ]` Webhook Evolution API.
- `[ ]` Integracao com LLM local.
- `[ ]` Fluxo automatizado WhatsApp -> interpretacao -> `ExtraTransaction` -> confirmacao.
- `[ ]` mTLS.
- `[ ]` Documentacao de deploy completa.
- `[ ]` Testes automatizados.

## Cards do Trello: status real

### 1. Mapear regras de divisao percentual por pessoa

- Status: `[-] parcial`
- Falta para concluir:
  - Documentacao de produto com exemplos claros para 2 pessoas e 4 categorias.

### 2. Implementar cadastro de renda mensal

- Status: `[x] concluido no frontend`
- Entregue no app:
  - Selecao da pessoa dona do lancamento.
  - Campo de mes de referencia (`YYYY-MM`).
  - Feedback de validacao e sucesso/erro.

### 3. Exibir saldo disponivel por categoria

- Status: `[-] parcial`
- Entregue no app:
  - Seletor de mes no resumo.
  - Linguagem de "saldo disponivel" por categoria.
  - Card de saldo geral.
  - Backend passou a descontar gastos extras categorizados do valor disponivel por faixa.
- Falta para concluir:
  - Garantir categorizacao consistente tambem no fluxo do bot do WhatsApp e nas correcoes manuais do app.

### 4. Registrar gasto adicional

- Status: `[-] parcial`
- Entregue no app:
  - Selecao da pessoa relacionada.
  - Campo de mes de referencia.
  - Melhor separacao visual dos tipos de lancamento.
  - Escolha manual da categoria/faixa do gasto extra.
- Falta para concluir:
  - Permitir edicao posterior da categoria sugerida pelo bot em fluxos futuros de historico/detalhe.

### 5. Exibir progresso da meta de economia

- Status: `[x] concluido no frontend`
- Entregue no app:
  - Exibicao de valor restante.
  - Exibicao de percentual de progresso.
  - Exibicao de prazo alvo e estimativa de meses restantes.

### 6. Ajustar cadastro de meta no app para enviar prazo em meses

- Status: `[x] concluido`
- Entregue no app:
  - Campo `targetMonths` no formulario.
  - Envio de `targetMonths` no create.
  - Tipos atualizados com `remainingAmount`, `jointMonthlyGuardado` e `estimatedMonthsRemaining`.

### 7. Criar tela de configuracao de faixas percentuais no app

- Status: `[x] concluido`
- Entregue no app:
  - Nova tela `settings` com listagem/edicao de regras.
  - Validacao de soma total igual a 100%.
  - Integracao com GET/PUT de allocation rules.

### 8. Implementar base multi-tenant no backend

- Status: `[ ] faltando`

### 9. Vincular usuario ao numero de WhatsApp

- Status: `[-] parcial`
- Entregue:
  - `User.phone` como base de identificacao do cliente.
  - Login por telefone no backend/app.
- Falta:
  - Validacao operacional do numero para fluxo real do WhatsApp.
  - Vinculo efetivo com Evolution API e mensagens recebidas.

### 10. Criar webhook da Evolution API no backend

- Status: `[ ] faltando`

### 11. Integrar backend com LLM local para interpretar mensagens

- Status: `[ ] faltando`

### 12. Salvar gasto recebido pelo WhatsApp como transacao extra

- Status: `[ ] faltando`

### 13. Implementar resposta de confirmacao para o WhatsApp

- Status: `[ ] faltando`

### 14. Configurar seguranca de comunicacao com mTLS

- Status: `[ ] faltando`

### 15. Criar documentacao de deploy em servidor proprio

- Status: `[ ] faltando`

### 16. Criar pipeline minimo de build e validacao do backend

- Status: `[-] parcial`

### 19. Implementar autenticacao real no produto

- Status: `[-] parcial`
- Entregue:
  - Rotas `register`, `login`, `refresh` e `me` no backend.
  - Sessao por dispositivo com refresh token vinculado ao device.
  - Frontend consumindo bearer token automaticamente e renovando sessao por refresh.
- Falta:
  - Integrar biometria no app para destravar a renovacao da sessao.
  - Criar logout com revogacao server-side.
  - Validar fluxo completo apos `prisma migrate` + `prisma generate`.

### 17. Preparar build Android com URL de producao da API

- Status: `[-] parcial`
- Entregue:
  - `.env.example` com `EXPO_PUBLIC_API_URL`.
  - README do frontend com checklist de build.
- Falta:
  - `eas.json`/processo de release definido e validacao final contra API publica.

### 18. Gerar PDF final de arquitetura com diagrama Mermaid

- Status: `[-] parcial`

## Gaps extras encontrados fora do Trello

### Alta prioridade

- `[x]` Alinhar contrato de metas entre app e backend.
- `[x]` Criar tela para editar `monthlySalary`.
- `[x]` Atualizar README do frontend.

### Media prioridade

- `[x]` Criar `.env.example` no frontend.
- `[x]` Definir padrao de navegacao para configuracoes no app (tab `Config`).
- `[-]` Estados vazios e mensagens de erro especificas: melhorado em telas principais, ainda pode evoluir.
- `[x]` Permitir um usuario lancar dados para outra pessoa.

### Qualidade tecnica

- `[ ]` Adicionar testes automatizados no backend para regras de negocio.
- `[ ]` Adicionar testes de contrato/smoke dos endpoints principais.
- `[ ]` Adicionar validacao automatica do frontend em CI.

## Ordem sugerida de execucao

### Fase 1 - Corrigir desalinhamentos atuais

- `[x]` Ajustar cadastro de meta no app para enviar `targetMonths`.
- `[x]` Atualizar tipos de `SavingsGoal` no app.
- `[x]` Exibir progresso completo da meta.
- `[x]` Criar `.env.example` e README real do frontend.

### Fase 2 - Fechar MVP funcional do casal

- `[x]` Criar tela de configuracao de faixas percentuais.
- `[x]` Criar tela de configuracao de `monthlySalary`.
- `[x]` Melhorar cadastro de renda mensal com selecao de pessoa e mes.
- `[x]` Melhorar cadastro de gasto adicional com selecao de pessoa e data/mes.
- `[-]` Revisar tela de summary para mostrar saldo disponivel de forma clara (parte frontend entregue; regra de negocio final ainda pendente).

### Fase 3 - Robustez operacional

- `[ ]` Criar pipeline minimo de validacao do backend.
- `[ ]` Criar documentacao de deploy.
- `[-]` Preparar build Android com URL de producao.
- `[ ]` Gerar PDF final de arquitetura.

### Fase 4 - Expansao via WhatsApp

- `[ ]` Implementar multi-tenant.
- `[ ]` Vincular usuario ao WhatsApp.
- `[ ]` Criar webhook da Evolution API.
- `[ ]` Integrar com LLM local.
- `[ ]` Salvar transacao via WhatsApp.
- `[ ]` Implementar confirmacao de resposta.
- `[ ]` Configurar mTLS.

## Observacoes da auditoria

- As features acima foram parcialmente avancadas neste ciclo, com foco em autenticacao real e categoria em gastos extras.
- Nao foi possivel executar `npm`, `node`, `lint` ou `tsc` localmente neste ambiente porque o shell desta sessao nao possui `node` disponivel.
