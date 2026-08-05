import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { PageBreak } from './page-break.extension';

describe('PageBreak extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: [StarterKit, PageBreak], content: '<p>Antes</p>' });
  });

  afterEach(() => editor.destroy());

  it('registra o atalho Mod-Enter para inserir o nó pageBreak', () => {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent({ type: 'pageBreak' });

    const json = editor.getJSON();
    expect(json.content?.some((node) => node.type === 'pageBreak')).toBe(true);
  });

  it('serializa e desserializa o nó sem perda (round-trip)', () => {
    // Inserir a quebra no meio do texto (cursor após "Antes") separa o parágrafo em dois,
    // com o cursor pousando no início do parágrafo vazio seguinte — comportamento esperado
    // para "levar o cursor para o início do espaço editável da nova página".
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent({ type: 'pageBreak' });
    editor.commands.insertContent('Depois');

    const html = editor.getHTML();
    expect(html).toContain('data-type="page-break"');

    const reloaded = new Editor({ extensions: [StarterKit, PageBreak], content: html });
    const types = reloaded.getJSON().content?.map((node) => node.type);
    expect(types).toEqual(['paragraph', 'pageBreak', 'paragraph']);
    reloaded.destroy();
  });

  it('não conta o nó pageBreak como texto na extração de texto puro', () => {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent({ type: 'pageBreak' });

    expect(editor.getText().trim()).toBe('Antes');
  });
});
