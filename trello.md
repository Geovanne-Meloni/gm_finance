# Trello - Tarefas em Formato SMART

Use cada cartao do Trello como uma tarefa SMART:

- **S - Especifica:** descreve exatamente o que sera feito.
- **M - Mensuravel:** define como saber que terminou.
- **A - Alcancavel:** tem escopo possivel de executar.
- **R - Relevante:** contribui diretamente para o objetivo do projeto.
- **T - Temporal:** possui prazo claro.

## Colunas do Trello

### A fazer

Tarefas ainda nao iniciadas, ja descritas em formato SMART.

### Documentacao

Tarefas de entendimento, escrita ou validacao tecnica.

Exemplos:

- Documentar endpoints.
- Mapear regras de negocio.
- Revisar contrato da API.
- Registrar decisoes tecnicas.

### Andamento

Tarefas que estao sendo executadas agora.

O ideal e manter poucas tarefas nessa coluna ao mesmo tempo.

### Finalizado

Tarefas concluidas, testadas e revisadas conforme o criterio de conclusao.

## Modelo de Cartao SMART

```md
[Titulo objetivo da tarefa]

Objetivo:
O que sera feito, de forma clara.

Criterio de conclusao:
Como saberemos que a tarefa terminou.

Escopo:
O que entra nessa tarefa.

Fora do escopo:
O que nao sera feito agora.

Prazo:
Data limite.

Responsavel:
Nome da pessoa.

Checklist:
- [ ] Passo 1
- [ ] Passo 2
- [ ] Passo 3
```

## Exemplo Geral

```md
Criar tela de login do app

Objetivo:
Implementar a tela de login no app Expo, permitindo que o usuario informe e-mail e senha.

Criterio de conclusao:
A tela deve permitir preencher e-mail e senha, validar campos obrigatorios e chamar a API de autenticacao.

Escopo:
- Layout da tela de login
- Campos de e-mail e senha
- Botao de entrar
- Exibicao de erro em caso de falha

Fora do escopo:
- Cadastro de usuario
- Recuperacao de senha
- Login social

Prazo:
31/05/2026

Responsavel:
Geovanne
```

## Sugestoes de Cartoes para o GM Finance

### Mapear regras de divisao percentual por pessoa

```md
Mapear regras de divisao percentual por pessoa

Objetivo:
Documentar como as rendas mensais serao divididas entre categorias por pessoa.

Criterio de conclusao:
A documentacao deve conter exemplos de calculo para pelo menos 2 pessoas e 4 categorias: contas, livre, streaming e guardado.

Escopo:
- Regras de percentual por pessoa
- Exemplo com renda mensal
- Exemplo de calculo por categoria

Fora do escopo:
- Implementacao no app
- Alteracao no backend

Prazo:
29/05/2026

Responsavel:
Geovanne
```

### Implementar cadastro de renda mensal

```md
Implementar cadastro de renda mensal

Objetivo:
Criar no app a funcionalidade para registrar uma renda mensal vinculada a uma pessoa.

Criterio de conclusao:
O usuario deve conseguir informar pessoa, titulo, tipo de renda, valor, mes de referencia e salvar a renda usando a API.

Escopo:
- Tela/formulario de renda mensal
- Validacao de campos obrigatorios
- Integracao com endpoint da API
- Feedback visual de sucesso ou erro

Fora do escopo:
- Relatorios mensais
- Edicao de rendas ja cadastradas

Prazo:
05/06/2026

Responsavel:
Geovanne
```

### Exibir saldo disponivel por categoria

```md
Exibir saldo disponivel por categoria

Objetivo:
Mostrar no app quanto cada pessoa pode gastar em cada categoria com base nos percentuais cadastrados.

Criterio de conclusao:
A tela deve exibir pessoa, categoria, valor calculado e valor disponivel para o mes selecionado.

Escopo:
- Consulta dos dados na API
- Listagem por pessoa
- Listagem por categoria
- Estado de carregamento e erro

Fora do escopo:
- Registro de compras do dia a dia
- Graficos avancados

Prazo:
10/06/2026

Responsavel:
Geovanne
```

