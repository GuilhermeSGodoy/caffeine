import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  effect,
  inject
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorSessionStore } from '../../core/state/editor-session.store';

@Component({
  selector: 'app-editor',
  standalone: true,
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) private readonly editorHost!: ElementRef<HTMLElement>;

  protected readonly store = inject(EditorSessionStore);

  private editor: Editor | null = null;
  private lastLoadedNodeId: string | null = null;

  constructor() {
    effect(() => {
      const nodeId = this.store.openNodeId();
      const contentJson = this.store.contentJson();

      if (this.editor && nodeId && nodeId !== this.lastLoadedNodeId) {
        this.lastLoadedNodeId = nodeId;
        this.editor.commands.setContent(JSON.parse(contentJson), { emitUpdate: false });
      }
    });
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorHost.nativeElement,
      extensions: [StarterKit],
      content: JSON.parse(this.store.contentJson()),
      onUpdate: ({ editor }) => this.store.onContentChange(JSON.stringify(editor.getJSON()), editor.getText())
    });
    this.lastLoadedNodeId = this.store.openNodeId();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.store.saveNow();
    }
  }
}
