import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Reproduz o cenário do bug relatado: ao inserir uma quebra manual de página (Ctrl+Enter), a tela
// deve rolar até o topo da página nova, em vez de deixar o usuário rolando manualmente com o
// mouse. Popula pasta/documento/conteúdo direto via API (evita depender de window.prompt na
// árvore, que bloquearia o teste) e só usa a UI real para abrir o documento e disparar o atalho.
test('ao inserir quebra manual de página com Ctrl+Enter, a tela rola suavemente até o topo da nova página', async ({
  page,
  request
}) => {
  const suffix = Date.now();
  const folderTitle = `Pasta E2E ${suffix}`;
  const documentTitle = `Documento E2E ${suffix}`;

  const folderResponse = await request.post(`${API_BASE_URL}/nodes`, {
    data: { parentId: null, nodeType: 0, title: folderTitle }
  });
  expect(folderResponse.ok()).toBeTruthy();
  const folder = await folderResponse.json();

  const documentResponse = await request.post(`${API_BASE_URL}/nodes`, {
    data: { parentId: folder.id, nodeType: 2, title: documentTitle }
  });
  expect(documentResponse.ok()).toBeTruthy();
  const document = await documentResponse.json();

  const contentJson = JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Antes da quebra de página.' }] }]
  });
  const saveResponse = await request.put(`${API_BASE_URL}/documents/${document.id}`, {
    data: { contentJson }
  });
  expect(saveResponse.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.getByText('Projetos', { exact: true })).toBeVisible();

  const folderNode = page.getByRole('treeitem', { name: folderTitle });
  await expect(folderNode).toBeVisible();
  await folderNode.locator('.p-tree-node-toggle-button').click();

  await page.getByRole('treeitem', { name: documentTitle }).click();

  const editorContent = page.locator('.editor__content');
  await expect(editorContent).toBeVisible();

  // Confirma que a transição de scroll é suave (scroll-behavior: smooth no container), não um
  // salto instantâneo.
  await expect(editorContent).toHaveCSS('scroll-behavior', 'smooth');

  const tiptap = page.locator('.editor__page-stack .tiptap');
  await tiptap.click();
  await page.keyboard.press('Control+End');

  const scrollTopBeforeBreak = await editorContent.evaluate((el) => el.scrollTop);

  await page.keyboard.press('Control+Enter');
  await page.keyboard.type('Depois da quebra, já na página 2.');

  // O scroll até o topo da página nova só é aplicado depois que a decoration assíncrona de
  // paginação empurra o layout (ambas via requestAnimationFrame) — por isso o poll, em vez de
  // uma espera fixa.
  await expect(async () => {
    const scrollTop = await editorContent.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(scrollTopBeforeBreak);
  }).toPass({ timeout: 5000 });
});
