import type { Programa } from '@arrowbot/shared/engine';
import { pool } from '../database/pool.js';

export interface ProgressoRegistro {
  fase_id: number;
  estrelas: number;
  blocos: number;
  dicas_usadas: number;
  atualizado_em: Date;
}

export async function listarDoUsuario(usuarioId: string): Promise<ProgressoRegistro[]> {
  const r = await pool.query<ProgressoRegistro>(
    'SELECT fase_id, estrelas, blocos, dicas_usadas, atualizado_em FROM progresso WHERE usuario_id = $1 ORDER BY fase_id',
    [usuarioId],
  );
  return r.rows;
}

/** Guarda a fase; só substitui o resultado anterior se ele for melhor (mais estrelas). */
export async function salvarMelhor(
  usuarioId: string,
  faseId: number,
  estrelas: number,
  blocos: number,
  dicasUsadas: number,
  programa: Programa,
): Promise<ProgressoRegistro> {
  const r = await pool.query<ProgressoRegistro>(
    `INSERT INTO progresso (usuario_id, fase_id, estrelas, blocos, dicas_usadas, programa)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (usuario_id, fase_id) DO UPDATE SET
       estrelas = EXCLUDED.estrelas, blocos = EXCLUDED.blocos,
       dicas_usadas = EXCLUDED.dicas_usadas, programa = EXCLUDED.programa,
       atualizado_em = now()
     WHERE EXCLUDED.estrelas > progresso.estrelas
     RETURNING fase_id, estrelas, blocos, dicas_usadas, atualizado_em`,
    [usuarioId, faseId, estrelas, blocos, dicasUsadas, JSON.stringify(programa)],
  );
  if (r.rows[0]) return r.rows[0];
  // Resultado anterior era igual ou melhor: devolve o que já estava guardado.
  const atual = await pool.query<ProgressoRegistro>(
    'SELECT fase_id, estrelas, blocos, dicas_usadas, atualizado_em FROM progresso WHERE usuario_id = $1 AND fase_id = $2',
    [usuarioId, faseId],
  );
  return atual.rows[0]!;
}
