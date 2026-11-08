import type { Provedor, Usuario } from '@arrowbot/shared';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';

function descreverAcesso(provedores: readonly Provedor[]): string {
  const senha = provedores.includes('senha');
  const google = provedores.includes('google');
  if (senha && google) return 'E-mail e senha, e conta Google';
  if (google) return 'Conta Google';
  if (senha) return 'E-mail e senha';
  return '—';
}

/** Mostra nome, e-mail e forma de acesso do usuário logado (RF05). */
export function PerfilPage() {
  const { carregarPerfil, sair } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState('');

  // Os dados vêm sempre de GET /api/users/me, que usa o dono do token.
  useEffect(() => {
    const controle = new AbortController();
    carregarPerfil(controle.signal)
      .then(setUsuario)
      .catch((e: unknown) => {
        if (controle.signal.aborted) return;
        // 401 já faz logout no AuthContext, e a rota protegida leva ao login.
        if (e instanceof ApiError && e.status !== 401) setErro(e.message);
      });
    return () => controle.abort();
  }, [carregarPerfil]);

  function aoSair() {
    sair();
    navigate('/login', { replace: true });
  }

  return (
    <section className="perfil" aria-labelledby="titulo-perfil">
      <h1 id="titulo-perfil" className="titulo-pagina">
        Meu perfil
      </h1>

      {erro && (
        <p className="erro-formulario" role="alert">
          {erro}
        </p>
      )}

      {!usuario && !erro && (
        <p role="status" className="carregando">
          Carregando perfil…
        </p>
      )}

      {usuario && (
        <div className="cartao-perfil">
          <div className="avatar" aria-hidden="true">
            {usuario.nome.trim().charAt(0).toUpperCase()}
          </div>
          <dl className="dados-perfil">
            <div>
              <dt>Nome</dt>
              <dd>{usuario.nome}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{usuario.email}</dd>
            </div>
            <div>
              <dt>Forma de acesso</dt>
              <dd>{descreverAcesso(usuario.provedores)}</dd>
            </div>
          </dl>
        </div>
      )}

      <button type="button" className="botao botao--secundario" onClick={aoSair}>
        Sair da conta
      </button>
    </section>
  );
}
