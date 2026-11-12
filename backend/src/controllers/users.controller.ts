import type { Request, Response } from 'express';
import { HttpError, MENSAGENS } from '../errors/HttpError.js';
import type { RequisicaoAutenticada } from '../middlewares/autenticar.js';
import { esquemaCadastro, esquemaLogin } from '../schemas/auth.schema.js';
import * as auth from '../services/auth.service.js';

function validar<T>(esquema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } }, corpo: unknown): T {
  const r = esquema.safeParse(corpo ?? {});
  if (!r.success) throw new HttpError(400, r.error.issues[0]?.message ?? MENSAGENS.corpoInvalido);
  return r.data;
}

export function criarUsersController() {
  return {
    async cadastrar(req: Request, res: Response) {
      const { nome, email, senha } = validar(esquemaCadastro, req.body);
      res.status(201).json(await auth.cadastrar(nome, email, senha));
    },
    async entrar(req: Request, res: Response) {
      const { email, senha } = validar(esquemaLogin, req.body);
      res.json(await auth.entrar(email, senha));
    },
    async google(_req: Request, _res: Response) {
      // Implementado na Etapa 2.
      throw new HttpError(501, MENSAGENS.googleNaoConfigurado);
    },
    async perfil(req: Request, res: Response) {
      res.json(await auth.perfil((req as RequisicaoAutenticada).usuarioId));
    },
  };
}
