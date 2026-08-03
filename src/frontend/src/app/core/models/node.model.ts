export enum NodeType {
  Folder = 0,
  Project = 1,
  Document = 2,
  Chapter = 3
}

export interface CaffeineNode {
  id: string;
  parentId: string | null;
  nodeType: NodeType;
  title: string;
  sortOrder: number;
}

export interface CreateNodeRequest {
  parentId: string | null;
  nodeType: NodeType;
  title: string;
}

export interface UpdateNodeRequest {
  title: string;
  sortOrder: number;
  parentId: string | null;
}
