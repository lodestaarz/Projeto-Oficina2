# Matriz de rastreabilidade

Liga cada requisito (veja [requisitos](../docs/requisitos.md)) aos testes que o cobrem.

Legenda: **U** = unidade/componente (Vitest), **I** = integração com PostgreSQL real, **E** = ponta a ponta (Playwright), **A** = acessibilidade (axe).

| Requisito                      | Testes                                                                                       | Tipo    |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ------- |
| RF01 Cadastrar conta           | `backend/tests/auth.test.ts`; `integration/auth.integration.test.ts`; `e2e/fluxo.spec.ts`    | U, I, E |
| RF02 Entrar com e-mail e senha | `backend/tests/auth.test.ts`; `integration/auth.integration.test.ts`; `e2e/fluxo.spec.ts`    | U, I, E |
| RF03 Entrar com Google         | `backend/tests/auth.test.ts` (cria, vincula e reaproveita conta); `integration/...` (Google) | U, I    |
| RF04 Manter e encerrar sessão  | `frontend/src/App.test.tsx`; `e2e/fluxo.spec.ts` (sair e entrar de novo)                     | U, E    |
| RF05 Visualizar perfil         | `integration/auth.integration.test.ts`; `e2e/fluxo.spec.ts`                                  | I, E    |
| RF06 Área de movimentação      | `frontend/src/pages/JogoPage.test.tsx`; `e2e/acessibilidade.spec.ts`                         | U, A    |
| RF07 Personagem e posição      | `frontend/src/pages/JogoPage.test.tsx`; `e2e/fluxo.spec.ts`                                  | U, E    |
| RF08 Mover com botões          | `frontend/src/pages/JogoPage.test.tsx`; `e2e/fluxo.spec.ts`                                  | U, E    |
| RF09 Mover com o teclado       | `frontend/src/pages/JogoPage.test.tsx`                                                       | U       |
| RF10 Limites da área           | `frontend/src/game/movement.test.ts`                                                         | U       |
| RF11 Voltar à posição inicial  | `frontend/src/pages/JogoPage.test.tsx`                                                       | U       |
| RF12 Executar a sequência      | `frontend/src/game/sequence.test.ts`; `frontend/src/pages/JogoPage.test.tsx`                 | U       |
| RF13 Montar a sequência        | `frontend/src/pages/JogoPage.test.tsx`                                                       | U       |
| RNF02 Teclado e rótulos        | `e2e/acessibilidade.spec.ts` (axe, WCAG A/AA)                                                | A       |
| RNF03 Navegadores e telas      | `playwright.config.ts` (chromium, firefox, webkit, tablet)                                   | E       |
| RNF04 Movimento no navegador   | `frontend/src/game/movement.test.ts` (funções puras)                                         | U       |
| RNF05 Hash e segredos          | `backend/tests/auth.test.ts` (bcrypt, JWT_SECRET fraco); `integration/...`                   | U, I    |
| RNF06 Dados por usuário        | `backend/tests/auth.test.ts` (rota protegida: 401 sem token)                                 | U       |
| RNF08 Testes e CI              | `.github/workflows/ci.yml`; `.githooks/pre-commit`                                           | —       |
| RN01–RN04 Grade e movimento    | `frontend/src/game/movement.test.ts`                                                         | U       |
| RN05 Execução em ordem         | `frontend/src/game/sequence.test.ts`                                                         | U       |
| RN06 E-mail único              | `integration/auth.integration.test.ts` (409, qualquer caixa); `backend/tests/auth.test.ts`   | I, U    |
| RN07 Senha mínima de 8         | `backend/tests/auth.test.ts` (validação)                                                     | U       |
| RN08 Sessão de 1 dia           | `backend/tests/auth.test.ts` (token expirado/inválido: 401)                                  | U       |
| RN09 Só os próprios dados      | `backend/tests/auth.test.ts`; `integration/auth.integration.test.ts` (`/users/me`)           | U, I    |
