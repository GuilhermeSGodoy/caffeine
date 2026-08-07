import { TestBed } from '@angular/core/testing';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { SearchReplaceDialogComponent } from './search-replace-dialog.component';
import { SearchAndReplace } from '../../../core/tiptap/search-and-replace.extension';

describe('SearchReplaceDialogComponent', () => {
  let editor: Editor;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchReplaceDialogComponent] });
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>gato gato cachorro</p>' });
  });

  afterEach(() => editor.destroy());

  function inputByPlaceholder(nativeElement: HTMLElement, placeholder: string): HTMLInputElement {
    return nativeElement.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`)!;
  }

  it('mostra a contagem de ocorrências ao digitar um termo de busca', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const searchInput = inputByPlaceholder(nativeElement, 'Buscar');
    searchInput.value = 'gato';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(nativeElement.querySelector('.search-replace-dialog__count')?.textContent?.trim()).toBe('1 de 2');
  });

  it('exibe "Nenhum resultado" quando o termo buscado não existe no documento', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const searchInput = inputByPlaceholder(nativeElement, 'Buscar');
    searchInput.value = 'elefante';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(nativeElement.querySelector('.search-replace-dialog__count')?.textContent?.trim()).toBe('Nenhum resultado');
  });

  it('substitui todas as ocorrências ao clicar em "Substituir tudo"', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    inputByPlaceholder(nativeElement, 'Buscar').value = 'gato';
    inputByPlaceholder(nativeElement, 'Buscar').dispatchEvent(new Event('input'));
    inputByPlaceholder(nativeElement, 'Substituir por').value = 'cachorro';
    inputByPlaceholder(nativeElement, 'Substituir por').dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const replaceAllButton = Array.from(nativeElement.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Substituir tudo')
    );
    replaceAllButton?.click();
    fixture.detectChanges();

    expect(editor.getText()).toBe('cachorro cachorro cachorro');
  });

  it('limpa a busca do editor quando o diálogo é fechado', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    inputByPlaceholder(nativeElement, 'Buscar').value = 'gato';
    inputByPlaceholder(nativeElement, 'Buscar').dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    expect(editor.storage.searchAndReplace.searchTerm).toBe('');
    expect(editor.storage.searchAndReplace.matches).toHaveLength(0);
  });

  it('preenche o campo de busca a partir de searchRequest (ex.: Ctrl+F com texto selecionado)', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('searchRequest', { term: 'cachorro', id: 1 });
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(inputByPlaceholder(nativeElement, 'Buscar').value).toBe('cachorro');
  });

  it('não sobrescreve o que o usuário digitou depois de um searchRequest anterior', () => {
    const fixture = TestBed.createComponent(SearchReplaceDialogComponent);
    fixture.componentRef.setInput('editor', editor);
    fixture.componentRef.setInput('searchRequest', { term: 'cachorro', id: 1 });
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const searchInput = inputByPlaceholder(nativeElement, 'Buscar');
    searchInput.value = 'gato';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputByPlaceholder(nativeElement, 'Buscar').value).toBe('gato');
  });
});
