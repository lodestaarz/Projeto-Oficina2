import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CHAVE_SESSAO } from './services/sessao';
import {
  USUARIO_ANA,
  renderizarApp,
  respostaJson,
  salvarSessaoDeTeste,
  sessaoValida,
  simularApi,
  tokenFalso,
} from './test/utils';

describe('Rotas protegidas (RF04)', () => {
  it('sem sessão, abrir / leva ao login', async () => {
    simularApi([]);
    renderizarApp('/');
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('sem sessão, /perfil também leva ao login', async () => {
    simularApi([]);
    renderizarApp('/perfil');
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('ao recarregar com token válido, continua autenticado', async () => {
    salvarSessaoDeTeste();
    const fetch = simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => respostaJson(200, { usuario: USUARIO_ANA }),
      },
    ]);

    renderizarApp('/');

    expect(await screen.findByRole('heading', { name: 'Mova o robô' })).toBeInTheDocument();
    const [, init] = fetch.mock.calls[0] ?? [];
    expect(new Headers(init?.headers).get('Authorization')).toMatch(/^Bearer /);
  });

  it('token recusado pelo backend (401) leva de volta ao login e descarta a sessão', async () => {
    salvarSessaoDeTeste();
    simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => respostaJson(401, { error: 'Sessão inválida ou expirada' }),
      },
    ]);

    renderizarApp('/');

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_SESSAO)).toBeNull();
  });

  it('token já vencido é descartado sem chamar a API (RN08)', async () => {
    salvarSessaoDeTeste(tokenFalso(-60));
    const fetch = simularApi([]);

    renderizarApp('/');

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('servidor fora do ar não derruba a sessão salva (RNF04)', async () => {
    salvarSessaoDeTeste();
    simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => {
          throw new TypeError('Failed to fetch');
        },
      },
    ]);

    renderizarApp('/');

    expect(await screen.findByRole('heading', { name: 'Mova o robô' })).toBeInTheDocument();
  });
});

describe('Login, cadastro e logout (RF01, RF02, RF04)', () => {
  it('CT-AUTH-05 na interface: entra com e-mail e senha e vai para a área de movimentação', async () => {
    const user = userEvent.setup();
    const fetch = simularApi([
      { metodo: 'POST', caminho: '/auth/login', resposta: () => respostaJson(200, sessaoValida()) },
    ]);
    renderizarApp('/login');

    await user.type(await screen.findByLabelText('E-mail'), 'ana@ex.com');
    await user.type(screen.getByLabelText('Senha'), 'segredo12');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('heading', { name: 'Mova o robô' })).toBeInTheDocument();
    expect(screen.getByText('Olá, Ana!')).toBeInTheDocument();

    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe('/api/auth/login');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'ana@ex.com', senha: 'segredo12' });
    expect(window.localStorage.getItem(CHAVE_SESSAO)).toContain('"token"');
  });

  it('CT-AUTH-06 na interface: mostra a mensagem genérica de login inválido', async () => {
    const user = userEvent.setup();
    simularApi([
      {
        metodo: 'POST',
        caminho: '/auth/login',
        resposta: () => respostaJson(401, { error: 'E-mail ou senha inválidos' }),
      },
    ]);
    renderizarApp('/login');

    await user.type(await screen.findByLabelText('E-mail'), 'ana@ex.com');
    await user.type(screen.getByLabelText('Senha'), 'errada123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('RF01 na interface: cria a conta e já entra', async () => {
    const user = userEvent.setup();
    const fetch = simularApi([
      {
        metodo: 'POST',
        caminho: '/auth/register',
        resposta: () => respostaJson(201, sessaoValida()),
      },
    ]);
    renderizarApp('/cadastro');

    await user.type(await screen.findByLabelText('Nome'), 'Ana Lima');
    await user.type(screen.getByLabelText('E-mail'), 'ana@ex.com');
    await user.type(screen.getByLabelText('Senha'), 'segredo12');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('heading', { name: 'Mova o robô' })).toBeInTheDocument();
    const [, init] = fetch.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body))).toEqual({
      nome: 'Ana Lima',
      email: 'ana@ex.com',
      senha: 'segredo12',
    });
  });

  it('RF01 na interface: mostra o erro de e-mail em uso', async () => {
    const user = userEvent.setup();
    simularApi([
      {
        metodo: 'POST',
        caminho: '/auth/register',
        resposta: () => respostaJson(409, { error: 'Este e-mail já está em uso' }),
      },
    ]);
    renderizarApp('/cadastro');

    await user.type(await screen.findByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('E-mail'), 'ana@ex.com');
    await user.type(screen.getByLabelText('Senha'), 'segredo12');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já está em uso');
  });

  it('RF03: as telas de login e cadastro têm o botão do Google', async () => {
    simularApi([]);
    const { unmount } = renderizarApp('/login');
    expect(await screen.findByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument();
    unmount();

    renderizarApp('/cadastro');
    expect(await screen.findByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument();
  });

  it('CT-AUTH-13: Sair descarta o token e volta ao login; / continua levando ao login', async () => {
    const user = userEvent.setup();
    salvarSessaoDeTeste();
    simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => respostaJson(200, { usuario: USUARIO_ANA }),
      },
    ]);
    renderizarApp('/');
    await screen.findByRole('heading', { name: 'Mova o robô' });

    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_SESSAO)).toBeNull();

    await user.click(screen.getByRole('link', { name: 'Criar conta' }));
    expect(await screen.findByRole('heading', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('usuário logado que abre /login vai direto para o jogo', async () => {
    salvarSessaoDeTeste();
    simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => respostaJson(200, { usuario: USUARIO_ANA }),
      },
    ]);
    renderizarApp('/login');
    expect(await screen.findByRole('heading', { name: 'Mova o robô' })).toBeInTheDocument();
  });
});

describe('Perfil (RF05)', () => {
  it('mostra nome, e-mail e forma de acesso vindos de /users/me', async () => {
    salvarSessaoDeTeste();
    const fetch = simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () =>
          respostaJson(200, { usuario: { ...USUARIO_ANA, provedores: ['senha', 'google'] } }),
      },
    ]);

    renderizarApp('/perfil');

    expect(await screen.findByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument();
    expect(await screen.findByText('ana@ex.com')).toBeInTheDocument();
    expect(screen.getByText('Ana Lima')).toBeInTheDocument();
    expect(screen.getByText('E-mail e senha, e conta Google')).toBeInTheDocument();
    await waitFor(() => expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(2));
    // Nenhuma chamada envia o id do usuário: o backend usa o token.
    for (const [url] of fetch.mock.calls) expect(String(url)).toBe('/api/users/me');
  });

  it('sessão que expira no perfil leva ao login', async () => {
    salvarSessaoDeTeste();
    let chamadas = 0;
    simularApi([
      {
        metodo: 'GET',
        caminho: '/users/me',
        resposta: () => {
          chamadas += 1;
          return chamadas === 1
            ? respostaJson(200, { usuario: USUARIO_ANA })
            : respostaJson(401, { error: 'Sessão inválida ou expirada' });
        },
      },
    ]);

    renderizarApp('/perfil');

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });
});
