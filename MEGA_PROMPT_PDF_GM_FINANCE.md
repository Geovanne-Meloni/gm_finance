# Mega Prompt - Gerar PDF de Arquitetura e Deploy (GM Finance)

> Preencha os campos abaixo antes de usar este prompt.

## Campos para preencher

- `SEU_NOME`: Geovanne Meloni dos Santos
- `LINK_TRELLO`: https://trello.com/b/GSb4ZqxR/gm-finance

---

## Prompt para a LLM (copiar e colar)

Voce e um redator tecnico senior de arquitetura de software e DevOps.
Sua tarefa e gerar um documento final em Markdown, pronto para exportacao em PDF, com linguagem clara, formal e objetiva em portugues (pt-BR).

Siga estas regras obrigatorias:

1. Use apenas o nome informado em `SEU_NOME` como autoria.
2. Use o campo `LINK_TRELLO` somente como espaco para o link do Trello.
3. Nao invente integrantes, links, tecnologias, endpoints ou provedores externos nao citados no contexto.
4. Diferencie claramente os dois repositorios: `gm_finance` e `gm_back`.
5. Mantenha a explicacao simples, direta e orientada a arquitetura, seguranca e deploy.
6. Quando algo ainda for uma funcionalidade planejada, descreva como "funcionalidade prevista" ou "evolucao planejada".
7. Entregue apenas o documento final em Markdown, sem comentarios de bastidor.

Dados de identificacao:

- Autor: `SEU_NOME`
- Trello: `LINK_TRELLO`
- Projeto: `GM Finance`
- Tipo: sistema fullstack com aplicativo mobile, API REST, banco PostgreSQL e integracao via WhatsApp

## Ideia central do sistema

O GM Finance e um sistema de organizacao e visualizacao de economias pessoais e conjuntas.
A proposta e permitir que utilizadores registrem suas rendas, gastos recorrentes, gastos extras e metas financeiras, gerando uma visao simples sobre quanto entra, quanto sai, quanto esta reservado para cada finalidade e quanto falta para atingir objetivos de economia.

O sistema deve atender tanto uso individual quanto uso conjunto, por exemplo casais, familias pequenas ou grupos que desejam acompanhar uma meta financeira compartilhada.
A arquitetura deve ser preparada para multi-tenant, permitindo que varias pessoas ou grupos utilizem a plataforma com separacao logica dos dados.

Explique que o foco do produto nao e obrigar o usuario a registrar cada pequena compra manualmente no app, mas sim facilitar a organizacao por categorias, recorrencias, metas e lancamentos relevantes. A entrada via WhatsApp sera usada para reduzir atrito no registro de gastos do dia a dia.

## Separacao dos repositorios

Existem dois repositorios principais:

| Repositorio | Papel | Descricao |
| --- | --- | --- |
| `gm_finance` | Aplicativo mobile | Frontend em Expo/React Native, responsavel pela interface do usuario, login simples, visualizacao de resumo, metas e cadastro de lancamentos. |
| `gm_back` | Backend/API | API REST em Node.js/TypeScript/Fastify, responsavel pelas regras de negocio, persistencia, contratos, webhook do WhatsApp e integracao com banco/LLM. |

## Frontend - `gm_finance`

Tecnologias identificadas no app:

- Expo
- React Native
- TypeScript
- expo-router
- NativeWind/Tailwind
- expo-secure-store
- lucide-react-native
- react-native-gifted-charts

Responsabilidades do app:

- Ser a entrada visual principal do usuario.
- Consumir a API REST do backend.
- Permitir login simples por e-mail no MVP.
- Salvar o `user_id` localmente com `expo-secure-store`.
- Exibir resumo mensal de entradas, saidas, saldo, distribuicao por categorias e progresso de metas.
- Permitir cadastro de lancamentos pelo app:
  - renda do mes
  - renda extra
  - gasto extra
- Permitir visualizacao e criacao de metas financeiras.
- Usar a variavel `EXPO_PUBLIC_API_URL` para apontar para a API em ambiente local ou producao.

Deploy do app:

- O app sera buildado para Android.
- A URL da API em producao deve apontar para o servidor proprio onde o backend estara hospedado.
- O build Android deve ser configurado com a variavel publica correta (`EXPO_PUBLIC_API_URL`) antes da geracao do APK/AAB.

## Backend - `gm_back`

Tecnologias identificadas no backend:

- Node.js
- TypeScript
- Fastify
- Zod
- Prisma
- PostgreSQL
- Swagger/OpenAPI
- Docker Compose para ambiente local

Responsabilidades do backend:

