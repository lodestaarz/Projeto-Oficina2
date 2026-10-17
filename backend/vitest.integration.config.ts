import { defineConfig } from 'vitest/config';

// Testes de integração com um PostgreSQL de verdade.
// Exigem TEST_DATABASE_URL (ex.: postgres://app:app@localhost:5432/arrowbot_test).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // Os arquivos compartilham o mesmo banco, então rodam um de cada vez.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'segredo-apenas-para-testes',
      GOOGLE_CLIENT_ID: 'client-id-de-teste.apps.googleusercontent.com',
    },
  },
});
