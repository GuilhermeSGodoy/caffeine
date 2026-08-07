import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { PageBreak } from './page-break.extension';
import { PaginationExtension } from './pagination.extension';
import { PaginationEngineService } from '../services/pagination-engine.service';

// blockMeasurer é stubado (mesmo padrão de editor.component.spec.ts) para isolar a lógica de
// decoration da medição real de DOM via getBoundingClientRect, que o jsdom não calcula.
async function flushDecorations(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

describe('PaginationExtension', () => {
  let paginationEngine: PaginationEngineService;
  let editor: Editor;

  afterEach(() => editor?.destroy());

  it('aplica o espaçador como margin-top no primeiro bloco quando a quebra manual é a primeira do documento (página inicial vazia)', async () => {
    paginationEngine = new PaginationEngineService();
    paginationEngine.blockMeasurer = () => [{ index: 0, heightPx: 50, forcedBreakCount: 1 }];

    editor = new Editor({
      extensions: [StarterKit, PageBreak, PaginationExtension.configure({ paginationEngine })],
      content: '<div data-type="page-break"></div><p></p>'
    });

    await flushDecorations();

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement;
    expect(paragraph.style.marginTop).not.toBe('');
    expect(paginationEngine.pageCount()).toBe(2);
  });

  it('continua aplicando o espaçador como margin-bottom no bloco anterior quando a quebra não é a primeira do documento', async () => {
    paginationEngine = new PaginationEngineService();
    paginationEngine.blockMeasurer = () => [
      { index: 0, heightPx: 50, forcedBreakCount: 0 },
      { index: 1, heightPx: 50, forcedBreakCount: 1 }
    ];

    editor = new Editor({
      extensions: [StarterKit, PageBreak, PaginationExtension.configure({ paginationEngine })],
      content: '<p>Antes</p><div data-type="page-break"></div><p>Depois</p>'
    });

    await flushDecorations();

    const paragraphs = editor.view.dom.querySelectorAll('p');
    expect((paragraphs[0] as HTMLElement).style.marginBottom).not.toBe('');
    expect((paragraphs[1] as HTMLElement).style.marginTop).toBe('');
    expect(paginationEngine.pageCount()).toBe(2);
  });

  it('escala o espaçador e a contagem de páginas quando há múltiplas quebras manuais consecutivas antes do primeiro bloco', async () => {
    paginationEngine = new PaginationEngineService();
    paginationEngine.blockMeasurer = () => [{ index: 0, heightPx: 50, forcedBreakCount: 2 }];

    editor = new Editor({
      extensions: [StarterKit, PageBreak, PaginationExtension.configure({ paginationEngine })],
      content: '<div data-type="page-break"></div><div data-type="page-break"></div><p></p>'
    });

    await flushDecorations();

    const paragraph = editor.view.dom.querySelector('p') as HTMLElement;
    expect(paragraph.style.marginTop).not.toBe('');
    expect(paginationEngine.pageCount()).toBe(3);
  });
});
