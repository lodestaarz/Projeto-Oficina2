import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RotaProtegida, RotaPublica } from './components/Rotas';
import { CadastroPage } from './pages/CadastroPage';
import { JogoPage } from './pages/JogoPage';
import { LoginPage } from './pages/LoginPage';
import { PerfilPage } from './pages/PerfilPage';
import { SelecaoFasesPage } from './pages/SelecaoFasesPage';

const FasePage = lazy(() => import('./pages/FasePage'));

export default function App() {
  return (
    <Routes>
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
      </Route>
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/fases" replace />} />
          <Route path="/treino" element={<JogoPage />} />
          <Route path="/fases" element={<SelecaoFasesPage />} />
          <Route
            path="/fases/:id"
            element={
              <Suspense fallback={<p>Carregando…</p>}>
                <FasePage />
              </Suspense>
            }
          />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
