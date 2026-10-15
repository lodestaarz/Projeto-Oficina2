# Arquitetura do Sistema

## 1. Visão geral

A aplicação é dividida em três partes: o **frontend** em React, que roda no navegador; a **API REST** em Node.js com Express; e o **banco de dados** PostgreSQL. A autenticação pode ser feita com e-mail e senha ou com a conta Google. Nos dois casos, a API emite um token JWT próprio, que identifica o usuário nas requisições seguintes.

A movimentação do personagem é calculada inteiramente no navegador, por funções puras, sem depender do servidor (RNF04). O backend cuida apenas de contas, sessão e persistência.

## 2. Diagrama

```mermaid
flowchart LR
    U[Usuário]

    subgraph FE["Frontend (React + Vite, TypeScript)"]
        P[Páginas<br/>login, cadastro, jogo, perfil]
        G[game/<br/>regras puras de movimento e sequência]
        AC[AuthContext<br/>token e usuário]
        S[services/api.ts]
    end

    subgraph BE["Backend (Express, TypeScript)"]
        R[routes]
        MW[middlewares<br/>auth, validação, erros]
        C[controllers]
        SV[services<br/>regras de negócio]
        RP[repositories<br/>SQL]
    end

    DB[(PostgreSQL)]
    GO[Google<br/>Identity Services]

    U --> P
    P --> G
    P --> AC
    AC --> S
    S -- "HTTP JSON /api" --> R
    R --> MW --> C --> SV --> RP --> DB
    P -. "botão Entrar com Google" .-> GO
    SV -. "valida ID token" .-> GO
```

## 3. Frontend

Os tipos usados pelo frontend e pelo backend (`Direcao`, `Posicao`, `Area`, `Usuario`, `RespostaAutenticacao`...) ficam em `shared/src/index.ts`, no pacote `@arrowbot/shared`, que só contém tipos.

Estrutura de `frontend/src/`:

| Pasta ou arquivo           | Responsabilidade                                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.tsx`                 | Ponto de entrada; monta `BrowserRouter`, `AuthProvider`, o provedor do Google e o `App`                                                                                           |
| `App.tsx`                  | Só as rotas de tela                                                                                                                                                               |
| `pages/`                   | Telas: `LoginPage`, `CadastroPage`, `JogoPage`, `PerfilPage`                                                                                                                      |
| `components/`              | `Grade`, `Personagem`, `Controles`, `ListaDeComandos`, `Layout` (cabeçalho e Sair), `Rotas` (`RotaProtegida` e `RotaPublica`), `BotaoGoogle`, `Campo`, `TelaAutenticacao`, `Logo` |
| `contexts/AuthContext.tsx` | Guarda o token e o usuário; login, cadastro, Google, logout, restauração da sessão e saída automática quando o token vence                                                        |
| `hooks/`                   | `useTeclado` (setas → direção), `useExecucao` (reproduz os passos com pausa), `useEnvioDeFormulario`                                                                              |
| `game/`                    | Regras puras do jogo, sem React: `movement.ts` (`move`), `sequence.ts` (`runSequence` e edição da lista), `config.ts` (grade 8 × 8, nomes e setas)                                |
| `services/`                | `api.ts` (cliente HTTP; adiciona `Authorization: Bearer`), `sessao.ts` (`localStorage` e leitura do `exp` do JWT), `google.ts` (Client ID)                                        |
| `test/`                    | Configuração dos testes de componentes e utilitários (API falsa, sessão de teste)                                                                                                 |

Rotas de tela (React Router):

| Rota        | Tela                                              | Exige sessão |
| ----------- | ------------------------------------------------- | ------------ |
| `/login`    | Login com e-mail/senha e botão Google             | Não          |
| `/cadastro` | Cadastro com nome, e-mail e senha, e botão Google | Não          |
| `/playboard`| Área de movimentação e sequência de comandos      | Sim          |
| `/perfil`   | Dados do usuário e botão Sair                     | Sim          |

Em desenvolvimento, o Vite encaminha as chamadas a `/api` para `http://localhost:3001` (`vite.config.ts`).

