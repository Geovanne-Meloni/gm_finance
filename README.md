# GM Finance App (`gm_finance`)

Frontend mobile (Expo/React Native) do GM Finance.

O app consome a API do repositório irmão `gm_back` e oferece:
- login por telefone em formato `+5511981443833` e senha, com sessão por dispositivo
- resumo mensal com divisão por categorias
- cadastro de lançamentos com renda ativa, renda passiva e gasto extra
- metas de economia com projeção de prazo
- configurações de faixas percentuais e salário mensal por pessoa

## Pré-requisitos

- Node.js 22+
- npm
- backend `gm_back` rodando e acessível

## Variáveis de ambiente

Use o arquivo de exemplo:

```bash
cp .env.example .env
```

Variável obrigatória:

- `EXPO_PUBLIC_API_URL`: URL base da API (sem barra no final)
  - local: `http://localhost:3000`
  - produção (exemplo): `https://api.seudominio.com`

## Rodando localmente

```bash
npm install
npm run start
```

Atalhos úteis:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

## Telas principais

- `Início`: resumo mensal por `yearMonth`, saldo geral, splits e status da meta.
- `Meta`: cria meta com prazo em meses e mostra progresso completo.
- `Lançamentos`: permite registrar renda ativa, renda passiva e gasto extra, com pessoa dona e mês de referência.
- `Config`: edição de salário mensal de projeção e faixas percentuais (soma = 100%).

## Contrato com backend

O app está alinhado com os endpoints principais:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/users`
- `PATCH /api/users/:id` (monthlySalary)
- `GET/PUT /api/users/:id/allocation-rules`
- `POST /api/revenue-entries`
- `POST /api/extra-transactions`
- `GET/POST/PATCH /api/savings-goals`
- `GET /api/users/:id/summary?yearMonth=YYYY-MM`

Para validar contrato e exemplos de payload, use o Swagger da API:

- `http://localhost:3000/docs` (quando `gm_back` estiver local)

## Build Android (checklist)

1. Definir `EXPO_PUBLIC_API_URL` para a URL pública da API.
2. Validar no app:
   - login
   - resumo
   - metas
   - lançamentos
   - configurações
3. Gerar build Android (APK/AAB) com o fluxo de release adotado no projeto.

## Estrutura rápida

- `app/`: rotas e telas (Expo Router)
- `src/api/`: clientes HTTP e tipos
- `src/context/`: autenticação e sessão local
- `components/ui/`: componentes visuais reutilizáveis
