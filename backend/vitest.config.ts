import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/integration/**'],
    // Valores fixos de teste: nunca use segredos reais aqui.
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'segredo-apenas-para-testes',
      JWT_EXPIRES_IN: '1d',
      GOOGLE_CLIENT_ID: 'client-id-de-teste.apps.googleusercontent.com',
      CORS_ORIGIN: 'http://localhost:5173',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
      reporter: ['text', 'html'],
    },
  },
});
