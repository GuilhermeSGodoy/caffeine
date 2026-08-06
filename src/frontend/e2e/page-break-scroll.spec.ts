import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Popula pasta/documento/conteúdo direto via API (evita depender de window.prompt na árvore, que
// bloquearia o teste) e abre o documento na UI real, deixando o cursor pronto no editor.
async function openDocumentWithContent(
  page: Page,
  request: APIRequestContext,
  titleSuffix: string,
  text: string
) {
  const folderTitle = `Pasta E2E ${titleSuffix}`;
  const documentTitle = `Documento E2E ${titleSuffix}`;

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
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
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

  return { editorContent, tiptap: page.locator('.editor__page-stack .tiptap') };
}

// Reproduz o cenário do bug relatado: ao inserir uma quebra manual de página (Ctrl+Enter), a tela
// deve rolar até o topo da página nova, em vez de deixar o usuário rolando manualmente com o
// mouse.
test('ao inserir quebra manual de página com Ctrl+Enter, a tela rola suavemente até o topo da nova página', async ({
  page,
  request
}) => {
  const { editorContent, tiptap } = await openDocumentWithContent(
    page,
    request,
    `fim-${Date.now()}`,
    'Antes da quebra de página.'
  );

  // Confirma que a transição de scroll é suave (scroll-behavior: smooth no container), não um
  // salto instantâneo.
  await expect(editorContent).toHaveCSS('scroll-behavior', 'smooth');

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

// Cenário complementar: a quebra manual também pode ocorrer no MEIO de um parágrafo (cursor entre
// duas frases, não só no fim do documento). Esse caso já expôs um bug diferente durante o
// desenvolvimento — o insertContent do Tiptap reposiciona o cursor com viés para trás internamente,
// então o texto digitado depois da quebra acabava voltando para a página antiga em vez de ir para
// a nova (ver page-break.extension.ts). Este teste garante que o parágrafo é dividido corretamente
// e que a digitação subsequente entra na página nova.
test('ao inserir quebra manual de página no meio de um parágrafo, o texto restante migra para a página nova', async ({
  page,
  request
}) => {
  const firstSentence = 'Primeira parte. ';
  const secondSentence = 'Segunda parte.';

  const { editorContent, tiptap } = await openDocumentWithContent(
    page,
    request,
    `meio-${Date.now()}`,
    firstSentence + secondSentence
  );

  await tiptap.click();

  // Posiciona o cursor entre as duas frases via Range nativo, em vez de simular várias teclas de
  // seta em sequência: o observador de seleção do ProseMirror não é síncrono com o evento nativo,
  // então uma rajada rápida de ArrowRight (sem tempo de digitação humana entre elas) tende a
  // deixar o estado interno do editor desincronizado da seleção do DOM — setar a posição final
  // direto evita essa flakiness.
  await page.evaluate((offset) => {
    const textNode = document.querySelector('.editor__page-stack .tiptap p')?.firstChild;
    if (!textNode) {
      throw new Error('Nó de texto do primeiro parágrafo não encontrado');
    }
    const range = document.createRange();
    range.setStart(textNode, offset);
    range.collapse(true);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, firstSentence.length);

  const scrollTopBeforeBreak = await editorContent.evaluate((el) => el.scrollTop);

  await page.keyboard.press('Control+Enter');

  // O parágrafo deve ser dividido em dois ao redor da quebra: o texto antes do cursor fica na
  // página atual, o texto depois migra para a página nova — sem duplicar nem perder conteúdo.
  const paragraphs = tiptap.locator('p');
  await expect(paragraphs.first()).toHaveText(firstSentence.trim());
  await expect(paragraphs.last()).toHaveText(secondSentence);

  // O cursor pousa exatamente no início do parágrafo remanescente (antes de "Segunda"), não no
  // seu fim — por isso o texto digitado aparece antes dele, não depois.
  await page.keyboard.type('Extra digitado na página nova. ');
  await expect(paragraphs.last()).toHaveText(`Extra digitado na página nova. ${secondSentence}`);

  await expect(async () => {
    const scrollTop = await editorContent.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(scrollTopBeforeBreak);
  }).toPass({ timeout: 5000 });
});
