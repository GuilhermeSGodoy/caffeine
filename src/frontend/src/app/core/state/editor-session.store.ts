import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { DocumentContentApiService } from '../services/document-content-api.service';
import { calculateWordCount } from '../utils/word-count.util';

const AUTO_SAVE_DEBOUNCE_MS = 3000;

@Injectable({ providedIn: 'root' })
export class EditorSessionStore implements OnDestroy {
  private readonly api = inject(DocumentContentApiService);
  private readonly saveRequested = new Subject<void>();
  private readonly saveSubscription: Subscription;

  readonly openNodeId = signal<string | null>(null);
  readonly contentJson = signal<string>('{"type":"doc","content":[{"type":"paragraph","content":[]}]}');
  readonly wordCount = signal(0);
  readonly charCount = signal(0);
  readonly dirty = signal(false);
  readonly saving = signal(false);

  constructor() {
    this.saveSubscription = this.saveRequested
      .pipe(debounceTime(AUTO_SAVE_DEBOUNCE_MS))
      .subscribe(() => this.performSave());
  }

  ngOnDestroy(): void {
    // Sem isso, o timer real do debounce (RxJS usa o scheduler assíncrono padrão, não
    // fake timers) sobrevive à destruição do serviço e dispara depois, chamando a API
    // através de um injector já destruído — é exatamente o que produzia o NG0205
    // intermitente na suíte de testes (issue #37). Em produção o serviço nunca é
    // destruído (providedIn: 'root' vive pela sessão inteira do app), mas isso ainda é
    // higiene correta para qualquer serviço com subscription própria.
    this.saveSubscription.unsubscribe();
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

  onContentChange(json: string, plainText: string): void {
    this.contentJson.set(json);

    const { wordCount, charCount } = calculateWordCount(plainText);
    this.wordCount.set(wordCount);
    this.charCount.set(charCount);

    this.dirty.set(true);
    this.saveRequested.next();
  }

  saveNow(): void {
    this.performSave();
  }

  close(): void {
    this.openNodeId.set(null);
    this.contentJson.set('{"type":"doc","content":[{"type":"paragraph","content":[]}]}');
    this.wordCount.set(0);
    this.charCount.set(0);
    this.dirty.set(false);
    this.saving.set(false);
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
