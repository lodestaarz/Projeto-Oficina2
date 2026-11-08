import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/data-source.js';

export function createApp() {

  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '10kb' }));


  return app;
}
