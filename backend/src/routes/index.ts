import { Router } from 'express';
import { criarUsersController } from '../controllers/users.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { limiteTentativas } from '../middlewares/limiteTentativas.js';

export interface OpcoesRotas {
  limiteLogin?: { maximo: number; janelaMs: number };
}

export function criarRotas(opcoes: OpcoesRotas = {}) {
  const rotas = Router();
  const users = criarUsersController();

  rotas.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  // Freia força bruta de senha: 10 tentativas por IP a cada 15 minutos.
  const limite = limiteTentativas(
    opcoes.limiteLogin ?? {
      maximo: Number(process.env.LIMITE_LOGIN_MAXIMO) || 10,
      janelaMs: 15 * 60 * 1000,
    },
  );
  rotas.post('/auth/register', limite, users.cadastrar);
  rotas.post('/auth/login', limite, users.entrar);
  rotas.post('/auth/google', limite, users.google);
  rotas.get('/users/me', autenticar, users.perfil);

  return rotas;
}
