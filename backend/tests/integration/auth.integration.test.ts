import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Roda contra um PostgreSQL de verdade (TEST_DATABASE_URL), sem mocks.
const urlTeste = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = urlTeste;

const { pool } = await import('../../src/database/pool.js');
const { createApp } = await import('../../src/app.js');
const { entrarComGoogle } = await import('../../src/services/auth.service.js');
const app = createApp({ limiteLogin: { maximo: 1000, janelaMs: 60_000 } });

describe.skipIf(!urlTeste)('autenticação com Postgres real', () => {
  beforeAll(async () => {
    const sql = readFileSync(resolve(import.meta.dirname, '../../../database/init.sql'), 'utf8');
    await pool.query(sql);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE usuarios');
  });

  afterAll(async () => {
    await pool.end();
  });

  const ana = { nome: 'Ana Lima', email: 'Ana@Ex.com', senha: 'segredo123' };

  it('cadastra, entra e lê o perfil', async () => {
    const cad = await request(app).post('/api/auth/register').send(ana);
    expect(cad.status).toBe(201);
    expect(cad.body.usuario.email).toBe('ana@ex.com');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ANA@ex.com', senha: ana.senha });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.usuario.nome).toBe('Ana Lima');
    expect(JSON.stringify(me.body)).not.toContain('senha_hash');
  });

  it('rejeita e-mail duplicado (qualquer caixa) com 409', async () => {
    await request(app).post('/api/auth/register').send(ana);
    const r = await request(app)
      .post('/api/auth/register')
      .send({ ...ana, email: 'ANA@EX.COM' });
    expect(r.status).toBe(409);
  });

  it('rejeita senha errada com 401', async () => {
    await request(app).post('/api/auth/register').send(ana);
    const r = await request(app)
      .post('/api/auth/login')
      .send({ email: ana.email, senha: 'errada123' });
    expect(r.status).toBe(401);
  });

  it('login Google cria conta e depois vincula à conta por senha', async () => {
    const g = async () => ({ sub: 'g-42', email: 'bia@ex.com', nome: 'Bia' });
    const nova = await entrarComGoogle('t', g);
    expect(nova.usuario.provedores).toEqual(['google']);

    await request(app).post('/api/auth/register').send(ana);
    const vinculada = await entrarComGoogle('t', async () => ({
      sub: 'g-43',
      email: 'ana@ex.com',
      nome: 'Ana',
    }));
    expect(vinculada.usuario.provedores).toEqual(['senha', 'google']);
  });
});
