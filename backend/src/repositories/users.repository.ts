import type { Provedor, Usuario } from '@arrowbot/shared';
import { pool } from '../database/pool.js';

export interface UsuarioRegistro {
  id: string;
  nome: string;
  email: string;
  senha_hash: string | null;
  google_id: string | null;
}

export function paraUsuario(u: UsuarioRegistro): Usuario {
  const provedores: Provedor[] = [];
  if (u.senha_hash) provedores.push('senha');
  if (u.google_id) provedores.push('google');
  return { id: u.id, nome: u.nome, email: u.email, provedores };
}

export async function buscarPorEmail(email: string): Promise<UsuarioRegistro | null> {
  const r = await pool.query<UsuarioRegistro>('SELECT * FROM usuarios WHERE email = $1', [email]);
  return r.rows[0] ?? null;
}

export async function buscarPorId(id: string): Promise<UsuarioRegistro | null> {
  const r = await pool.query<UsuarioRegistro>('SELECT * FROM usuarios WHERE id = $1', [id]);
  return r.rows[0] ?? null;
}

export async function criarComSenha(nome: string, email: string, senhaHash: string) {
  const r = await pool.query<UsuarioRegistro>(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING *',
    [nome, email, senhaHash],
  );
  return r.rows[0]!;
}

/** Código de erro do Postgres para violação de unicidade. */
export function emailDuplicado(erro: unknown): boolean {
  return (erro as { code?: string } | null)?.code === '23505';
}
