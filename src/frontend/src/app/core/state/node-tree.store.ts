import { Injectable, computed, inject, signal } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NodeApiService } from '../services/node-api.service';
import { CaffeineNode, NodeType } from '../models/node.model';

const NODE_ICONS: Record<NodeType, string> = {
  [NodeType.Folder]: 'pi pi-folder',
  [NodeType.Project]: 'pi pi-book',
  [NodeType.Document]: 'pi pi-file',
  [NodeType.Chapter]: 'pi pi-file-edit'
};

@Injectable({ providedIn: 'root' })
export class NodeTreeStore {
  private readonly api = inject(NodeApiService);

  private readonly nodes = signal<CaffeineNode[]>([]);

  readonly treeNodes = computed<TreeNode<CaffeineNode>[]>(() => this.buildTree(this.nodes()));

  load() {
    this.api.getTree().subscribe((nodes) => this.nodes.set(nodes));
  }

  createNode(parentId: string | null, nodeType: NodeType, title: string) {
    this.api.create({ parentId, nodeType, title }).subscribe(() => this.load());
  }

  renameNode(node: CaffeineNode, title: string) {
    this.api
      .update(node.id, { title, sortOrder: node.sortOrder, parentId: node.parentId })
      .subscribe(() => this.load());
  }

  moveNode(node: CaffeineNode, newParentId: string | null) {
    this.api
      .update(node.id, { title: node.title, sortOrder: node.sortOrder, parentId: newParentId })
      .subscribe(() => this.load());
  }

  deleteNode(id: string) {
    this.api.delete(id).subscribe(() => this.load());
  }

  private buildTree(nodes: CaffeineNode[]): TreeNode<CaffeineNode>[] {
    const childrenByParent = new Map<string | null, CaffeineNode[]>();

    for (const node of nodes) {
      const siblings = childrenByParent.get(node.parentId) ?? [];
      siblings.push(node);
      childrenByParent.set(node.parentId, siblings);
    }

    const toTreeNode = (node: CaffeineNode): TreeNode<CaffeineNode> => {
      const children = (childrenByParent.get(node.id) ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toTreeNode);

      return {
        key: node.id,
        label: node.title,
        icon: NODE_ICONS[node.nodeType],
        data: node,
        children,
        leaf: children.length === 0
      };
    };

    return (childrenByParent.get(null) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(toTreeNode);
  }
}
