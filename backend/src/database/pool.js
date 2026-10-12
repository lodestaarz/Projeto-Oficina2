import pg from 'pg';
import { env } from '../config/env.js';

// Pool de conexões compartilhado pela camada de repositórios.
export const pool = new pg.Pool({ connectionString: env.databaseUrl });
