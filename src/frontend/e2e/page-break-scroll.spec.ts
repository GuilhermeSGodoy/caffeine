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
    content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }]
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
  // seta em sequência (uma rajada rápida de ArrowRight sem tempo de digitação humana entre elas
  // tende a deixar o estado interno do editor desincronizado da seleção do DOM). Espera o evento
  // "selectionchange" disparar antes de seguir: ele é assíncrono (fila de tarefas do navegador) —
  // sem esperar por ele, o ProseMirror ocasionalmente só sincroniza sua seleção interna depois do
  // Ctrl+Enter já ter sido processado contra a seleção antiga (flakiness observada em CI).
  await page.evaluate(
    (offset) =>
      new Promise<void>((resolve) => {
        document.addEventListener('selectionchange', () => resolve(), { once: true });

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
      }),
    firstSentence.length
  );

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

// Bug relatado após validação manual: ao inserir uma quebra manual de página (criando uma página 2
// em branco) e então apertar Ctrl+Enter DE NOVO ainda sobre o parágrafo vazio da página 2 (querendo
// uma página 3), o cursor voltava para a página anterior em vez de criar a página nova — a quebra
// manual só funcionava quando o parágrafo atual tinha pelo menos 1 caractere. Causa raiz: o
// insertContent do Tiptap substitui um parágrafo vazio pelo próprio nó da quebra (em vez de dividi-
// lo), sem sobrar nenhum parágrafo depois — ver page-break.extension.ts. A correção detecta esse
// caso e insere a quebra ANTES do parágrafo vazio, que passa a ser o parágrafo da página nova (sem
// duplicá-lo).
test('ao inserir quebra manual de página no parágrafo vazio de uma página recém-criada, uma página nova em branco é criada sem voltar o cursor para a página anterior', async ({
  page,
  request
}) => {
  const { editorContent, tiptap } = await openDocumentWithContent(
    page,
    request,
    `vazio-${Date.now()}`,
    'Conteúdo da página 1.'
  );

  await tiptap.click();
  await expect(tiptap).toHaveClass(/ProseMirror-focused/);

  // Posiciona o cursor no fim do texto via Control+End (evento nativo de teclado, que passa pelo
  // próprio pipeline de seleção do ProseMirror) em vez de um Range manual via page.evaluate: setar
  // a seleção diretamente no DOM não é reconciliado de forma síncrona pelo ProseMirror antes do
  // Ctrl+Enter seguinte, causando flakiness (o handler roda contra uma seleção desatualizada).
  await page.keyboard.press('Control+End');

  const pageBreaks = tiptap.locator('[data-type="page-break"]');
  const paragraphs = tiptap.locator('p');

  // Round-trip ao navegador antes do Ctrl+Enter: dá ao ProseMirror uma volta do event loop para
  // sincronizar a seleção movida pelo Control+End antes do próximo atalho de teclado — sem isso,
  // o handler do Mod-Enter ocasionalmente roda contra a seleção anterior (flakiness observada em
  // CI, ver comentário acima sobre o Range manual).
  await editorContent.evaluate((el) => el.scrollTop);

  // Primeira quebra: caminho já existente (parágrafo com texto), cria a página 2 com um parágrafo
  // vazio — ponto de partida para reproduzir o bug relatado.
  await page.keyboard.press('Control+Enter');
  await expect(pageBreaks).toHaveCount(1);
  await expect(paragraphs).toHaveCount(2);
  await expect(paragraphs.last()).toHaveText('');

  const scrollTopBeforeSecondBreak = await editorContent.evaluate((el) => el.scrollTop);

  // Segunda quebra: cursor ainda no parágrafo vazio da página 2 — é exatamente o cenário do bug.
  await page.keyboard.press('Control+Enter');

  // O parágrafo vazio da página 2 não é duplicado: ele próprio passa a ser o parágrafo da página 3,
  // e o cursor permanece nele (não deve voltar para a página 1 ou 2).
  await expect(pageBreaks).toHaveCount(2);
  await expect(paragraphs).toHaveCount(2);
  await expect(paragraphs.first()).toHaveText('Conteúdo da página 1.');
  await expect(paragraphs.last()).toHaveText('');

  await page.keyboard.type('Texto na página 3.');
  await expect(paragraphs.first()).toHaveText('Conteúdo da página 1.');
  await expect(paragraphs.last()).toHaveText('Texto na página 3.');

  await expect(async () => {
    const scrollTop = await editorContent.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(scrollTopBeforeSecondBreak);
  }).toPass({ timeout: 5000 });
});

// Bug relatado: ao voltar o cursor para uma página que já tem uma página seguinte (com conteúdo) e
// apertar Ctrl+Enter, nenhuma página nova era criada — o cursor apenas pulava para a página
// seguinte já existente (ver page-break.extension.ts). Este teste garante que uma página nova de
// fato é inserida entre as duas, sem tocar na página seguinte.
test('ao inserir quebra manual de página numa página que já tem uma página seguinte, uma página nova é criada entre as duas', async ({
  page,
  request
}) => {
  const { editorContent, tiptap } = await openDocumentWithContent(
    page,
    request,
    `seguinte-${Date.now()}`,
    'Conteúdo da página 1.'
  );

  await tiptap.click();
  await expect(tiptap).toHaveClass(/ProseMirror-focused/);

  await page.keyboard.press('Control+End');
  await editorContent.evaluate((el) => el.scrollTop);

  // Cria a página 2 com conteúdo (já não está mais vazia) para reproduzir o cenário do bug.
  await page.keyboard.press('Control+Enter');
  await page.keyboard.type('Conteúdo da página 2.');

  const pageBreaks = tiptap.locator('[data-type="page-break"]');
  const paragraphs = tiptap.locator('p');
  await expect(pageBreaks).toHaveCount(1);
  await expect(paragraphs).toHaveCount(2);

  // Volta o cursor para o fim da página 1 (que já tem uma página seguinte com conteúdo).
  await tiptap.locator('p').first().click();
  await editorContent.evaluate((el) => el.scrollTop);
  await page.keyboard.press('End');
  await editorContent.evaluate((el) => el.scrollTop);

  await page.keyboard.press('Control+Enter');

  // Uma página nova (vazia) é criada entre a página 1 e a página 2 — a página 2 não é tocada nem
  // reaproveitada como a página nova, apenas empurrada para depois dela.
  await expect(pageBreaks).toHaveCount(2);
  await expect(paragraphs).toHaveCount(3);
  await expect(paragraphs.nth(0)).toHaveText('Conteúdo da página 1.');
  await expect(paragraphs.nth(1)).toHaveText('');
  await expect(paragraphs.nth(2)).toHaveText('Conteúdo da página 2.');

  // O cursor fica na página nova (vazia), não na página 2 já existente.
  await page.keyboard.type('Texto na página nova.');
  await expect(paragraphs.nth(1)).toHaveText('Texto na página nova.');
  await expect(paragraphs.nth(2)).toHaveText('Conteúdo da página 2.');
});
