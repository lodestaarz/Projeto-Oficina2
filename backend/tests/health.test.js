import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /api/health', () => {
  it('responde com status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('rotas inexistentes', () => {
  it('respondem 404 em JSON', async () => {
    const response = await request(app).get('/api/nao-existe');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Rota não encontrada' });
  });
});
