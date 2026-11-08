// Tipos compartilhados entre o frontend e o backend.
// Este pacote só exporta tipos: use sempre `import type { ... } from '@arrowbot/shared'`.

/** Comandos de direção aceitos pelo jogo (RN03). */
export type Direcao = 'up' | 'down' | 'left' | 'right';

/** Coordenada de uma célula. x cresce para a direita e y cresce para baixo (RN02). */
export interface Posicao {
  x: number;
  y: number;
}

/** Tamanho da área de movimentação. */
export interface Area {
  columns: number;
  rows: number;
}

/** Formas de acesso de uma conta. */
export type Provedor = 'senha' | 'google';

/** Usuário como a API devolve. Nunca inclui `senha_hash` nem `google_id`. */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  provedores: Provedor[];
}

/** Resposta de `POST /api/auth/register`, `/login` e `/google`. */
export interface RespostaAutenticacao {
  token: string;
  usuario: Usuario;
}

/** Resposta de `GET /api/users/me`. */
export interface RespostaPerfil {
  usuario: Usuario;
}

/** Formato padrão de erro da API. */
export interface RespostaErro {
  error: string;
}

/** Corpos das requisições de autenticação. */
export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosLoginGoogle {
  credential: string;
}
