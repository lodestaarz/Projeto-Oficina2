import type { Usuario } from '@arrowbot/shared';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import { CHAVE_SESSAO } from '../services/sessao';

export const USUARIO_ANA: Usuario = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Ana Lima',
  email: 'ana@ex.com',
  provedores: ['senha'],
};

function base64Url(objeto: unknown): string {
  return btoa(JSON.stringify(objeto)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** JWT sem assinatura válida, só para o front ler o campo `exp`. */
export function tokenFalso(segundosAteExpirar = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + segundosAteExpirar;
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url({ sub: USUARIO_ANA.id, exp })}.assinatura`;
}

export function sessaoValida() {
  return { token: tokenFalso(), usuario: USUARIO_ANA };
}

export function salvarSessaoDeTeste(token: string = tokenFalso()) {
  window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token, usuario: USUARIO_ANA }));
}

export function respostaJson(status: number, corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export interface RotaSimulada {
  metodo: string;
  caminho: string;
  resposta: () => Response;
}

/** Troca o fetch global por um simulado que atende só as rotas informadas. */
export function simularApi(rotas: RotaSimulada[]) {
  const fetchSimulado = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const caminho = String(url).replace(/^\/api/, '');
    const metodo = (init?.method ?? 'GET').toUpperCase();
    const rota = rotas.find((r) => r.metodo === metodo && r.caminho === caminho);
    if (!rota) throw new Error(`Chamada não simulada: ${metodo} ${caminho}`);
    return rota.resposta();
  });
  vi.stubGlobal('fetch', fetchSimulado);
  return fetchSimulado;
}

export function renderizarApp(rota = '/') {
  return render(
    <GoogleOAuthProvider clientId="teste.apps.googleusercontent.com">
      <MemoryRouter initialEntries={[rota]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </GoogleOAuthProvider>,
  );
}
