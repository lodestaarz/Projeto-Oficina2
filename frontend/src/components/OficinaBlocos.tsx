import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Fase } from '@arrowbot/shared/engine';
import { Blockly, criarOficina } from '../blocos/definicoes';
import type { EstadoOficina } from '../blocos/converter';

export interface OficinaHandle {
  estado(): EstadoOficina;
  destacar(id: string | null): void;
}

interface OficinaProps {
  fase: Fase;
  aoMudar: (estado: EstadoOficina) => void;
}

/** Área de montagem dos blocos (Blockly): arrastar/soltar e teclado. */
export const OficinaBlocos = forwardRef<OficinaHandle, OficinaProps>(function OficinaBlocos(
  { fase, aoMudar },
  ref,
) {
  const elemento = useRef<HTMLDivElement>(null);
  const oficina = useRef<Blockly.WorkspaceSvg | null>(null);
  const aoMudarRef = useRef(aoMudar);
  aoMudarRef.current = aoMudar;

  useEffect(() => {
    if (!elemento.current) return;
    const ws = criarOficina(elemento.current, fase);
    oficina.current = ws;
    const ler = () => Blockly.serialization.workspaces.save(ws) as EstadoOficina;
    ws.addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.isUiEvent) return;
      aoMudarRef.current(ler());
    });
    aoMudarRef.current(ler());
    const ro = new ResizeObserver(() => Blockly.svgResize(ws));
    ro.observe(elemento.current);
    return () => {
      ro.disconnect();
      ws.dispose();
      oficina.current = null;
    };
  }, [fase]);

  useImperativeHandle(ref, () => ({
    estado: () =>
      oficina.current
        ? (Blockly.serialization.workspaces.save(oficina.current) as EstadoOficina)
        : {},
    destacar: (id) => oficina.current?.highlightBlock(id),
  }));

  return (
    <div
      ref={elemento}
      className="oficina"
      data-testid="oficina"
      aria-label="Área de montagem dos blocos"
    />
  );
});
