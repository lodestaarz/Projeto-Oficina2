import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  buscarFase,
  calcularEstrelas,
  executar,
  validarPrograma,
  type Programa,
  type Resultado,
} from '@arrowbot/shared/engine';
import { gerarCodigo, type Linguagem } from '../blocos/codigo';
import { estadoParaPrograma, type EstadoOficina } from '../blocos/converter';
import { usePlayback, VELOCIDADES, type IdVelocidade } from '../blocos/usePlayback';
import { useAuth } from '../contexts/AuthContext';
import { progressoApi } from '../services/api';
import { MapaFase } from '../components/MapaFase';
import { OficinaBlocos, type OficinaHandle } from '../components/OficinaBlocos';

const ESTRELAS = ['☆☆☆', '★☆☆', '★★☆', '★★★'];

/** Tela de uma fase: mapa, blocos, execução animada e código ao lado. */
export default function FasePage() {
  const { id } = useParams();
  const fase = buscarFase(Number(id));
  if (!fase) return <Navigate to="/fases" replace />;
  return <FaseConteudo key={fase.id} faseId={fase.id} />;
}

function FaseConteudo({ faseId }: { faseId: number }) {
  const fase = useMemo(() => buscarFase(faseId)!, [faseId]);
  const oficina = useRef<OficinaHandle>(null);
  const [estado, setEstado] = useState<EstadoOficina>({});
  const [velocidade, setVelocidade] = useState<IdVelocidade>('normal');
  const [lang, setLang] = useState<Linguagem>('js');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [programaRodado, setProgramaRodado] = useState<Programa>([]);
  const [aviso, setAviso] = useState('');
  const [dicasUsadas, setDicasUsadas] = useState(0);

  const passos = resultado?.passos ?? [];
  const pb = usePlayback(passos.length, velocidade);
  const passo = pb.indice >= 0 ? passos[pb.indice] : undefined;
  const robo = passo?.robo ?? fase.inicio;
  const programa = useMemo(() => estadoParaPrograma(estado), [estado]);

  useEffect(() => {
    oficina.current?.destacar(passo?.blocoId ?? null);
  }, [passo]);

  function aoMudar(novo: EstadoOficina) {
    setEstado(novo);
    if (resultado) {
      pb.zerar();
      setResultado(null);
    }
  }

  /** Valida e calcula a execução inteira; a reprodução só mostra o que já foi calculado. */
  function preparar(): Resultado | null {
    const prog = estadoParaPrograma(oficina.current?.estado() ?? {});
    if (prog.length === 0) {
      setAviso('Arraste blocos para baixo de "quando executar" antes de rodar.');
      return null;
    }
    const problema = validarPrograma(fase, prog);
    if (problema) {
      setAviso(problema);
      return null;
    }
    setAviso('');
    const r = executar(fase, prog);
    setProgramaRodado(prog);
    setResultado(r);
    return r;
  }

  function rodar() {
    if (preparar()) pb.iniciar();
  }

  function umPasso() {
    if (!resultado) {
      const r = preparar();
      if (r) pb.avancarUm();
      return;
    }
    pb.avancarUm();
  }

  function recomecar() {
    pb.zerar();
    setResultado(null);
    setAviso('');
  }

  const fim = resultado !== null && pb.terminou;
  const venceu = fim && resultado.status === 'venceu';
  const estrelas = venceu ? calcularEstrelas(fase, programaRodado, resultado, dicasUsadas) : 0;
  const proxima = buscarFase(fase.id + 1);
  const { token } = useAuth();
  const [salvo, setSalvo] = useState<'' | 'ok' | 'erro'>('');

  // Ao vencer, o servidor refaz o cálculo e guarda o melhor resultado (só com login).
  useEffect(() => {
    if (!venceu || !token) return;
    let ativo = true;
    progressoApi
      .registrar(token, fase.id, programaRodado, dicasUsadas)
      .then(() => ativo && setSalvo('ok'))
      .catch(() => ativo && setSalvo('erro'));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venceu, token, fase.id]);

  return (
    <div className="fase">
      <header className="fase-topo">
        <Link to="/fases" className="fase-voltar">
          ← Fases
        </Link>
        <h1 className="titulo-pagina">
          Fase {fase.id}: {fase.titulo}
        </h1>
        <span className="fase-conceito">{fase.conceito}</span>
      </header>
      <p className="fase-enunciado">{fase.enunciado}</p>

      <div className="fase-corpo">
        <section className="fase-mapa" aria-label="Mapa">
          <MapaFase
            fase={fase}
            robo={robo}
            temChave={passo?.temChave ?? false}
            erro={Boolean(passo?.erro)}
          />
          <p className="posicao" aria-live="polite" data-testid="posicao">
            Robô em ({robo.x}, {robo.y})
          </p>

          <div className="fase-controles" role="group" aria-label="Controles de execução">
            <button type="button" className="botao" onClick={rodar} disabled={pb.tocando}>
              ▶ Executar
            </button>
            <button
              type="button"
              className="botao botao--secundario"
              onClick={umPasso}
              disabled={pb.tocando}
            >
              ⏭ Passo
            </button>
            {pb.tocando && (
              <button type="button" className="botao botao--secundario" onClick={pb.pausar}>
                ⏸ Pausar
              </button>
            )}
            <button type="button" className="botao botao--fantasma" onClick={recomecar}>
              ↺ Recomeçar
            </button>
            <label className="fase-velocidade">
              Velocidade
              <select
                value={velocidade}
                onChange={(e) => setVelocidade(e.target.value as IdVelocidade)}
              >
                {VELOCIDADES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="fase-mensagem" role="status" data-testid="mensagem">
            {aviso && <p className="aviso">{aviso}</p>}
            {fim && (
              <>
                <p className={venceu ? 'mensagem-ok' : 'aviso'}>{resultado.mensagem}</p>
                {resultado.erro && <p className="dica-erro">💡 {resultado.erro.dica}</p>}
                {venceu && (
                  <p
                    className="estrelas"
                    aria-label={`${estrelas} de 3 estrelas`}
                    data-testid="estrelas"
                  >
                    {ESTRELAS[estrelas]}
                  </p>
                )}
                {salvo === 'ok' && <p className="fase-enunciado">Progresso salvo.</p>}
                {salvo === 'erro' && <p className="aviso">Não foi possível salvar o progresso.</p>}
                {venceu && proxima && (
                  <Link className="botao" to={`/fases/${proxima.id}`}>
                    Próxima fase →
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="fase-dicas">
            <button
              type="button"
              className="botao botao--fantasma"
              disabled={dicasUsadas >= fase.dicas.length}
              onClick={() => setDicasUsadas((n) => n + 1)}
            >
              💡 Dica ({dicasUsadas}/{fase.dicas.length})
            </button>
            <ol>
              {fase.dicas.slice(0, dicasUsadas).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="fase-blocos" aria-label="Blocos">
          <OficinaBlocos ref={oficina} fase={fase} aoMudar={aoMudar} />
          <div className="fase-codigo">
            <div role="group" aria-label="Linguagem do código" className="fase-abas">
              <button type="button" aria-pressed={lang === 'js'} onClick={() => setLang('js')}>
                JavaScript
              </button>
              <button
                type="button"
                aria-pressed={lang === 'python'}
                onClick={() => setLang('python')}
              >
                Python
              </button>
            </div>
            <pre data-testid="codigo" aria-label="Código equivalente">
              {gerarCodigo(programa, lang)}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
