# Casos de teste

Resumo dos cenários automatizados. A ligação com os requisitos está na [matriz de rastreabilidade](matriz-rastreabilidade.md).

| Cód. | Cenário                                                  | Resultado esperado                                   | Onde                                 |
| ---- | -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| CT01 | Cadastrar com dados válidos                              | Conta criada e usuário já logado, tela do jogo       | `e2e/fluxo.spec.ts`                  |
| CT02 | Cadastrar com e-mail já usado (qualquer caixa)           | 409 com mensagem de e-mail em uso                    | `integration/auth.integration`       |
| CT03 | Entrar com senha errada                                  | 401 e alerta na tela, sem revelar se o e-mail existe | `e2e/fluxo.spec.ts`; `auth.test.ts`  |
| CT04 | Sair da conta e entrar de novo                           | Volta à tela em que estava                           | `e2e/fluxo.spec.ts`                  |
| CT05 | Mover o personagem com um botão de direção               | Posição muda uma célula                              | `e2e/fluxo.spec.ts`; `JogoPage.test` |
| CT06 | Mover para fora da grade                                 | Comando ignorado, personagem não sai do lugar        | `movement.test.ts`                   |
| CT07 | Executar sequência com comando bloqueado pela borda      | Segue para o próximo comando                         | `sequence.test.ts`                   |
| CT08 | Login com Google (conta nova, existente, vinculada)      | Cria, reaproveita ou vincula pelo e-mail verificado  | `auth.test.ts`; `integration/...`    |
| CT09 | Muitas tentativas de login seguidas                      | 429 com `Retry-After`                                | `auth.test.ts`                       |
| CT10 | Telas de login, cadastro, jogo e perfil no axe (WCAG AA) | Nenhuma violação                                     | `e2e/acessibilidade.spec.ts`         |
