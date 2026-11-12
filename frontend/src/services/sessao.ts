import type { Usuario } from '@arrowbot/shared';

export const CHAVE_SESSAO = 'arrowbot.sessao';
export interface Sessao {
  token: string;
  usuario: Usuario;
}

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}
export function salvarSessao(s: Sessao) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
  } catch {
    /* ignora */
  }
}
export function apagarSessao() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    /* ignora */
  }
}

/** Data de expiração (ms) lida do campo exp do JWT, ou null. */
export function expiracaoDoToken(token: string): number | null {
  try {
    const p = JSON.parse(atob((token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')));
    return typeof p.exp === 'number' ? p.exp * 1000 : null;
  } catch {
    return null;
  }
}
export function tokenExpirado(token: string): boolean {
  const e = expiracaoDoToken(token);
  return e !== null && e <= Date.now();
}
