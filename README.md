# Projeto Acadêmico da Disciplina Oficina De Integração 2 - Engenharia de Software - UTFPR-CP - 02/2026

## Alunos
>[Davi Felipe Zeneratto](https://github.com/davifz)
>
>[Gabriel Moya Amorim](https://github.com/gabrielAmorim-utfpr)
>
>[Gleisson Santos Vieira](https://github.com/gleisson-santos-dev)
>
>[Vinícius de Farias Santos](https://github.com/lodestaarz)
>
>[Willian Hiroshi da Silva Fukuda](https://github.com/fkdhiro)

## Sobre o Projeto

Este projeto faz parte da disciplina Oficina de Integração 2 e está relacionado ao projeto de extensão ELLP (Ensino Lúdico de Lógica e Programação).

A proposta consiste no desenvolvimento de uma ferramenta visual e interativa para o ensino de conceitos básicos de lógica de programação. Por meio da aplicação, o usuário poderá controlar um personagem em uma área delimitada utilizando comandos direcionais e organizar sequências de instruções para execução.

O projeto busca proporcionar uma experiência simples e acessível, permitindo que o usuário compreenda conceitos como sequência de comandos, direção e movimentação de forma prática e visual.

# Requisitos

Requisitos funcionais, não funcionais e regras de negócio da ferramenta Lógica Lúdica. Cada requisito funcional tem um arquivo próprio com descrição, critérios de aceite, prioridade, sprint e situação atual. Esses arquivos servem de base para as issues no GitHub.

A coluna **Situação** reflete o código da branch `main`. Atualize-a no mesmo pull request que implementar o requisito.

## Requisitos funcionais

| Código | Requisito | Prioridade | Sprint | Situação |
|---|---|---|---|---|
| [RF01](RF01-cadastrar-conta.md) | Cadastrar conta com nome, e-mail e senha | Alta | Sprint 1 | Não iniciado |
| [RF02](RF02-entrar-com-email-e-senha.md) | Entrar com e-mail e senha | Alta | Sprint 1 | Não iniciado |
| [RF03](RF03-entrar-com-google.md) | Entrar com conta Google | Alta | Sprint 1 | Não iniciado |
| [RF04](RF04-manter-e-encerrar-sessao.md) | Manter e encerrar a sessão | Alta | Sprint 1 | Não iniciado |
| [RF05](RF05-visualizar-perfil.md) | Visualizar perfil | Média | Sprint 2 | Não iniciado |
| [RF06](RF06-exibir-area-de-movimentacao.md) | Exibir a área de movimentação | Alta | Sprint 1 | Não iniciado |
| [RF07](RF07-exibir-personagem.md) | Exibir o personagem e sua posição | Alta | Sprint 1 | Não iniciado |
| [RF08](RF08-mover-com-botoes.md) | Mover o personagem com botões | Alta | Sprint 1 | Não iniciado |
| [RF09](RF09-mover-com-teclado.md) | Mover o personagem com as setas do teclado | Alta | Sprint 1 | Não iniciado |
| [RF10](RF10-respeitar-limites-da-area.md) | Respeitar os limites da área | Alta | Sprint 1 | Não iniciado |
| [RF11](RF11-voltar-a-posicao-inicial.md) | Voltar à posição inicial | Alta | Sprint 1 | Não iniciado |
| [RF12](RF12-executar-sequencia-de-comandos.md) | Executar a sequência de comandos | Alta | Sprint 2 | Não iniciado |
| [RF13](RF13-armazenar-dados-do-usuario.md) | Armazenar os dados do usuário | Alta | Sprint 1 | Não iniciado |
| [RF14](RF14-montar-sequencia-de-comandos.md) | Montar a sequência de comandos | Alta | Sprint 2 | Não iniciado |

## Requisitos não funcionais

| Código | Descrição | Categoria |
|---|---|---|
| RNF01 | A interface deve usar linguagem simples e retorno visual imediato a cada comando, pensando no público iniciante das oficinas do ELLP. | Usabilidade |
| RNF02 | Todos os controles devem poder ser usados pelo teclado e ter rótulos acessíveis (`aria-label`) para leitores de tela. | Acessibilidade |
| RNF03 | A aplicação deve funcionar nas versões atuais de Chrome, Firefox, Edge e Safari e se adaptar a telas de notebook e tablet. | Compatibilidade |
| RNF04 | A movimentação do personagem deve ser calculada no navegador, sem depender de resposta do servidor. | Desempenho |
| RNF05 | Senhas devem ser guardadas apenas como hash (bcrypt). Segredos e credenciais ficam em variáveis de ambiente e nunca são versionados. | Segurança |
| RNF06 | O sistema deve guardar apenas os dados necessários, e cada usuário só pode acessar os próprios dados. | Privacidade |
| RNF07 | Frontend e backend devem seguir a separação em camadas descrita na arquitetura. As regras do jogo ficam em módulos puros, fora dos componentes. | Manutenibilidade |
| RNF08 | Toda funcionalidade deve ter testes automatizados, e o CI deve rodar lint, testes e build a cada pull request. | Testabilidade |

## Regras de negócio

| Código | Regra | Requisitos relacionados |
|---|---|---|
| RN01 | A área de movimentação é uma grade de 8 colunas por 8 linhas. | RF06 |
| RN02 | A posição inicial do personagem é a célula (0, 0), no canto superior esquerdo. O eixo x cresce para a direita e o eixo y cresce para baixo. | RF07, RF11 |
| RN03 | Cada comando desloca o personagem exatamente uma célula na direção indicada: Cima, Baixo, Esquerda ou Direita. | RF08, RF09, RF12 |
| RN04 | Um comando que levaria o personagem para fora da grade é ignorado, e o personagem permanece onde está. | RF10, RF12 |
| RN05 | Os comandos de uma sequência são executados um por vez, na ordem em que aparecem. Um comando ignorado pela RN04 não interrompe a sequência. | RF12, RF14 |
| RN06 | Cada e-mail corresponde a uma única conta. | RF01, RF03 |
| RN07 | A senha deve ter no mínimo 8 caracteres. | RF01 |
| RN08 | A sessão expira após 1 dia (`JWT_EXPIRES_IN=1d`). Depois disso, o usuário precisa entrar novamente. | RF04 |
| RN09 | Um usuário só pode consultar e alterar os próprios dados. | RF05, RF13, RNF06 |

## Rastreabilidade

A ligação entre requisitos e casos de teste está em [`tests/matriz-rastreabilidade.md`](../main/tests/matriz-rastreabilidade.md).
