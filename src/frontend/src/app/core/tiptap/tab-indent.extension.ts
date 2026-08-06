import { Extension } from '@tiptap/core';

const NBSP = ' ';

// Espacos comuns sao colapsados visualmente pelo HTML fora de `white-space: pre`;
// non-breaking spaces garantem a indentacao visivel sem alterar o wrapping do texto.
export const TAB_INDENT_SPACING = NBSP + NBSP + NBSP + NBSP;

export const TabIndent = Extension.create({
  name: 'tabIndent',

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.insertContent(TAB_INDENT_SPACING)
    };
  }
});
