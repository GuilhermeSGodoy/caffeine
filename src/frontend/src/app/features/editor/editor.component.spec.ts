import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditorComponent } from './editor.component';
import { EditorSessionStore } from '../../core/state/editor-session.store';
import { PaginationEngineService } from '../../core/services/pagination-engine.service';
import { DocumentContent } from '../../core/models/document-content.model';
import { API_BASE_URL } from '../../core/api-base-url';

describe('EditorComponent', () => {
  let http: HttpTestingController;
  let store: EditorSessionStore;
  let paginationEngine: PaginationEngineService;

  const doc: DocumentContent = {
    nodeId: 'doc-1',
    contentJson: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Ola"}]}]}',
    wordCount: 1,
    charCount: 3
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(EditorSessionStore);
    paginationEngine = TestBed.inject(PaginationEngineService);
  });

  afterEach(() => http.verify());

  function createAndOpen() {
    store.open(doc.nodeId);
    http.expectOne(`${API_BASE_URL}/documents/${doc.nodeId}`).flush(doc);

    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('não exibe a folha da página quando nenhum documento está aberto', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const content = nativeElement.querySelector('.editor__content') as HTMLElement;
    expect(content.hidden).toBe(true);
    expect(nativeElement.querySelector('.editor__placeholder')).not.toBeNull();
  });

  it('exibe a contagem de páginas no cabeçalho ao lado da contagem de palavras/caracteres', () => {
    const fixture = createAndOpen();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const status = nativeElement.querySelector('.editor__status');
    expect(status?.textContent).toContain('páginas');
  });

  it('Ctrl+Enter insere um nó pageBreak persistido no documento', () => {
    const fixture = createAndOpen();
    const component = fixture.componentInstance as unknown as { editor: { view: { dom: HTMLElement } } };

    component.editor.view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })
    );

    const json = JSON.parse(store.contentJson());
    expect(json.content.some((node: { type: string }) => node.type === 'pageBreak')).toBe(true);
  });

  it('alterna o alinhamento do texto ao clicar num botão da toolbar', () => {
    const fixture = createAndOpen();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const centerButton = Array.from(nativeElement.querySelectorAll<HTMLButtonElement>('.editor-toolbar__button')).find(
      (button) => button.title === 'Centralizar'
    );
    centerButton?.click();
    fixture.detectChanges();

    const json = JSON.parse(store.contentJson());
    expect(json.content[0].attrs.textAlign).toBe('center');
  });

  it('decide as quebras de página com alturas medidas mockadas sem depender de layout real', () => {
    createAndOpen();

    paginationEngine.blockMeasurer = () => [
      { index: 0, heightPx: 2000, forcedBreakBefore: false },
      { index: 1, heightPx: 100, forcedBreakBefore: false }
    ];

    const fakeRoot = document.createElement('div');
    const blockA = document.createElement('p');
    const blockB = document.createElement('p');
    fakeRoot.append(blockA, blockB);

    const breaks = paginationEngine.computeBreaks(fakeRoot);

    expect(paginationEngine.pageCount()).toBe(2);
    expect(breaks).toEqual([{ breakBeforeBlockIndex: 1, spacerHeightPx: expect.any(Number) }]);
  });

  it('a altura mínima da pilha de páginas escala com o número de páginas, não fica fixa em uma folha', () => {
    const fixture = createAndOpen();
    const component = fixture.componentInstance as unknown as {
      pageStackMinHeightPx: () => number;
      pageHeightPx: number;
      pageGapPx: number;
    };

    paginationEngine.blockMeasurer = () => [
      { index: 0, heightPx: 2000, forcedBreakBefore: false },
      { index: 1, heightPx: 100, forcedBreakBefore: false }
    ];
    paginationEngine.computeBreaks(document.createElement('div'));
    fixture.detectChanges();

    expect(paginationEngine.pageCount()).toBe(2);
    expect(component.pageStackMinHeightPx()).toBe(2 * component.pageHeightPx + 1 * component.pageGapPx);

    const content = fixture.nativeElement.querySelector('.editor__content') as HTMLElement;
    expect(content.style.getPropertyValue('--page-stack-min-height-px')).toBe(
      `${2 * component.pageHeightPx + 1 * component.pageGapPx}px`
    );
  });

  it('recalcula a paginação ao abrir um documento diferente, mesmo sem edição subsequente', async () => {
    const fixture = createAndOpen();
    const computeBreaksSpy = vi.spyOn(paginationEngine, 'computeBreaks');

    const doc2: DocumentContent = {
      nodeId: 'doc-2',
      contentJson: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Outro"}]}]}',
      wordCount: 1,
      charCount: 5
    };
    store.open(doc2.nodeId);
    http.expectOne(`${API_BASE_URL}/documents/${doc2.nodeId}`).flush(doc2);
    fixture.detectChanges();

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(computeBreaksSpy).toHaveBeenCalled();
  });
});
