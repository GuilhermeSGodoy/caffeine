import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NodeTreeStore } from './node-tree.store';
import { CaffeineNode, NodeType } from '../models/node.model';
import { API_BASE_URL } from '../api-base-url';

describe('NodeTreeStore', () => {
  let store: NodeTreeStore;
  let http: HttpTestingController;

  const folder: CaffeineNode = { id: 'folder-1', parentId: null, nodeType: NodeType.Folder, title: 'Pasta', sortOrder: 0 };
  const document: CaffeineNode = { id: 'doc-1', parentId: 'folder-1', nodeType: NodeType.Document, title: 'Doc', sortOrder: 0 };
  const newChapter: CaffeineNode = { id: 'chap-1', parentId: 'folder-1', nodeType: NodeType.Chapter, title: 'Cap', sortOrder: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    store = TestBed.inject(NodeTreeStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mantém pastas expandidas ao criar um novo nó', () => {
    store.load();
    http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder, document]);

    store.setExpanded(folder.id, true);
    expect(store.treeNodes()[0].expanded).toBe(true);

    store.createNode(folder.id, NodeType.Chapter, newChapter.title);
    http.expectOne(`${API_BASE_URL}/nodes`).flush(newChapter);
    http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder, document, newChapter]);

    expect(store.treeNodes()[0].expanded).toBe(true);
    expect(store.treeNodes()[0].children?.length).toBe(2);
  });
});
