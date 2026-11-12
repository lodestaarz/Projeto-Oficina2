import type { Bloco, Programa } from './tipos.ts';

// Soluções de referência (usadas nos testes para provar que cada fase tem solução).
let n = 0;
const id = (): string => `s${++n}`;
const av = (): Bloco => ({ id: id(), tipo: 'avancar' });
const gd = (): Bloco => ({ id: id(), tipo: 'girar', lado: 'direita' });
const ge = (): Bloco => ({ id: id(), tipo: 'girar', lado: 'esquerda' });
const rep = (vezes: number, corpo: Bloco[]): Bloco => ({ id: id(), tipo: 'repetir', vezes, corpo });

export function solucaoDaFase(fase: number): Programa {
  switch (fase) {
    case 1:
      return [av(), av(), av(), av()];
    case 2:
      return [av(), gd(), av(), av(), ge(), av()];
    case 3:
      return [gd(), av(), av(), ge(), av(), av(), av(), av()];
    case 4:
      return [rep(9, [av()])];
    case 5:
      return [rep(3, [av(), gd(), av(), ge()])];
    case 6:
      return [rep(5, [av()]), gd(), rep(5, [av()])];
    case 7:
      return [
        rep(8, [
          {
            id: id(),
            tipo: 'se',
            condicao: { sensor: 'obstaculoAFrente' },
            entao: [gd()],
            senao: [av()],
          },
        ]),
      ];
    case 8:
      return [
        rep(8, [
          {
            id: id(),
            tipo: 'se',
            condicao: { sensor: 'buracoAFrente' },
            entao: [gd()],
            senao: [av()],
          },
        ]),
      ];
    case 9:
      return [{ id: id(), tipo: 'enquanto', condicao: { sensor: 'caminhoLivre' }, corpo: [av()] }];
    default:
      return [];
  }
}