Sem sessão, as rotas protegidas levam a `/login` e guardam a página pedida; depois do login o usuário volta para ela. Quem já está logado e abre `/login` ou `/cadastro` vai direto para o jogo.

## 4. Backend

Estrutura de `backend/src/`:

| Pasta ou arquivo      | Responsabilidade                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `server.ts`           | Sobe o servidor na porta `PORT` e fecha o pool ao encerrar                                                                                      |
| `app.ts`              | `createApp()`: `helmet`, `cors`, JSON (até 10 kB), rotas em `/api`, 404 e tratamento de erros. Recebe um repositório opcional, usado nos testes |
| `config/env.ts`       | Lê e valida as variáveis de ambiente com `zod` (falha ao subir se faltar `JWT_SECRET`)                                                          |
| `routes/`             | `health`, `auth` (`/register`, `/login`, `/google`) e `users` (`/me`)                                                                           |
| `middlewares/`        | `errorHandler`, `autenticar` (valida o JWT) e `validar` (aplica um schema `zod`)                                                                |
| `validators/`         | Schemas `zod` dos corpos de `/auth`, com mensagens que citam o campo                                                                            |
| `controllers/`        | Lê a requisição, chama o service e monta a resposta HTTP                                                                                        |
| `services/`           | `auth.service` (regras de conta), `senha.service` (bcrypt), `token.service` (JWT), `google.service` (valida o ID token)                         |
| `repositories/`       | `usuario.repository`: consultas SQL parametrizadas usando o `pool`                                                                              |
| `errors/HttpError.ts` | Erro com status HTTP e as mensagens padrão                                                                                                      |
| `database/pool.ts`    | Pool de conexões do `pg`                                                                                                                        |
| `types/express.d.ts`  | Acrescenta `req.usuarioId` ao tipo do Express                                                                                                   |

Regra das camadas: cada camada só chama a camada logo abaixo. Controllers não escrevem SQL, e repositories não conhecem `req` nem `res`.

## 5. Contrato da API

Todas as rotas ficam sob `/api` e trocam JSON. Os erros seguem sempre o formato `{ "error": "mensagem" }`, gerado pelo `errorHandler`.

| Método e rota             | Corpo                                 | Resposta de sucesso      | Erros                                      | Situação     |
| ------------------------- | ------------------------------------- | ------------------------ | ------------------------------------------ | ------------ |
| `GET /api/health`         | —                                     | `200 { "status": "ok" }` | —                                          | Implementado |
| `POST /api/auth/register` | `{ nome, email, senha }`              | `201 { token, usuario }` | `400` dados inválidos, `409` e-mail em uso | Implementado |
| `POST /api/auth/login`    | `{ email, senha }`                    | `200 { token, usuario }` | `400`, `401` credenciais inválidas         | Implementado |
| `POST /api/auth/google`   | `{ credential }` (ID token do Google) | `200 { token, usuario }` | `400`, `401` token inválido                | Implementado |
| `GET /api/users/me`       | — (exige `Authorization: Bearer`)     | `200 { usuario }`        | `401`                                      | Implementado |

O objeto `usuario` devolvido pela API tem o formato `{ id, nome, email, provedores: ["senha" | "google"] }`. Ele nunca inclui `senha_hash` nem `google_id`.

Erros extras: corpo que não é JSON válido gera `400 { "error": "Corpo da requisição inválido" }`; `POST /api/auth/google` responde `409` se o e-mail já estiver ligado a outra conta Google e `503` se o servidor não tiver `GOOGLE_CLIENT_ID`.

O logout não tem rota: como o JWT não guarda estado no servidor, o frontend apenas descarta o token (RF04).

## 6. Fluxos de autenticação

### 6.1 E-mail e senha

