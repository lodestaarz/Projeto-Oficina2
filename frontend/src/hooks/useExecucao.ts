import { useCallback, useEffect, useRef, useState } from 'react';
import type { Posicao } from '../game/movement';

interface OpcoesExecucao {
  /** Pausa entre um passo e o próximo, em milissegundos. */
  pausaMs: number;
  /** Chamado a cada passo com a nova posição e o índice do comando. */
  aoPasso: (posicao: Posicao, indice: number) => void;
  /** Chamado quando todos os passos terminaram (não é chamado se for interrompida). */
  aoTerminar?: () => void;
}

/**
 * Reproduz, passo a passo, as posições calculadas por `runSequence` (RF12).
 * O cálculo fica nas funções puras; este hook só cuida do tempo.
 */
export function useExecucao({ pausaMs, aoPasso, aoTerminar }: OpcoesExecucao) {
  const [passoAtual, setPassoAtual] = useState<number | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const callbacks = useRef({ aoPasso, aoTerminar });
  useEffect(() => {
    callbacks.current = { aoPasso, aoTerminar };
  }, [aoPasso, aoTerminar]);

  const limparTemporizador = useCallback(() => {
    if (temporizador.current !== undefined) {
      clearTimeout(temporizador.current);
      temporizador.current = undefined;
    }
  }, []);

  /** Interrompe a execução (usado pelo "Recomeçar", RF11). */
  const parar = useCallback(() => {
    limparTemporizador();
    setPassoAtual(null);
  }, [limparTemporizador]);

  /** Começa a reproduzir os passos. Lista vazia não faz nada. */
  const executar = useCallback(
    (passos: readonly Posicao[]) => {
      limparTemporizador();
      if (passos.length === 0) return;

      const rodarPasso = (indice: number) => {
        const posicao = passos[indice];
        if (posicao === undefined) {
          temporizador.current = undefined;
          setPassoAtual(null);
          callbacks.current.aoTerminar?.();
          return;
        }
        setPassoAtual(indice);
        callbacks.current.aoPasso(posicao, indice);
        temporizador.current = setTimeout(() => rodarPasso(indice + 1), pausaMs);
      };

      rodarPasso(0);
    },
    [limparTemporizador, pausaMs],
  );

  // Não deixa temporizadores rodando se a página for fechada no meio.
  useEffect(() => limparTemporizador, [limparTemporizador]);

  return {
    executar,
    parar,
    passoAtual,
    emExecucao: passoAtual !== null,
  };
}
