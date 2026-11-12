import type { Bloco, Programa } from './tipos.ts';

// Soluções de referência (usadas nos testes para provar que cada fase tem solução).
let n = 0;
const id = (): string => `s${++n}`;
const av = (): Bloco => ({ id: id(), tipo: 'avancar' });
const gd = (): Bloco => ({ id: id(), tipo: 'girar', lado: 'direita' });
const ge = (): Bloco => ({ id: id(), tipo: 'girar', lado: 'esquerda' });
const rep = (vezes: number, corpo: Bloco[]): Bloco => ({ id: id(), tipo: 'repetir', vezes, corpo });

const fn = (corpo: Bloco[]): Bloco => ({ id: id(), tipo: 'funcao', nome: 'A', corpo });
const ch = (): Bloco => ({ id: id(), tipo: 'chamar', nome: 'A' });

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
    case 10:
      return [
        {
          id: id(),
          tipo: 'enquanto',
          condicao: { sensor: 'metaAFrente', negado: true },
          corpo: [av()],
        },
        av(),
      ];
    case 11:
      return [
        { id: id(), tipo: 'enquanto', condicao: { sensor: 'caminhoLivre' }, corpo: [av()] },
        gd(),
        av(),
        av(),
        gd(),
        { id: id(), tipo: 'enquanto', condicao: { sensor: 'caminhoLivre' }, corpo: [av()] },
      ];
    case 12:
      return [
        {
          id: id(),
          tipo: 'enquanto',
          condicao: { sensor: 'metaAFrente', negado: true },
          corpo: [
            {
              id: id(),
              tipo: 'se',
              condicao: { sensor: 'obstaculoAFrente' },
              entao: [gd()],
              senao: [av()],
            },
          ],
        },
        av(),
      ];
    case 13:
      return [
        {
          id: id(),
          tipo: 'enquanto',
          condicao: { variavel: 'itens', op: '<', valor: 3 },
          corpo: [av()],
        },
        av(),
        av(),
      ];
    case 14:
      return [
        { id: id(), tipo: 'definir', valor: 0 },
        rep(9, [
          av(),
          { id: id(), tipo: 'somar', valor: 1 },
          {
            id: id(),
            tipo: 'se',
            condicao: { variavel: 'contador', op: '=', valor: 3 },
            entao: [gd(), { id: id(), tipo: 'definir', valor: 0 }],
            senao: [],
          },
        ]),
      ];
    case 15:
      return [
        {
          id: id(),
          tipo: 'enquanto',
          condicao: { variavel: 'itens', op: '<', valor: 3 },
          corpo: [
            {
              id: id(),
              tipo: 'se',
              condicao: { sensor: 'obstaculoAFrente' },
              entao: [gd()],
              senao: [av()],
            },
          ],
        },
        { id: id(), tipo: 'enquanto', condicao: { sensor: 'caminhoLivre' }, corpo: [av()] },
      ];
    case 16:
      return [fn([av(), gd(), av(), ge()]), ch(), ch(), ch()];
    case 17:
      return [fn([rep(2, [av()]), gd()]), rep(3, [ch()]), av()];
    case 18:
      return [
        fn([
          {
            id: id(),
            tipo: 'se',
            condicao: { sensor: 'obstaculoAFrente' },
            entao: [gd()],
            senao: [av()],
          },
        ]),
        rep(10, [ch()]),
      ];
    default:
      return [];
  }
}
