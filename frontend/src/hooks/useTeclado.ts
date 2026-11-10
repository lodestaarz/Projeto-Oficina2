import { useEffect, useRef } from 'react';
import { direcaoDaTecla, type Direcao } from '../game/movement';

/** O alvo do evento é um campo onde o usuário digita? */
function ehCampoDeTexto(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  if (alvo.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName);
}

/**
 * Transforma as setas do teclado em comandos de direção (RF09).
 * - ↑ ↓ ← → chamam `aoPressionar` com a direção e não rolam a página;
 * - outras teclas são ignoradas;
 * - nada acontece enquanto o usuário digita num campo de texto;
 * - combinações com Ctrl, Alt ou Cmd ficam com o navegador.
 */
export function useTeclado(aoPressionar: (direcao: Direcao) => void, ativo = true): void {
  // Guarda sempre a versão mais nova da função sem precisar
  // remover e adicionar o ouvinte a cada renderização.
  const aoPressionarRef = useRef(aoPressionar);
  useEffect(() => {
    aoPressionarRef.current = aoPressionar;
  }, [aoPressionar]);

  useEffect(() => {
    if (!ativo) return undefined;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      if (ehCampoDeTexto(evento.target)) return;

      const direcao = direcaoDaTecla(evento.key);
      if (!direcao) return;

      evento.preventDefault();
      aoPressionarRef.current(direcao);
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [ativo]);
}
