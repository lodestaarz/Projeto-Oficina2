import { z } from 'zod';
import type { Bloco } from '@arrowbot/shared/engine';

const MAX_PROFUNDIDADE = 8;

const condicaoSensor = z
  .object({
    sensor: z.enum(['obstaculoAFrente', 'buracoAFrente', 'caminhoLivre', 'metaAFrente']),
    negado: z.boolean().optional(),
  })
  .strict();

const condicaoComparar = z
  .object({
    variavel: z.enum(['contador', 'itens']),
    op: z.enum(['<', '=', '>']),
    valor: z.number().int().min(-99).max(99),
  })
  .strict();

const condicao = z.union([condicaoSensor, condicaoComparar]);

const valorNumerico = z.number().int().min(-99).max(99);

const id = z.string().min(1).max(64);

function bloco(nivel: number): z.ZodType<Bloco> {
  const corpo: z.ZodType<Bloco[]> =
    nivel >= MAX_PROFUNDIDADE
      ? z.array(z.never()).max(0)
      : z.array(z.lazy(() => bloco(nivel + 1))).max(50);
  return z.union([
    z.object({ id, tipo: z.literal('avancar') }).strict(),
    z.object({ id, tipo: z.literal('girar'), lado: z.enum(['esquerda', 'direita']) }).strict(),
    z
      .object({ id, tipo: z.literal('repetir'), vezes: z.number().int().min(1).max(99), corpo })
      .strict(),
    z.object({ id, tipo: z.literal('definir'), valor: valorNumerico }).strict(),
    z.object({ id, tipo: z.literal('somar'), valor: valorNumerico }).strict(),
    z.object({ id, tipo: z.literal('enquanto'), condicao, corpo }).strict(),
    z.object({ id, tipo: z.literal('se'), condicao, entao: corpo, senao: corpo }).strict(),
  ]) as z.ZodType<Bloco>;
}

export const esquemaProgresso = z.object({
  programa: z.array(bloco(0)).min(1, 'Envie ao menos um bloco').max(50),
  dicasUsadas: z.number().int().min(0).max(10).default(0),
});

export const esquemaFaseId = z.coerce.number().int().min(1, 'Fase inválida');