1. O usuário envia nome, e-mail e senha (cadastro) ou e-mail e senha (login).
2. O backend valida o corpo com `zod`.
3. No cadastro, gera o hash com `bcryptjs` e grava o usuário. No login, compara a senha com o hash guardado.
4. O backend assina um JWT com `JWT_SECRET`, validade `JWT_EXPIRES_IN` e o `id` do usuário no campo `sub`.
5. O frontend guarda o token no `AuthContext` e o envia como `Authorization: Bearer <token>`.

### 6.2 Google

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant G as Google
    participant A as API
    participant D as PostgreSQL

    U->>F: Clica em "Entrar com Google"
    F->>G: Abre a janela de login (@react-oauth/google)
    G-->>F: ID token (credential)
    F->>A: POST /api/auth/google { credential }
    A->>G: Verifica assinatura, validade e aud = GOOGLE_CLIENT_ID
    A->>D: Busca usuário pelo google_id
    alt Não achou pelo google_id, mas o e-mail já tem conta
        A->>D: Vincula o google_id à conta existente (RN06)
    else Primeiro acesso
        A->>D: Cria o usuário sem senha
    end
    A-->>F: { token (JWT da API), usuario }
```

### 6.3 Rotas protegidas

O middleware `autenticar` lê o cabeçalho `Authorization`, verifica o JWT e coloca o id do usuário em `req.usuarioId`. Sem token, com token adulterado ou com token expirado, responde `401`. Os repositories sempre filtram pelo `req.usuarioId` (RN09).

## 7. Modelo de dados

Tabela criada por `database/init.sql`:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha_hash  TEXT,
  google_id   VARCHAR(255) UNIQUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuario_tem_forma_de_acesso
    CHECK (senha_hash IS NOT NULL OR google_id IS NOT NULL),
  CONSTRAINT email_em_minusculas CHECK (email = lower(email)),
  CONSTRAINT nome_nao_vazio CHECK (length(trim(nome)) > 0)
);
```

| Coluna       | Observação                                                        |
| ------------ | ----------------------------------------------------------------- |
| `email`      | Único (RN06). Sempre em minúsculas, garantido pelo próprio banco. |
| `senha_hash` | Nulo para quem só usa Google.                                     |
| `google_id`  | Campo `sub` do ID token do Google. Nulo para quem só usa senha.   |

## 8. Segurança

- Senhas guardadas apenas como hash bcrypt (RNF05).
- `helmet` define cabeçalhos HTTP de segurança, e `cors` aceita apenas a origem `CORS_ORIGIN`.
- Todos os corpos de requisição são validados com `zod` antes de chegar ao service.
- Consultas SQL sempre parametrizadas (`$1`, `$2`), nunca montadas com concatenação de texto.
- O login com senha responde com a mesma mensagem para e-mail inexistente e senha errada.
- Erros 500 não expõem detalhes internos ao cliente (`errorHandler`).
- `.env` fora do git. Apenas os `.env.example`, sem valores reais, são versionados.
- Variáveis `VITE_*` vão para o navegador, então nunca contêm segredos.

## 9. Variáveis de ambiente

| Variável                | Onde     | Uso                                      |
| ----------------------- | -------- | ---------------------------------------- |
| `PORT`                  | backend  | Porta da API (padrão 3001)               |
| `NODE_ENV`              | backend  | `development`, `test` ou `production`    |
| `CORS_ORIGIN`           | backend  | Origem permitida (endereço do frontend)  |
| `DATABASE_URL`          | backend  | Conexão com o PostgreSQL                 |
| `JWT_SECRET`            | backend  | Segredo para assinar os tokens de sessão |
| `JWT_EXPIRES_IN`        | backend  | Validade do token (padrão `1d`)          |
| `GOOGLE_CLIENT_ID`      | backend  | Valida o `aud` do ID token do Google     |
| `VITE_API_URL`          | frontend | URL base da API (padrão `/api`)          |
| `VITE_GOOGLE_CLIENT_ID` | frontend | Client ID usado pelo botão do Google     |
