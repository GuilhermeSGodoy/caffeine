import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { PaginationEngineService } from '../services/pagination-engine.service';

const PAGE_BREAK_NODE_NAME = 'pageBreak';

const paginationPluginKey = new PluginKey<DecorationSet>('pagination-decorations');

export interface PaginationExtensionOptions {
  paginationEngine: PaginationEngineService | null;
}

function buildDecorations(view: EditorView, paginationEngine: PaginationEngineService): DecorationSet {
  const breaks = paginationEngine.computeBreaks(view.dom as HTMLElement);

  const decorations: Decoration[] = [];
  let blockIndex = 0;

  view.state.doc.forEach((node, offset) => {
    if (node.type.name === PAGE_BREAK_NODE_NAME) {
      return;
    }

    const styles: string[] = [];

    // Quebra forçada no início do documento (página inicial vazia): não há bloco anterior para
    // receber margin-bottom, então o espaçador vira margin-top no próprio primeiro bloco.
    if (blockIndex === 0) {
      const breakAtStart = breaks.find((candidate) => candidate.breakBeforeBlockIndex === 0);
      if (breakAtStart) {
        styles.push(`margin-top: ${breakAtStart.spacerHeightPx}px`);
      }
    }

    const breakAfter = breaks.find((candidate) => candidate.breakBeforeBlockIndex - 1 === blockIndex);
    if (breakAfter) {
      styles.push(`margin-bottom: ${breakAfter.spacerHeightPx}px`);
    }

    if (styles.length > 0) {
      decorations.push(Decoration.node(offset, offset + node.nodeSize, { style: styles.join('; ') }));
    }

    blockIndex += 1;
  });

  return DecorationSet.create(view.state.doc, decorations);
}

// As quebras de página são aplicadas via Decoration do ProseMirror, não mutação direta de
// `style` no DOM. O ProseMirror redesenha nós a qualquer atualização de view (mesmo sem uma
// mudança de conteúdo, ex.: seleção) e não preserva estilo aplicado por fora do seu próprio
// ciclo de renderização — só o que está no estado (decorations) sobrevive a esses redesenhos.
export const PaginationExtension = Extension.create<PaginationExtensionOptions>({
  name: 'pagination',

  addOptions() {
    return {
      paginationEngine: null
    };
  },

  addProseMirrorPlugins() {
    const paginationEngine = this.options.paginationEngine;
    if (!paginationEngine) {
      return [];
    }

    let scheduled = false;

    return [
      new Plugin({
        key: paginationPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, previous) {
            const meta = tr.getMeta(paginationPluginKey);
            if (meta) {
              return meta;
            }
            return tr.docChanged ? previous.map(tr.mapping, tr.doc) : previous;
          }
        },
        props: {
          decorations(state) {
            return paginationPluginKey.getState(state);
          }
        },
        view(editorView) {
          const schedule = () => {
            if (scheduled) {
              return;
            }
            scheduled = true;
            requestAnimationFrame(() => {
              scheduled = false;
              if (editorView.isDestroyed) {
                return;
              }
              const decorationSet = buildDecorations(editorView, paginationEngine);
              editorView.dispatch(editorView.state.tr.setMeta(paginationPluginKey, decorationSet));
            });
          };

          schedule();

          return { update: schedule };
        }
      })
    ];
  }
});
