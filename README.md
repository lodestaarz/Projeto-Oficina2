# ArrowBot

Projeto acadêmico da disciplina Oficina de Integração 2 (Engenharia de Software, UTFPR-CP, 2º semestre de 2026), relacionado ao projeto de extensão ELLP (Ensino Lúdico de Lógica e Programação).

O ArrowBot é uma ferramenta web visual para ensinar conceitos básicos de lógica de programação. O usuário controla um personagem numa grade de 8 × 8 com comandos de direção (botões ou setas do teclado), monta sequências de comandos e as executa passo a passo. O acesso é feito com e-mail e senha ou com a conta Google.

## Stack

| Camada               | Tecnologias                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| Linguagem            | TypeScript 5.9 (modo `strict`) em todo o projeto, Node.js 22                          |
| Frontend             | React 19, Vite 6, React Router 7, `@react-oauth/google`                               |
| Backend              | Express 5, `zod`, `bcryptjs`, `jsonwebtoken`, `google-auth-library`, `helmet`, `cors` |
| Banco de dados       | PostgreSQL 16 (Docker), acesso com `pg` (SQL parametrizado, sem ORM)                  |
| Tipos compartilhados | Pacote `@arrowbot/shared` (npm workspaces)                                            |
| Testes               | Vitest, Supertest, React Testing Library + jsdom, Playwright, `@vitest/coverage-v8`   |
| Qualidade            | ESLint 9 + `typescript-eslint`, Prettier 3, GitHub Actions                            |

Detalhes e versões  em [docs/tecnologias.md](docs/tecnologias.md).

## Documentação

| Documento                                            | Conteúdo                                                  |
| ---------------------------------------------------- | --------------------------------------------------------- |
| [Descrição do sistema](docs/descricao-do-sistema.md) | Proposta, objetivos, limites e usuários                   |
| [Requisitos](requisitos/README.md)                   | Requisitos funcionais, não funcionais e regras de negócio |
| [Arquitetura](docs/arquitetura-sistema.md)           | Camadas, contrato da API, autenticação e modelo de dados  |
| [Stack e tecnologias](docs/tecnologias.md)           | Ferramentas, versões, scripts e decisões                  |
| [Testes](docs/testes.md)                             | Estratégia de testes ([casos de teste e matriz](tests/))  |
| [Processo e cronograma](docs/processo.md)            | Scrum, Kanban, branches, definição de pronto e datas      |

## Como rodar

Pré-requisitos: Node.js 22 (veja `.nvmrc`) e Docker. O projeto é escrito em **TypeScript**.

```bash
# 1. Instalar as dependências do frontend e do backend
npm install

# 2. Criar os arquivos de ambiente e preencher os valores
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Subir o banco de dados
npm run db:up

# 4. Subir backend e frontend juntos
npm run dev
```

- Interface: http://localhost:5173
- API: http://localhost:3001/api (teste com http://localhost:3001/api/health)

Para desligar o banco: `npm run db:down`.

### Login com Google

Crie um Client ID OAuth do tipo "Aplicativo da Web" no Google Cloud Console (APIs e serviços → Credenciais), adicione `http://localhost:5173` às origens JavaScript autorizadas e coloque o mesmo valor em `GOOGLE_CLIENT_ID` (backend) e `VITE_GOOGLE_CLIENT_ID` (frontend).

## Comandos úteis

| Comando                               | O que faz                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                         | Sobe backend e frontend em modo de desenvolvimento                        |
| `npm run typecheck`                   | Checa os tipos (TypeScript) de todos os pacotes                           |
| `npm test`                            | Roda os testes do frontend e do backend (sem precisar de banco)           |
| `npm run test:coverage`               | Testes com relatório de cobertura                                         |
| `npm run test:integration -w backend` | Testes com PostgreSQL de verdade (exige `TEST_DATABASE_URL`)              |
| `npm run test:e2e`                    | Testes de ponta a ponta no navegador (Playwright; exige o banco no ar)    |
| `npm run lint`                        | Roda o ESLint nos dois projetos                                           |
| `npm run format`                      | Formata o código com Prettier                                             |
| `npm run build`                       | Compila o backend (`backend/dist`) e gera o build de produção do frontend |

O CI (GitHub Actions) roda formatação, tipos, lint, testes e build a cada push na `main` e a cada pull request, além dos testes de integração com o banco e dos E2E em jobs separados.

## Estrutura

```
shared/      Tipos compartilhados (Direcao, Posicao, Usuario...) — só TypeScript, sem código
frontend/    React + Vite (páginas, componentes, regras puras do jogo em src/game)
backend/     Express (rotas → controllers → services → repositories)
database/    init.sql, executado na primeira subida do PostgreSQL
tests/e2e/   Testes de ponta a ponta (Playwright)
```

## Cronograma

| Etapa      | Período       |
| ---------- | ------------- |
| Preparação | 05/10 a 16/10 |
| Sprint 1   | 17/10 a 07/11 |
| Sprint 2   | 08/11 a 30/11 |

Detalhes de cada etapa em [`docs/processo.md`](docs/processo.md).
