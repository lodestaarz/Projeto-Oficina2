import { useId, type InputHTMLAttributes } from 'react';

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  dica?: string;
}

/** Campo de formulário com rótulo e dica ligados ao input (acessibilidade). */
export function Campo({ rotulo, dica, ...props }: CampoProps) {
  const id = useId();
  const idDica = `${id}-dica`;

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} aria-describedby={dica ? idDica : undefined} {...props} />
      {dica && (
        <small id={idDica} className="campo-dica">
          {dica}
        </small>
      )}
    </div>
  );
}
