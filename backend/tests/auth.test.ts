import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UsuarioRegistro } from '../src/repositories/users.repository.js';

vi.mock('../src/repositories/users.repository.js', async (importar) => {
  const real = await importar<Record<string, unknown>>();
  return {
    ...real,
    buscarPorEmail: vi.fn(),
    buscarPorId: vi.fn(),
    criarComSenha: vi.fn(),
  };
});

const repo = await import('../src/repositories/users.repository.js');
const { createApp } = await import('../src/app.js');
const app = createApp();

const ANA: UsuarioRegistro = {
  id: '11111111-1111-4111-8111-111111111111',
  nome: 'Ana Lima',
  email: 'ana@ex.com',
  senha_hash: bcrypt.hashSync('segredo123', 4),
  google_id: null,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/health', () => {
  it('responde ok', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: 'ok' });
  });
});

describe('rotas inexistentes e corpo inválido', () => {
  it('devolve 404 em JSON', async () => {
    const r = await request(app).get('/api/nada');
    expect(r.status).toBe(404);
    expect(r.body).toEqual({ error: 'Rota não encontrada' });
  });

  it('devolve 400 para JSON malformado', async () => {
    const r = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ quebrado');
    expect(r.status).toBe(400);
    expect(r.body.error).toBeTruthy();
  });
});

describe('POST /api/auth/register', () => {
  it('cria a conta, normaliza o e-mail e não vaza a senha', async () => {
    vi.mocked(repo.criarComSenha).mockResolvedValue(ANA);
    const r = await request(app)
      .post('/api/auth/register')
      .send({ nome: ' Ana Lima ', email: 'ANA@ex.com', senha: 'segredo123' });
    expect(r.status).toBe(201);
    expect(r.body.token).toEqual(expect.any(String));
    expect(r.body.usuario).toEqual({
      id: ANA.id,
      nome: 'Ana Lima',
      email: 'ana@ex.com',
      provedores: ['senha'],
    });
    expect(JSON.stringify(r.body)).not.toContain('senha_hash');
    const [nome, email, hash] = vi.mocked(repo.criarComSenha).mock.calls[0]!;
    expect([nome, email]).toEqual(['Ana Lima', 'ana@ex.com']);
    expect(hash).not.toBe('segredo123');
  });

  it.each([
    [{ nome: '', email: 'a@b.com', senha: '123456' }],
    [{ nome: 'Ana', email: 'invalido', senha: '123456' }],
    [{ nome: 'Ana', email: 'a@b.com', senha: '123' }],
    [{}],
  ])('rejeita dados inválidos %j com 400', async (corpo) => {
    const r = await request(app).post('/api/auth/register').send(corpo);
    expect(r.status).toBe(400);
    expect(repo.criarComSenha).not.toHaveBeenCalled();
  });

  it('devolve 409 se o e-mail já existe', async () => {
    vi.mocked(repo.criarComSenha).mockRejectedValue({ code: '23505' });
    const r = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Ana', email: 'ana@ex.com', senha: 'segredo123' });
    expect(r.status).toBe(409);
    expect(r.body.error).toBe('Este e-mail já está em uso');
  });
});

describe('POST /api/auth/login', () => {
  it('entra com credenciais corretas', async () => {
    vi.mocked(repo.buscarPorEmail).mockResolvedValue(ANA);
    const r = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@ex.com', senha: 'segredo123' });
    expect(r.status).toBe(200);
    expect(r.body.usuario.email).toBe('ana@ex.com');
  });

  it('rejeita senha errada e e-mail inexistente com a mesma mensagem', async () => {
    vi.mocked(repo.buscarPorEmail).mockResolvedValueOnce(ANA).mockResolvedValueOnce(null);
    const errada = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@ex.com', senha: 'outra-senha' });
    const inexistente = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@ex.com', senha: 'segredo123' });
    expect(errada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(errada.body).toEqual(inexistente.body);
  });

  it('rejeita conta sem senha (só Google)', async () => {
    vi.mocked(repo.buscarPorEmail).mockResolvedValue({ ...ANA, senha_hash: null, google_id: 'g1' });
    const r = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@ex.com', senha: 'segredo123' });
    expect(r.status).toBe(401);
  });
});

describe('GET /api/users/me', () => {
  async function tokenDaAna() {
    vi.mocked(repo.criarComSenha).mockResolvedValue(ANA);
    const r = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Ana', email: 'ana@ex.com', senha: 'segredo123' });
    return r.body.token as string;
  }

  it('exige token', async () => {
    const r = await request(app).get('/api/users/me');
    expect(r.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const r = await request(app).get('/api/users/me').set('Authorization', 'Bearer lixo');
    expect(r.status).toBe(401);
  });

  it('devolve o perfil com token válido', async () => {
    const token = await tokenDaAna();
    vi.mocked(repo.buscarPorId).mockResolvedValue(ANA);
    const r = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(r.status).toBe(200);
    expect(r.body.usuario.id).toBe(ANA.id);
  });

  it('devolve 401 se a conta foi removida', async () => {
    const token = await tokenDaAna();
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    const r = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(r.status).toBe(401);
  });
});

describe('POST /api/auth/google', () => {
  it('ainda não implementado devolve 501', async () => {
    const r = await request(app).post('/api/auth/google').send({ credential: 'x' });
    expect(r.status).toBe(501);
  });
});
