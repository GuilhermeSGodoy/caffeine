import { Editor, Node, mergeAttributes } from '@tiptap/core';
import { PAGE_MARGIN_TOP_PX } from '../utils/page-layout.constants';

const EDITOR_CONTENT_SELECTOR = '.editor__content';

// A decoration que empurra o conteúdo para a página nova (margin-bottom no bloco anterior à
// quebra) só é aplicada de forma assíncrona pela extensão de paginação, no próximo
// requestAnimationFrame após esta transação. Por isso o scroll também precisa esperar um frame —
// se calculado antes, ainda usaria a posição do texto sem a página nova ter "empurrado" o layout.
function scrollToTopOfNewPage(editor: Editor, pos: number): void {
  requestAnimationFrame(() => {
    if (editor.isDestroyed) {
      return;
    }

    const container = editor.view.dom.closest<HTMLElement>(EDITOR_CONTENT_SELECTOR);
    if (!container) {
      return;
    }

    const coords = editor.view.coordsAtPos(pos);
    const containerRect = container.getBoundingClientRect();
    container.scrollTop += coords.top - containerRect.top - PAGE_MARGIN_TOP_PX;
  });
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: false,

  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-break', class: 'page-break' })];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        const inserted = this.editor.commands.insertContent({ type: this.name });
        if (inserted) {
          scrollToTopOfNewPage(this.editor, this.editor.state.selection.from);
        }
        return inserted;
      }
    };
  }
});
