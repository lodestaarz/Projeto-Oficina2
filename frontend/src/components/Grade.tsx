import type { CSSProperties } from 'react';
import type { Area, Direcao, Posicao } from '../game/movement';
import { Personagem } from './Personagem';

interface GradeProps {
  area: Area;
  posicao: Posicao;
  olhando: Direcao | null;
  /** Muda a cada batida na borda para reiniciar a animação. */
  batidas: number;
  /** Células por onde o personagem passou na execução atual. */
  rastro?: readonly Posicao[];
}

function intervalo(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/** Área de movimentação em forma de grade (RF06), com o personagem (RF07). */
export function Grade({ area, posicao, olhando, batidas, rastro = [] }: GradeProps) {
  const colunas = intervalo(area.columns);
  const linhas = intervalo(area.rows);
  const noRastro = (x: number, y: number) => rastro.some((p) => p.x === x && p.y === y);

  return (
    <div className="grade-moldura" style={{ '--colunas': area.columns } as CSSProperties}>
      <div className="grade-eixo grade-eixo--x" aria-hidden="true">
        {colunas.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
      <div className="grade-eixo grade-eixo--y" aria-hidden="true">
        {linhas.map((y) => (
          <span key={y}>{y}</span>
        ))}
      </div>

      <div className="grade" role="grid" aria-label="Área de movimentação" aria-readonly="true">
        {linhas.map((y) => (
          <div key={y} className="grade-linha" role="row">
            {colunas.map((x) => {
              const temPersonagem = posicao.x === x && posicao.y === y;
              return (
                <div
                  key={x}
                  role="gridcell"
                  className={`celula${noRastro(x, y) ? ' celula--rastro' : ''}`}
                  data-x={x}
                  data-y={y}
                  aria-label={`Célula (${x}, ${y})`}
                >
                  {temPersonagem && (
                    <Personagem key={batidas} olhando={olhando} batendo={batidas > 0} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
