# GM Finance
## Documentacao de Arquitetura, Experiencia, Seguranca e Deploy

**Disciplina:** Programacao para Dispositivos Moveis II  
**Curso:** Desenvolvimento de Software Multiplataforma - 5o Semestre  
**Autor:** Geovanne Meloni dos Santos  
**Projeto:** GM Finance  
**Tipo:** Sistema fullstack com aplicativo mobile, API REST, banco PostgreSQL e integracao via WhatsApp  
**Trello:** https://trello.com/b/GSb4ZqxR/gm-finance  
**Repositorio GitHub:** Nao informado  
**Swagger:** `/docs` no servidor da API  

<<<PAGEBREAK>>>

# 1. Capa

GM Finance e um sistema de organizacao financeira pessoal e conjunta, com foco em rendas, gastos relevantes, metas de economia e acompanhamento por categorias. O projeto foi dividido em dois repositorios principais, um aplicativo mobile em Expo/React Native e uma API REST em Node.js/TypeScript/Fastify.

Este documento consolida o estado tecnico atual do projeto, as evolucoes previstas, a arquitetura de deploy em servidor proprio, as preocupacoes de seguranca e a direcao funcional futura para um agente conversacional no WhatsApp capaz de registrar movimentacoes e responder duvidas financeiras do utilizador.

# 2. Identificacao do Projeto

| Campo | Valor |
| --- | --- |
| Nome do projeto | GM Finance |
| Autor | Geovanne Meloni dos Santos |
| Repositorio mobile | `gm_finance` |
| Repositorio backend | `gm_back` |
| Tipo de sistema | Aplicativo Android + API REST + PostgreSQL + WhatsApp |
| Documentacao da API | Swagger em `/docs` |
| Quadro de acompanhamento | Trello informado acima |

# 3. Resumo Executivo

O GM Finance foi concebido para reduzir atrito no controle financeiro. Em vez de exigir que cada pequena compra seja registrada manualmente em uma interface complexa, o sistema organiza a vida financeira por categorias percentuais, metas e lancamentos relevantes.

No modelo atual, o aplicativo Android e a principal entrada visual. O usuario faz login simples por e-mail, consulta o resumo mensal, registra rendas e gastos, acompanha metas e ajusta regras percentuais por pessoa.

Como evolucao planejada, o sistema passara a ter uma segunda entrada forte: o WhatsApp. Nessa etapa, a integracao com Evolution API e uma LLM local permitira transformar mensagens em registros estruturados e, posteriormente, operar um agente financeiro geral, capaz de responder perguntas como:

- quanto posso gastar de lanche este mes
- quanto ainda falta para a meta
- quais rendas entraram neste mes
- quanto ja foi gasto em uma categoria
- qual foi meu saldo disponivel hoje

Essa evolucao preserva um principio central da arquitetura: a LLM interpreta e auxilia, mas a validacao, autorizacao, regras de negocio e persistencia continuam sendo responsabilidade do backend.

# 4. Objetivo do Sistema

O objetivo do GM Finance e organizar rendas, gastos extras, regras percentuais e metas de economia de forma simples, direta e util para utilizacao individual ou conjunta.

O produto foi pensado para:

- permitir acompanhamento financeiro por pessoa
- suportar contexto de casal, familia pequena ou grupo financeiro
- dividir a renda mensal em categorias com percentuais definidos
- destacar quanto cabe em cada destino financeiro
- atualizar metas de economia a partir da categoria `guardado`
- reduzir atrito operacional com entrada conversacional por WhatsApp

O sistema nao tem como objetivo principal substituir ferramentas contabilmente detalhadas ou obrigar o utilizador a informar cada microtransacao. A proposta e combinar organizacao, previsibilidade e praticidade.

# 5. Separacao dos Repositorios

| Repositorio | Papel | Descricao |
| --- | --- | --- |
| `gm_finance` | Aplicativo mobile | Frontend em Expo/React Native, responsavel pela experiencia do usuario, autenticacao simples, visualizacao de resumo, metas e cadastro manual de movimentacoes |
| `gm_back` | Backend/API | API REST em Node.js/TypeScript/Fastify, responsavel por contratos, regras financeiras, persistencia, resumo mensal, webhook do WhatsApp e integracao futura com LLM local |

Essa separacao melhora manutencao, clareza arquitetural e evolucao independente entre interface e camada de negocio.

# 6. Visao Geral da Arquitetura

## 6.1 Arquitetura atual

