import type { Bloco, Condicao, Programa, Sensor } from '@arrowbot/shared/engine';

export type Linguagem = 'js' | 'python';

const SENSOR_JS: Record<Sensor, string> = {
  obstaculoAFrente: 'obstaculoAFrente()',
  buracoAFrente: 'buracoAFrente()',
  caminhoLivre: 'caminhoLivre()',
  metaAFrente: 'metaAFrente()',
};

const SENSOR_PY: Record<Sensor, string> = {
  obstaculoAFrente: 'obstaculo_a_frente()',
  buracoAFrente: 'buraco_a_frente()',
  caminhoLivre: 'caminho_livre()',
  metaAFrente: 'meta_a_frente()',
};

function condicao(c: Condicao, lang: Linguagem): string {
  if ('variavel' in c) {
    const op = c.op === '=' ? '==' : c.op;
    return `${c.variavel} ${op} ${c.valor}`;
  }
  const base = (lang === 'js' ? SENSOR_JS : SENSOR_PY)[c.sensor];
  if (!c.negado) return base;
  return lang === 'js' ? `!${base}` : `not ${base}`;
}

function linhas(blocos: Bloco[], lang: Linguagem, nivel: number): string[] {
  const rec = '  '.repeat(nivel);
  const saida: string[] = [];
  for (const b of blocos) {
    switch (b.tipo) {
      case 'avancar':
        saida.push(lang === 'js' ? `${rec}avancar();` : `${rec}avancar()`);
        break;
      case 'girar': {
        const fn = b.lado === 'esquerda' ? 'girarEsquerda' : 'girarDireita';
        const fnPy = b.lado === 'esquerda' ? 'girar_esquerda' : 'girar_direita';
        saida.push(lang === 'js' ? `${rec}${fn}();` : `${rec}${fnPy}()`);
        break;
      }
      case 'funcao':
        if (lang === 'js') {
          saida.push(
            `${rec}function ${b.nome}() {`,
            ...linhas(b.corpo, lang, nivel + 1),
            `${rec}}`,
          );
        } else {
          saida.push(`${rec}def ${b.nome}():`, ...corpoPy(b.corpo, nivel + 1));
        }
        break;
      case 'chamar':
        saida.push(lang === 'js' ? `${rec}${b.nome}();` : `${rec}${b.nome}()`);
        break;
      case 'definir':
        saida.push(`${rec}contador = ${b.valor}${lang === 'js' ? ';' : ''}`);
        break;
      case 'somar':
        saida.push(`${rec}contador += ${b.valor}${lang === 'js' ? ';' : ''}`);
        break;
      case 'repetir':
        if (lang === 'js') {
          saida.push(`${rec}for (let i = 0; i < ${b.vezes}; i++) {`);
          saida.push(...linhas(b.corpo, lang, nivel + 1), `${rec}}`);
        } else {
          saida.push(`${rec}for _ in range(${b.vezes}):`);
          saida.push(...corpoPy(b.corpo, nivel + 1));
        }
        break;
      case 'enquanto':
        if (lang === 'js') {
          saida.push(`${rec}while (${condicao(b.condicao, lang)}) {`);
          saida.push(...linhas(b.corpo, lang, nivel + 1), `${rec}}`);
        } else {
          saida.push(`${rec}while ${condicao(b.condicao, lang)}:`);
          saida.push(...corpoPy(b.corpo, nivel + 1));
        }
        break;
      case 'se':
        if (lang === 'js') {
          saida.push(`${rec}if (${condicao(b.condicao, lang)}) {`);
          saida.push(...linhas(b.entao, lang, nivel + 1));
          if (b.senao.length > 0) {
            saida.push(`${rec}} else {`, ...linhas(b.senao, lang, nivel + 1));
          }
          saida.push(`${rec}}`);
        } else {
          saida.push(`${rec}if ${condicao(b.condicao, lang)}:`);
          saida.push(...corpoPy(b.entao, nivel + 1));
          if (b.senao.length > 0) {
            saida.push(`${rec}else:`, ...corpoPy(b.senao, nivel + 1));
          }
        }
        break;
    }
  }
  return saida;
}

/** Em Python um corpo vazio precisa de `pass`. */
function corpoPy(corpo: Bloco[], nivel: number): string[] {
  const l = linhas(corpo, 'python', nivel);
  return l.length > 0 ? l : [`${'  '.repeat(nivel)}pass`];
}

/** Gera o código textual equivalente ao programa de blocos. */
export function gerarCodigo(programa: Programa, lang: Linguagem): string {
  if (programa.length === 0)
    return lang === 'js' ? '// (nenhum bloco ainda)' : '# (nenhum bloco ainda)';
  return linhas(programa, lang, 0).join('\n');
}
