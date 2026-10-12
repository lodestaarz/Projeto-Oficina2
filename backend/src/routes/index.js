import { Router } from 'express';
import { healthRoutes } from './health.routes.js';

// Agrupa as rotas da API. Novas rotas (ex.: /auth, /users) entram aqui.
export const routes = Router();

routes.use('/health', healthRoutes);
