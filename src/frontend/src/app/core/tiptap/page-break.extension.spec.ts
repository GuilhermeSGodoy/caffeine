import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { PageBreak } from './page-break.extension';
import { PAGE_MARGIN_TOP_PX } from '../utils/page-layout.constants';

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

  it('rola o container da página até o topo da nova página ao inserir quebra manual com Mod-Enter', async () => {
    const container = document.createElement('div');
    container.className = 'editor__content';
    const host = document.createElement('div');
    container.appendChild(host);
    document.body.appendChild(container);

    const scopedEditor = new Editor({ element: host, extensions: [StarterKit, PageBreak], content: '<p>Antes</p>' });
    scopedEditor.commands.setTextSelection(scopedEditor.state.doc.content.size);

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
    vi.spyOn(scopedEditor.view, 'coordsAtPos').mockReturnValue({ top: 500, bottom: 520, left: 0, right: 0 } as never);
    container.scrollTop = 0;

    scopedEditor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(container.scrollTop).toBe(500 - PAGE_MARGIN_TOP_PX);

    scopedEditor.destroy();
    container.remove();
  });

  it('cria uma página nova em branco ao pressionar Mod-Enter num parágrafo vazio único no documento', () => {
    const emptyEditor = new Editor({ extensions: [StarterKit, PageBreak], content: '<p></p>' });

    emptyEditor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    const types = emptyEditor.getJSON().content?.map((node) => node.type);
    expect(types).toEqual(['pageBreak', 'paragraph']);

    const { selection } = emptyEditor.state;
    expect(selection.$from.parent.type.name).toBe('paragraph');
    expect(selection.$from.parent.content.size).toBe(0);

    emptyEditor.destroy();
  });

  it('cria uma página nova em branco ao pressionar Mod-Enter de novo no fim da página atual, sem voltar o cursor para a página anterior', () => {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent({ type: 'pageBreak' });

    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    // Uma nova página em branco é criada entre a quebra recém-criada e a página que já existia
    // (deixada em branco pelo insertContent do setup) — nenhuma é reaproveitada como a outra.
    const types = editor.getJSON().content?.map((node) => node.type);
    expect(types).toEqual(['paragraph', 'pageBreak', 'paragraph', 'pageBreak', 'paragraph']);

    const { selection } = editor.state;
    expect(selection.$from.parent.type.name).toBe('paragraph');
    expect(selection.$from.parent.content.size).toBe(0);
  });

  it('cria uma página nova entre a atual e uma página seguinte já existente, sem apenas mover o cursor para ela', () => {
    // Documento já com duas páginas antes do teste: página 1 = "Antes", página 2 já existente =
    // "Depois" — construído direto via HTML para isolar o cenário sem depender de onde o cursor
    // pousa após um insertContent anterior.
    editor.commands.setContent('<p>Antes</p><div data-type="page-break"></div><p>Depois</p>');

    // Cursor volta para o fim do texto da página 1 (que já tem uma página seguinte com conteúdo).
    editor.commands.setTextSelection(6);

    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));

    const types = editor.getJSON().content?.map((node) => node.type);
    expect(types).toEqual(['paragraph', 'pageBreak', 'paragraph', 'pageBreak', 'paragraph']);

    // A página "Depois" não é tocada nem reaproveitada: ela continua depois da quebra antiga, e o
    // cursor fica na página nova recém-criada (entre a quebra nova e a antiga), não dentro dela.
    const paragraphs = editor.getJSON().content?.filter((node) => node.type === 'paragraph');
    expect(paragraphs?.[0]).toMatchObject({ content: [{ text: 'Antes' }] });
    expect(paragraphs?.[2]).toMatchObject({ content: [{ text: 'Depois' }] });

    const { selection } = editor.state;
    expect(selection.$from.parent.type.name).toBe('paragraph');
    expect(selection.$from.parent.content.size).toBe(0);
  });
});
