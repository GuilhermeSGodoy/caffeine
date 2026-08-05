import { defineConfig } from '@playwright/test';

// Assume que o backend (porta 5000) e o frontend (`ng serve`, porta 4200) já estão rodando
// localmente — ver scripts/dev-backend.ps1 e scripts/dev-frontend.ps1. Testes E2E validam
// layout/DOM real de navegador, que os specs Angular/Vitest (jsdom) não conseguem verificar.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure'
  }
});
