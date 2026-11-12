import { NOMES_FUNCAO } from './tipos.ts';
import type {
  Bloco,
  Condicao,
  Direcao,
  ErroExecucao,
  Fase,
  Passo,
  Programa,
  Resultado,
  Robo,
} from './tipos.ts';

export const LIMITE_PASSOS = 500;
/** Profundidade máxima de chamadas de função aninhadas (evita recursão infinita). */
export const LIMITE_CHAMADAS = 20;

const DELTAS: Record<Direcao, { dx: number; dy: number }> = {
  0: { dx: 0, dy: -1 },
  1: { dx: 1, dy: 0 },
  2: { dx: 0, dy: 1 },
  3: { dx: -1, dy: 0 },
};

/** Texto da célula; fora da grade é parede. */
export function celula(fase: Fase, x: number, y: number): string {
  return fase.grade[y]?.[x] ?? '#';
}

export function contarBlocos(programa: Programa): number {
  return programa.reduce((total, b) => {
    if (b.tipo === 'repetir' || b.tipo === 'enquanto' || b.tipo === 'funcao')
      return total + 1 + contarBlocos(b.corpo);
    if (b.tipo === 'se') return total + 1 + contarBlocos(b.entao) + contarBlocos(b.senao);
    return total + 1;
  }, 0);
}

class ParadaDeExecucao extends Error {
  readonly erro: ErroExecucao | null;
  constructor(erro: ErroExecucao | null) {
    super('parada');
    this.erro = erro;
  }
}

/** Executa o programa e devolve todos os passos (determinístico; o servidor repete o cálculo). */
export function executar(fase: Fase, programa: Programa): Resultado {
  const robo: Robo = { ...fase.inicio };
  let temChave = false;
  let contador = 0;
  const coletados = new Set<string>();
  const passos: Passo[] = [];
  // Funções são içadas: podem ser chamadas antes da definição.
  const funcoes = new Map<string, Bloco[]>();
  for (const b of programa) if (b.tipo === 'funcao') funcoes.set(b.nome, b.corpo);
  let profundidade = 0;

  const registrar = (blocoId: string, erro?: ErroExecucao): void => {
    if (passos.length >= LIMITE_PASSOS) {
      throw new ParadaDeExecucao({
        codigo: 'limite',
        mensagem: `O programa passou de ${LIMITE_PASSOS} passos.`,
        dica: 'Confira a condição do "enquanto" ou o número de repetições.',
      });
    }
    passos.push({
      blocoId,
      robo: { ...robo },
      temChave,
      itens: coletados.size,
      contador,
      coletados: [...coletados],
      ...(erro ? { erro } : {}),
    });
  };

  const frente = (): { x: number; y: number } => {
    const d = DELTAS[robo.dir];
    return { x: robo.x + d.dx, y: robo.y + d.dy };
  };

  const avaliar = (cond: Condicao): boolean => {
    if ('variavel' in cond) {
      const atual = cond.variavel === 'itens' ? coletados.size : contador;
      return cond.op === '<'
        ? atual < cond.valor
        : cond.op === '>'
          ? atual > cond.valor
          : atual === cond.valor;
    }
    const { sensor, negado } = cond;
    const f = frente();
    const c = celula(fase, f.x, f.y);
    const bloqueado = c === '#' || (c === 'D' && !temChave);
    let valor: boolean;
    switch (sensor) {
      case 'obstaculoAFrente':
        valor = bloqueado;
        break;
      case 'buracoAFrente':
        valor = c === 'o';
        break;
      case 'metaAFrente':
        valor = c === 'G';
        break;
      case 'caminhoLivre':
        valor = !bloqueado && c !== 'o';
        break;
    }
    return negado ? !valor : valor;
  };

  const falhar = (blocoId: string, erro: ErroExecucao): never => {
    registrar(blocoId, erro);
    throw new ParadaDeExecucao(erro);
  };

  const venceu = (): boolean =>
    celula(fase, robo.x, robo.y) === 'G' && coletados.size >= (fase.itensMeta ?? 0);

  const rodar = (blocos: Bloco[]): void => {
    for (const bloco of blocos) {
      switch (bloco.tipo) {
        case 'girar': {
          const passo = bloco.lado === 'direita' ? 1 : 3;
          robo.dir = ((robo.dir + passo) % 4) as Direcao;
          registrar(bloco.id);
          break;
        }
        case 'avancar': {
          const f = frente();
          const c = celula(fase, f.x, f.y);
          if (c === '#') {
            falhar(bloco.id, {
              codigo: 'parede',
              mensagem: `O robô bateu na parede na célula (${f.x}, ${f.y}).`,
              dica: 'Use "se obstáculo à frente" antes de avançar, ou gire.',
            });
          }
          if (c === 'D' && !temChave) {
            falhar(bloco.id, {
              codigo: 'porta',
              mensagem: 'A porta está trancada. Pegue a chave primeiro.',
              dica: 'Passe pela chave antes de ir à porta.',
            });
          }
          robo.x = f.x;
          robo.y = f.y;
          if (c === 'K') temChave = true;
          if (c === 'I') coletados.add(`${f.x},${f.y}`);
          if (c === 'o') {
            falhar(bloco.id, {
              codigo: 'buraco',
              mensagem: 'O robô caiu em um buraco.',
              dica: 'Gire antes ou use o sensor de buraco.',
            });
          }
          registrar(bloco.id);
          if (venceu()) throw new ParadaDeExecucao(null);
          break;
        }
        case 'funcao':
          break; // só define; não gasta passo
        case 'chamar': {
          registrar(bloco.id);
          const corpo = funcoes.get(bloco.nome);
          if (!corpo) {
            throw new ParadaDeExecucao({
              codigo: 'funcaoInvalida',
              mensagem: `A função ${bloco.nome} não foi definida.`,
              dica: 'Defina a função com o bloco "função" antes de chamá-la.',
            });
          }
          if (profundidade >= LIMITE_CHAMADAS) {
            throw new ParadaDeExecucao({
              codigo: 'funcaoInvalida',
              mensagem: 'Chamadas de função demais, uma dentro da outra.',
              dica: 'Uma função não deve chamar a si mesma sem parar.',
            });
          }
          profundidade++;
          rodar(corpo);
          profundidade--;
          break;
        }
        case 'definir':
          contador = bloco.valor;
          registrar(bloco.id);
          break;
        case 'somar':
          contador += bloco.valor;
          registrar(bloco.id);
          break;
        case 'repetir': {
          registrar(bloco.id);
          if (!Number.isInteger(bloco.vezes) || bloco.vezes < 1 || bloco.vezes > 99) {
            throw new ParadaDeExecucao({
              codigo: 'repetirInvalido',
              mensagem: 'O número de repetições deve estar entre 1 e 99.',
              dica: 'Troque o número do bloco "repetir".',
            });
          }
          for (let i = 0; i < bloco.vezes; i++) rodar(bloco.corpo);
          break;
        }
        case 'enquanto': {
          while (true) {
            registrar(bloco.id);
            if (!avaliar(bloco.condicao)) break;
            rodar(bloco.corpo);
          }
          break;
        }
        case 'se': {
          registrar(bloco.id);
          rodar(avaliar(bloco.condicao) ? bloco.entao : bloco.senao);
          break;
        }
      }
    }
  };

  let erro: ErroExecucao | undefined;
  try {
    rodar(programa);
  } catch (e) {
    if (!(e instanceof ParadaDeExecucao)) throw e;
    erro = e.erro ?? undefined;
  }

  if (erro) {
    return { status: 'erro', passos, erro, mensagem: erro.mensagem };
  }
  if (venceu()) {
    return { status: 'venceu', passos, mensagem: 'Você chegou na meta!' };
  }
  const faltam = (fase.itensMeta ?? 0) - coletados.size;
  if (faltam > 0 && celula(fase, robo.x, robo.y) === 'G') {
    return {
      status: 'incompleto',
      passos,
      mensagem: `Você chegou na meta, mas ainda faltam ${faltam} item(ns) para coletar.`,
    };
  }
  return {
    status: 'incompleto',
    passos,
    mensagem: 'O programa acabou, mas o robô não chegou na meta.',
  };
}

