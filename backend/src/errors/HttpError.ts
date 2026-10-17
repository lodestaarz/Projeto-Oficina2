// Erro com status HTTP. O errorHandler transforma em { "error": mensagem }.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const MENSAGENS = {
  emailEmUso: 'Este e-mail já está em uso',
  credenciaisInvalidas: 'E-mail ou senha inválidos',
  googleInvalido: 'Não foi possível validar a conta Google',
  googleNaoConfigurado: 'Login com Google não está configurado no servidor',
  tokenAusente: 'Sessão não informada',
  sessaoInvalida: 'Sessão inválida ou expirada',
  rotaNaoEncontrada: 'Rota não encontrada',
  corpoInvalido: 'Corpo da requisição inválido',
  erroInterno: 'Erro interno do servidor',
} as const;
