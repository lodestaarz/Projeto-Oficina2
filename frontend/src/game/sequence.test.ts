import { describe, expect, it } from 'vitest';
import { AREA } from './config';
import { adicionarComando, moverComando, removerComando, runSequence } from './sequence';

describe('runSequence', () => {
  it('CT-SEQ-01: executa os comandos na ordem', () => {
    expect(runSequence({ x: 0, y: 0 }, ['right', 'right', 'down'], AREA)).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
    ]);
  });

  it('CT-SEQ-02: ignora o comando que bate na borda e segue para o próximo', () => {
    expect(runSequence({ x: 0, y: 0 }, ['up', 'right'], AREA)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('CT-SEQ-03: sequência vazia devolve lista vazia', () => {
    expect(runSequence({ x: 3, y: 3 }, [], AREA)).toEqual([]);
  });

  it('parte da posição atual, não da inicial', () => {
    expect(runSequence({ x: 5, y: 4 }, ['left', 'up'], AREA)).toEqual([
      { x: 4, y: 4 },
      { x: 4, y: 3 },
    ]);
  });

  it('para no canto mesmo com vários comandos para fora', () => {
    const passos = runSequence({ x: 6, y: 7 }, ['right', 'right', 'right', 'down'], AREA);
    expect(passos.at(-1)).toEqual({ x: 7, y: 7 });
    expect(passos).toHaveLength(4);
  });
});

describe('edição da sequência', () => {
  it('CT-SEQ-05: adiciona ao fim', () => {
    expect(adicionarComando(adicionarComando([], 'right'), 'down')).toEqual(['right', 'down']);
  });

  it('CT-SEQ-06: remove o item indicado', () => {
    expect(removerComando(['right', 'down', 'left'], 1)).toEqual(['right', 'left']);
  });

  it('remover com índice inválido não muda a lista', () => {
    expect(removerComando(['right'], 5)).toEqual(['right']);
    expect(removerComando(['right'], -1)).toEqual(['right']);
  });

  it('CT-SEQ-07: reordena para cima e para baixo', () => {
    expect(moverComando(['right', 'down'], 1, -1)).toEqual(['down', 'right']);
    expect(moverComando(['right', 'down', 'left'], 0, 1)).toEqual(['down', 'right', 'left']);
  });

  it('não move além das pontas da lista', () => {
    expect(moverComando(['right', 'down'], 0, -1)).toEqual(['right', 'down']);
    expect(moverComando(['right', 'down'], 1, 1)).toEqual(['right', 'down']);
  });

  it('não altera a lista original', () => {
    const original = ['right', 'down'] as const;
    moverComando(original, 0, 1);
    removerComando(original, 0);
    adicionarComando(original, 'up');
    expect(original).toEqual(['right', 'down']);
  });
});
