// Regras puras da sequência de comandos (RF12, RF14).
// A sequência é uma lista de direções, ex.: ['right', 'right', 'down'].
import { move, type Area, type Direcao, type Posicao } from './movement';

/**
 * Executa a sequência a partir de `inicio` e devolve a posição depois de
 * cada passo, na ordem (RN05). Um comando que bateria na borda é ignorado
 * e a execução segue para o próximo (RN04), então aquele passo repete a
 * posição anterior. Sequência vazia devolve `[]`.
 */
export function runSequence(inicio: Posicao, comandos: readonly Direcao[], area: Area): Posicao[] {
  const passos: Posicao[] = [];
  let atual = inicio;
  for (const comando of comandos) {
    atual = move(atual, comando, area);
    passos.push(atual);
  }
  return passos;
}

/** Adiciona um comando ao fim da sequência. */
export function adicionarComando(lista: readonly Direcao[], comando: Direcao): Direcao[] {
  return [...lista, comando];
}

/** Remove o comando na posição `indice`. Índice inválido não muda a lista. */
export function removerComando(lista: readonly Direcao[], indice: number): Direcao[] {
  if (indice < 0 || indice >= lista.length) return [...lista];
  return lista.filter((_, i) => i !== indice);
}

/**
 * Troca o comando de lugar com o vizinho: -1 sobe, +1 desce.
 * Movimentos que sairiam da lista não mudam nada.
 */
export function moverComando(
  lista: readonly Direcao[],
  indice: number,
  deslocamento: -1 | 1,
): Direcao[] {
  const destino = indice + deslocamento;
  const copia = [...lista];
  if (indice < 0 || indice >= lista.length || destino < 0 || destino >= lista.length) {
    return copia;
  }
  const atual = copia[indice] as Direcao;
  copia[indice] = copia[destino] as Direcao;
  copia[destino] = atual;
  return copia;
}
