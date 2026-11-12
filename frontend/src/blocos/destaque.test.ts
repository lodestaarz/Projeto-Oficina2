import { describe, expect, it } from 'vitest';
import { blocoParaDestacar } from './destaque';

describe('blocoParaDestacar', () => {
  it('destaca o bloco do passo em andamento', () => {
    expect(blocoParaDestacar({ blocoId: 'b2' }, false)).toBe('b2');
  });
  it('limpa o destaque ao terminar a execução', () => {
    expect(blocoParaDestacar({ blocoId: 'b1' }, true)).toBeNull();
  });
  it('sem passo, não destaca nada', () => {
    expect(blocoParaDestacar(undefined, false)).toBeNull();
  });
});