- Expor rotas REST consumidas pelo aplicativo mobile.
- Centralizar regras de negocio financeiras.
- Persistir usuarios, regras de alocacao, rendas, gastos extras e metas.
- Gerar resumo mensal por usuario.
- Atualizar valores de metas conforme entradas, saidas e regras de economia.
- Disponibilizar documentacao da API em `/docs`.
- Disponibilizar healthcheck em `/health`.
- Receber futuramente eventos do WhatsApp por webhook da Evolution API.
- Encaminhar mensagens de gastos para uma LLM local, interpretar o conteudo e salvar o lancamento formatado no banco.

Endpoints ja identificados:

| Metodo | Rota | Funcao |
| --- | --- | --- |
| `GET` | `/health` | Verificacao de saude da API |
| `GET` | `/api/users` | Lista usuarios |
| `GET` | `/api/users/:id` | Busca usuario por ID |
| `PATCH` | `/api/users/:id` | Atualiza salario mensal para projecao |
| `GET` | `/api/users/:id/allocation-rules` | Lista regras percentuais do usuario |
| `PUT` | `/api/users/:id/allocation-rules` | Atualiza regras percentuais |
| `POST` | `/api/revenue-entries` | Registra renda do mes |
| `POST` | `/api/extra-transactions` | Registra renda/gasto extra |
| `GET` | `/api/savings-goals` | Lista metas |
| `POST` | `/api/savings-goals` | Cria meta |
| `PATCH` | `/api/savings-goals/:id` | Atualiza meta |
| `GET` | `/api/users/:id/summary?yearMonth=YYYY-MM` | Gera resumo mensal |

## Modelo de dados atual

Entidades identificadas no Prisma:

| Entidade | Papel |
| --- | --- |
| `User` | Representa um usuario do sistema |
| `AllocationRule` | Define percentuais por categoria para um usuario |
| `IncomeEntry` | Representa renda mensal declarada |
| `ExtraTransaction` | Representa renda ou gasto extra |
| `SavingsGoal` | Representa meta financeira com valor alvo e acumulado |

Explique que, para multi-tenant completo, o modelo pode evoluir com entidades como `Tenant`, `Group`, `Membership` ou equivalente, permitindo separar usuarios por familia, casal, organizacao ou grupo financeiro. Essa evolucao deve preservar isolamento de dados e evitar que usuarios acessem informacoes de outros tenants.

## Funcionamento financeiro

Explique o fluxo de forma simples:

- O usuario informa quanto recebeu de renda no mes.
- O backend aplica regras percentuais por categoria.
- As categorias representam destinos do dinheiro, como contas, livre, streaming e guardado.
- A categoria `guardado` alimenta a logica de economia/metas.
- Gastos e rendas extras sao registrados de forma explicita.
- O resumo mensal combina entradas, saidas, categorias e progresso de meta.
- A economia conjunta permite visualizar a soma de esforcos financeiros de mais de um usuario dentro do mesmo tenant/grupo.

## Duas entradas do sistema

O documento deve destacar que o sistema tera duas entradas principais:

| Entrada | Origem | Responsabilidade |
| --- | --- | --- |
| App mobile Android | `gm_finance` | Entrada visual para consulta, cadastro manual, metas, resumo e configuracoes |
| WhatsApp | Numero conectado a Evolution API | Entrada conversacional para registrar gastos rapidamente por mensagem |

## Fluxo do aplicativo mobile

Descreva:

1. Usuario abre o app Android.
2. App chama a API REST do `gm_back`.
3. Backend valida a requisicao e aplica regras de negocio.
4. Backend consulta ou grava dados no PostgreSQL.
5. API retorna dados estruturados para o app.
6. App renderiza resumo, metas, graficos e lancamentos.

## Fluxo do WhatsApp com Evolution API e LLM local

Descreva a funcionalidade prevista:

1. Usuario envia uma mensagem para o numero de WhatsApp do sistema, por exemplo: "gastei 42 reais no mercado".
2. A Evolution API recebe a mensagem e dispara um webhook para o backend `gm_back`.
3. O backend valida a origem do webhook e identifica o usuario/tenant associado ao numero de telefone.
4. O backend envia o texto para uma LLM local hospedada em servidor proprio.
5. A LLM interpreta a mensagem e transforma em uma estrutura padronizada, por exemplo:
   - tipo: gasto
   - valor: 42.00
   - categoria/motivo: mercado
   - data: data atual ou data inferida
   - usuario: usuario associado ao WhatsApp
6. O backend valida a resposta da LLM com schemas e regras de negocio.
7. O backend salva o lancamento no PostgreSQL como `ExtraTransaction` ou entidade equivalente.
8. O backend responde a Evolution API com uma mensagem de confirmacao.
9. O usuario recebe no WhatsApp uma resposta curta confirmando o registro.

Explique que a LLM nao deve gravar diretamente no banco. Ela apenas interpreta e estrutura a mensagem. O backend continua sendo a camada responsavel por validar, autorizar e persistir os dados.

