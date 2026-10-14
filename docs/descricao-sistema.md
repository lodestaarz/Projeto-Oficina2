# Descrição do sistema

## Proposta

O ArrowBot é uma ferramenta web visual e interativa para o ensino de conceitos básicos de lógica de programação. O usuário controla um personagem dentro de uma área delimitada, em forma de grade, usando comandos de direção: Cima, Baixo, Esquerda e Direita. Além de mover o personagem diretamente, o usuário pode organizar uma sequência de comandos e executá-la, vendo cada passo acontecer na tela.

A ferramenta faz parte da disciplina Oficina de Integração 2 (Engenharia de Software, UTFPR-CP, 2º semestre de 2026) e está relacionada ao projeto de extensão ELLP (Ensino Lúdico de Lógica e Programação).

## Objetivo geral

Desenvolver uma ferramenta visual que permita ao usuário movimentar um personagem por meio de comandos básicos e compreender, de forma prática, os conceitos de sequência de comandos, direção e movimentação.

## Objetivos específicos

- Exibir uma área delimitada com um personagem e sua posição atual.
- Permitir a movimentação por botões e pelas setas do teclado.
- Impedir que o personagem saia da área.
- Permitir montar, reorganizar e executar uma sequência de comandos, passo a passo.
- Permitir o cadastro e o acesso com e-mail e senha ou com a conta Google.
- Armazenar com segurança os dados necessários para identificar cada usuário.

## Limites e restrições

- Aplicação web acessada pelo navegador. Não há aplicativo móvel nativo.
- A área é uma grade fixa de 8 × 8, sem obstáculos, mapas ou fases.
- Os comandos são apenas de direção. Não há laços, condições nem geração de código textual nesta versão.
- O personagem é virtual. Não há envio de comandos para robôs físicos ou placas.
- Não há área administrativa nem perfis com permissões diferentes.

## Documentos relacionados

- [Requisitos](requisitos.md)
- [Arquitetura do sistema](arquitetura-sistema.md)
- [Tecnologias e decisões](tecnologias.md)
- [Estratégia de testes](testes.md)
- [Processo e cronograma](processo.md)
