import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export function Layout() {
  const navigate = useNavigate();

  function aoSair() {
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
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>
        <div className="cabecalho-usuario">
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
