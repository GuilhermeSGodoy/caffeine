import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditorSessionStore } from './editor-session.store';
import { DocumentContent } from '../models/document-content.model';
import { API_BASE_URL } from '../api-base-url';

describe('EditorSessionStore', () => {
  let store: EditorSessionStore;
  let http: HttpTestingController;

  const doc: DocumentContent = {
    nodeId: 'doc-1',
    contentJson: '{"type":"doc","content":[]}',
    wordCount: 0,
    charCount: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    store = TestBed.inject(EditorSessionStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('atualiza a contagem de palavras/caracteres imediatamente ao digitar, sem esperar o auto-save', () => {
    store.open(doc.nodeId);
    http.expectOne(`${API_BASE_URL}/documents/${doc.nodeId}`).flush(doc);

    store.onContentChange('{"type":"doc","content":[]}', 'Hello world');

    expect(store.wordCount()).toBe(2);
    expect(store.charCount()).toBe(10);
  });

  it('close() limpa a sessão do editor, voltando ao estado inicial', () => {
    store.open(doc.nodeId);
    http.expectOne(`${API_BASE_URL}/documents/${doc.nodeId}`).flush(doc);
    store.onContentChange('{"type":"doc","content":[]}', 'Hello world');

    store.close();

    expect(store.openNodeId()).toBeNull();
    expect(store.wordCount()).toBe(0);
    expect(store.charCount()).toBe(0);
    expect(store.dirty()).toBe(false);
  });
});
