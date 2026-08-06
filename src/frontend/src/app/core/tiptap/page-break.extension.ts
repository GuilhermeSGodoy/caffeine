import { Editor, Node, mergeAttributes } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';
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
        // insertContent divide o bloco corretamente (nó da quebra como irmão do parágrafo, não
        // aninhado dentro dele), mas reposiciona o cursor com viés para trás internamente
        // (Selection.near(pos, -1) — ver selectionToInsertionEnd no @tiptap/core): isso pula o nó
        // atômico não-selecionável da quebra e sempre pousa exatamente no fim do parágrafo que
        // antecede a quebra. Em vez de tentar recalcular a posição de inserção original por
        // aritmética (frágil: o "fitting" do ProseMirror consome uma quantidade de posições que
        // varia com o ponto de inserção), usamos esse próprio ponto ($to) como referência
        // confiável para navegar para frente, cruzando o nó da quebra.
        let scrollTargetPos: number | null = null;

        const inserted = this.editor
          .chain()
          .insertContent({ type: this.name })
          .command(({ tr, dispatch }) => {
            if (!dispatch) {
              return true;
            }

            const { $to } = tr.selection;
            const afterParagraph = $to.after($to.depth);
            const pageBreakNode = tr.doc.resolve(afterParagraph).nodeAfter;
            const afterPageBreak = pageBreakNode ? afterParagraph + pageBreakNode.nodeSize : afterParagraph;

            if (!tr.doc.resolve(afterPageBreak).nodeAfter) {
              tr.insert(afterPageBreak, tr.doc.type.schema.nodes['paragraph'].create());
            }

            tr.setSelection(Selection.near(tr.doc.resolve(afterPageBreak), 1));
            scrollTargetPos = tr.selection.from;
            return true;
          })
          .run();

        if (inserted && scrollTargetPos !== null) {
          scrollToTopOfNewPage(this.editor, scrollTargetPos);
        }

        return inserted;
      }
    };
  }
});
