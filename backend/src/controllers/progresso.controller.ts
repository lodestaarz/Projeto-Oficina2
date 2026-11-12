import type { Request, Response } from 'express';
import { HttpError } from '../errors/HttpError.js';
import type { RequisicaoAutenticada } from '../middlewares/autenticar.js';
import { esquemaFaseId, esquemaProgresso } from '../schemas/progresso.schema.js';
import * as servico from '../services/progresso.service.js';

function faseId(req: Request): number {
  const r = esquemaFaseId.safeParse(req.params['faseId'] ?? req.params['id']);
  if (!r.success) throw new HttpError(400, 'Fase inválida');
  return r.data;
}

export function criarProgressoController() {
  return {
    fases(_req: Request, res: Response) {
      res.json(servico.listarFases());
    },
    fase(req: Request, res: Response) {
      res.json(servico.detalharFase(faseId(req)));
    },
    async listar(req: Request, res: Response) {
      res.json(await servico.listarProgresso((req as RequisicaoAutenticada).usuarioId));
    },
    async registrar(req: Request, res: Response) {
      const id = faseId(req);
      const r = esquemaProgresso.safeParse(req.body ?? {});
      if (!r.success)
        throw new HttpError(400, r.error.issues[0]?.message ?? 'Corpo da requisição inválido');
      res.json(
        await servico.registrar(
          (req as RequisicaoAutenticada).usuarioId,
          id,
          r.data.programa,
          r.data.dicasUsadas,
        ),
      );
    },
  };
}
