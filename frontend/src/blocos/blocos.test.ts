import { describe, expect, it } from 'vitest';
import { gerarCodigo } from './codigo';
import { estadoParaPrograma, type EstadoOficina } from './converter';

const estado: EstadoOficina = {
  blocks: {
    blocks: [
      {
        type: 'arrow_inicio',
        id: 'ini',
        next: {
          block: {
            type: 'arrow_repetir',
            id: 'r',
            fields: { VEZES: 3 },
            inputs: {
              CORPO: {
                block: {
                  type: 'arrow_se',
                  id: 's',
                  fields: { COND: '!obstaculoAFrente' },
                  inputs: {
                    ENTAO: { block: { type: 'arrow_avancar', id: 'a' } },
                    SENAO: {
                      block: { type: 'arrow_girar', id: 'g', fields: { LADO: 'esquerda' } },
                    },
                  },
                },
              },
            },
            next: { block: { type: 'arrow_avancar', id: 'z' } },
          },
        },
      },
      { type: 'arrow_avancar', id: 'solto' },
    ],
  },
};

describe('estadoParaPrograma', () => {
  it('converte a cadeia a partir do bloco inicial e ignora blocos soltos', () => {
    const p = estadoParaPrograma(estado);
    expect(p).toHaveLength(2);
    expect(p[0]).toMatchObject({ tipo: 'repetir', vezes: 3, id: 'r' });
    const se = (p[0] as { corpo: unknown[] }).corpo[0];
    expect(se).toMatchObject({
      tipo: 'se',
      condicao: { sensor: 'obstaculoAFrente', negado: true },
      entao: [{ tipo: 'avancar', id: 'a' }],
      senao: [{ tipo: 'girar', lado: 'esquerda' }],
    });
  });

  it('sem bloco inicial usa o primeiro bloco do topo; vazio gera programa vazio', () => {
    expect(
      estadoParaPrograma({ blocks: { blocks: [{ type: 'arrow_avancar', id: 'x' }] } }),
    ).toHaveLength(1);
    expect(estadoParaPrograma({})).toEqual([]);
  });
});

describe('gerarCodigo', () => {
  const p = estadoParaPrograma(estado);

  it('gera JavaScript', () => {
    expect(gerarCodigo(p, 'js')).toBe(
      [
        'for (let i = 0; i < 3; i++) {',
        '  if (!obstaculoAFrente()) {',
        '    avancar();',
        '  } else {',
        '    girarEsquerda();',
        '  }',
        '}',
        'avancar();',
      ].join('\n'),
    );
  });

  it('gera Python', () => {
    expect(gerarCodigo(p, 'python')).toBe(
      [
        'for _ in range(3):',
        '  if not obstaculo_a_frente():',
        '    avancar()',
        '  else:',
        '    girar_esquerda()',
        'avancar()',
      ].join('\n'),
    );
  });

  it('corpo vazio em Python usa pass e programa vazio tem comentário', () => {
    const vazio = estadoParaPrograma({
      blocks: { blocks: [{ type: 'arrow_enquanto', id: 'w', fields: { COND: 'caminhoLivre' } }] },
    });
    expect(gerarCodigo(vazio, 'python')).toBe('while caminho_livre():\n  pass');
    expect(gerarCodigo([], 'js')).toContain('nenhum bloco');
  });
});