### Registrar gasto adicional

```md
Registrar gasto adicional

Objetivo:
Permitir lancar um gasto fora do fluxo normal da renda mensal, com motivo e usuario responsavel pelo lancamento.

Criterio de conclusao:
O sistema deve salvar valor, descricao, pessoa relacionada, data e quem inseriu o lancamento.

Escopo:
- Formulario de gasto adicional
- Validacao de valor e descricao
- Integracao com API
- Feedback de sucesso ou erro

Fora do escopo:
- Recorrencia de gastos
- Upload de comprovante

Prazo:
12/06/2026

Responsavel:
Geovanne
```

### Exibir progresso da meta de economia

```md
Exibir progresso da meta de economia

Objetivo:
Mostrar o valor acumulado, o valor alvo e quanto falta para atingir a meta de economia.

Criterio de conclusao:
A tela deve exibir valor alvo, acumulado atual, valor restante e percentual de progresso.

Escopo:
- Consulta da meta na API
- Card/resumo de progresso
- Barra de progresso
- Tratamento de estado vazio

Fora do escopo:
- Alteracao manual do acumulado
- Simulacao avancada de tempo

Prazo:
15/06/2026

Responsavel:
Geovanne
```

## Backlog Pendente Baseado no PDF de Arquitetura

As tarefas abaixo foram criadas a partir do arquivo `MEGA_PROMPT_PDF_GM_FINANCE.md`, considerando o que ainda nao foi identificado como pronto nos repositorios `gm_finance` e `gm_back`.

### Ajustar cadastro de meta no app para enviar prazo em meses

```md
Ajustar cadastro de meta no app para enviar prazo em meses

Objetivo:
Atualizar a tela de metas do app `gm_finance` para permitir informar o prazo desejado da meta em meses e enviar esse campo para a API.

Criterio de conclusao:
O usuario deve conseguir criar uma meta informando titulo, valor alvo e prazo em meses, e a API deve retornar a meta criada sem erro de validacao.

Escopo:
- Adicionar campo de prazo em meses na tela de metas
- Atualizar tipos de `SavingsGoal` no app
- Atualizar chamada de criacao e edicao de metas
- Exibir prazo e estimativa de meses restantes quando a API retornar esses dados

Fora do escopo:
- Alterar regra de calculo de metas no backend
- Criar multiplas metas por tenant
- Criar graficos avancados de projecao

Prazo:
18/06/2026

Responsavel:
Geovanne

Checklist:
- [ ] Adicionar campo `targetMonths` no formulario de meta
- [ ] Enviar `targetMonths` no POST `/api/savings-goals`
- [ ] Atualizar tipo `SavingsGoal` com `targetMonths`, `remainingAmount`, `jointMonthlyGuardado` e `estimatedMonthsRemaining`
- [ ] Validar criacao da meta no app Android
```

### Criar tela de configuracao de faixas percentuais no app

```md
Criar tela de configuracao de faixas percentuais no app

Objetivo:
Permitir que o usuario visualize e edite as faixas percentuais por categoria diretamente no app `gm_finance`.

Criterio de conclusao:
O usuario deve conseguir listar, alterar e salvar categorias percentuais, respeitando a regra de soma total igual a 100%.

Escopo:
- Criar tela de configuracoes ou regra de alocacao
- Consumir GET `/api/users/:id/allocation-rules`
- Consumir PUT `/api/users/:id/allocation-rules`
- Validar soma dos percentuais antes de salvar
- Exibir mensagens de sucesso e erro

Fora do escopo:
- Criar categorias globais compartilhadas
- Criar multi-tenant completo
- Alterar calculo financeiro do backend

Prazo:
20/06/2026

Responsavel:
Geovanne

Checklist:
- [ ] Criar rota/tela no app
- [ ] Listar regras atuais do usuario
- [ ] Permitir editar nome e percentual
- [ ] Bloquear envio quando a soma for diferente de 100%
- [ ] Testar reflexo das regras no resumo mensal
```

### Implementar base multi-tenant no backend

