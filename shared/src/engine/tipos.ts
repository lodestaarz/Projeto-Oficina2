// Tipos do motor de blocos do ArrowBot (puro: sem DOM, sem I/O). Usado pelo front e pelo back.

/** Direções em sentido horário: 0 = norte (cima), 1 = leste, 2 = sul, 3 = oeste. */
export type Direcao = 0 | 1 | 2 | 3;

export type Sensor = 'obstaculoAFrente' | 'buracoAFrente' | 'caminhoLivre' | 'metaAFrente';

export interface Condicao {
  sensor: Sensor;
  negado?: boolean;
}

export type Bloco =
  | { id: string; tipo: 'avancar' }
  | { id: string; tipo: 'girar'; lado: 'esquerda' | 'direita' }
  | { id: string; tipo: 'repetir'; vezes: number; corpo: Bloco[] }
  | { id: string; tipo: 'enquanto'; condicao: Condicao; corpo: Bloco[] }
  | { id: string; tipo: 'se'; condicao: Condicao; entao: Bloco[]; senao: Bloco[] };

export type TipoBloco = Bloco['tipo'];

export type Programa = Bloco[];

/**
 * Caracteres da grade: '.' chão, '#' parede, 'o' buraco, 'G' meta, 'K' chave, 'D' porta.
 * Fora da grade conta como parede.
 */
export interface Fase {
  id: number;
  titulo: string;
  conceito: string;
  enunciado: string;
  grade: string[];
  inicio: { x: number; y: number; dir: Direcao };
  blocosPermitidos: TipoBloco[];
  sensoresPermitidos: Sensor[];
  /** Número mínimo de blocos de uma solução conhecida (3 estrelas). */
  blocosIdeais: number;
  dicas: string[];
}

export interface Robo {
  x: number;
  y: number;
  dir: Direcao;
}

export type CodigoErro = 'parede' | 'buraco' | 'porta' | 'limite' | 'repetirInvalido';

export interface ErroExecucao {
  codigo: CodigoErro;
  mensagem: string;
  dica: string;
}

/** Um passo da execução; a interface anima um por vez. */
export interface Passo {
  /** Bloco destacado neste passo. */
  blocoId: string;
  robo: Robo;
  temChave: boolean;
  erro?: ErroExecucao;
}

export type StatusExecucao = 'venceu' | 'erro' | 'incompleto';

export interface Resultado {
  status: StatusExecucao;
  passos: Passo[];
  erro?: ErroExecucao;
  mensagem: string;
}
