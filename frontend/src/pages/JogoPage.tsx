import { useCallback, useRef, useState } from 'react';
import { Controles } from '../components/Controles';
import { Grade } from '../components/Grade';
import { ListaDeComandos } from '../components/ListaDeComandos';
import {
  AREA,
  COMANDOS,
  POSICAO_INICIAL,
  VELOCIDADE_PADRAO,
  pausaDaVelocidade,
  textoPosicao,
  type IdVelocidade,
} from '../game/config';
import { mesmaPosicao, move, type Direcao, type Posicao } from '../game/movement';
import { adicionarComando, moverComando, removerComando, runSequence } from '../game/sequence';
import { useExecucao } from '../hooks/useExecucao';
import { useTeclado } from '../hooks/useTeclado';

const AVISO_BORDA = 'Ops! O robô não pode sair da área.';

/** Tela principal: área de movimentação, controles e sequência de comandos. */
export function JogoPage() {
  const [posicao, setPosicao] = useState<Posicao>(POSICAO_INICIAL);
  const [olhando, setOlhando] = useState<Direcao | null>(null);
  const [sequencia, setSequencia] = useState<Direcao[]>([]);
  const [velocidade, setVelocidade] = useState<IdVelocidade>(VELOCIDADE_PADRAO);
  const [batidas, setBatidas] = useState(0);
  const [aviso, setAviso] = useState('');
  const [rastro, setRastro] = useState<Posicao[]>([]);

  // Dados da execução em andamento, usados para saber se um passo bateu na borda.
  const execucaoAtual = useRef<{ inicio: Posicao; passos: Posicao[]; comandos: Direcao[] }>({
    inicio: POSICAO_INICIAL,
    passos: [],
    comandos: [],
  });

  const sinalizarBorda = useCallback(() => {
    setBatidas((n) => n + 1);
    setAviso(AVISO_BORDA);
  }, []);

  const aoPasso = useCallback(
    (nova: Posicao, indice: number) => {
      const { inicio, passos, comandos } = execucaoAtual.current;
      const anterior = indice === 0 ? inicio : (passos[indice - 1] ?? inicio);
      setOlhando(comandos[indice] ?? null);
      setPosicao(nova);
      setRastro((r) => [...r, nova]);
      if (mesmaPosicao(anterior, nova)) sinalizarBorda();
      else setAviso('');
    },
    [sinalizarBorda],
  );

  const aoTerminar = useCallback(() => {
    const final = execucaoAtual.current.passos.at(-1);
    if (final) setAviso(`Sequência concluída! ${textoPosicao(final)}.`);
  }, []);

  const execucao = useExecucao({ pausaMs: pausaDaVelocidade(velocidade), aoPasso, aoTerminar });

  // Movimento direto (RF08, RF09). Bloqueado durante a execução da sequência.
  const mover = useCallback(
    (direcao: Direcao) => {
      if (execucao.emExecucao) return;
      const nova = move(posicao, direcao, AREA);
      setOlhando(direcao);
      setRastro([]);
      if (mesmaPosicao(nova, posicao)) {
        sinalizarBorda();
        return;
      }
      setAviso('');
      setPosicao(nova);
    },
    [execucao.emExecucao, posicao, sinalizarBorda],
  );

  useTeclado(mover);

  // RF11: volta para (0, 0) e interrompe a execução, sem apagar a sequência.
  function recomecar() {
    execucao.parar();
    setPosicao(POSICAO_INICIAL);
    setOlhando(null);
    setRastro([]);
    setBatidas(0);
    setAviso('');
  }

  // RF12: calcula todos os passos com a função pura e reproduz um a um.
  function executar() {
    if (sequencia.length === 0 || execucao.emExecucao) return;
    const passos = runSequence(posicao, sequencia, AREA);
    execucaoAtual.current = { inicio: posicao, passos, comandos: [...sequencia] };
    setRastro([posicao]);
    setAviso('');
    execucao.executar(passos);
  }

  const comandoAtual = execucao.passoAtual !== null ? sequencia[execucao.passoAtual] : undefined;

  return (
    <div className="jogo">
      <section className="jogo-area" aria-labelledby="titulo-area">
        <h1 id="titulo-area" className="titulo-pagina">
          Mova o robô
        </h1>

        <Grade area={AREA} posicao={posicao} olhando={olhando} batidas={batidas} rastro={rastro} />

        <div className="jogo-status">
          <p className="posicao" aria-live="polite" data-testid="posicao">
            {textoPosicao(posicao)}
          </p>
          {comandoAtual && execucao.passoAtual !== null && (
            <p className="passo-atual">
              Passo {execucao.passoAtual + 1} de {sequencia.length}:{' '}
              <strong>
                {COMANDOS[comandoAtual].seta} {COMANDOS[comandoAtual].nome}
              </strong>
            </p>
          )}
          <p className="aviso" role="status">
            {aviso}
          </p>
        </div>
      </section>

      <div className="jogo-paineis">
        <Controles aoMover={mover} aoRecomecar={recomecar} bloqueado={execucao.emExecucao} />

        <ListaDeComandos
          sequencia={sequencia}
          passoAtual={execucao.passoAtual}
          emExecucao={execucao.emExecucao}
          velocidade={velocidade}
          aoAdicionar={(d) => setSequencia((s) => adicionarComando(s, d))}
          aoRemover={(i) => setSequencia((s) => removerComando(s, i))}
          aoMover={(i, delta) => setSequencia((s) => moverComando(s, i, delta))}
          aoLimpar={() => setSequencia([])}
          aoExecutar={executar}
          aoMudarVelocidade={setVelocidade}
        />
      </div>
    </div>
  );
}
