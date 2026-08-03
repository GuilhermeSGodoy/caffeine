import { Component, OnInit, inject } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem, TreeNode } from 'primeng/api';
import { NodeTreeStore } from '../../core/state/node-tree.store';
import { CaffeineNode, NodeType } from '../../core/models/node.model';

@Component({
  selector: 'app-project-tree',
  standalone: true,
  imports: [TreeModule, ButtonModule, ContextMenuModule],
  templateUrl: './project-tree.component.html',
  styleUrl: './project-tree.component.scss'
})
export class ProjectTreeComponent implements OnInit {
  protected readonly store = inject(NodeTreeStore);

  protected selectedNode: TreeNode<CaffeineNode> | null = null;

  protected readonly contextMenuItems: MenuItem[] = [
    { label: 'Nova pasta', icon: 'pi pi-folder', command: () => this.createChild(NodeType.Folder) },
    { label: 'Novo documento', icon: 'pi pi-file', command: () => this.createChild(NodeType.Document) },
    { label: 'Novo capítulo', icon: 'pi pi-file-edit', command: () => this.createChild(NodeType.Chapter) },
    { separator: true },
    { label: 'Renomear', icon: 'pi pi-pencil', command: () => this.renameSelected() },
    { label: 'Excluir', icon: 'pi pi-trash', command: () => this.deleteSelected() }
  ];

  ngOnInit(): void {
    this.store.load();
  }

  protected createRootFolder(): void {
    const title = window.prompt('Nome da nova pasta:');
    if (title) {
      this.store.createNode(null, NodeType.Folder, title);
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
      this.store.createNode(parent.id, nodeType, title);
    }
  }

  private renameSelected(): void {
    const node = this.selectedNode?.data;
    if (!node) {
      return;
    }

    const title = window.prompt('Novo nome:', node.title);
    if (title) {
      this.store.renameNode(node, title);
    }
  }

  private deleteSelected(): void {
    const node = this.selectedNode?.data;
    if (!node) {
      return;
    }

    if (window.confirm(`Excluir "${node.title}" e todo o seu conteúdo?`)) {
      this.store.deleteNode(node.id);
    }
  }
}
