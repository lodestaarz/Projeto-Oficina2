import {
  FASES,
  buscarFase,
  calcularEstrelas,
  contarBlocos,
  executar,
  validarPrograma,
  type Programa,
} from '@arrowbot/shared/engine';
import { HttpError } from '../errors/HttpError.js';
import * as repo from '../repositories/progresso.repository.js';

function resumo(f: (typeof FASES)[number]) {
  return { id: f.id, titulo: f.titulo, conceito: f.conceito };
}

export function listarFases() {
  return { fases: FASES.map(resumo) };
}

export function detalharFase(id: number) {
  const fase = buscarFase(id);
  if (!fase) throw new HttpError(404, 'Fase não encontrada');
  return { fase };
}

export async function listarProgresso(usuarioId: string) {
  const itens = await repo.listarDoUsuario(usuarioId);
  return {
    progresso: itens.map((p) => ({ faseId: p.fase_id, estrelas: p.estrelas, blocos: p.blocos })),
  };
}

/** Roda o programa no servidor: a nota nunca vem do cliente. */
export async function registrar(
  usuarioId: string,
  faseId: number,
  programa: Programa,
  dicasUsadas: number,
) {
  const fase = buscarFase(faseId);
  if (!fase) throw new HttpError(404, 'Fase não encontrada');
  const problema = validarPrograma(fase, programa);
  if (problema) throw new HttpError(422, problema);
  const resultado = executar(fase, programa);
  if (resultado.status !== 'venceu') throw new HttpError(422, resultado.mensagem);
  const estrelas = calcularEstrelas(fase, programa, resultado, dicasUsadas);
  const blocos = contarBlocos(programa);
  const salvo = await repo.salvarMelhor(usuarioId, faseId, estrelas, blocos, dicasUsadas, programa);
  return {
    progresso: { faseId: salvo.fase_id, estrelas: salvo.estrelas, blocos: salvo.blocos },
    estrelas,
    melhorou: salvo.estrelas === estrelas && salvo.blocos === blocos,
  };
}