## Seguranca

Descreva seguranca simples, boa e objetiva:

- HTTPS para comunicacao externa com o backend.
- mTLS entre servicos internos sensiveis, especialmente entre backend, Evolution/webhook e servidor da LLM, quando aplicavel.
- Certificados digitais para autenticar os servicos autorizados.
- Validacao de assinatura/origem do webhook da Evolution API.
- Isolamento por tenant para evitar vazamento entre usuarios/grupos.
- Validacao de entrada com Zod no backend.
- Variaveis de ambiente para segredos e URLs.
- Banco PostgreSQL acessivel apenas pela rede/servicos autorizados.
- Usuario do banco com permissoes limitadas.
- Logs sem dados sensiveis.
- Backups periodicos do PostgreSQL.
- A LLM local nao deve receber mais dados do que o necessario para interpretar a mensagem.

Enfatize que o desenho e propositalmente simples: app, backend, banco, Evolution API e LLM local, com boas praticas basicas de seguranca.

## Hospedagem e deploy previstos

Ambiente de producao previsto:

- Backend `gm_back` hospedado em servidor proprio.
- Banco PostgreSQL hospedado no servidor proprio.
- LLM local hospedada no servidor proprio.
- App `gm_finance` buildado para Android.
- Evolution API conectada ao numero de WhatsApp e integrada ao backend por webhook.

Explique uma estrategia simples de deploy:

- Backend rodando como servico no servidor, preferencialmente via Docker ou processo gerenciado por systemd/PM2.
- PostgreSQL com volume persistente e rotina de backup.
- LLM local exposta apenas em rede privada ou porta protegida por mTLS.
- Reverse proxy como Nginx ou Caddy para TLS/HTTPS.
- Healthcheck em `/health`.
- Swagger em `/docs`, podendo ser protegido ou desabilitado em producao se necessario.
- Variaveis de ambiente separadas para producao.
- Firewall liberando apenas portas necessarias.

Pipeline minimo do backend:

1. Instalar dependencias.
2. Gerar Prisma Client.
3. Executar migracoes.
4. Compilar TypeScript.
5. Subir API.
6. Validar `/health`.

## Variaveis de ambiente esperadas

Inclua uma tabela com variaveis provaveis. Nao invente valores reais:

| Variavel | Uso |
| --- | --- |
| `DATABASE_URL` | Conexao com PostgreSQL |
| `PORT` | Porta da API |
| `EXPO_PUBLIC_API_URL` | URL publica da API usada pelo app |
| `EVOLUTION_WEBHOOK_SECRET` | Segredo para validar webhook da Evolution |
| `EVOLUTION_API_URL` | URL da Evolution API |
| `LLM_API_URL` | URL interna da LLM local |
| `MTLS_CA_CERT_PATH` | Certificado CA para mTLS |
| `MTLS_CLIENT_CERT_PATH` | Certificado cliente para mTLS |
| `MTLS_CLIENT_KEY_PATH` | Chave privada do certificado cliente |

## Estrutura obrigatoria do documento final

Gere o documento final com esta estrutura:

1. Capa
2. Identificacao do Projeto
3. Resumo Executivo
4. Objetivo do Sistema
5. Separacao dos Repositorios
6. Visao Geral da Arquitetura
7. Arquitetura do Frontend (`gm_finance`)
8. Arquitetura do Backend (`gm_back`)
9. Modelo de Dados
10. Fluxo Financeiro Principal
11. Entrada pelo Aplicativo Android
12. Entrada pelo WhatsApp
13. Processamento com LLM Local
14. Seguranca
15. Deploy em Servidor Proprio
16. Operacao, Logs e Backup
17. Melhorias Futuras
18. Conclusao

## Tom e formato

- Escreva como documentacao de arquitetura.
- Use frases diretas.
- Evite exageros comerciais.
- Use tabelas quando facilitar.
- Inclua uma representacao textual simples da arquitetura, por exemplo:

```text
App Android (gm_finance)
        |
        | HTTPS
        v
Backend/API (gm_back) <---- Webhook HTTPS/mTLS ---- Evolution API / WhatsApp
        |
        | SQL/rede privada
        v
PostgreSQL no servidor proprio

Backend/API (gm_back) ---- HTTPS/mTLS ----> LLM local no servidor proprio
```

Corrija o diagrama se necessario para representar melhor o fluxo de entrada pelo WhatsApp, deixando claro que a mensagem entra pela Evolution API, chega ao backend por webhook, passa pela LLM para interpretacao e depois e salva no PostgreSQL.

## Saida esperada

Entregue apenas o Markdown final do documento, pronto para ser convertido em PDF.
Nao inclua esta instrucao na resposta final.
