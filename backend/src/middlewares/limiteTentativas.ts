import type { NextFunction, Request, Response } from 'express';
import { HttpError, MENSAGENS } from '../errors/HttpError.js';

interface Opcoes {
  /** Máximo de requisições por janela e por IP. */
  maximo: number;
  janelaMs: number;
}

/** Limitador simples em memória (por IP) para rotas de login e cadastro. */
export function limiteTentativas({ maximo, janelaMs }: Opcoes) {
  const contagens = new Map<string, { total: number; expira: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const agora = Date.now();
    const chave = req.ip ?? 'desconhecido';
    let atual = contagens.get(chave);
    if (!atual || atual.expira <= agora) {
      atual = { total: 0, expira: agora + janelaMs };
      contagens.set(chave, atual);
    }
    atual.total += 1;

    if (contagens.size > 10_000) {
      for (const [k, v] of contagens) if (v.expira <= agora) contagens.delete(k);
    }

    if (atual.total > maximo) {
      res.setHeader('Retry-After', String(Math.ceil((atual.expira - agora) / 1000)));
      throw new HttpError(429, MENSAGENS.muitasTentativas);
    }
    next();
  };
}
