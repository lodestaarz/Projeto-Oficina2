import { createApp } from './app.js';
import { env } from './config/data-source.js';
import { pool } from './database/pool.js';

const app = createApp();

const servidor = app.listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}/api`);
});

function encerrar() {
  servidor.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
