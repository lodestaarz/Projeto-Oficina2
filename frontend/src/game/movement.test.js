import { describe, expect, it } from 'vitest';
import { move } from './movement.js';

const area = { columns: 5, rows: 5 };

describe('move', () => {
  it('move o personagem na direção indicada', () => {
    expect(move({ x: 2, y: 2 }, 'up', area)).toEqual({ x: 2, y: 1 });
    expect(move({ x: 2, y: 2 }, 'down', area)).toEqual({ x: 2, y: 3 });
    expect(move({ x: 2, y: 2 }, 'left', area)).toEqual({ x: 1, y: 2 });
    expect(move({ x: 2, y: 2 }, 'right', area)).toEqual({ x: 3, y: 2 });
  });

  it('impede que o personagem ultrapasse os limites da área', () => {
    expect(move({ x: 0, y: 0 }, 'up', area)).toEqual({ x: 0, y: 0 });
    expect(move({ x: 0, y: 0 }, 'left', area)).toEqual({ x: 0, y: 0 });
    expect(move({ x: 4, y: 4 }, 'down', area)).toEqual({ x: 4, y: 4 });
    expect(move({ x: 4, y: 4 }, 'right', area)).toEqual({ x: 4, y: 4 });
  });

  it('ignora direções desconhecidas', () => {
    expect(move({ x: 1, y: 1 }, 'diagonal', area)).toEqual({ x: 1, y: 1 });
  });
});
