import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { Editor } from '@tiptap/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-search-replace-dialog',
  standalone: true,
  imports: [DialogModule, InputTextModule, ButtonModule],
  templateUrl: './search-replace-dialog.component.html',
  styleUrl: './search-replace-dialog.component.scss'
})
export class SearchReplaceDialogComponent {
  readonly editor = input<Editor | null>(null);
  readonly visible = input(false);
  readonly searchRequest = input<{ term: string; id: number } | null>(null);
  readonly visibleChange = output<boolean>();

  protected readonly searchTerm = signal('');
  protected readonly replaceTerm = signal('');
  protected readonly caseSensitive = signal(false);

  // O storage da extensão Tiptap não é reativo: este signal é incrementado a cada comando
  // despachado no editor só para forçar o `computed` abaixo a reler `editor.storage` de novo.
  private readonly revision = signal(0);

  protected readonly matchCount = computed(() => {
    this.revision();
    return this.storage()?.matches.length ?? 0;
  });

  protected readonly activeMatchIndex = computed(() => {
    this.revision();
    return this.storage()?.activeMatchIndex ?? -1;
  });

  constructor() {
    // `searchTerm`/`caseSensitive`/`editor` são lidos dentro de `runSearch()` sem rastreamento
    // (`untracked`) de propósito: este efeito só deve reagir a abrir/fechar o diálogo ou a um
    // novo pedido de busca (`searchRequest`, ex.: Ctrl+F com texto selecionado) — não a cada
    // tecla digitada, senão o próprio efeito reescreveria `searchTerm` de volta para o valor do
    // último `searchRequest`, apagando o que o usuário acabou de digitar.
    effect(() => {
      const visible = this.visible();
      const request = this.searchRequest();

      if (!visible) {
        this.searchTerm.set('');
        this.replaceTerm.set('');
        untracked(() => this.editor()?.commands.clearSearch());
        return;
      }

      if (request) {
        this.searchTerm.set(request.term);
      }
      untracked(() => this.runSearch());
    });
  }

  protected onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  protected onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.runSearch();
  }

  protected onCaseSensitiveChange(checked: boolean): void {
    this.caseSensitive.set(checked);
    this.runSearch();
  }

  protected nextMatch(): void {
    this.editor()?.commands.nextMatch();
    this.revision.update((value) => value + 1);
  }

  protected previousMatch(): void {
    this.editor()?.commands.previousMatch();
    this.revision.update((value) => value + 1);
  }

  protected replaceCurrent(): void {
    this.editor()?.commands.replaceCurrent(this.replaceTerm());
    this.revision.update((value) => value + 1);
  }

  protected replaceAll(): void {
    this.editor()?.commands.replaceAll(this.replaceTerm());
    this.revision.update((value) => value + 1);
  }

  private runSearch(): void {
    this.editor()?.commands.search(this.searchTerm(), { caseSensitive: this.caseSensitive() });
    this.revision.update((value) => value + 1);
  }

  private storage() {
    return this.editor()?.storage.searchAndReplace;
  }
}
