import type { Fase, Robo } from '@arrowbot/shared/engine';

interface MapaFaseProps {
  fase: Fase;
  robo: Robo;
  temChave: boolean;
  /** Itens já coletados, como "x,y". */
  coletados?: string[];
  /** Muda a cada erro para reiniciar a animação de batida. */
  erro?: boolean;
}

const TAM = 56;

/** Mapa da fase em SVG: chão, paredes, buracos, meta, chave e porta, com o robô. */
export function MapaFase({ fase, robo, temChave, coletados = [], erro = false }: MapaFaseProps) {
  const linhas = fase.grade.length;
  const colunas = Math.max(...fase.grade.map((l) => l.length));
  const celulas: { x: number; y: number; c: string }[] = [];
  fase.grade.forEach((linha, y) => {
    for (let x = 0; x < colunas; x++) celulas.push({ x, y, c: linha[x] ?? '#' });
  });
  const largura = colunas * TAM;
  const altura = linhas * TAM;

  return (
    <svg
      className="mapa"
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={`Mapa da fase: ${colunas} colunas por ${linhas} linhas. Robô na célula (${robo.x}, ${robo.y}).`}
      data-testid="mapa"
      data-robo={`${robo.x},${robo.y},${robo.dir}`}
    >
      {celulas.map(({ x, y, c }) => {
        const px = x * TAM;
        const py = y * TAM;
        return (
          <g key={`${x}-${y}`} data-celula={`${x},${y}`} data-tipo={c}>
            {c === '#' ? (
              <rect x={px} y={py} width={TAM} height={TAM} className="mapa-parede" />
            ) : (
              <rect x={px} y={py} width={TAM} height={TAM} className="mapa-chao" />
            )}
            {c === 'o' && (
              <ellipse
                cx={px + TAM / 2}
                cy={py + TAM / 2}
                rx={20}
                ry={16}
                className="mapa-buraco"
              />
            )}
            {c === 'G' && (
              <g className="mapa-meta">
                <line x1={px + 20} y1={py + 12} x2={px + 20} y2={py + 46} />
                <path
                  d={`M${px + 20} ${py + 12} L${px + 44} ${py + 21} L${px + 20} ${py + 30} Z`}
                />
              </g>
            )}
            {c === 'K' && !temChave && (
              <g className="mapa-chave">
                <circle cx={px + 22} cy={py + 28} r={8} />
                <rect x={px + 28} y={py + 25} width={18} height={6} />
              </g>
            )}
            {c === 'I' && !coletados.includes(`${x},${y}`) && (
              <g className="mapa-item" data-testid="item">
                <circle cx={px + TAM / 2} cy={py + TAM / 2} r={10} />
              </g>
            )}
            {c === 'D' && (
              <rect
                x={px + 8}
                y={py + 4}
                width={TAM - 16}
                height={TAM - 8}
                rx={4}
                className={temChave ? 'mapa-porta mapa-porta--aberta' : 'mapa-porta'}
              />
            )}
          </g>
        );
      })}
      <g
        className={`mapa-robo${erro ? ' mapa-robo--erro' : ''}`}
        style={{ transform: `translate(${robo.x * TAM + TAM / 2}px, ${robo.y * TAM + TAM / 2}px)` }}
      >
        <g className="mapa-robo-giro" style={{ transform: `rotate(${robo.dir * 90}deg)` }}>
          <rect x={-18} y={-18} width={36} height={36} rx={9} className="personagem-corpo" />
          <rect x={-11} y={-11} width={22} height={14} rx={5} className="personagem-visor" />
          <path d="M-7 -22 L0 -32 L7 -22 Z" className="personagem-luz" />
        </g>
      </g>
    </svg>
  );
}
