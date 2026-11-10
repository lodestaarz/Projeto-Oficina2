import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BotaoGoogle } from '../components/BotaoGoogle';
import { Campo } from '../components/Campo';
import { TelaAutenticacao } from '../components/TelaAutenticacao';
import { useAuth } from '../contexts/AuthContext';
import { useEnvioDeFormulario } from '../hooks/useEnvioDeFormulario';

const SENHA_MINIMA = 8; // RN07

/** Cadastro com nome, e-mail e senha (RF01) ou com Google (RF03). */
export function CadastroPage() {
  const { cadastrar, entrarComGoogle } = useAuth();
  const { enviando, erro, enviar } = useEnvioDeFormulario();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void enviar(() => cadastrar({ nome, email, senha }));
  }

  return (
    <TelaAutenticacao
      titulo="Criar conta"
      subtitulo="Crie sua conta para começar a programar o robô."
    >
      <form className="formulario" onSubmit={aoEnviar}>
        <Campo
          rotulo="Nome"
          type="text"
          name="nome"
          autoComplete="name"
          required
          maxLength={100}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Campo
          rotulo="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Campo
          rotulo="Senha"
          type="password"
          name="senha"
          autoComplete="new-password"
          required
          minLength={SENHA_MINIMA}
          maxLength={72}
          dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && (
          <p className="erro-formulario" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className="botao botao--primario botao--largo" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <div className="separador" aria-hidden="true">
        <span>ou</span>
      </div>

      <BotaoGoogle
        texto="signup_with"
        aoReceberCredencial={(credential) => void enviar(() => entrarComGoogle(credential))}
      />

      <p className="cartao-auth-rodape">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </TelaAutenticacao>
  );
}
