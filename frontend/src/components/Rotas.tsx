import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Carregando() {
  return (
    <div className="carregando" role="status">
      Carregando…
    </div>
  );
}

/** Páginas internas: sem sessão válida, leva ao login (RF04). */
export function RotaProtegida() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'carregando') return <Carregando />;
  if (status === 'anonimo') {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login e cadastro: quem já está logado vai direto para o jogo. */
export function RotaPublica() {
  const { status } = useAuth();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? '/';

  if (status === 'carregando') return <Carregando />;
  if (status === 'autenticado') return <Navigate to={destino} replace />;
  return <Outlet />;
}
