/** Bloco a destacar: só enquanto a execução está em andamento; ao terminar, limpa. */
export function blocoParaDestacar(
  passo: { blocoId?: string | null } | undefined,
  terminou: boolean,
): string | null {
  if (terminou) return null;
  return passo?.blocoId ?? null;
}
