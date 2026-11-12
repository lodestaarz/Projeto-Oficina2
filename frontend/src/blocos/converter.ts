import type { Bloco, Condicao, Programa, Sensor, Variavel } from '@arrowbot/shared/engine';

/** Subconjunto do JSON de `Blockly.serialization.workspaces.save` que o ArrowBot usa. */
export interface BlocoSerializado {
  type: string;
  id?: string;
  fields?: Record<string, string | number | boolean>;
  inputs?: Record<string, { block?: BlocoSerializado } | undefined>;
  next?: { block?: BlocoSerializado };
}

export interface EstadoOficina {
  blocks?: { blocks?: BlocoSerializado[] };
}

const SENSORES: readonly Sensor[] = [
  'obstaculoAFrente',
  'buracoAFrente',
  'caminhoLivre',
  'metaAFrente',
];

/** Condição vem do dropdown como `sensor` ou `!sensor` (negado). */
export function lerCondicao(valor: unknown, limite?: unknown): Condicao {
  const texto = typeof valor === 'string' ? valor : '';
  const cmp = /^(contador|itens)([<=>])$/.exec(texto);
  if (cmp) {
    return {
      variavel: cmp[1] as Variavel,
      op: cmp[2] as '<' | '=' | '>',
      valor: Number(limite) || 0,
    };
  }
  const negado = texto.startsWith('!');
  const sensor = (negado ? texto.slice(1) : texto) as Sensor;
  return { sensor: SENSORES.includes(sensor) ? sensor : 'obstaculoAFrente', negado };
}

function cadeia(inicio: BlocoSerializado | undefined): Bloco[] {
  const lista: Bloco[] = [];
  for (let b = inicio; b; b = b.next?.block) {
    const convertido = converterBloco(b);
    if (convertido) lista.push(convertido);
  }
  return lista;
}

function converterBloco(b: BlocoSerializado): Bloco | null {
  const id = b.id ?? `${b.type}-${Math.random().toString(36).slice(2, 8)}`;
  const campo = (nome: string) => b.fields?.[nome];
  const entrada = (nome: string) => cadeia(b.inputs?.[nome]?.block);
  switch (b.type) {
    case 'arrow_avancar':
      return { id, tipo: 'avancar' };
    case 'arrow_girar':
      return { id, tipo: 'girar', lado: campo('LADO') === 'esquerda' ? 'esquerda' : 'direita' };
    case 'arrow_repetir':
      return { id, tipo: 'repetir', vezes: Number(campo('VEZES')), corpo: entrada('CORPO') };
    case 'arrow_definir':
      return { id, tipo: 'definir', valor: Number(campo('VALOR')) || 0 };
    case 'arrow_somar':
      return { id, tipo: 'somar', valor: Number(campo('VALOR')) || 0 };
    case 'arrow_enquanto':
      return {
        id,
        tipo: 'enquanto',
        condicao: lerCondicao(campo('COND'), campo('VALOR')),
        corpo: entrada('CORPO'),
      };
    case 'arrow_se':
      return {
        id,
        tipo: 'se',
        condicao: lerCondicao(campo('COND'), campo('VALOR')),
        entao: entrada('ENTAO'),
        senao: entrada('SENAO'),
      };
    default:
      return null;
  }
}

/**
 * Converte o estado da oficina em `Programa`. Só o bloco "quando executar" (ou o primeiro
 * bloco solto no topo) inicia a execução; os demais blocos soltos são ignorados.
 */
export function estadoParaPrograma(estado: EstadoOficina): Programa {
  const topo = estado.blocks?.blocks ?? [];
  const raiz = topo.find((b) => b.type === 'arrow_inicio');
  if (raiz) return cadeia(raiz.next?.block);
  return cadeia(topo[0]);
}
