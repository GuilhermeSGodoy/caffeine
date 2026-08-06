import { test, expect } from '@playwright/test';

// Smoke test: confirma que o app carrega e a árvore de projetos aparece. Requer backend e
// frontend de dev já no ar (ver playwright.config.ts). Testes de fluxo mais específicos
// (criar documento, editar, paginação) devem ser adicionados como specs próprias em `e2e/`.
test('carrega o app e exibe a árvore de projetos', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Projetos', { exact: true })).toBeVisible();
});
