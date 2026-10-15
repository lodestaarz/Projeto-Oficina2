# Requisitos

Requisitos funcionais, não funcionais e regras de negócio da ferramenta ArrowBot. Cada requisito funcional tem um arquivo próprio com descrição, critérios de aceite, prioridade, sprint e situação atual. Esses arquivos servem de base para as issues no GitHub.

A coluna **Situação** reflete o código da branch `main`. Atualize-a no mesmo pull request que implementar o requisito.

## Requisitos funcionais

| Código | Requisito | Prioridade | Sprint | Situação |
|---|---|---|---|---|
| RF01 | Cadastrar conta com nome, e-mail e senha | Alta | Sprint 1 | Não iniciado |
| RF02 | Entrar com e-mail e senha | Alta | Sprint 1 | Não iniciado |
| RF03 | Entrar com conta Google | Alta | Sprint 1 | Não iniciado |
| RF04 | Manter e encerrar a sessão | Alta | Sprint 1 | Não iniciado |
| RF05 | Visualizar perfil | Média | Sprint 2 | Não iniciado |
| RF06 | Exibir a área de movimentação | Alta | Sprint 1 | Não iniciado |
| RF07 | Exibir o personagem e sua posição | Alta | Sprint 1 | Não iniciado |
| RF08 | Mover o personagem com botões | Alta | Sprint 1 | Não iniciado |
| RF09 | Mover o personagem com as setas do teclado | Alta | Sprint 1 | Não iniciado |
| RF10 | Respeitar os limites da área | Alta | Sprint 1 | Não iniciado |
| RF11 | Voltar à posição inicial | Alta | Sprint 1 | Não iniciado |
| RF12 | Executar a sequência de comandos | Alta | Sprint 2 | Não iniciado |
| RF13 | Montar a sequência de comandos | Alta | Sprint 2 | Não iniciado |

## Requisitos não funcionais

| Código | Descrição                                                                                                                                       | Categoria        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| RNF01  | A interface deve usar linguagem simples e retorno visual imediato a cada comando, pensando no público iniciante das oficinas do ELLP.           | Usabilidade      |
| RNF02  | Todos os controles devem poder ser usados pelo teclado e ter rótulos acessíveis (`aria-label`) para leitores de tela.                           | Acessibilidade   |
| RNF03  | A aplicação deve funcionar nas versões atuais de Chrome, Firefox, Edge e Safari e se adaptar a telas de notebook e tablet.                      | Compatibilidade  |
| RNF04  | A movimentação do personagem deve ser calculada no navegador, sem depender de resposta do servidor.                                             | Desempenho       |
| RNF05  | Senhas devem ser guardadas apenas como hash (bcrypt). Segredos e credenciais ficam em variáveis de ambiente e nunca são versionados.            | Segurança        |
| RNF06  | O sistema deve guardar apenas os dados necessários, e cada usuário só pode acessar os próprios dados.                                           | Privacidade      |
| RNF07  | Frontend e backend devem seguir a separação em camadas descrita na arquitetura. As regras do jogo ficam em módulos puros, fora dos componentes. | Manutenibilidade |
| RNF08  | Toda funcionalidade deve ter testes automatizados, e o CI deve rodar lint, testes e build a cada pull request.                                  | Testabilidade    |

## Regras de negócio

| Código | Regra                                                                                                                                       | Requisitos relacionados |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| RN01   | A área de movimentação é uma grade de 8 colunas por 8 linhas.                                                                               | RF06                    |
| RN02   | A posição inicial do personagem é a célula (0, 0), no canto superior esquerdo. O eixo x cresce para a direita e o eixo y cresce para baixo. | RF07, RF11              |
| RN03   | Cada comando desloca o personagem exatamente uma célula na direção indicada: Cima, Baixo, Esquerda ou Direita.                              | RF08, RF09, RF12        |
| RN04   | Um comando que levaria o personagem para fora da grade é ignorado, e o personagem permanece onde está.                                      | RF10, RF12              |
| RN05   | Os comandos de uma sequência são executados um por vez, na ordem em que aparecem. Um comando ignorado pela RN04 não interrompe a sequência. | RF12, RF14              |
| RN06   | Cada e-mail corresponde a uma única conta.                                                                                                  | RF01, RF03              |
| RN07   | A senha deve ter no mínimo 8 caracteres.                                                                                                    | RF01                    |
| RN08   | A sessão expira após 1 dia (`JWT_EXPIRES_IN=1d`). Depois disso, o usuário precisa entrar novamente.                                         | RF04                    |
| RN09   | Um usuário só pode consultar e alterar os próprios dados.                                                                                   | RF05, RF13, RNF06       |

## Rastreabilidade

A ligação entre requisitos e casos de teste está em [`tests/matriz-rastreabilidade.md`](../tests/matriz-rastreabilidade.md).
