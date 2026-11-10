import { useCallback, useState } from 'react';
import { ApiError } from '../services/api';

/**
 * Controla o estado de um envio (enviando, mensagem de erro) para os
 * formulários de login e cadastro.
 */
export function useEnvioDeFormulario() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = useCallback(async (acao: () => Promise<void>) => {
    setEnviando(true);
    setErro('');
    try {
      await acao();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Algo deu errado. Tente de novo.');
      setEnviando(false);
    }
  }, []);

  return { enviando, erro, enviar };
}
