import { describe, expect, it } from 'vitest';
import {
  FASES,
  calcularEstrelas,
  contarBlocos,
  executar,
  solucaoDaFase,
  validarPrograma,
  type Fase,
  type Programa,
} from '../src/engine/index.ts';

const fase = (id: number): Fase => FASES.find((f) => f.id === id)!;

describe('fases do MVP', () => {
  it.each(FASES.map((f) => f.id))(
    'fase %i tem solução de referência válida e com 3 estrelas',
    (id) => {
      const f = fase(id);
      const prog = solucaoDaFase(id);
      expect(validarPrograma(f, prog)).toBeNull();
      const r = executar(f, prog);
      expect(r.status).toBe('venceu');
      expect(contarBlocos(prog)).toBe(f.blocosIdeais);
      expect(calcularEstrelas(f, prog, r, 0)).toBe(3);
    },
  );

  it('cada fase tem 3 dicas e ids únicos', () => {
    expect(new Set(FASES.map((f) => f.id)).size).toBe(FASES.length);
    for (const f of FASES) expect(f.dicas).toHaveLength(3);
  });
});

describe('interpretador', () => {
  const av = (id: string) => ({ id, tipo: 'avancar' as const });

  it('bateu na parede explica o erro', () => {
    const r = executar(fase(2), [av('a'), av('b')]);
    expect(r.status).toBe('erro');
    expect(r.erro?.codigo).toBe('parede');
    expect(r.mensagem).toContain('(2, 0)');
    expect(r.passos.at(-1)?.erro?.codigo).toBe('parede');
  });

  it('fora da grade conta como parede', () => {
    const r = executar(fase(1), [{ id: 'g', tipo: 'girar', lado: 'esquerda' }, av('a')]);
    expect(r.erro?.codigo).toBe('parede');
  });

  it('cai no buraco', () => {
    const r = executar(fase(3), [av('a'), av('b'), av('c')]);
    expect(r.erro?.codigo).toBe('buraco');
  });

  it('porta trancada sem chave', () => {
    const f: Fase = { ...fase(9), grade: ['..D.G'] };
    const r = executar(f, [av('a'), av('b')]);
    expect(r.erro?.codigo).toBe('porta');
  });

  it('programa incompleto não vence', () => {
    const r = executar(fase(1), [av('a')]);
    expect(r.status).toBe('incompleto');
    expect(r.mensagem).toContain('não chegou');
  });

  it('para ao chegar na meta (não executa o resto)', () => {
    const prog: Programa = [...solucaoDaFase(1), av('extra')];
    const r = executar(fase(1), prog);
    expect(r.status).toBe('venceu');
    expect(r.passos).toHaveLength(4);
  });

  it('enquanto infinito é interrompido pelo limite de passos', () => {
    const f: Fase = { ...fase(9), grade: ['.......G'] };
    const prog: Programa = [
      {
        id: 'w',
        tipo: 'enquanto',
        condicao: { sensor: 'obstaculoAFrente', negado: true },
        corpo: [],
      },
    ];
    const r = executar(f, prog);
    expect(r.erro?.codigo).toBe('limite');
  });

  it('repetir com número inválido gera erro', () => {
    const r = executar(fase(4), [{ id: 'r', tipo: 'repetir', vezes: 0, corpo: [av('a')] }]);
    expect(r.erro?.codigo).toBe('repetirInvalido');
  });

  it('é determinístico', () => {
    const p = solucaoDaFase(8);
    expect(executar(fase(8), p)).toEqual(executar(fase(8), p));
  });
});

describe('estrelas e validação', () => {
  it('sem vitória = 0 estrela; com dica = 1; acima do ideal = 2', () => {
    const f = fase(4);
    const ideal = solucaoDaFase(4);
    const r = executar(f, ideal);
    expect(calcularEstrelas(f, ideal, { status: 'erro' }, 0)).toBe(0);
    expect(calcularEstrelas(f, ideal, r, 1)).toBe(1);
    const longo: Programa = Array.from({ length: 9 }, (_, i) => ({
      id: `x${i}`,
      tipo: 'avancar' as const,
    }));
    expect(calcularEstrelas(f, longo, executar(f, longo), 0)).toBe(2);
  });

  it('rejeita bloco e sensor não liberados e ids repetidos', () => {
    expect(validarPrograma(fase(1), [{ id: 'g', tipo: 'girar', lado: 'direita' }])).toMatch(
      /não permitido/,
    );
    const se: Programa = [
      { id: 's', tipo: 'se', condicao: { sensor: 'buracoAFrente' }, entao: [], senao: [] },
    ];
    expect(validarPrograma(fase(7), se)).toMatch(/Sensor/);
    expect(
      validarPrograma(fase(1), [
        { id: 'a', tipo: 'avancar' },
        { id: 'a', tipo: 'avancar' },
      ]),
    ).toMatch(/repetido/);
  });
});
