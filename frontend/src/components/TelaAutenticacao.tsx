import type { ReactNode } from 'react';
import { Logo } from './Logo';

interface TelaAutenticacaoProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

/** Moldura comum das telas de login e cadastro. */
export function TelaAutenticacao({ titulo, subtitulo, children }: TelaAutenticacaoProps) {
  return (
    <main className="tela-auth">
      <div className="cartao-auth">
        <Logo />
        <h1 className="cartao-auth-titulo">{titulo}</h1>
        <p className="cartao-auth-subtitulo">{subtitulo}</p>
        {children}
      </div>
    </main>
  );
}
