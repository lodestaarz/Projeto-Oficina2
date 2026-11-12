import { Router } from 'express';
import { criarUsersController } from '../controllers/users.controller.js';
import { autenticar } from '../middlewares/autenticar.js';

export function criarRotas() {
  const rotas = Router();
  const users = criarUsersController();

  rotas.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  rotas.post('/auth/register', users.cadastrar);
  rotas.post('/auth/login', users.entrar);
  rotas.post('/auth/google', users.google);
  rotas.get('/users/me', autenticar, users.perfil);

  return rotas;
}
