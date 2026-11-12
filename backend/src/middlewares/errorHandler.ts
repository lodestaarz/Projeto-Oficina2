// Respostas de erro padronizadas em JSON: { "error": "mensagem" }
import type { NextFunction, Request, Response } from 'express';
import { HttpError, MENSAGENS } from '../errors/HttpError.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: MENSAGENS.rotaNaoEncontrada });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // JSON malformado no corpo da requisição
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: MENSAGENS.corpoInvalido });
    return;
  }
  console.error(err);
  res.status(500).json({ error: MENSAGENS.erroInterno });
}
