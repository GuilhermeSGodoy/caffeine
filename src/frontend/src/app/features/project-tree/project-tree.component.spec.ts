import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MenuItem } from 'primeng/api';
import { ProjectTreeComponent } from './project-tree.component';
import { NodeTreeStore } from '../../core/state/node-tree.store';
import { EditorSessionStore } from '../../core/state/editor-session.store';
import { CaffeineNode, NodeType } from '../../core/models/node.model';
import { DocumentContent } from '../../core/models/document-content.model';
import { API_BASE_URL } from '../../core/api-base-url';

describe('ProjectTreeComponent', () => {
  let http: HttpTestingController;
  let store: NodeTreeStore;
  let editorSession: EditorSessionStore;

  const folder: CaffeineNode = { id: 'folder-1', parentId: null, nodeType: NodeType.Folder, title: 'Capítulo 1', sortOrder: 0 };
  const documentNode: CaffeineNode = { id: 'document-1', parentId: 'folder-1', nodeType: NodeType.Document, title: 'Documento 1', sortOrder: 0 };
  const chapter: CaffeineNode = { id: 'chapter-1', parentId: 'document-1', nodeType: NodeType.Chapter, title: 'Capítulo A', sortOrder: 0 };

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
    editorSession = TestBed.inject(EditorSessionStore);
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

  describe('contextMenuItems', () => {
    function labelsOf(items: MenuItem[]): string[] {
      return items.filter((item) => !!item.label).map((item) => item.label as string);
    }

    function setup(): { component: ProjectTreeComponent; nodesById: Map<string, unknown> } {
      const fixture = TestBed.createComponent(ProjectTreeComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder, documentNode, chapter]);
      fixture.detectChanges();

      const nodesById = new Map<string, unknown>();
      const collect = (nodes: { key?: string; data: CaffeineNode; children?: unknown[] }[]): void => {
        for (const node of nodes) {
          nodesById.set(node.data.id, node);
          collect((node.children ?? []) as { key?: string; data: CaffeineNode; children?: unknown[] }[]);
        }
      };
      collect(store.treeNodes() as unknown as { key?: string; data: CaffeineNode; children?: unknown[] }[]);

      return { component, nodesById };
    }

    it('oferece apenas criação de pasta e documento quando uma pasta está selecionada', () => {
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(folder.id);

      const labels = labelsOf((component as unknown as { contextMenuItems: () => MenuItem[] }).contextMenuItems());
      expect(labels).toContain('Nova pasta');
      expect(labels).toContain('Novo documento');
      expect(labels).not.toContain('Novo capítulo');
    });

    it('oferece apenas criação de capítulo quando um documento está selecionado', () => {
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(documentNode.id);

      const labels = labelsOf((component as unknown as { contextMenuItems: () => MenuItem[] }).contextMenuItems());
      expect(labels).toContain('Novo capítulo');
      expect(labels).not.toContain('Nova pasta');
      expect(labels).not.toContain('Novo documento');
    });

    it('não oferece nenhuma opção de criação quando um capítulo está selecionado', () => {
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(chapter.id);

      const labels = labelsOf((component as unknown as { contextMenuItems: () => MenuItem[] }).contextMenuItems());
      expect(labels).not.toContain('Nova pasta');
      expect(labels).not.toContain('Novo documento');
      expect(labels).not.toContain('Novo capítulo');
      expect(labels).toEqual(['Renomear', 'Excluir']);
    });
  });

  describe('exclusão de nó aberto no editor', () => {
    function openDocument(nodeId: string): void {
      const doc: DocumentContent = { nodeId, contentJson: '{"type":"doc","content":[]}', wordCount: 0, charCount: 0 };
      editorSession.open(nodeId);
      http.expectOne(`${API_BASE_URL}/documents/${nodeId}`).flush(doc);
    }

    function setup(): { component: ProjectTreeComponent; nodesById: Map<string, { data: CaffeineNode; children?: unknown[] }> } {
      const fixture = TestBed.createComponent(ProjectTreeComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder, documentNode, chapter]);
      fixture.detectChanges();

      const nodesById = new Map<string, { data: CaffeineNode; children?: unknown[] }>();
      const collect = (nodes: { key?: string; data: CaffeineNode; children?: unknown[] }[]): void => {
        for (const node of nodes) {
          nodesById.set(node.data.id, node);
          collect((node.children ?? []) as { key?: string; data: CaffeineNode; children?: unknown[] }[]);
        }
      };
      collect(store.treeNodes() as unknown as { key?: string; data: CaffeineNode; children?: unknown[] }[]);

      return { component, nodesById };
    }

    function triggerDelete(component: ProjectTreeComponent): void {
      const items = (component as unknown as { contextMenuItems: () => MenuItem[] }).contextMenuItems();
      const deleteItem = items.find((item) => item.label === 'Excluir');
      deleteItem?.command?.({} as never);
    }

    beforeEach(() => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('limpa o EditorSessionStore ao excluir o próprio nó atualmente aberto', () => {
      openDocument(documentNode.id);
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(documentNode.id);

      triggerDelete(component);
      http.expectOne(`${API_BASE_URL}/nodes/${documentNode.id}`).flush(null);
      http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder]);

      expect(window.confirm).toHaveBeenCalled();
      expect(editorSession.openNodeId()).toBeNull();
    });

    it('limpa o EditorSessionStore ao excluir um ancestral do nó aberto (cascade delete)', () => {
      openDocument(chapter.id);
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(folder.id);

      triggerDelete(component);
      http.expectOne(`${API_BASE_URL}/nodes/${folder.id}`).flush(null);
      http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([]);

      expect(editorSession.openNodeId()).toBeNull();
    });

    it('não altera o EditorSessionStore ao excluir um nó não relacionado ao que está aberto', () => {
      openDocument(chapter.id);
      const { component, nodesById } = setup();
      (component as unknown as { selectedNode: unknown }).selectedNode = nodesById.get(folder.id);

      const unrelatedFolder: CaffeineNode = { id: 'folder-2', parentId: null, nodeType: NodeType.Folder, title: 'Outra pasta', sortOrder: 1 };
      (component as unknown as { selectedNode: unknown }).selectedNode = { data: unrelatedFolder, children: [] };

      triggerDelete(component);
      http.expectOne(`${API_BASE_URL}/nodes/${unrelatedFolder.id}`).flush(null);
      http.expectOne(`${API_BASE_URL}/nodes/tree`).flush([folder, documentNode, chapter]);

      expect(editorSession.openNodeId()).toBe(chapter.id);
    });
  });
});