```md
Implementar base multi-tenant no backend

Objetivo:
Evoluir o `gm_back` para separar dados por grupo, casal, familia ou organizacao, preparando o sistema para uso por mais de um tenant.

Criterio de conclusao:
Usuarios, lancamentos, regras percentuais e metas devem estar associados a um tenant, e as consultas principais devem filtrar dados pelo tenant correto.

Escopo:
- Criar entidade `Tenant` ou equivalente no Prisma
- Criar relacionamento entre tenant e usuarios
- Associar metas, lancamentos e regras ao tenant quando necessario
- Atualizar consultas para respeitar isolamento de dados
- Criar migracao Prisma
- Atualizar seed de desenvolvimento

Fora do escopo:
- Autenticacao completa com senha/JWT
- Painel administrativo de tenants
- Convites de usuarios

Prazo:
25/06/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir modelo `Tenant`
- [ ] Criar migracao Prisma
- [ ] Atualizar relacionamentos principais
- [ ] Atualizar endpoints impactados
- [ ] Validar que um tenant nao acessa dados de outro
```

### Vincular usuario ao numero de WhatsApp

```md
Vincular usuario ao numero de WhatsApp

Objetivo:
Permitir que o backend identifique qual usuario e tenant enviou uma mensagem recebida pelo WhatsApp.

Criterio de conclusao:
O backend deve conseguir localizar um usuario ativo a partir do numero de telefone recebido no webhook da Evolution API.

Escopo:
- Adicionar telefone ao modelo de usuario ou criar entidade de vinculo
- Garantir unicidade do telefone por tenant ou regra definida
- Criar migracao Prisma
- Atualizar seed com telefones de teste
- Documentar formato esperado do telefone

Fora do escopo:
- Validacao real via codigo SMS
- Interface completa para alterar telefone no app
- Envio ativo de mensagens pelo WhatsApp

Prazo:
27/06/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir campo ou entidade de telefone
- [ ] Criar migracao Prisma
- [ ] Atualizar seed
- [ ] Criar funcao de busca por telefone
- [ ] Testar busca com numero valido e invalido
```

### Criar webhook da Evolution API no backend

```md
Criar webhook da Evolution API no backend

Objetivo:
Criar um endpoint no `gm_back` para receber mensagens da Evolution API e iniciar o fluxo de registro via WhatsApp.

Criterio de conclusao:
O backend deve receber um payload de mensagem, validar a origem do webhook e responder com status adequado sem quebrar as rotas existentes.

Escopo:
- Criar rota de webhook, por exemplo POST `/api/webhooks/evolution`
- Validar segredo `EVOLUTION_WEBHOOK_SECRET`
- Validar schema do payload com Zod
- Extrair telefone, texto da mensagem e identificador da mensagem
- Registrar logs tecnicos sem dados sensiveis
- Documentar endpoint no Swagger quando fizer sentido

Fora do escopo:
- Interpretacao da mensagem com LLM
- Persistencia final do gasto
- Resposta ativa para o usuario no WhatsApp

Prazo:
30/06/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir contrato minimo do payload da Evolution
- [ ] Criar schema Zod do webhook
- [ ] Validar segredo do webhook
- [ ] Extrair telefone e mensagem
- [ ] Testar payload valido e invalido
```

### Integrar backend com LLM local para interpretar mensagens

```md
Integrar backend com LLM local para interpretar mensagens

Objetivo:
Permitir que o `gm_back` envie textos recebidos pelo WhatsApp para uma LLM local e receba uma estrutura financeira padronizada.

Criterio de conclusao:
Dada uma mensagem como "gastei 42 reais no mercado", o backend deve obter uma resposta estruturada contendo tipo, valor, motivo/categoria e data inferida ou atual.

Escopo:
- Criar cliente HTTP para `LLM_API_URL`
- Definir schema de requisicao e resposta da LLM
- Validar resposta da LLM com Zod
- Tratar erro, timeout e resposta invalida
- Garantir que a LLM nao acesse diretamente o banco

Fora do escopo:
- Treinar ou hospedar o modelo local
- Criar interface visual para prompts
- Automatizar classificacao perfeita de todas as mensagens

Prazo:
03/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir contrato com a LLM local
- [ ] Criar cliente HTTP isolado
- [ ] Validar resposta estruturada
- [ ] Implementar timeout
- [ ] Criar testes com mensagens exemplo
```

