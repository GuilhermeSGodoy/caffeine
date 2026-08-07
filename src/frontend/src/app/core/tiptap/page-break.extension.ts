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
        // Parágrafo vazio (isEmptyParagraph) precisa de um caminho próprio: dividir um parágrafo
        // vazio com tr.split não sobra nada útil para ser "o parágrafo da página nova", então a
        // quebra é inserida ANTES dele, deixando o próprio parágrafo vazio como o primeiro
        // parágrafo da página nova (em vez de duplicá-lo).
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
              .command(({ tr, dispatch }) => {
                if (!dispatch) {
                  return true;
                }

                // Divide o bloco atual no ponto do cursor com tr.split (em vez de
                // insertContent()): produz sempre um irmão remanescente bem definido — vazio se o
                // cursor estava no fim do bloco, com o restante do texto se estava no meio —, que
                // passa a ser o parágrafo da página nova. Diferente de posições calculadas a partir
                // de $to.after($to.depth) após insertContent(), tr.mapping aqui reflete só o split
                // que acabamos de fazer, então não confunde uma quebra de página já existente mais
                // adiante no documento com a que está sendo criada agora — o que fazia o cursor
                // pular para dentro de uma página seguinte já existente em vez de permanecer na
                // página nova.
                const pos = tr.selection.$from.pos;
                tr.split(pos);

                // A posição mapeada cai DENTRO do parágrafo remanescente do split (o que vai virar
                // a página nova) — a quebra precisa ser inserida ANTES dele, não naquela posição.
                const $remainderStart = tr.doc.resolve(tr.mapping.map(pos, 1));
                const insertPos = $remainderStart.before($remainderStart.depth);
                const pageBreakNode = tr.doc.type.schema.nodes[this.name].create();
                tr.insert(insertPos, pageBreakNode);

                tr.setSelection(Selection.near(tr.doc.resolve(insertPos + pageBreakNode.nodeSize), 1));
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
