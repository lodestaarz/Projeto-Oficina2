import type { RespostaAutenticacao } from '@arrowbot/shared';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/data-source.js';
import { HttpError, MENSAGENS } from '../errors/HttpError.js';
import * as repo from '../repositories/users.repository.js';

const CUSTO_BCRYPT = env.nodeEnv === 'test' ? 4 : 10;

export function emitirSessao(u: repo.UsuarioRegistro): RespostaAutenticacao {
  const token = jwt.sign({ sub: u.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
  return { token, usuario: repo.paraUsuario(u) };
}

export async function cadastrar(nome: string, email: string, senha: string) {
  const hash = await bcrypt.hash(senha, CUSTO_BCRYPT);
  try {
    return emitirSessao(await repo.criarComSenha(nome, email, hash));
  } catch (erro) {
    if (repo.emailDuplicado(erro)) throw new HttpError(409, MENSAGENS.emailEmUso);
    throw erro;
  }
}

export async function entrar(email: string, senha: string) {
  const u = await repo.buscarPorEmail(email);
  // Compara sempre, para não revelar pelo tempo se o e-mail existe.
  const hash = u?.senha_hash ?? '$2a$04$invalidinvalidinvalidinvaliduQ3Y9s5Qk0Zr8y0o9Zr8y0o9Zr8y0o';
  const ok = await bcrypt.compare(senha, hash);
  if (!u?.senha_hash || !ok) throw new HttpError(401, MENSAGENS.credenciaisInvalidas);
  return emitirSessao(u);
}

export async function perfil(id: string) {
  const u = await repo.buscarPorId(id);
  if (!u) throw new HttpError(401, MENSAGENS.sessaoInvalida);
  return { usuario: repo.paraUsuario(u) };
}