### Salvar gasto recebido pelo WhatsApp como transacao extra

```md
Salvar gasto recebido pelo WhatsApp como transacao extra

Objetivo:
Conectar o webhook da Evolution API com a interpretacao da LLM e salvar o lancamento final no PostgreSQL como `ExtraTransaction`.

Criterio de conclusao:
Ao receber uma mensagem valida do WhatsApp, o backend deve identificar o usuario, interpretar a mensagem, validar os dados e criar uma transacao extra no banco.

Escopo:
- Identificar usuario pelo telefone
- Chamar LLM local para interpretar mensagem
- Validar valor, tipo, motivo e data
- Criar `ExtraTransaction`
- Atualizar impacto na meta conforme regra ja existente
- Retornar confirmacao tecnica para a Evolution API

Fora do escopo:
- Confirmacao interativa com botoes
- Edicao de lancamento pelo WhatsApp
- Upload ou leitura de comprovantes

Prazo:
05/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Buscar usuario pelo telefone
- [ ] Interpretar mensagem com LLM
- [ ] Validar resposta interpretada
- [ ] Criar transacao extra
- [ ] Testar fluxo completo com payload simulado
```

### Implementar resposta de confirmacao para o WhatsApp

```md
Implementar resposta de confirmacao para o WhatsApp

Objetivo:
Enviar uma resposta curta ao usuario no WhatsApp confirmando se o lancamento foi registrado ou se houve erro de interpretacao.

Criterio de conclusao:
Depois de processar uma mensagem, o sistema deve enviar uma confirmacao pela Evolution API com valor, motivo e status do registro.

Escopo:
- Criar cliente para `EVOLUTION_API_URL`
- Configurar autenticacao da Evolution API via variavel de ambiente
- Enviar mensagem de sucesso
- Enviar mensagem de erro quando a mensagem nao puder ser interpretada
- Evitar expor dados sensiveis na resposta

Fora do escopo:
- Conversa longa com historico
- Menu interativo
- Atendimento humano

Prazo:
08/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Criar cliente HTTP da Evolution
- [ ] Definir mensagens padrao de sucesso e erro
- [ ] Integrar resposta ao fluxo do webhook
- [ ] Testar envio em ambiente controlado
```

### Configurar seguranca de comunicacao com mTLS

```md
Configurar seguranca de comunicacao com mTLS

Objetivo:
Preparar a comunicacao sensivel entre backend, Evolution API/webhook e LLM local usando certificados quando aplicavel.

Criterio de conclusao:
O backend deve conseguir carregar certificados por variaveis de ambiente e usar mTLS nas chamadas internas configuradas.

Escopo:
- Ler `MTLS_CA_CERT_PATH`, `MTLS_CLIENT_CERT_PATH` e `MTLS_CLIENT_KEY_PATH`
- Configurar cliente HTTPS com certificados
- Documentar uso dos certificados
- Garantir fallback controlado para ambiente local sem mTLS

Fora do escopo:
- Emissao real de certificados de producao
- Configuracao completa do provedor de infraestrutura
- Rotacao automatica de certificados

Prazo:
10/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir variaveis de ambiente de mTLS
- [ ] Criar helper de cliente HTTPS com certificados
- [ ] Usar helper na comunicacao com LLM/Evolution quando configurado
- [ ] Documentar comportamento local e producao
```

### Criar documentacao de deploy em servidor proprio

