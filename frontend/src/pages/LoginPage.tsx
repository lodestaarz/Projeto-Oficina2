import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BotaoGoogle } from '../components/BotaoGoogle';
import { Campo } from '../components/Campo';
import { TelaAutenticacao } from '../components/TelaAutenticacao';
import { useAuth } from '../contexts/AuthContext';
import { useEnvioDeFormulario } from '../hooks/useEnvioDeFormulario';

/** Login com e-mail e senha (RF02) ou com Google (RF03). */
export function LoginPage() {
  const { entrar, entrarComGoogle } = useAuth();
  const { enviando, erro, enviar } = useEnvioDeFormulario();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void enviar(() => entrar({ email, senha }));
  }

  // Ao entrar, o AuthContext muda para "autenticado" e a RotaPublica
  // leva o usuário para a área de movimentação.
  return (
    <TelaAutenticacao titulo="Entrar" subtitulo="Que bom ver você de novo!">
      <form className="formulario" onSubmit={aoEnviar}>
        <Campo
          rotulo="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo="Senha"
          type="password"
          name="senha"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && (
          <p className="erro-formulario" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className="botao botao--primario botao--largo" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="separador" aria-hidden="true">
        <span>ou</span>
      </div>

      <BotaoGoogle
        texto="signin_with"
        aoReceberCredencial={(credential) => void enviar(() => entrarComGoogle(credential))}
      />

      <p className="cartao-auth-rodape">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </TelaAutenticacao>
  );
}
