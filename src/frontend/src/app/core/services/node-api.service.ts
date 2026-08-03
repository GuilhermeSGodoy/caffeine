import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CaffeineNode, CreateNodeRequest, UpdateNodeRequest } from '../models/node.model';
import { API_BASE_URL } from '../api-base-url';

@Injectable({ providedIn: 'root' })
export class NodeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/nodes`;

  getTree() {
    return this.http.get<CaffeineNode[]>(`${this.baseUrl}/tree`);
  }

  create(request: CreateNodeRequest) {
    return this.http.post<CaffeineNode>(this.baseUrl, request);
  }

  update(id: string, request: UpdateNodeRequest) {
    return this.http.put<CaffeineNode>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
