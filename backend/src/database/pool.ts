import pg from 'pg';
import { env } from '../config/data-source.js';

// Pool de conexões compartilhado pela camada de repositórios.
// A conexão só é aberta na primeira consulta.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });
