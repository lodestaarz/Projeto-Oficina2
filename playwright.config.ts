import { defineConfig, devices } from '@playwright/test';

const databaseUrl = process.env.E2E_DATABASE_URL ?? 'postgres://app:app@localhost:5432/arrowbot';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'pt-BR',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
  ],
  webServer: [
    {
      command: 'npm run dev -w backend',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'development',
        PORT: '3001',
        CORS_ORIGIN: 'http://localhost:5173',
        DATABASE_URL: databaseUrl,
        JWT_SECRET: process.env.JWT_SECRET ?? 'segredo-apenas-para-e2e',
        JWT_EXPIRES_IN: '1d',
      },
    },
    {
      command: 'npm run dev -w frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      env: { VITE_GOOGLE_CLIENT_ID: '' },
    },
  ],
});
