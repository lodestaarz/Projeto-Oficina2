// Regras de movimentação do personagem, mantidas fora dos componentes
// para que possam ser testadas isoladamente (RNF07).
import type { Area, Direcao, Posicao } from '@arrowbot/shared';

export type { Area, Direcao, Posicao };

export interface Deslocamento {
  dx: number;
  dy: number;
}

export const DIRECTIONS: Readonly<Record<Direcao, Deslocamento>> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const KEY_TO_DIRECTION: Readonly<Record<string, Direcao>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Confere se um valor qualquer é uma das quatro direções. */
export function isDirecao(valor: unknown): valor is Direcao {
  return typeof valor === 'string' && Object.hasOwn(DIRECTIONS, valor);
}

/** Direção correspondente a uma tecla, ou `null` se a tecla não for uma seta. */
export function direcaoDaTecla(tecla: string): Direcao | null {
  return Object.hasOwn(KEY_TO_DIRECTION, tecla) ? (KEY_TO_DIRECTION[tecla] ?? null) : null;
}

/** Duas posições representam a mesma célula? */
export function mesmaPosicao(a: Posicao, b: Posicao): boolean {
  return a.x === b.x && a.y === b.y;
}

/** A posição está dentro da área? */
export function dentroDaArea(posicao: Posicao, area: Area): boolean {
  return posicao.x >= 0 && posicao.x < area.columns && posicao.y >= 0 && posicao.y < area.rows;
}

/**
 * Calcula a próxima posição do personagem sem deixá-lo sair da área (RN03, RN04).
 * Um comando que sairia da grade, ou uma direção desconhecida, devolve a
 * mesma posição recebida.
 *
 * @param position posição atual
 * @param direction direção do comando (valores desconhecidos são ignorados)
 * @param area tamanho da área delimitada
 */
export function move(position: Posicao, direction: Direcao | string, area: Area): Posicao {
  if (!isDirecao(direction)) return position;

  const { dx, dy } = DIRECTIONS[direction];
  const destino = { x: position.x + dx, y: position.y + dy };

  return dentroDaArea(destino, area) ? destino : position;
}
