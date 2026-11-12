import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { googleClientId } from './services/google';
import './styles.css';

const raiz = document.getElementById('root');
if (!raiz) throw new Error('Elemento #root não encontrado em index.html');

createRoot(raiz).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || 'sem-client-id'}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