```md
Criar documentacao de deploy em servidor proprio

Objetivo:
Documentar como subir o `gm_back`, PostgreSQL, LLM local, Evolution API e app Android em ambiente de producao previsto.

Criterio de conclusao:
A documentacao deve permitir entender os passos minimos de deploy, variaveis de ambiente, portas, TLS, backup e validacao por healthcheck.

Escopo:
- Documentar variaveis de ambiente
- Documentar estrategia com Docker, PM2 ou systemd
- Documentar reverse proxy com Nginx ou Caddy
- Documentar firewall e portas necessarias
- Documentar validacao de `/health`
- Documentar estrategia de backup do PostgreSQL

Fora do escopo:
- Automatizar CI/CD completo
- Contratar servidor ou configurar DNS real
- Criar certificados reais de producao

Prazo:
12/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Criar arquivo de documentacao de deploy
- [ ] Listar variaveis por ambiente
- [ ] Descrever passos do backend
- [ ] Descrever backup do banco
- [ ] Descrever verificacao final do ambiente
```

### Criar pipeline minimo de build e validacao do backend

```md
Criar pipeline minimo de build e validacao do backend

Objetivo:
Padronizar os comandos minimos para instalar dependencias, gerar Prisma Client, executar migracoes, compilar TypeScript, subir API e validar healthcheck.

Criterio de conclusao:
Deve existir um fluxo documentado ou scriptado que execute os passos minimos do backend com sucesso em ambiente limpo.

Escopo:
- Instalar dependencias
- Gerar Prisma Client
- Executar migracoes
- Compilar TypeScript
- Subir API
- Validar GET `/health`

Fora do escopo:
- Deploy automatico em producao
- Testes end-to-end com app Android
- Observabilidade completa

Prazo:
15/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Revisar scripts do `package.json`
- [ ] Documentar ordem dos comandos
- [ ] Validar build TypeScript
- [ ] Validar Prisma generate/migrate
- [ ] Validar endpoint `/health`
```

### Preparar build Android com URL de producao da API

```md
Preparar build Android com URL de producao da API

Objetivo:
Garantir que o app `gm_finance` seja buildado para Android apontando para a URL correta do backend em producao.

Criterio de conclusao:
O app Android deve usar `EXPO_PUBLIC_API_URL` de producao no build e conseguir acessar o backend publicado.

Escopo:
- Documentar como definir `EXPO_PUBLIC_API_URL`
- Validar configuracao local e producao
- Criar checklist de build APK/AAB
- Testar login e chamadas principais contra a API configurada

Fora do escopo:
- Publicacao na Play Store
- Configuracao de conta de desenvolvedor
- Pipeline automatico de release mobile

Prazo:
18/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Definir URL publica da API
- [ ] Configurar variavel antes do build
- [ ] Gerar build Android
- [ ] Testar login
- [ ] Testar resumo, metas e lancamentos
```

### Gerar PDF final de arquitetura com diagrama Mermaid

```md
Gerar PDF final de arquitetura com diagrama Mermaid

Objetivo:
Criar o documento final de arquitetura do GM Finance em Markdown e exportar para PDF com o diagrama tecnico renderizado corretamente.

Criterio de conclusao:
O PDF deve conter a estrutura exigida no `MEGA_PROMPT_PDF_GM_FINANCE.md`, autoria correta, link do Trello e diagrama renderizado como imagem ou Mermaid suportado.

Escopo:
- Escrever documento final em Markdown
- Incluir separacao entre `gm_finance` e `gm_back`
- Incluir arquitetura, seguranca, deploy, logs e backup
- Incluir diagrama Mermaid ou imagem exportada
- Exportar PDF final

Fora do escopo:
- Implementar funcionalidades pendentes
- Criar apresentacao em slides
- Inventar provedores, endpoints ou integrantes nao citados

Prazo:
20/07/2026

Responsavel:
Geovanne

Checklist:
- [ ] Gerar Markdown final seguindo a estrutura obrigatoria
- [ ] Inserir link do Trello
- [ ] Inserir diagrama Mermaid revisado
- [ ] Exportar Mermaid para SVG/PNG se o PDF nao renderizar Mermaid
- [ ] Revisar PDF final
```

## Regra Pratica

Cada tarefa precisa responder claramente:

- O que sera feito?
- Como medir que terminou?
- Por que importa?
- Quem faz?
- Ate quando?
