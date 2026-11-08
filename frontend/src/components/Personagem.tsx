import type { Direcao } from '../game/movement';

interface PersonagemProps {
  /** Para onde o personagem está olhando (última direção usada). */
  olhando: Direcao | null;
  /** Liga a animação de "bateu na borda". */
  batendo?: boolean;
}

const OLHAR: Record<Direcao, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -2 },
  down: { dx: 0, dy: 2 },
  left: { dx: -2, dy: 0 },
  right: { dx: 2, dy: 0 },
};

/** O robozinho que o aprendiz controla (RF07). */
export function Personagem({ olhando, batendo = false }: PersonagemProps) {
  const { dx, dy } = olhando ? OLHAR[olhando] : { dx: 0, dy: 0 };

  return (
    <span
      className={`personagem${batendo ? ' personagem--batendo' : ''}`}
      role="img"
      aria-label="Personagem"
    >
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <line x1="20" y1="4" x2="20" y2="10" className="personagem-antena" />
        <circle cx="20" cy="4" r="2.5" className="personagem-luz" />
        <rect x="6" y="10" width="28" height="24" rx="8" className="personagem-corpo" />
        <rect x="10" y="15" width="20" height="12" rx="5" className="personagem-visor" />
        <circle cx={15 + dx} cy={21 + dy} r="2.6" className="personagem-olho" />
        <circle cx={25 + dx} cy={21 + dy} r="2.6" className="personagem-olho" />
        <rect x="2" y="18" width="4" height="8" rx="2" className="personagem-corpo" />
        <rect x="34" y="18" width="4" height="8" rx="2" className="personagem-corpo" />
      </svg>
    </span>
  );
}
