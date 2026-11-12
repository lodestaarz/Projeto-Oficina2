import { useCallback, useEffect, useRef, useState } from 'react';

export const VELOCIDADES = [
  { id: 'lenta', nome: 'Lenta', ms: 900 },
  { id: 'normal', nome: 'Normal', ms: 450 },
  { id: 'rapida', nome: 'Rápida', ms: 150 },
] as const;
export type IdVelocidade = (typeof VELOCIDADES)[number]['id'];

/**
 * Reproduz uma lista de passos já calculada: contínuo (com velocidade) ou passo único.
 * `indice` é o passo mostrado agora (-1 = ainda não começou).
 */
export function usePlayback(total: number, velocidade: IdVelocidade) {
  const [indice, setIndice] = useState(-1);
  const [tocando, setTocando] = useState(false);
  const ms = VELOCIDADES.find((v) => v.id === velocidade)?.ms ?? 450;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    if (!tocando) return;
    if (indice >= total - 1) {
      setTocando(false);
      return;
    }
    timer.current = setTimeout(() => setIndice((i) => i + 1), indice === -1 ? 0 : ms);
    return limpar;
  }, [tocando, indice, total, ms, limpar]);

  return {
    indice,
    tocando,
    terminou: total > 0 && indice >= total - 1,
    iniciar: () => {
      setIndice(-1);
      setTocando(true);
    },
    pausar: () => {
      limpar();
      setTocando(false);
    },
    continuar: () => setTocando(true),
    avancarUm: () => {
      limpar();
      setTocando(false);
      setIndice((i) => Math.min(i + 1, total - 1));
    },
    zerar: () => {
      limpar();
      setTocando(false);
      setIndice(-1);
    },
  };
}
