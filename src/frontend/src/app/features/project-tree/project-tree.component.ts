import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { TreeNodeCollapseEvent, TreeNodeExpandEvent, TreeNodeSelectEvent } from 'primeng/types/tree';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem, TreeNode } from 'primeng/api';
import { NodeTreeStore } from '../../core/state/node-tree.store';
import { CaffeineNode, NodeType } from '../../core/models/node.model';
import { EditorSessionStore } from '../../core/state/editor-session.store';
import { SettingsDialogComponent } from '../settings/settings-dialog.component';

const OPENABLE_NODE_TYPES = new Set([NodeType.Document, NodeType.Chapter]);

const ALLOWED_CHILD_TYPES: Record<NodeType, NodeType[]> = {
  [NodeType.Folder]: [NodeType.Folder, NodeType.Document],
  [NodeType.Project]: [NodeType.Document],
  [NodeType.Document]: [NodeType.Chapter],
  [NodeType.Chapter]: []
};

@Component({
  selector: 'app-project-tree',
  standalone: true,
  imports: [TreeModule, ButtonModule, ContextMenuModule, SettingsDialogComponent],
  templateUrl: './project-tree.component.html',
  styleUrl: './project-tree.component.scss'
})
export class ProjectTreeComponent implements OnInit {
  protected readonly store = inject(NodeTreeStore);
  private readonly editorSession = inject(EditorSessionStore);

  private readonly selectedNodeSignal = signal<TreeNode<CaffeineNode> | null>(null);
  protected settingsVisible = false;

  protected get selectedNode(): TreeNode<CaffeineNode> | null {
    return this.selectedNodeSignal();
  }

  protected set selectedNode(value: TreeNode<CaffeineNode> | null) {
    this.selectedNodeSignal.set(value);
  }

  constructor() {
    effect(() => {
      const nodes = this.store.treeNodes();
      const current = untracked(() => this.selectedNode);
      if (current) {
        this.selectedNode = this.findNodeByKey(nodes, current.key);
      }
    });
  }

  protected onNodeSelect(event: TreeNodeSelectEvent): void {
    const node = (event.node as TreeNode<CaffeineNode>).data;
    if (node && OPENABLE_NODE_TYPES.has(node.nodeType)) {
      this.editorSession.open(node.id);
    }
  }

  protected onNodeExpand(event: TreeNodeExpandEvent): void {
    const node = (event.node as TreeNode<CaffeineNode>).data;
    if (node) {
      this.store.setExpanded(node.id, true);
    }
  }

  protected onNodeCollapse(event: TreeNodeCollapseEvent): void {
    const node = (event.node as TreeNode<CaffeineNode>).data;
    if (node) {
      this.store.setExpanded(node.id, false);
    }
  }

  protected readonly contextMenuItems = computed<MenuItem[]>(() => {
    const selected = this.selectedNodeSignal()?.data;
    const allowedChildren = selected ? ALLOWED_CHILD_TYPES[selected.nodeType] : [];

    const creationItems: MenuItem[] = [];
    if (allowedChildren.includes(NodeType.Folder)) {
      creationItems.push({ label: 'Nova pasta', icon: 'pi pi-folder', command: () => this.createChild(NodeType.Folder) });
    }
    if (allowedChildren.includes(NodeType.Document)) {
      creationItems.push({ label: 'Novo documento', icon: 'pi pi-file', command: () => this.createChild(NodeType.Document) });
    }
    if (allowedChildren.includes(NodeType.Chapter)) {
      creationItems.push({ label: 'Novo capítulo', icon: 'pi pi-file-edit', command: () => this.createChild(NodeType.Chapter) });
    }
    if (creationItems.length > 0) {
      creationItems.push({ separator: true });
    }

    return [
      ...creationItems,
      { label: 'Renomear', icon: 'pi pi-pencil', command: () => this.renameSelected() },
      { label: 'Excluir', icon: 'pi pi-trash', command: () => this.deleteSelected() }
    ];
  });

  ngOnInit(): void {
    this.store.load();
  }

  protected openSettings(): void {
    this.settingsVisible = true;
  }

  protected createRootFolder(): void {
    const title = window.prompt('Nome da nova pasta:');
    if (title) {
      this.store.createNode(null, NodeType.Folder, title, (message) => window.alert(message));
    }
  }

  private createChild(nodeType: NodeType): void {
    const parent = this.selectedNode?.data;
    if (!parent) {
      return;
    }

    const label = nodeType === NodeType.Folder ? 'pasta' : nodeType === NodeType.Document ? 'documento' : 'capítulo';
    const title = window.prompt(`Nome do novo ${label}:`);
    if (title) {
      this.store.createNode(parent.id, nodeType, title, (message) => window.alert(message));
    }
  }

  private renameSelected(): void {
    const node = this.selectedNode?.data;
    if (!node) {
      return;
    }

    const title = window.prompt('Novo nome:', node.title);
    if (title) {
      this.store.renameNode(node, title, (message) => window.alert(message));
    }
  }

  private findNodeByKey(nodes: TreeNode<CaffeineNode>[], key: string | undefined): TreeNode<CaffeineNode> | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }

      const found = this.findNodeByKey(node.children ?? [], key);
      if (found) {
        return found;
      }
    }

    return null;
  }

  private deleteSelected(): void {
    const node = this.selectedNode?.data;
    if (!node) {
      return;
    }

    if (window.confirm(`Excluir "${node.title}" e todo o seu conteúdo?`)) {
      const openNodeId = this.editorSession.openNodeId();
      if (openNodeId && this.selectedNode && this.collectIds(this.selectedNode).includes(openNodeId)) {
        this.editorSession.close();
      }
      this.store.deleteNode(node.id);
    }
  }

  private collectIds(node: TreeNode<CaffeineNode>): string[] {
    const ids = node.data ? [node.data.id] : [];
    for (const child of node.children ?? []) {
      ids.push(...this.collectIds(child as TreeNode<CaffeineNode>));
    }
    return ids;
  }
}
