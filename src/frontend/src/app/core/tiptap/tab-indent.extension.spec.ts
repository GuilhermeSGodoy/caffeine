import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TAB_INDENT_SPACING, TabIndent } from './tab-indent.extension';

describe('TabIndent extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: [StarterKit, TabIndent], content: '<p>Antes</p>' });
  });

  afterEach(() => editor.destroy());

  it('insere espacamento de tabulacao ao pressionar Tab', () => {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));

    expect(editor.getText()).toBe('Antes' + TAB_INDENT_SPACING);
  });

  it('usa non-breaking spaces para nao colapsar visualmente a indentacao', () => {
    expect(TAB_INDENT_SPACING.codePointAt(0)).toBe(160);
    expect(TAB_INDENT_SPACING).toHaveLength(4);
  });
});
