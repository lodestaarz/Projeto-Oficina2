import { useEffect, useRef, useState } from 'react';
import { COMANDOS, ORDEM_DOS_COMANDOS, VELOCIDADES, type IdVelocidade } from '../game/config';
import type { Direcao } from '../game/movement';

interface ListaDeComandosProps {
  sequencia: readonly Direcao[];
  /** Índice do comando em execução, ou null. */
  passoAtual: number | null;
  emExecucao: boolean;
  velocidade: IdVelocidade;
  aoAdicionar: (direcao: Direcao) => void;
  aoRemover: (indice: number) => void;
  aoMover: (indice: number, deslocamento: -1 | 1) => void;
  aoLimpar: () => void;
  aoExecutar: () => void;
  aoMudarVelocidade: (velocidade: IdVelocidade) => void;
}

type AcaoItem = 'subir' | 'descer' | 'remover';
type Foco = { indice: number; acao: AcaoItem } | { indice: null; acao: 'adicionar' };

/**
 * Monta (RF14) e dispara (RF12) a sequência de comandos.
 * Todos os botões funcionam pelo teclado, e o foco acompanha o item movido.
 */
export function ListaDeComandos({
  sequencia,
  passoAtual,
  emExecucao,
  velocidade,
  aoAdicionar,
  aoRemover,
  aoMover,
  aoLimpar,
  aoExecutar,
  aoMudarVelocidade,
}: ListaDeComandosProps) {
  const botoes = useRef(new Map<string, HTMLButtonElement>());
  const [focoPendente, setFocoPendente] = useState<Foco | null>(null);
  const vazia = sequencia.length === 0;

  // Depois de mover ou remover um item, devolve o foco a um botão que faça sentido.
  useEffect(() => {
    if (!focoPendente) return;
    const chave =
      focoPendente.indice === null ? 'adicionar-up' : `${focoPendente.acao}-${focoPendente.indice}`;
    let alvo = botoes.current.get(chave);
    if (alvo?.disabled && focoPendente.indice !== null) {
      const outra = focoPendente.acao === 'subir' ? 'descer' : 'subir';
      alvo = botoes.current.get(`${outra}-${focoPendente.indice}`);
    }
    alvo?.focus();
    setFocoPendente(null);
  }, [focoPendente, sequencia]);

  function registrar(chave: string) {
    return (elemento: HTMLButtonElement | null) => {
      if (elemento) botoes.current.set(chave, elemento);
      else botoes.current.delete(chave);
    };
  }

  function mover(indice: number, deslocamento: -1 | 1) {
    aoMover(indice, deslocamento);
    setFocoPendente({ indice: indice + deslocamento, acao: deslocamento < 0 ? 'subir' : 'descer' });
  }

  function remover(indice: number) {
    aoRemover(indice);
    const restantes = sequencia.length - 1;
    setFocoPendente(
      restantes === 0
        ? { indice: null, acao: 'adicionar' }
        : { indice: Math.min(indice, restantes - 1), acao: 'remover' },
    );
  }

  return (
    <section className="painel painel--sequencia" aria-labelledby="titulo-sequencia">
      <h2 id="titulo-sequencia" className="painel-titulo">
        Sequência de comandos
      </h2>
      <p className="painel-dica">Monte o caminho e aperte Executar para ver o robô seguir.</p>

      <div className="adicionar" role="group" aria-label="Adicionar comando">
        {ORDEM_DOS_COMANDOS.map((direcao) => {
          const { nome, seta } = COMANDOS[direcao];
          return (
            <button
              key={direcao}
              ref={registrar(`adicionar-${direcao}`)}
              type="button"
              className="botao botao--comando"
              onClick={() => aoAdicionar(direcao)}
              aria-label={`Adicionar ${nome}`}
              disabled={emExecucao}
            >
              <span aria-hidden="true">+ {seta}</span>
              <span className="botao-legenda" aria-hidden="true">
                {nome}
              </span>
            </button>
          );
        })}
      </div>

      {vazia ? (
        <p className="sequencia-vazia">A sequência está vazia. Adicione comandos acima.</p>
      ) : (
        <ol className="sequencia" role="list" aria-label="Comandos da sequência">
          {sequencia.map((direcao, indice) => {
            const { nome, seta } = COMANDOS[direcao];
            const numero = indice + 1;
            const ativo = passoAtual === indice;
            const descricao = `comando ${numero} (${nome})`;
            return (
              <li
                key={indice}
                className={`sequencia-item${ativo ? ' sequencia-item--ativo' : ''}`}
                aria-current={ativo ? 'step' : undefined}
              >
                <span className="sequencia-numero">{numero}.</span>
                <span className="sequencia-seta" aria-hidden="true">
                  {seta}
                </span>
                <span className="sequencia-nome">{nome}</span>
                <span className="sequencia-acoes">
                  <button
                    ref={registrar(`subir-${indice}`)}
                    type="button"
                    className="botao-icone"
                    onClick={() => mover(indice, -1)}
                    disabled={emExecucao || indice === 0}
                    aria-label={`Subir ${descricao}`}
                    title="Subir"
                  >
                    <span aria-hidden="true">▲</span>
                  </button>
                  <button
                    ref={registrar(`descer-${indice}`)}
                    type="button"
                    className="botao-icone"
                    onClick={() => mover(indice, 1)}
                    disabled={emExecucao || indice === sequencia.length - 1}
                    aria-label={`Descer ${descricao}`}
                    title="Descer"
                  >
                    <span aria-hidden="true">▼</span>
                  </button>
                  <button
                    ref={registrar(`remover-${indice}`)}
                    type="button"
                    className="botao-icone botao-icone--perigo"
                    onClick={() => remover(indice)}
                    disabled={emExecucao}
                    aria-label={`Remover ${descricao}`}
                    title="Remover"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="sequencia-rodape">
        <label className="velocidade">
          Velocidade
          <select
            value={velocidade}
            onChange={(e) => aoMudarVelocidade(e.target.value as IdVelocidade)}
            disabled={emExecucao}
          >
            {VELOCIDADES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.rotulo}
              </option>
            ))}
          </select>
        </label>

        <div className="sequencia-botoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={aoLimpar}
            disabled={vazia || emExecucao}
          >
            Limpar
          </button>
          <button
            type="button"
            className="botao botao--primario"
            onClick={aoExecutar}
            disabled={vazia || emExecucao}
          >
            <span aria-hidden="true">▶ </span>
            {emExecucao ? 'Executando…' : 'Executar'}
          </button>
        </div>
      </div>
    </section>
  );
}
