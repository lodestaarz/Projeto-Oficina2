import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FASES } from '@arrowbot/shared/engine';
import { useAuth } from '../contexts/AuthContext';
import { progressoApi } from '../services/api';

/** Lista das fases agrupadas por conceito. */
export function SelecaoFasesPage() {
  const { token } = useAuth();
  const [estrelas, setEstrelas] = useState<Record<number, number>>({});
  useEffect(() => {
    if (!token) return;
    const ctl = new AbortController();
    progressoApi
      .listar(token, ctl.signal)
      .then((r) => setEstrelas(Object.fromEntries(r.progresso.map((p) => [p.faseId, p.estrelas]))))
      .catch(() => undefined);
    return () => ctl.abort();
  }, [token]);
  const conceitos = [...new Set(FASES.map((f) => f.conceito))];
  return (
    <div className="fases">
      <h1 className="titulo-pagina">Fases</h1>
      <p className="fase-enunciado">Monte blocos para guiar o robô até a bandeira.</p>
      {conceitos.map((c) => (
        <section key={c} aria-labelledby={`c-${c}`}>
          <h2 id={`c-${c}`} className="fases-conceito">
            {c}
          </h2>
          <ul className="fases-lista">
            {FASES.filter((f) => f.conceito === c).map((f) => (
              <li key={f.id}>
                <Link to={`/fases/${f.id}`} className="fases-cartao">
                  <span className="fases-num">{f.id}</span>
                  <span>{f.titulo}</span>
                  {estrelas[f.id] ? (
                    <span
                      aria-label={`${estrelas[f.id]} de 3 estrelas`}
                      data-testid={`estrelas-fase-${f.id}`}
                    >
                      {'★'.repeat(estrelas[f.id] ?? 0)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
