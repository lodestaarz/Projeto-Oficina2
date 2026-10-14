# Processo de desenvolvimento

## Metodologia

Scrum com duas sprints de desenvolvimento, precedidas por um período de preparação. Cada sprint termina com uma revisão: demonstração do que foi feito e execução dos testes. Os ajustes pedidos pelo professor viram issues da sprint seguinte.

## Papéis

| Pessoa | Responsabilidade |
|---|---|
| Davi Felipe Zeneratto | PO e Documentação |
| Gabriel Moya Amorim | Backend e Banco |
| Gleisson Santos Vieira | Backend e Banco |
| Vinícius de Farias Santos | Frontend |
| Willian Hiroshi da Silva Fukuda | Testes e CI |

Cada área tem um responsável, que garante a entrega e mantém os documentos dela atualizados. Todos podem contribuir em qualquer área.

## Quadro e issues

- **Quadro Kanban** no GitHub Projects com as colunas Backlog, A fazer, Em andamento, Em revisão e Concluído. Link: _(adicionar)_
- **Cada requisito vira uma issue**, criada a partir do arquivo em [`requisitos/`](../requisitos/README.md) e usando os critérios de aceite como checklist.
- Tarefas grandes são divididas em sub-issues por camada (frontend, backend, banco, testes), cada uma com responsável e prazo.
- **Milestones:** Preparação, Sprint 1 e Sprint 2.
- Para bugs e novas funcionalidades, use os templates em `.github/ISSUE_TEMPLATE/`.

## Branches e commits

- `main` é protegida: só recebe código por pull request, com pelo menos uma revisão aprovada e o CI verde.
- Nome das branches: `tipo/numero-da-issue-descricao-curta`, por exemplo `feat/12-botao-recomecar` ou `fix/20-teclado-em-formulario`.
- Commits no padrão Conventional Commits, referenciando a issue: `feat: botão recomeçar (#12)`. Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.
- O pull request usa o template em `.github/pull_request_template.md` e fecha a issue com `Closes #12`.

## Definição de pronto

Uma issue só vai para **Concluído** quando:

- todos os critérios de aceite do requisito foram atendidos;
- há testes automatizados para o comportamento novo;
- `npm run lint`, `npm test` e `npm run build` passam no CI;
- o pull request foi revisado por outra pessoa e entrou na `main`;
- a coluna **Situação** em `requisitos/README.md` e a matriz de rastreabilidade foram atualizadas.

## Cronograma

> Datas a conferir com o calendário oficial da disciplina.

| Etapa | Período | Entrega |
|---|---|---|
| Preparação | 02/10 a 16/10 | Documentação, requisitos, arquitetura, ambiente, CI e projetos base |
| Sprint 1 | 17/10 a 07/11 | Contas e sessão, área de movimentação, botões, teclado, limites, recomeçar, tabela de usuários |
| Sprint 2 | 08/11 a 30/11 | Sequência de comandos, execução passo a passo, perfil, testes E2E e entrega final |
