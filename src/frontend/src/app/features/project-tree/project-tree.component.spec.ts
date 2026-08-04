import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectTreeComponent } from './project-tree.component';
import { NodeTreeStore } from '../../core/state/node-tree.store';
import { CaffeineNode, NodeType } from '../../core/models/node.model';
import { API_BASE_URL } from '../../core/api-base-url';

describe('ProjectTreeComponent', () => {
  let http: HttpTestingController;
  let store: NodeTreeStore;

  const folder: CaffeineNode = { id: 'folder-1', parentId: null, nodeType: NodeType.Folder, title: 'Capítulo 1', sortOrder: 0 };

  beforeEach(() => {
    window.matchMedia ??= () =>
      ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {}
      }) as unknown as MediaQueryList;

    TestBed.configureTestingModule({
      imports: [ProjectTreeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(NodeTreeStore);
  });

  afterEach(() => http.verify());

  it('mantém o nó selecionado sincronizado com o nome atual após renomeações sucessivas', () => {
    const fixture = TestBed.createComponent(ProjectTreeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder]);
    fixture.detectChanges();

    const nodeInTree = store.treeNodes()[0];
    (component as unknown as { selectedNode: unknown }).selectedNode = nodeInTree;

    store.renameNode(folder, 'Capítulo Renomeado');
    http.expectOne(`${API_BASE_URL}/nodes/${folder.id}`).flush({ ...folder, title: 'Capítulo Renomeado' });
    http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([{ ...folder, title: 'Capítulo Renomeado' }]);
    fixture.detectChanges();

    const selectedNode = (component as unknown as { selectedNode: { data: CaffeineNode } | null }).selectedNode;
    expect(selectedNode?.data.title).toBe('Capítulo Renomeado');
  });
});
