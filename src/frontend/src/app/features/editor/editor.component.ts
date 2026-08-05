import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { EditorSessionStore } from '../../core/state/editor-session.store';
import { ThemeStore } from '../../core/state/theme.store';
import { findTheme } from '../../core/theming/theme-catalog';
import { PageBreak } from '../../core/tiptap/page-break.extension';
import { TabIndent } from '../../core/tiptap/tab-indent.extension';
import { PaginationExtension } from '../../core/tiptap/pagination.extension';
import { PaginationEngineService } from '../../core/services/pagination-engine.service';
import { EditorToolbarComponent } from './editor-toolbar/editor-toolbar.component';
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  PAGE_GAP_PX,
  PAGE_MARGIN_BOTTOM_PX,
  PAGE_MARGIN_LEFT_PX,
  PAGE_MARGIN_RIGHT_PX,
  PAGE_MARGIN_TOP_PX
} from '../../core/utils/page-layout.constants';

const RESIZE_RECALCULATION_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [EditorToolbarComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) private readonly editorHost!: ElementRef<HTMLElement>;

  protected readonly store = inject(EditorSessionStore);
  protected readonly paginationEngine = inject(PaginationEngineService);
  private readonly themeStore = inject(ThemeStore);

  protected readonly editorInstance = signal<Editor | null>(null);
  protected readonly activeAlignment = signal('left');
  protected readonly pageSurroundColor = signal('transparent');

  protected readonly pageWidthPx = A4_WIDTH_PX;
  protected readonly pageHeightPx = A4_HEIGHT_PX;
  protected readonly pageMarginTopPx = PAGE_MARGIN_TOP_PX;
  protected readonly pageMarginBottomPx = PAGE_MARGIN_BOTTOM_PX;
  protected readonly pageMarginLeftPx = PAGE_MARGIN_LEFT_PX;
  protected readonly pageMarginRightPx = PAGE_MARGIN_RIGHT_PX;
  protected readonly pageGapPx = PAGE_GAP_PX;

  private editor: Editor | null = null;
  private lastLoadedNodeId: string | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const nodeId = this.store.openNodeId();
      const contentJson = this.store.contentJson();

      if (this.editor && nodeId && nodeId !== this.lastLoadedNodeId) {
        this.lastLoadedNodeId = nodeId;
        this.editor.commands.setContent(JSON.parse(contentJson), { emitUpdate: false });
      }
    });

    effect(() => {
      this.pageSurroundColor.set(findTheme(this.themeStore.currentThemeId()).pageSurroundColor);
    });
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorHost.nativeElement,
      extensions: [
        StarterKit,
        PageBreak,
        TabIndent,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        PaginationExtension.configure({ paginationEngine: this.paginationEngine })
      ],
      content: JSON.parse(this.store.contentJson()),
      onUpdate: ({ editor }) => {
        this.store.onContentChange(JSON.stringify(editor.getJSON()), editor.getText());
      },
      onSelectionUpdate: ({ editor }) => this.updateActiveAlignment(editor),
      onTransaction: ({ editor }) => this.updateActiveAlignment(editor)
    });
    this.lastLoadedNodeId = this.store.openNodeId();
    this.editorInstance.set(this.editor);

    // A extensão de paginação recalcula automaticamente a cada transação do ProseMirror (via
    // Decorations, que sobrevivem a re-renders do editor). O ResizeObserver cobre o único caso
    // que não passa por uma transação: redimensionamento da janela, que pode mudar a quebra de
    // linha do texto sem qualquer edição do documento — por isso só precisa "cutucar" o editor
    // com uma transação vazia para a extensão reavaliar.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleRecalculation());
      this.resizeObserver.observe(this.editorHost.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.resizeObserver?.disconnect();
    if (this.resizeTimeoutId) {
      clearTimeout(this.resizeTimeoutId);
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.store.saveNow();
    }
  }

  private updateActiveAlignment(editor: Editor): void {
    const alignment = ['left', 'center', 'right', 'justify'].find((value) =>
      editor.isActive({ textAlign: value })
    );
    this.activeAlignment.set(alignment ?? 'left');
  }

  private scheduleRecalculation(): void {
    if (this.resizeTimeoutId) {
      clearTimeout(this.resizeTimeoutId);
    }
    this.resizeTimeoutId = setTimeout(() => {
      this.editor?.view.dispatch(this.editor.view.state.tr);
    }, RESIZE_RECALCULATION_DEBOUNCE_MS);
  }
}
