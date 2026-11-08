import type { DadosCadastro, DadosLogin, RespostaAutenticacao, Usuario } from '@arrowbot/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, authApi } from '../services/api';
import {
  CHAVE_SESSAO,
  apagarSessao,
  expiracaoDoToken,
  lerSessao,
  salvarSessao,
  tokenExpirado,
} from '../services/sessao';

type EstadoAuth =
  | { status: 'carregando'; token: string; usuario: Usuario }
  | { status: 'anonimo'; token: null; usuario: null }
  | { status: 'autenticado'; token: string; usuario: Usuario };

export interface ValorAuth {
  status: EstadoAuth['status'];
  token: string | null;
  usuario: Usuario | null;
  entrar: (dados: DadosLogin) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  entrarComGoogle: (credential: string) => Promise<void>;
  sair: () => void;
  /** Busca o perfil em GET /api/users/me. Se a sessão não valer mais, faz logout. */
  carregarPerfil: (signal?: AbortSignal) => Promise<Usuario>;
}

const ANONIMO: EstadoAuth = { status: 'anonimo', token: null, usuario: null };
const MAIOR_ESPERA_MS = 2_147_483_647; // limite do setTimeout

const AuthContext = createContext<ValorAuth | null>(null);

function estadoInicial(): EstadoAuth {
  const salva = lerSessao();
  if (!salva || tokenExpirado(salva.token)) {
    apagarSessao();
    return ANONIMO;
  }
  // Há um token guardado: confere com o backend antes de liberar as páginas.
  return { status: 'carregando', ...salva };
}

/** Guarda o token e o usuário logado e oferece login, cadastro e logout (RF01–RF04). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAuth>(estadoInicial);

  const iniciarSessao = useCallback(({ token, usuario }: RespostaAutenticacao) => {
    salvarSessao({ token, usuario });
    setEstado({ status: 'autenticado', token, usuario });
  }, []);

  const sair = useCallback(() => {
    apagarSessao();
    setEstado(ANONIMO);
  }, []);

  // Ao abrir a página com uma sessão salva, confere se o token ainda vale.
  const tokenPendente = estado.status === 'carregando' ? estado.token : null;
  useEffect(() => {
    if (!tokenPendente) return undefined;
    const controle = new AbortController();

    authApi
      .perfil(tokenPendente, controle.signal)
      .then(({ usuario }) => iniciarSessao({ token: tokenPendente, usuario }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return;
        if (erro instanceof ApiError && erro.status === 401) {
          sair();
          return;
        }
        // Servidor fora do ar: o jogo funciona sem a API (RNF04), então
        // mantém a sessão salva até o servidor voltar ou o token vencer.
        setEstado((atual) =>
          atual.status === 'carregando' ? { ...atual, status: 'autenticado' } : atual,
        );
      });

    return () => controle.abort();
  }, [tokenPendente, iniciarSessao, sair]);

  // Sai automaticamente quando o token vence (RN08).
  const tokenAtivo = estado.status === 'autenticado' ? estado.token : null;
  useEffect(() => {
    if (!tokenAtivo) return undefined;
    const expira = expiracaoDoToken(tokenAtivo);
    if (expira === null) return undefined;
    const espera = Math.min(Math.max(expira - Date.now(), 0), MAIOR_ESPERA_MS);
    const id = setTimeout(sair, espera);
    return () => clearTimeout(id);
  }, [tokenAtivo, sair]);

  // Mantém várias abas em sincronia: sair em uma sai em todas.
  useEffect(() => {
    function aoMudarArmazenamento(evento: StorageEvent) {
      if (evento.key !== CHAVE_SESSAO) return;
      const salva = lerSessao();
      if (salva && !tokenExpirado(salva.token)) {
        setEstado({ status: 'autenticado', ...salva });
      } else {
        setEstado(ANONIMO);
      }
    }
    window.addEventListener('storage', aoMudarArmazenamento);
    return () => window.removeEventListener('storage', aoMudarArmazenamento);
  }, []);

  const entrar = useCallback(
    async (dados: DadosLogin) => iniciarSessao(await authApi.entrar(dados)),
    [iniciarSessao],
  );

  const cadastrar = useCallback(
    async (dados: DadosCadastro) => iniciarSessao(await authApi.cadastrar(dados)),
    [iniciarSessao],
  );

  const entrarComGoogle = useCallback(
    async (credential: string) => iniciarSessao(await authApi.entrarComGoogle(credential)),
    [iniciarSessao],
  );

  const token = estado.token;
  const carregarPerfil = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) throw new ApiError(401, 'Sessão não informada');
      try {
        const { usuario } = await authApi.perfil(token, signal);
        iniciarSessao({ token, usuario });
        return usuario;
      } catch (erro) {
        if (erro instanceof ApiError && erro.status === 401) sair();
        throw erro;
      }
    },
    [token, iniciarSessao, sair],
  );

  const valor = useMemo<ValorAuth>(
    () => ({
      status: estado.status,
      token: estado.token,
      usuario: estado.usuario,
      entrar,
      cadastrar,
      entrarComGoogle,
      sair,
      carregarPerfil,
    }),
    [estado, entrar, cadastrar, entrarComGoogle, sair, carregarPerfil],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return valor;
}
