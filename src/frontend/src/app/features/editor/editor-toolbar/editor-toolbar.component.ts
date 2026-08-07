import { Component, input, output } from '@angular/core';
import { Editor } from '@tiptap/core';

export interface ToolbarAction {
  id: string;
  icon: string;
  label: string;
  run: (editor: Editor) => void;
}

const ALIGNMENT_ACTIONS: ToolbarAction[] = [
  { id: 'left', icon: 'pi pi-align-left', label: 'Alinhar à esquerda', run: (editor) => editor.chain().focus().setTextAlign('left').run() },
  { id: 'center', icon: 'pi pi-align-center', label: 'Centralizar', run: (editor) => editor.chain().focus().setTextAlign('center').run() },
  { id: 'right', icon: 'pi pi-align-right', label: 'Alinhar à direita', run: (editor) => editor.chain().focus().setTextAlign('right').run() },
  { id: 'justify', icon: 'pi pi-align-justify', label: 'Justificar', run: (editor) => editor.chain().focus().setTextAlign('justify').run() }
];

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  templateUrl: './editor-toolbar.component.html',
  styleUrl: './editor-toolbar.component.scss'
})
export class EditorToolbarComponent {
  readonly editor = input<Editor | null>(null);
  readonly activeAlignment = input<string>('left');
  readonly searchToggled = output<void>();

  protected readonly alignmentActions = ALIGNMENT_ACTIONS;

  protected runAction(action: ToolbarAction): void {
    const editor = this.editor();
    if (editor) {
      action.run(editor);
    }
  }
}
