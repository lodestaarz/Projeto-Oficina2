# Estratégia de testes

Responsável: 

## Tipos de teste

| Tipo | O que testa | Ferramenta | Onde fica |
|---|---|---|---|
| Unitário | Regras puras do jogo (`move`, `runSequence`) e services do backend (hash, JWT, validação) | Vitest | `frontend/src/**/*.test.js`, `backend/tests/` |
| API | Rotas do Express de ponta a ponta dentro do backend, sem subir servidor | Vitest e Supertest | `backend/tests/` |
| Integração com banco | Repositories contra um PostgreSQL de teste | Vitest | `backend/tests/integration/` |
| Componentes | Grade, controles, teclado, lista de comandos e formulários | Vitest, React Testing Library e jsdom | `frontend/src/**/*.test.jsx` |
| Ponta a ponta (E2E) | Jornada completa do usuário no navegador | Playwright | `tests/e2e/` |

## Técnicas para escrever os casos

- **Classes de equivalência:** separar as entradas em grupos que devem se comportar igual (válidas e inválidas) e testar pelo menos um valor de cada grupo.
- **Valor-limite:** testar exatamente nas bordas, como o personagem na coluna 0 e na coluna 7, ou senhas com 7 e com 8 caracteres.
- **Baseado em requisitos:** cada critério de aceite dos arquivos em `requisitos/` vira pelo menos um caso de teste.

Os casos estão em [`tests/casos-de-teste.md`](../tests/casos-de-teste.md), e a ligação com os requisitos está em [`tests/matriz-rastreabilidade.md`](../tests/matriz-rastreabilidade.md).

## Dados e dependências externas

- **Google:** os testes nunca chamam o Google de verdade. A verificação do ID token é substituída por um mock (`vi.mock('google-auth-library')`), que devolve um usuário fictício ou lança erro, conforme o caso.
- **Banco:** os testes de integração usam um banco separado (`logica_ludica_test`), recriado antes da suíte com o mesmo `database/init.sql`. A `DATABASE_URL` de teste vem de `backend/.env.test`.
- **JWT:** os testes usam um `JWT_SECRET` fixo de teste e geram tokens expirados ou adulterados de propósito.

## Cobertura

- Meta: **pelo menos 80%** de linhas nos módulos `frontend/src/game/` e `backend/src/services/`.
- Ferramenta: `@vitest/coverage-v8`, com o comando `npx vitest run --coverage` em cada workspace.
- O relatório de cobertura é anexado à revisão de cada sprint.

## Quando os testes rodam

- Localmente, com `npm test` na raiz.
- No GitHub Actions, a cada push na `main` e a cada pull request, junto com lint e build.
- Os testes E2E entram no CI na Sprint 2, num job separado que sobe banco, backend e frontend.

## Critérios de aprovação

- Todos os testes passam no CI.
- Nenhum pull request entra na `main` com teste falhando.
- Nenhum bug crítico aberto no fim da sprint.
- Cobertura dentro da meta nos módulos indicados.
