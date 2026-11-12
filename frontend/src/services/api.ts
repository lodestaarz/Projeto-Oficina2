import type {
  DadosCadastro,
  DadosLogin,
  RespostaAutenticacao,
  RespostaPerfil,
} from '@arrowbot/shared';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function chamar<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown; token?: string; signal?: AbortSignal } = {},
): Promise<T> {
  const resp = await fetch(`${BASE}${caminho}`, {
    method: opcoes.metodo ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}),
    },
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    signal: opcoes.signal,
  });
  const dados = await resp.json().catch(() => null);
  if (!resp.ok) throw new ApiError(resp.status, dados?.error ?? `Erro ${resp.status}`);
  return dados as T;
}

export const authApi = {
  entrar: (d: DadosLogin) =>
    chamar<RespostaAutenticacao>('/auth/login', { metodo: 'POST', corpo: d }),
  cadastrar: (d: DadosCadastro) =>
    chamar<RespostaAutenticacao>('/auth/register', { metodo: 'POST', corpo: d }),
  entrarComGoogle: (credential: string) =>
    chamar<RespostaAutenticacao>('/auth/google', { metodo: 'POST', corpo: { credential } }),
  perfil: (token: string, signal?: AbortSignal) =>
    chamar<RespostaPerfil>('/users/me', { token, signal }),
};

export interface ItemProgresso {
  faseId: number;
  estrelas: number;
  blocos: number;
}

export const progressoApi = {
  listar: (token: string, signal?: AbortSignal) =>
    chamar<{ progresso: ItemProgresso[] }>('/progresso', { token, signal }),
  registrar: (token: string, faseId: number, programa: unknown, dicasUsadas: number) =>
    chamar<{ progresso: ItemProgresso; estrelas: number }>(`/progresso/${faseId}`, {
      metodo: 'PUT',
      corpo: { programa, dicasUsadas },
      token,
    }),
};
