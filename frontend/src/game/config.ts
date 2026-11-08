// Constantes do jogo e textos de cada comando.
import type { Area, Direcao, Posicao } from './movement';

/** Grade de 8 colunas por 8 linhas (RN01). */
export const AREA: Area = { columns: 8, rows: 8 };

/** Canto superior esquerdo (RN02). */
export const POSICAO_INICIAL: Posicao = { x: 0, y: 0 };

export interface InfoComando {
  direcao: Direcao;
  nome: string;
  seta: string;
}

export const COMANDOS: Readonly<Record<Direcao, InfoComando>> = {
  up: { direcao: 'up', nome: 'Cima', seta: '↑' },
  down: { direcao: 'down', nome: 'Baixo', seta: '↓' },
  left: { direcao: 'left', nome: 'Esquerda', seta: '←' },
  right: { direcao: 'right', nome: 'Direita', seta: '→' },
};

/** Ordem em que os botões de direção aparecem. */
export const ORDEM_DOS_COMANDOS: readonly Direcao[] = ['up', 'left', 'down', 'right'];

/** Velocidades de execução da sequência (pausa entre passos, em ms). */
export const VELOCIDADES = [
  { id: 'devagar', rotulo: 'Devagar', pausaMs: 1000 },
  { id: 'normal', rotulo: 'Normal', pausaMs: 600 },
  { id: 'rapido', rotulo: 'Rápido', pausaMs: 300 },
] as const;

export type IdVelocidade = (typeof VELOCIDADES)[number]['id'];

export const VELOCIDADE_PADRAO: IdVelocidade = 'normal';

export function pausaDaVelocidade(id: IdVelocidade): number {
  return VELOCIDADES.find((v) => v.id === id)?.pausaMs ?? 600;
}

/** Texto padrão de posição, ex.: "Posição: (2, 3)" (RF07). */
export function textoPosicao({ x, y }: Posicao): string {
  return `Posição: (${x}, ${y})`;
}
