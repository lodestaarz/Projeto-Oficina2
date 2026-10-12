// Regras de movimentação do personagem, mantidas fora dos componentes
// para que possam ser testadas isoladamente.

export const DIRECTIONS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/**
 * Calcula a próxima posição do personagem sem deixá-lo sair da área.
 * @param {{x: number, y: number}} position posição atual
 * @param {'up'|'down'|'left'|'right'} direction direção do comando
 * @param {{columns: number, rows: number}} area tamanho da área delimitada
 * @returns {{x: number, y: number}} nova posição (igual à atual se bater no limite)
 */
export function move(position, direction, area) {
  const delta = DIRECTIONS[direction];
  if (!delta) return position;

  const x = position.x + delta.dx;
  const y = position.y + delta.dy;

  const insideArea = x >= 0 && x < area.columns && y >= 0 && y < area.rows;
  return insideArea ? { x, y } : position;
}
