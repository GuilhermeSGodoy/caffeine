import { Injectable, inject, signal } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { DocumentContentApiService } from '../services/document-content-api.service';

const AUTO_SAVE_DEBOUNCE_MS = 3000;

@Injectable({ providedIn: 'root' })
export class EditorSessionStore {
  private readonly api = inject(DocumentContentApiService);
  private readonly saveRequested = new Subject<void>();

  readonly openNodeId = signal<string | null>(null);
  readonly contentJson = signal<string>('{"type":"doc","content":[]}');
  readonly wordCount = signal(0);
  readonly charCount = signal(0);
  readonly dirty = signal(false);
  readonly saving = signal(false);

  constructor() {
    this.saveRequested.pipe(debounceTime(AUTO_SAVE_DEBOUNCE_MS)).subscribe(() => this.performSave());
  }

  open(nodeId: string): void {
    if (this.dirty()) {
      this.performSave();
    }

    this.api.get(nodeId).subscribe((doc) => {
      this.openNodeId.set(nodeId);
      this.contentJson.set(doc.contentJson);
      this.wordCount.set(doc.wordCount);
      this.charCount.set(doc.charCount);
      this.dirty.set(false);
    });
  }

  onContentChange(json: string): void {
    this.contentJson.set(json);
    this.dirty.set(true);
    this.saveRequested.next();
  }

  saveNow(): void {
    this.performSave();
  }

  private performSave(): void {
    const nodeId = this.openNodeId();
    if (!nodeId || !this.dirty()) {
      return;
    }

    this.saving.set(true);
    this.api.save(nodeId, this.contentJson()).subscribe((doc) => {
      this.wordCount.set(doc.wordCount);
      this.charCount.set(doc.charCount);
      this.dirty.set(false);
      this.saving.set(false);
    });
  }
}
