import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentContent } from '../models/document-content.model';
import { API_BASE_URL } from '../api-base-url';

@Injectable({ providedIn: 'root' })
export class DocumentContentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/documents`;

  get(nodeId: string) {
    return this.http.get<DocumentContent>(`${this.baseUrl}/${nodeId}`);
  }

  save(nodeId: string, contentJson: string) {
    return this.http.put<DocumentContent>(`${this.baseUrl}/${nodeId}`, { contentJson });
  }
}
