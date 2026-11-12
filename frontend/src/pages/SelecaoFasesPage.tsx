import { Link } from 'react-router-dom';
import { FASES } from '@arrowbot/shared/engine';

/** Lista das fases agrupadas por conceito. */
export function SelecaoFasesPage() {
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
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
