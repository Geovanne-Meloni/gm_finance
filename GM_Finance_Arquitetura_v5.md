# Documentação de Arquitetura - GM Finance
**Projeto:** GM Finance  
**Instituição:** FATEC (Desenvolvimento de Software Multiplataforma - 5º Semestre)

## 1. Integrantes do grupo
a. Geovanne Meloni dos Santos

## 2. Links do Projeto
a. **GitHub (Mobile):** https://github.com/geovannemeloni/gm_finance  
b. **GitHub (Backend):** https://github.com/geovannemeloni/gm_back  
c. **Swagger:** https://api.gmfinance.com.br/docs (Exemplo)  
d. **Trello:** https://trello.com/b/GSb4ZqxR/gm-finance

## 3. Ilustração da arquitetura

> [INSERIR DESENHO TÉCNICO DA ARQUITETURA AQUI]

## 4. Descrição dos componentes da API

### 1. Camada de Apresentação (Frontend)
A interface mobile é focada em reduzir o atrito no controle financeiro, oferecendo uma visão clara de metas, rendas e gastos por categorias percentuais.
*   **App Mobile (gm_finance):** Desenvolvido em **React Native com Expo**, utiliza o **expo-router** para navegação baseada em arquivos e **NativeWind (Tailwind CSS)** para estilização. O aplicativo consome a API REST via HTTPS/JSON, permitindo ao usuário gerenciar seu fluxo financeiro, acompanhar metas de economia e configurar regras de alocação percentual.

### 2. Camada de Aplicação (Backend API)
O núcleo de processamento é projetado para ser leve e escalável, utilizando tecnologias modernas de runtime JavaScript.
*   **API Backend (gm_back):** Desenvolvida em **Node.js com Fastify e TypeScript**, atua como o orquestrador central. É responsável por validar esquemas de dados, aplicar regras de negócio financeiras e gerenciar a integração com serviços externos.
    *   **Controllers/Routes:** Gerenciam a exposição dos endpoints REST, utilizando o **Zod** para validação estrutural rigorosa e tipagem segura das requisições.
    *   **Services:** Centralizam a lógica de negócio, como o cálculo de resumos mensais, projeções de metas e a orquestração do fluxo conversacional.
    *   **Middleware:** Implementa camadas de segurança, logs e tratamento de erros padronizado.

### 3. Camada de Persistência e Dados
A estratégia de dados utiliza um banco relacional robusto integrado a um ORM que garante segurança e agilidade no desenvolvimento.
*   **Prisma ORM:** Utilizado para abstrair a camada de dados, fornecendo consultas type-safe e gerenciamento de migrações simplificado.
*   **Banco de Dados PostgreSQL:** Infraestrutura de dados relacional que garante a integridade e consistência das movimentações financeiras, metas e configurações de usuários.

### 4. Segurança e Autenticação
Protocolos rigorosos garantem a proteção dos dados financeiros e a identidade dos usuários.
*   **Autenticação JWT:** O acesso às rotas protegidas é controlado via JSON Web Tokens, garantindo que cada usuário acesse apenas seu próprio contexto financeiro (isolamento lógico).
*   **Criptografia e Validação:** Utilização de HTTPS para toda comunicação externa e validação exaustiva de entradas via Zod para prevenir ataques de injeção e dados inconsistentes.

### 5. Integrações e Infraestrutura
O ecossistema é expandido por capacidades conversacionais e uma infraestrutura de deploy flexível.

| Componente | Descrição Técnica e Papel na Infraestrutura |
| :--- | :--- |
| **WhatsApp / Evolution API** | Porta de entrada conversacional que recebe mensagens via Webhook. Permite o registro de transações e consultas financeiras em linguagem natural. |
| **LLM Local** | Processamento de linguagem natural integrado ao backend para interpretação de intenções e assistência financeira assistida, operando de forma interpretativa sem acesso direto ao banco. |
| **Deploy e Orquestração** | Ambiente conteinerizado com **Docker Compose**, utilizando **Nginx ou Caddy** como reverse proxy para terminação TLS e gerenciamento de rede privada entre os serviços. |
| **Documentação** | Geração automática de documentação via **Swagger/OpenAPI**, facilitando a integração entre as camadas do sistema e testes de API. |
