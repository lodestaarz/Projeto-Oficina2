import { COMANDOS, ORDEM_DOS_COMANDOS } from '../game/config';
import type { Direcao } from '../game/movement';

interface ControlesProps {
  aoMover: (direcao: Direcao) => void;
  aoRecomecar: () => void;
  /** Durante a execução de uma sequência, os botões de direção ficam bloqueados. */
  bloqueado: boolean;
}

/** Botões Cima, Baixo, Esquerda e Direita (RF08) e o botão Recomeçar (RF11). */
export function Controles({ aoMover, aoRecomecar, bloqueado }: ControlesProps) {
  return (
    <section className="painel" aria-labelledby="titulo-controles">
      <h2 id="titulo-controles" className="painel-titulo">
        Mover agora
      </h2>
      <p className="painel-dica">Clique nas setas ou use as setas do teclado.</p>

      <div className="controles" role="group" aria-label="Direções">
        {ORDEM_DOS_COMANDOS.map((direcao) => {
          const { nome, seta } = COMANDOS[direcao];
          return (
            <button
              key={direcao}
              type="button"
              className={`botao-direcao botao-direcao--${direcao}`}
              onClick={() => aoMover(direcao)}
              aria-label={nome}
              title={nome}
              disabled={bloqueado}
            >
              <span aria-hidden="true">{seta}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className="botao botao--secundario botao--largo" onClick={aoRecomecar}>
        <span aria-hidden="true">⟲ </span>Recomeçar
      </button>
    </section>
  );
}
