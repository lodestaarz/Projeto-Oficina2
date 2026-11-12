import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solucaoDaFase } from '@arrowbot/shared/engine';

vi.mock('../src/repositories/progresso.repository.js', () => ({
  listarDoUsuario: vi.fn(),
  salvarMelhor: vi.fn(),
}));

const repo = await import('../src/repositories/progresso.repository.js');
const { createApp } = await import('../src/app.js');
const { env } = await import('../src/config/data-source.js');
const app = createApp({ limiteLogin: { maximo: 1000, janelaMs: 60_000 } });

const USUARIO = '11111111-1111-4111-8111-111111111111';
const token = jwt.sign({ sub: USUARIO }, env.jwtSecret);
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/fases', () => {
  it('lista as 9 fases sem exigir login', async () => {
    const r = await request(app).get('/api/fases');
    expect(r.status).toBe(200);
    expect(r.body.fases).toHaveLength(9);
  });

  it('detalha uma fase e responde 404/400 nos casos ruins', async () => {
    expect((await request(app).get('/api/fases/1')).body.fase.id).toBe(1);
    expect((await request(app).get('/api/fases/99')).status).toBe(404);
    const ruim = await request(app).get('/api/fases/abc');
    expect(ruim.status).toBe(400);
    expect(ruim.body).toHaveProperty('error');
  });
});

describe('progresso', () => {
  it('exige autenticação', async () => {
    expect((await request(app).get('/api/progresso')).status).toBe(401);
    expect((await request(app).put('/api/progresso/1').send({})).status).toBe(401);
  });

  it('lista o progresso do usuário', async () => {
    vi.mocked(repo.listarDoUsuario).mockResolvedValue([
      { fase_id: 1, estrelas: 3, blocos: 4, dicas_usadas: 0, atualizado_em: new Date() },
    ]);
    const r = await request(app).get('/api/progresso').set(auth);
    expect(r.status).toBe(200);
    expect(r.body.progresso).toEqual([{ faseId: 1, estrelas: 3, blocos: 4 }]);
  });

  it('recalcula as estrelas no servidor, ignorando o que o cliente disser', async () => {
    vi.mocked(repo.salvarMelhor).mockImplementation(async (_u, faseId, estrelas, blocos) => ({
      fase_id: faseId,
      estrelas,
      blocos,
      dicas_usadas: 0,
      atualizado_em: new Date(),
    }));
    const r = await request(app)
      .put('/api/progresso/1')
      .set(auth)
      .send({ programa: solucaoDaFase(1), dicasUsadas: 0, estrelas: 3 });
    expect(r.status).toBe(200);
    expect(r.body.estrelas).toBeGreaterThanOrEqual(1);
    expect(vi.mocked(repo.salvarMelhor).mock.calls[0]?.[0]).toBe(USUARIO);
  });

  it('recusa programa que não vence (422) sem gravar', async () => {
    const r = await request(app)
      .put('/api/progresso/1')
      .set(auth)
      .send({ programa: [{ id: 'a', tipo: 'girar', lado: 'direita' }], dicasUsadas: 0 });
    expect(r.status).toBe(422);
    expect(r.body).toHaveProperty('error');
    expect(repo.salvarMelhor).not.toHaveBeenCalled();
  });

  it('valida o corpo (zod) e a fase', async () => {
    const semPrograma = await request(app).put('/api/progresso/1').set(auth).send({});
    expect(semPrograma.status).toBe(400);
    const blocoFalso = await request(app)
      .put('/api/progresso/1')
      .set(auth)
      .send({ programa: [{ id: 'a', tipo: 'eval', codigo: 'x' }] });
    expect(blocoFalso.status).toBe(400);
    const fase = await request(app)
      .put('/api/progresso/99')
      .set(auth)
      .send({ programa: solucaoDaFase(1) });
    expect(fase.status).toBe(404);
    expect(repo.salvarMelhor).not.toHaveBeenCalled();
  });
});
