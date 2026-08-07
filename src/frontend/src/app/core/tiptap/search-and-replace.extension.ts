import { Extension } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SearchMatch {
  from: number;
  to: number;
}

export interface SearchAndReplaceStorage {
  searchTerm: string;
  caseSensitive: boolean;
  matches: SearchMatch[];
  activeMatchIndex: number;
}

declare module '@tiptap/core' {
  interface Storage {
    searchAndReplace: SearchAndReplaceStorage;
  }

  interface Commands<ReturnType> {
    searchAndReplace: {
      search: (term: string, options?: { caseSensitive?: boolean }) => ReturnType;
      nextMatch: () => ReturnType;
      previousMatch: () => ReturnType;
      replaceCurrent: (replacement: string) => ReturnType;
      replaceAll: (replacement: string) => ReturnType;
      clearSearch: () => ReturnType;
    };
  }
}

const searchAndReplacePluginKey = new PluginKey<DecorationSet>('search-and-replace-decorations');

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Matches ficam restritos a um único bloco de texto (parágrafo/heading) — um regex/termo não
// atravessa quebras de parágrafo. Isso evita ter que mapear separadores sintéticos (usados por
// `doc.textBetween` para representar limites de bloco) de volta para posições reais do documento.
export function findMatches(doc: ProseMirrorNode, term: string, caseSensitive: boolean): SearchMatch[] {
  if (!term) {
    return [];
  }

  const pattern = new RegExp(escapeRegExp(term), caseSensitive ? 'g' : 'gi');
  const matches: SearchMatch[] = [];

  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true;
    }

    const text = node.textContent;
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const from = pos + 1 + match.index;
      matches.push({ from, to: from + match[0].length });
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
      }
    }

    return false;
  });

  return matches;
}

function buildDecorations(doc: ProseMirrorNode, matches: SearchMatch[], activeMatchIndex: number): DecorationSet {
  const decorations = matches.map((match, index) =>
    Decoration.inline(match.from, match.to, {
      class: index === activeMatchIndex ? 'search-match search-match--active' : 'search-match'
    })
  );
  return DecorationSet.create(doc, decorations);
}

function dispatchDecorations(tr: Transaction, storage: SearchAndReplaceStorage): Transaction {
  const decorations = buildDecorations(tr.doc, storage.matches, storage.activeMatchIndex);
  return tr.setMeta(searchAndReplacePluginKey, decorations);
}

export const SearchAndReplace = Extension.create<Record<string, never>, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addStorage() {
    return {
      searchTerm: '',
      caseSensitive: false,
      matches: [],
      activeMatchIndex: -1
    };
  },

  addProseMirrorPlugins() {
    const extensionStorage = this.storage;

    return [
      new Plugin({
        key: searchAndReplacePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, previous) {
            const meta = tr.getMeta(searchAndReplacePluginKey);
            if (meta) {
              return meta;
            }
            if (!tr.docChanged) {
              return previous;
            }
            if (!extensionStorage.searchTerm) {
              return previous.map(tr.mapping, tr.doc);
            }

            extensionStorage.matches = findMatches(tr.doc, extensionStorage.searchTerm, extensionStorage.caseSensitive);
            extensionStorage.activeMatchIndex = extensionStorage.matches.length > 0 ? 0 : -1;
            return buildDecorations(tr.doc, extensionStorage.matches, extensionStorage.activeMatchIndex);
          }
        },
        props: {
          decorations(state) {
            return searchAndReplacePluginKey.getState(state);
          }
        }
      })
    ];
  },

  addCommands() {
    return {
      search:
        (term, options) =>
        ({ tr, dispatch }) => {
          this.storage.searchTerm = term;
          if (options?.caseSensitive !== undefined) {
            this.storage.caseSensitive = options.caseSensitive;
          }

          this.storage.matches = findMatches(tr.doc, term, this.storage.caseSensitive);
          this.storage.activeMatchIndex = this.storage.matches.length > 0 ? 0 : -1;

          if (dispatch) {
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        },

      nextMatch:
        () =>
        ({ tr, dispatch }) => {
          if (this.storage.matches.length === 0) {
            return false;
          }

          this.storage.activeMatchIndex = (this.storage.activeMatchIndex + 1) % this.storage.matches.length;
          if (dispatch) {
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        },

      previousMatch:
        () =>
        ({ tr, dispatch }) => {
          if (this.storage.matches.length === 0) {
            return false;
          }

          this.storage.activeMatchIndex =
            (this.storage.activeMatchIndex - 1 + this.storage.matches.length) % this.storage.matches.length;
          if (dispatch) {
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        },

      replaceCurrent:
        (replacement) =>
        ({ tr, dispatch }) => {
          const match = this.storage.matches[this.storage.activeMatchIndex];
          if (!match) {
            return false;
          }

          if (dispatch) {
            tr.insertText(replacement, match.from, match.to);
            this.storage.matches = findMatches(tr.doc, this.storage.searchTerm, this.storage.caseSensitive);
            this.storage.activeMatchIndex =
              this.storage.matches.length > 0
                ? Math.min(this.storage.activeMatchIndex, this.storage.matches.length - 1)
                : -1;
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        },

      replaceAll:
        (replacement) =>
        ({ tr, dispatch }) => {
          if (this.storage.matches.length === 0) {
            return false;
          }

          if (dispatch) {
            const matchesDescending = [...this.storage.matches].sort((a, b) => b.from - a.from);
            for (const match of matchesDescending) {
              tr.insertText(replacement, match.from, match.to);
            }

            this.storage.matches = [];
            this.storage.activeMatchIndex = -1;
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        },

      clearSearch:
        () =>
        ({ tr, dispatch }) => {
          this.storage.searchTerm = '';
          this.storage.matches = [];
          this.storage.activeMatchIndex = -1;

          if (dispatch) {
            dispatch(dispatchDecorations(tr, this.storage));
          }
          return true;
        }
    };
  }
});