/** 1 estrela: venceu · 2: sem usar dicas · 3: sem dicas e com no máximo os blocos ideais. */
export function calcularEstrelas(
  fase: Fase,
  programa: Programa,
  resultado: Pick<Resultado, 'status'>,
  dicasUsadas: number,
): 0 | 1 | 2 | 3 {
  if (resultado.status !== 'venceu') return 0;
  if (dicasUsadas > 0) return 1;
  return contarBlocos(programa) <= fase.blocosIdeais ? 3 : 2;
}

/** Programa é permitido na fase? (blocos e sensores liberados) */
export function validarPrograma(fase: Fase, programa: Programa): string | null {
  const ids = new Set<string>();
  const nomes = new Set<string>();
  const topo = new Set<Bloco>(programa);
  const visitar = (blocos: Bloco[]): string | null => {
    for (const b of blocos) {
      if (ids.has(b.id)) return `Bloco com id repetido: ${b.id}`;
      ids.add(b.id);
      if (!fase.blocosPermitidos.includes(b.tipo))
        return `Bloco não permitido nesta fase: ${b.tipo}`;
      if ('condicao' in b) {
        const c = b.condicao;
        if ('variavel' in c) {
          if (!(fase.variaveisPermitidas ?? []).includes(c.variavel))
            return `Variável não permitida nesta fase: ${c.variavel}`;
        } else if (!fase.sensoresPermitidos.includes(c.sensor)) {
          return `Sensor não permitido nesta fase: ${c.sensor}`;
        }
      }
      if (b.tipo === 'funcao') {
        if (!topo.has(b)) return 'Função só pode ser definida no nível principal';
        if (nomes.has(b.nome)) return `Função repetida: ${b.nome}`;
        nomes.add(b.nome);
      }
      if ((b.tipo === 'funcao' || b.tipo === 'chamar') && !NOMES_FUNCAO.includes(b.nome))
        return `Nome de função inválido: ${String(b.nome)}`;
      const filhos =
        b.tipo === 'repetir' || b.tipo === 'enquanto' || b.tipo === 'funcao'
          ? [b.corpo]
          : b.tipo === 'se'
            ? [b.entao, b.senao]
            : [];
      for (const f of filhos) {
        const r = visitar(f);
        if (r) return r;
      }
    }
    return null;
  };
  return visitar(programa);
}
