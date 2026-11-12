import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/data-source.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { criarRotas, type OpcoesRotas } from './routes/index.js';

export function createApp(opcoes: OpcoesRotas = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', criarRotas(opcoes));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
