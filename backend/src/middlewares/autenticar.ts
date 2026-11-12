import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/data-source.js';
import { HttpError, MENSAGENS } from '../errors/HttpError.js';

export interface RequisicaoAutenticada extends Request {
  usuarioId: string;
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization ?? '';
  if (!cabecalho.startsWith('Bearer ')) throw new HttpError(401, MENSAGENS.tokenAusente);
  try {
    const { sub } = jwt.verify(cabecalho.slice(7), env.jwtSecret) as { sub?: string };
    if (!sub) throw new Error('sem sub');
    (req as RequisicaoAutenticada).usuarioId = sub;
    next();
  } catch {
    throw new HttpError(401, MENSAGENS.sessaoInvalida);
  }
}
