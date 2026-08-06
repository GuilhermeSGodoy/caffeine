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
        // insertContent() do @tiptap/core trata parágrafo vazio de forma estruturalmente diferente
        // de parágrafo com texto: quando o parágrafo atual tem conteúdo, ele divide o bloco (nó da
        // quebra como irmão do parágrafo, sobrando um parágrafo remanescente depois) — cenário já
        // coberto pela correção de cursor abaixo (Selection.near com viés para trás pula o nó
        // atômico e não-selecionável da quebra e precisa ser reancorada). Quando o parágrafo atual
        // está VAZIO, porém, insertContent detecta "isEmptyTextBlock" e substitui o parágrafo
        // inteiro pelo nó da quebra — não sobra nenhum parágrafo depois, então Selection.near não
        // acha onde pousar e recua para a página anterior (e no caso de parágrafo vazio único no
        // documento, chega a lançar RangeError). Por isso parágrafo vazio precisa de um caminho
        // próprio: inserir a quebra ANTES do parágrafo vazio (em vez de no lugar dele), deixando-o
        // como o primeiro parágrafo da página nova.
        let scrollTargetPos: number | null = null;

        const { $from } = this.editor.state.selection;
        const isEmptyParagraph = $from.parent.isTextblock && $from.parent.content.size === 0;

        const inserted = isEmptyParagraph
          ? this.editor
              .chain()
              .command(({ tr, dispatch }) => {
                if (!dispatch) {
                  return true;
                }

                const pageBreakNode = tr.doc.type.schema.nodes[this.name].create();
                const insertPos = tr.selection.$from.before(tr.selection.$from.depth);

                tr.insert(insertPos, pageBreakNode);
                tr.setSelection(Selection.near(tr.doc.resolve(insertPos + pageBreakNode.nodeSize), 1));
                scrollTargetPos = tr.selection.from;
                return true;
              })
              .run()
          : this.editor
              .chain()
              .insertContent({ type: this.name })
              .command(({ tr, dispatch }) => {
                if (!dispatch) {
                  return true;
                }

                const { $to } = tr.selection;
                const afterCurrentBlock = $to.after($to.depth);
                const maybePageBreak = tr.doc.resolve(afterCurrentBlock).nodeAfter;

                if (maybePageBreak?.type.name === this.name) {
                  const afterPageBreak = afterCurrentBlock + maybePageBreak.nodeSize;

                  if (!tr.doc.resolve(afterPageBreak).nodeAfter) {
                    tr.insert(afterPageBreak, tr.doc.type.schema.nodes['paragraph'].create());
                  }

                  tr.setSelection(Selection.near(tr.doc.resolve(afterPageBreak), 1));
                }

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
