import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

export function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  function aoSair() {
    sair();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="cabecalho">
        <Logo />
        <nav className="cabecalho-nav" aria-label="Principal">
          <NavLink to="/" end>
            Jogo
          </NavLink>
          <NavLink to="/fases">Fases</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>
        <div className="cabecalho-usuario">
          {usuario && <span className="cabecalho-nome">Olá, {usuario.nome.split(' ')[0]}!</span>}
          <button type="button" className="botao botao--fantasma" onClick={aoSair}>
            Sair
          </button>
        </div>
      </header>
      <main id="conteudo" className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
