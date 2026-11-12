import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { solucaoDaFase } from '@arrowbot/shared/engine';

const urlTeste = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = urlTeste;

const { pool } = await import('../../src/database/pool.js');
const { createApp } = await import('../../src/app.js');
const app = createApp({ limiteLogin: { maximo: 1000, janelaMs: 60_000 } });

describe.skipIf(!urlTeste)('progresso com Postgres real', () => {
  beforeAll(async () => {
    const sql = readFileSync(resolve(import.meta.dirname, '../../../database/init.sql'), 'utf8');
    await pool.query(sql);
  });
  beforeEach(async () => {
    await pool.query('TRUNCATE usuarios CASCADE');
  });
  afterAll(async () => {
    await pool.end();
  });

  async function entrar(email: string) {
    const r = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Ana Lima', email, senha: 'segredo123' });
    return { Authorization: `Bearer ${r.body.token as string}` };
  }

  it('grava, lista, nunca piora a nota e isola por usuário', async () => {
    const ana = await entrar('ana@ex.com');
    const bia = await entrar('bia@ex.com');

    const bom = await request(app)
      .put('/api/progresso/1')
      .set(ana)
      .send({ programa: solucaoDaFase(1), dicasUsadas: 0 });
    expect(bom.status).toBe(200);

    // Repetir com dicas (nota menor) não rebaixa o registro.
    const pior = await request(app)
      .put('/api/progresso/1')
      .set(ana)
      .send({ programa: solucaoDaFase(1), dicasUsadas: 3 });
    expect(pior.status).toBe(200);
    expect(pior.body.progresso.estrelas).toBeGreaterThanOrEqual(bom.body.estrelas);

    const lista = await request(app).get('/api/progresso').set(ana);
    expect(lista.body.progresso).toHaveLength(1);
    expect((await request(app).get('/api/progresso').set(bia)).body.progresso).toEqual([]);

    const rejeitado = await request(app)
      .put('/api/progresso/2')
      .set(ana)
      .send({ programa: [{ id: 'x', tipo: 'avancar' }] });
    expect(rejeitado.status).toBe(422);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM progresso');
    expect(rows[0].n).toBe(1);
  });
});
