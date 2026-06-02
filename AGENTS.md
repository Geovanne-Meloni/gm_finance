# GM Finance — contexto para agentes

Aplicativo de **cofre financeiro para casal**: o dinheiro de renda entra no cofre e é organizado **por pessoa**. Cada usuário tem **faixas percentuais** (ex.: contas, livre, streaming, guardado) que definem, a partir de uma renda informada no mês, **quanto pode ser gasto em cada categoria** — sem obrigar o registro de cada compra do dia a dia.

**Rendas e gastos adicionais** (fora do fluxo “renda do mês”) são **lançamentos explícitos**, com motivo/descrição e registro de **quem inseriu** no sistema.

Existe uma **meta de economia** (valor alvo) e um **montante acumulado** que o backend atualiza conforme regras (por exemplo, a parcela “guardado” das rendas). Isso permite estimar **quanto falta** e, no app, uma noção de tempo até o objetivo.

## Onde está o código

- **App (Expo / frontend):** este repositório (`gm_finance`).
- **API (Fastify, Prisma, Postgres):** pasta irmã do monorepo local: `/home/geovanne/geova/gm_back` (ou `../gm_back` em relação à raiz deste repo).

Ao alterar contratos de API, alinhar tipos e chamadas no app com os endpoints documentados em Swagger na raiz da API (`/docs`).
