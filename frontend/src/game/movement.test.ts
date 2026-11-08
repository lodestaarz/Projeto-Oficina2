import { describe, expect, it } from 'vitest';
import { AREA } from './config';
import { direcaoDaTecla, isDirecao, move } from './movement';

// Grade padrão de 8 × 8: coordenadas de (0, 0) a (7, 7).

describe('move', () => {
  it('CT-MOV-01: move o personagem uma célula na direção indicada', () => {
    expect(move({ x: 2, y: 2 }, 'up', AREA)).toEqual({ x: 2, y: 1 });
    expect(move({ x: 2, y: 2 }, 'down', AREA)).toEqual({ x: 2, y: 3 });
    expect(move({ x: 2, y: 2 }, 'left', AREA)).toEqual({ x: 1, y: 2 });
    expect(move({ x: 2, y: 2 }, 'right', AREA)).toEqual({ x: 3, y: 2 });
  });

  it('CT-MOV-02: fica parado nos cantos', () => {
    expect(move({ x: 0, y: 0 }, 'up', AREA)).toEqual({ x: 0, y: 0 });
    expect(move({ x: 0, y: 0 }, 'left', AREA)).toEqual({ x: 0, y: 0 });
    expect(move({ x: 7, y: 7 }, 'down', AREA)).toEqual({ x: 7, y: 7 });
    expect(move({ x: 7, y: 7 }, 'right', AREA)).toEqual({ x: 7, y: 7 });
    expect(move({ x: 7, y: 0 }, 'up', AREA)).toEqual({ x: 7, y: 0 });
    expect(move({ x: 7, y: 0 }, 'right', AREA)).toEqual({ x: 7, y: 0 });
    expect(move({ x: 0, y: 7 }, 'down', AREA)).toEqual({ x: 0, y: 7 });
    expect(move({ x: 0, y: 7 }, 'left', AREA)).toEqual({ x: 0, y: 7 });
  });

  it('CT-MOV-03: ignora direções desconhecidas', () => {
    expect(move({ x: 1, y: 1 }, 'diagonal', AREA)).toEqual({ x: 1, y: 1 });
    expect(move({ x: 1, y: 1 }, '', AREA)).toEqual({ x: 1, y: 1 });
    expect(move({ x: 1, y: 1 }, undefined as unknown as string, AREA)).toEqual({ x: 1, y: 1 });
    // Nomes herdados de Object não podem virar direções
    expect(move({ x: 1, y: 1 }, 'toString', AREA)).toEqual({ x: 1, y: 1 });
  });

  it('CT-MOV-04: fica parado nas bordas fora dos cantos', () => {
    expect(move({ x: 3, y: 0 }, 'up', AREA)).toEqual({ x: 3, y: 0 });
    expect(move({ x: 0, y: 3 }, 'left', AREA)).toEqual({ x: 0, y: 3 });
    expect(move({ x: 3, y: 7 }, 'down', AREA)).toEqual({ x: 3, y: 7 });
    expect(move({ x: 7, y: 3 }, 'right', AREA)).toEqual({ x: 7, y: 3 });
  });

  it('valor-limite: chega à última coluna e à última linha', () => {
    expect(move({ x: 6, y: 3 }, 'right', AREA)).toEqual({ x: 7, y: 3 });
    expect(move({ x: 3, y: 6 }, 'down', AREA)).toEqual({ x: 3, y: 7 });
  });

  it('funciona com áreas de outro tamanho', () => {
    const area = { columns: 5, rows: 5 };
    expect(move({ x: 4, y: 4 }, 'right', area)).toEqual({ x: 4, y: 4 });
    expect(move({ x: 3, y: 4 }, 'right', area)).toEqual({ x: 4, y: 4 });
  });

  it('não altera o objeto de posição recebido', () => {
    const origem = { x: 2, y: 2 };
    move(origem, 'right', AREA);
    expect(origem).toEqual({ x: 2, y: 2 });
  });
});

describe('isDirecao e direcaoDaTecla', () => {
  it('reconhece só as quatro direções', () => {
    expect(['up', 'down', 'left', 'right'].every(isDirecao)).toBe(true);
    expect(isDirecao('diagonal')).toBe(false);
    expect(isDirecao('constructor')).toBe(false);
    expect(isDirecao(1)).toBe(false);
  });

  it('mapeia as setas do teclado e ignora outras teclas', () => {
    expect(direcaoDaTecla('ArrowUp')).toBe('up');
    expect(direcaoDaTecla('ArrowDown')).toBe('down');
    expect(direcaoDaTecla('ArrowLeft')).toBe('left');
    expect(direcaoDaTecla('ArrowRight')).toBe('right');
    expect(direcaoDaTecla('a')).toBeNull();
    expect(direcaoDaTecla('Enter')).toBeNull();
    expect(direcaoDaTecla('toString')).toBeNull();
  });
});
