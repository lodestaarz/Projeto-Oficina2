# Stack e tecnologias

## Visão geral da stack

```
Navegador ── React 19 + React Router 7 (TypeScript, Vite 6)
   │            regras do jogo em funções puras (frontend/src/game)
   │  HTTP JSON /api  (Authorization: Bearer <JWT>)
   ▼
API ──────── Express 5 (TypeScript, tsx em dev / tsc em produção)
   │            zod · bcryptjs · jsonwebtoken · google-auth-library · helmet · cors
   │  SQL parametrizado (pg)
   ▼
Banco ────── PostgreSQL 16 (Docker), esquema em database/init.sql
```

Os tipos que os dois lados trocam ficam no pacote `@arrowbot/shared` (`shared/src/index.ts`).

## Tecnologias em uso

| Uso                                 | Tecnologia                                        | Versão (package.json)      |
| ----------------------------------- | ------------------------------------------------- | -------------------------- |
| Ambiente de execução                | Node.js                                           | 22 (`.nvmrc`; mínimo 22.9) |
| Linguagem                           | TypeScript (ES Modules, modo `strict`)            | ~5.9                       |
| Execução do backend em dev          | `tsx` (build de produção com `tsc`)               | ^4.20                      |
| Organização do repositório          | npm workspaces (`shared`, `frontend` e `backend`) | —                          |
| Interface                           | React                                             | ^19.1                      |
| Build e servidor de desenvolvimento | Vite                                              | ^6.3                       |
| Rotas de tela                       | React Router                                      | ^7.6                       |
| Login Google no navegador           | `@react-oauth/google`                             | ^0.12                      |
| API                                 | Express                                           | ^5.1                       |
| Segurança HTTP                      | `helmet` e `cors`                                 | ^8.1 e ^2.8                |
| Validação de dados                  | `zod`                                             | ^3.25                      |
| Hash de senha                       | `bcryptjs`                                        | ^3.0                       |
| Token de sessão                     | `jsonwebtoken`                                    | ^9.0                       |
| Validação do token Google           | `google-auth-library`                             | ^9.15                      |
| Banco de dados                      | PostgreSQL (Docker)                               | 16-alpine                  |
| Acesso ao banco                     | `pg`                                              | ^8.16                      |
| Testes unitários e de API           | Vitest e Supertest                                | ^3.2 e ^7.1                |
| Testes de componentes               | React Testing Library e jsdom                     | ^16.3 e ^26.1              |
| Testes de ponta a ponta             | Playwright                                        | ^1.56                      |
| Cobertura de código                 | `@vitest/coverage-v8`                             | ^3.2                       |
| Lint e formatação                   | ESLint 9 + `typescript-eslint` e Prettier 3       | ^8.34                      |
| Integração contínua                 | GitHub Actions                                    | —                          |

## Scripts

| Comando (na raiz)                     | O que faz                                                               |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                         | Backend (`tsx watch`) e frontend (Vite) juntos                          |
| `npm run typecheck`                   | `tsc --noEmit` em `shared`, `frontend`, `backend` e testes E2E          |
| `npm run lint`                        | ESLint com `typescript-eslint`                                          |
| `npm test`                            | Vitest no frontend (jsdom) e no backend (Supertest, banco em memória)   |
| `npm run test:coverage`               | Testes com cobertura (`@vitest/coverage-v8`)                            |
| `npm run test:integration -w backend` | Repositório contra PostgreSQL de verdade (`TEST_DATABASE_URL`)          |
| `npm run test:e2e`                    | Playwright em Chromium, Firefox, WebKit e tablet                        |
| `npm run build`                       | `tsc` do backend para `backend/dist` e build do Vite em `frontend/dist` |
| `npm run format` / `format:check`     | Prettier                                                                |
| `npm run db:up` / `db:down`           | Sobe ou derruba o PostgreSQL do `docker-compose.yml`                    |