```text
App Android (gm_finance)
        |
        | HTTPS
        v
Backend / API (gm_back)
        |
        | SQL / rede privada
        v
PostgreSQL
```

## 6.2 Arquitetura alvo com WhatsApp e agente

```text
App Android (gm_finance)
        |
        | HTTPS
        v
Backend / API (gm_back) <---- Webhook HTTPS/mTLS ---- Evolution API / WhatsApp
        |                         ^
        |                         |
        |---- consulta e escrita -- 
        v
PostgreSQL

Backend / API (gm_back) ---- HTTPS/mTLS ----> LLM local
                               |
                               v
                  Interpretacao, classificacao e resposta assistida
```

## 6.3 Principio central

O backend e a camada central do sistema. Toda entrada, seja pelo app ou pelo WhatsApp, passa por validacao de schema, aplicacao de regra financeira, autorizacao de contexto e persistencia controlada.

Mesmo na fase do agente conversacional, a LLM nao deve gravar diretamente no banco. Ela apenas interpreta mensagens, recebe contexto calculado pelo backend e devolve respostas estruturadas ou linguagem natural supervisionada.

# 7. Arquitetura do Frontend (`gm_finance`)

## 7.1 Tecnologias identificadas

- Expo
- React Native
- TypeScript
- `expo-router`
- NativeWind / Tailwind
- `expo-secure-store`
- `lucide-react-native`
- `react-native-gifted-charts`

## 7.2 Responsabilidades do app

- ser a entrada visual principal do utilizador
- consumir a API REST do backend
- permitir login simples por e-mail no MVP
- persistir `user_id` localmente com `expo-secure-store`
- exibir resumo mensal, distribuicao por categorias, saldo e progresso da meta
- permitir cadastro manual de renda ativa, renda passiva e gasto extra
- permitir configuracao de faixas percentuais por pessoa
- permitir edicao do salario mensal de projecao

## 7.3 Estrutura funcional atual

O aplicativo esta organizado em rotas de abas principais:

- `Inicio`
- `Meta`
- `Lancamentos`
- `Config`

Esse arranjo favorece navegacao curta, previsivel e orientada a tarefa. O utilizador nao precisa navegar em profundidade para chegar aos fluxos mais recorrentes.

## 7.4 Sistema de design atual

Embora o projeto ainda nao possua uma documentacao formal de design system separada, ja existe um nucleo consistente de componentes e padroes reutilizaveis.

### Fundacoes visuais

- paleta neutra baseada em tons `slate` e `neutral`
- cores semanticas para sucesso, alerta e despesa
- contraste alto em botoes principais
- bordas suaves e cards com sombra leve
- icones consistentes com `lucide-react-native`

### Componentes base identificados

- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Text`
- `Progress`

### Padroes de tela

- tela de autenticacao simples
- dashboard com cards-resumo
- formularios orientados por contexto
- configuracoes com edicao incremental
- estados de loading, erro e vazio

### Beneficio arquitetural

Esse conjunto reduz duplicacao visual e facilita evolucao. A medida que o produto crescer, o design system pode ser formalizado em tres camadas:

1. Fundacoes: cor, espaco, tipografia, iconografia
2. Componentes: botao, card, progresso, campo, badge, bloco de alerta
3. Padroes: login, dashboard, formulario de renda, resumo de categoria, resposta do assistente

## 7.5 Fluxo de entrada de informacao pelo app

O fluxo visual atual pode ser resumido assim:

1. O utilizador abre o app.
2. O app recupera o `user_id` salvo localmente.
3. A camada de rotas decide entre login ou abas autenticadas.
4. Em cada tela, o frontend chama a API REST do backend.
5. O backend responde com dados estruturados.
6. O app renderiza cards, progresso, graficos e formularios.

## 7.6 Fluxo de design system aplicado ao dado

O design system deve ser entendido nao apenas como aparencia, mas como fluxo coerente entre estado visual e operacao:

- entrada manual do usuario
- validacao local de formato
- envio para a API
- resposta de sucesso ou erro
- atualizacao de tela
- reforco visual do estado final

Esse modelo sera importante tambem para a entrada por WhatsApp, pois a resposta conversacional precisa refletir os mesmos conceitos de negocio mostrados no app.

# 8. Arquitetura do Backend (`gm_back`)

## 8.1 Tecnologias identificadas

- Node.js
- TypeScript
- Fastify
- Zod
- Prisma
- PostgreSQL
- Swagger / OpenAPI
- Docker Compose para ambiente local

## 8.2 Responsabilidades do backend

- expor rotas REST consumidas pelo app
- centralizar regras financeiras
- persistir utilizadores, regras percentuais, rendas, extras e metas
- gerar resumo mensal por utilizador
- atualizar meta conforme renda, gasto e percentual guardado
- publicar `/health` e `/docs`
- receber futuramente webhook da Evolution API
- orquestrar a integracao com uma LLM local

## 8.3 Contrato externo identificado

| Metodo | Rota | Funcao |
| --- | --- | --- |
| `GET` | `/health` | Verificacao de saude da API |
| `GET` | `/api/users` | Lista usuarios |
| `GET` | `/api/users/:id` | Busca usuario por ID |
| `PATCH` | `/api/users/:id` | Atualiza salario mensal para projecao |
| `GET` | `/api/users/:id/allocation-rules` | Lista regras percentuais do usuario |
| `PUT` | `/api/users/:id/allocation-rules` | Atualiza regras percentuais |
| `POST` | `/api/revenue-entries` | Registra renda mensal |
| `POST` | `/api/extra-transactions` | Registra renda extra ou gasto extra |
| `GET` | `/api/savings-goals` | Lista metas |
| `POST` | `/api/savings-goals` | Cria meta |
| `PATCH` | `/api/savings-goals/:id` | Atualiza meta |
| `GET` | `/api/users/:id/summary?yearMonth=YYYY-MM` | Gera resumo mensal |

## 8.4 Observacao importante sobre a persistencia atual

No Prisma, a entidade que representa renda mensal ainda se chama `IncomeEntry`. No entanto, semanticamente ela ja foi atualizada para representar renda, com `title` e `revenueType` (`ACTIVE` ou `PASSIVE`). Essa diferenca entre nome tecnico interno e semantica externa deve ser registrada para evitar confusao em manutencao futura.

## 8.5 Camadas logicas recomendadas

Para suportar a evolucao do agente conversacional, o backend deve caminhar para a seguinte organizacao logica:

- camada HTTP e validacao
- camada de servicos financeiros
- camada de resumo e projecao
- camada de agentes e orquestracao conversacional
- camada de persistencia

Essa separacao diminui acoplamento e ajuda a manter respostas do agente consistentes com as mesmas regras usadas pelo app.

# 9. Modelo de Dados

## 9.1 Entidades identificadas

| Entidade | Papel |
| --- | --- |
| `User` | Representa um usuario do sistema |
| `AllocationRule` | Define percentuais por categoria para um usuario |
| `IncomeEntry` | Nome tecnico atual da entidade de renda mensal declarada |
| `ExtraTransaction` | Representa renda extra ou gasto extra |
| `SavingsGoal` | Meta financeira com valor alvo e acumulado |

## 9.2 Evolucao recente do modelo de renda

A renda mensal passou a carregar:

- `title`
- `revenueType` com valores `ACTIVE` e `PASSIVE`
- `amount`
- `yearMonth`
- `userId`
- `createdByUserId`

Isso permite representar exemplos reais como:

- `Salario` -> renda ativa
- `Aluguel` -> renda passiva

## 9.3 Evolucao planejada para multi-tenant

O sistema ainda nao possui multi-tenant completo implementado. A evolucao prevista inclui entidades como:

- `Tenant`
- `Group`
- `Membership`

Essa camada deve isolar usuarios por casal, familia, grupo ou organizacao, evitando acesso indevido entre contextos financeiros diferentes.

# 10. Fluxo Financeiro Principal

O fluxo financeiro atual e simples e coerente:

1. O utilizador informa uma renda mensal.
2. O backend consulta as regras percentuais da pessoa.
3. O valor e dividido entre categorias como contas, livre, streaming e guardado.
4. A parcela `guardado` alimenta a meta de economia.
5. Rendas extras e gastos extras ajustam o saldo e a meta conforme a regra.
6. O resumo mensal devolve totais, distribuicoes e status da meta.

## 10.1 Exemplo conceitual

Se uma pessoa registra:

- `Salario: +2400 por mes`
- `Aluguel: +500 por mes`

o backend consolida essas rendas no contexto do mes, aplica as faixas percentuais e calcula quanto cabe em cada categoria e quanto deve reforcar a meta, de acordo com a faixa `guardado`.

# 11. Entrada pelo Aplicativo Android

## 11.1 Fluxo operacional

1. O utilizador abre o app Android.
2. Faz login simples por e-mail.
3. O app salva o identificador localmente.
4. O utilizador acessa `Inicio`, `Meta`, `Lancamentos` e `Config`.
5. As telas enviam requisicoes HTTPS ao backend.
6. O backend valida, calcula e persiste os dados.
7. O app renderiza resposta estruturada.

## 11.2 Fluxos de escrita atuais

Pelo aplicativo, o utilizador pode:

- registrar renda ativa
- registrar renda passiva
- registrar gasto extra
- criar e consultar metas
- editar salario mensal de projecao
- editar faixas percentuais

## 11.3 Papel do app na estrategia geral

O app continua sendo a referencia visual principal. Mesmo com a chegada do agente no WhatsApp, o aplicativo permanece como ambiente de consulta ampla, configuracao detalhada e visualizacao historica.

# 12. Entrada pelo WhatsApp

## 12.1 Estado desejado

A entrada pelo WhatsApp deixa de ser apenas um canal de captura de gasto e passa a ser um canal conversacional financeiro geral.

Na arquitetura evoluida, o numero conectado a Evolution API sera capaz de:

- registrar gasto informado em linguagem natural
- registrar renda quando o texto indicar entrada de valor
- responder duvidas sobre saldo, metas e categorias
- orientar o utilizador sobre quanto pode gastar em determinado contexto
- recuperar informacoes recentes, por exemplo despesas do dia ou rendas do mes

## 12.2 Exemplos de perguntas previstas

- quanto posso gastar de lanche este mes
- quanto ainda posso gastar no livre
- quanto falta para minha meta
- quais rendas eu recebi neste mes
- quanto gastei no mercado

## 12.3 Papel da Evolution API

A Evolution API sera a porta de entrada da mensagem do WhatsApp. Ela recebe a mensagem do utilizador e dispara um webhook para o backend `gm_back`, que continua sendo o controlador da sessao, do contexto e da decisao final.

# 13. Processamento com LLM Local

## 13.1 Evolucao planejada

O sistema passara a operar um agente financeiro assistivo no backend. Esse agente nao sera apenas um classificador de mensagem; ele sera um assistente geral capaz de interpretar pedidos, consultar contexto financeiro e devolver respostas uteis e curtas no WhatsApp.

## 13.2 Fluxo previsto do agente

1. O utilizador envia texto pelo WhatsApp.
2. A Evolution API dispara webhook para o backend.
3. O backend valida segredo, origem e associacao do numero ao usuario/tenant.
4. O backend monta um contexto minimo e seguro.
5. O backend chama a LLM local.
6. A LLM interpreta a intencao.
7. O backend executa as consultas ou persistencias necessarias.
8. O backend monta a resposta final.
9. A Evolution API envia a resposta ao utilizador.

## 13.3 Tipos de intencao previstos

O agente deve reconhecer, no minimo, tres grupos de intencao:

### Registro de movimentacao

Exemplos:

- gastei 42 reais no mercado
- recebi 500 de aluguel
- entrou 2400 de salario

### Consulta financeira

Exemplos:

- quanto posso gastar de lanche
- quanto ainda tenho no livre
- quanto falta para minha meta

### Assistencia contextual

Exemplos:

- resume meu mes
- me mostra minhas ultimas despesas
- o que mais esta pesando nos meus gastos

## 13.4 Regra critica

A LLM local nao pode consultar ou gravar diretamente no PostgreSQL. Ela deve funcionar como camada interpretativa. O backend executa as consultas reais, calcula as respostas, aplica limite de contexto e garante consistencia com as regras financeiras do sistema.

## 13.5 Desenho recomendado para o agente

Do ponto de vista arquitetural, o agente deve operar com ferramentas internas controladas pelo backend, como:

- buscar resumo mensal
- buscar regras percentuais
- calcular saldo disponivel por categoria
- registrar renda
- registrar gasto
- consultar meta

Esse desenho torna a resposta mais confiavel, pois a LLM decide a intencao e a forma da resposta, mas os numeros vem de consultas deterministicas e calculos de negocio.

# 14. Seguranca

## 14.1 Medidas principais

- HTTPS para comunicacao externa com a API
- mTLS entre servicos internos sensiveis, quando aplicavel
- validacao de origem e segredo no webhook da Evolution API
- validacao de entrada com Zod
- isolamento logico por tenant como evolucao obrigatoria
- usuario do banco com privilegios limitados
- banco acessivel apenas por servicos autorizados
- logs sem dados sensiveis
- backup periodico do PostgreSQL

## 14.2 Seguranca especifica do agente

O agente conversacional deve receber apenas o contexto necessario para a tarefa do momento. Isso evita exposicao desnecessaria de historico financeiro bruto e reduz risco operacional.

## 14.3 Principio de menor privilegio

Cada integracao deve ter acesso apenas ao que precisa:

- app consome somente a API publica
- Evolution API somente entrega webhook e recebe resposta
- LLM somente interpreta texto e contexto reduzido
- PostgreSQL nao deve ser exposto para consumo direto de componentes nao autorizados

# 15. Deploy em Servidor Proprio

## 15.1 Ambiente previsto

- backend `gm_back` em servidor proprio
- PostgreSQL em servidor proprio
- LLM local no servidor proprio
- app `gm_finance` buildado para Android
- Evolution API integrada ao backend por webhook

## 15.2 Estrategia recomendada

- backend executado via Docker ou processo gerenciado por systemd/PM2
- PostgreSQL com volume persistente
- reverse proxy com Nginx ou Caddy para TLS
- LLM exposta apenas em rede privada ou porta protegida
- variaveis de ambiente separadas por ambiente
- firewall com portas minimas abertas

## 15.3 Pipeline minimo do backend

1. instalar dependencias
2. gerar Prisma Client
3. executar migracoes
4. compilar TypeScript
5. subir a API
6. validar `/health`

## 15.4 Estado atual do projeto

Esse pipeline existe parcialmente no repositrio, com scripts e documentacao local, mas ainda nao ha CI nem fluxo automatizado completo de validacao.

# 16. Operacao, Logs e Backup

## 16.1 Operacao

Em producao, o sistema deve operar com foco em simplicidade:

- healthcheck em `/health`
- Swagger em `/docs`, opcionalmente protegido ou desabilitado em producao
- observacao de erros de API, webhook e integracao com LLM

## 16.2 Logs

Os logs devem priorizar:

- identificacao da rota
- identificacao tecnica do erro
- correlacao minima de requisicoes
- ausencia de dados financeiros sensiveis em texto puro

## 16.3 Backup

O PostgreSQL deve ter rotina de backup periodico com validacao de restauracao. Nao basta gerar arquivo de backup; e necessario garantir que ele pode ser restaurado.

# 17. Melhorias Futuras

As principais evolucoes planejadas identificadas no backlog atual sao:

- multi-tenant completo
- vinculo de usuario com numero de WhatsApp
- webhook da Evolution API
- integracao com LLM local
- persistencia de transacoes vindas por WhatsApp
- resposta automatica ao utilizador
- mTLS entre servicos sensiveis
- documentacao completa de deploy
- pipeline minimo de build e validacao
- processo formal de build Android de producao

## 17.1 Evolucao funcional mais importante

A evolucao funcional mais relevante e transformar o WhatsApp em um agente financeiro geral, e nao apenas em um canal de anotacao. Isso posiciona o sistema como assistente de consulta e operacao, ampliando utilidade sem aumentar friccao.

# 18. Conclusao

O GM Finance possui uma base tecnica coerente, com separacao clara entre frontend e backend, regras financeiras centralizadas, contrato REST documentado e estrutura favoravel a crescimento.

O aplicativo Android ja cobre o nucleo do MVP visual. O backend ja centraliza as regras financeiras e a persistencia. O proximo salto arquitetural esta na consolidacao do agente via WhatsApp, com Evolution API, LLM local e uma camada de orquestracao segura no backend.

Com a formalizacao do design system, a consolidacao da entrada conversacional e a estruturacao do deploy e da seguranca, o GM Finance pode evoluir de um cofre financeiro com app mobile para uma plataforma assistiva de organizacao financeira com duas portas de entrada: interface grafica e conversa natural.

# 19. Variaveis de Ambiente Esperadas

| Variavel | Uso |
| --- | --- |
| `DATABASE_URL` | Conexao com PostgreSQL |
| `PORT` | Porta da API |
| `EXPO_PUBLIC_API_URL` | URL publica da API usada pelo app |
| `EVOLUTION_WEBHOOK_SECRET` | Segredo para validar o webhook da Evolution |
| `EVOLUTION_API_URL` | URL da Evolution API |
| `LLM_API_URL` | URL interna da LLM local |
| `MTLS_CA_CERT_PATH` | Certificado CA para mTLS |
| `MTLS_CLIENT_CERT_PATH` | Certificado cliente para mTLS |
| `MTLS_CLIENT_KEY_PATH` | Chave privada do certificado cliente |
