import { GoogleLogin } from '@react-oauth/google';
import { googleConfigurado } from '../services/google';

interface BotaoGoogleProps {
  /** Recebe o ID token (credential) devolvido pelo Google. */
  aoReceberCredencial: (credential: string) => void;
  texto?: 'signin_with' | 'signup_with' | 'continue_with';
}

/**
 * Botão "Entrar com Google" (RF03). Usa o botão oficial do Google Identity
 * Services, que devolve o ID token que o backend valida.
 * Sem VITE_GOOGLE_CLIENT_ID, mostra um botão desabilitado explicando o motivo.
 */
export function BotaoGoogle({ aoReceberCredencial, texto = 'signin_with' }: BotaoGoogleProps) {
  if (!googleConfigurado) {
    return (
      <div className="google-indisponivel">
        <button type="button" className="botao botao--google" disabled>
          Entrar com Google
        </button>
        <small>Login com Google não configurado (defina VITE_GOOGLE_CLIENT_ID).</small>
      </div>
    );
  }

  return (
    <div className="google-botao">
      <GoogleLogin
        onSuccess={({ credential }) => {
          if (credential) aoReceberCredencial(credential);
        }}
        // Fechar a janela do Google não é um erro: o usuário continua na tela (RF03).
        onError={() => undefined}
        text={texto}
        shape="pill"
        locale="pt-BR"
        width="320"
      />
    </div>
  );
}
