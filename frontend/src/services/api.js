// Cliente HTTP para a API REST do backend (JSON).
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? `Erro ${response.status}`);
  }
  return data;
}
