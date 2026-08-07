import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { SearchAndReplace } from './search-and-replace.extension';

describe('SearchAndReplace extension', () => {
  let editor: Editor;

  function storage() {
    return editor.storage.searchAndReplace;
  }

  afterEach(() => editor.destroy());

  it('encontra todas as ocorrências literais de um termo, ignorando maiúsculas/minúsculas por padrão', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>Gato gato GATO cachorro</p>' });

    editor.commands.search('gato');

    expect(storage().matches).toHaveLength(3);
    expect(storage().activeMatchIndex).toBe(0);
  });

  it('respeita a opção de diferenciar maiúsculas/minúsculas', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>Gato gato GATO</p>' });

    editor.commands.search('gato', { caseSensitive: true });

    expect(storage().matches).toHaveLength(1);
  });

  it('não encontra matches que atravessam quebra de parágrafo', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>fim</p><p>começo</p>' });

    editor.commands.search('fimcomeço');

    expect(storage().matches).toHaveLength(0);
  });

  it('retorna zero matches para um termo vazio ou inexistente', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>Texto qualquer</p>' });

    editor.commands.search('');
    expect(storage().matches).toHaveLength(0);
    expect(storage().activeMatchIndex).toBe(-1);

    editor.commands.search('inexistente');
    expect(storage().matches).toHaveLength(0);
    expect(storage().activeMatchIndex).toBe(-1);
  });

  it('nextMatch/previousMatch navegam com wrap-around', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>a a a</p>' });
    editor.commands.search('a');

    expect(storage().activeMatchIndex).toBe(0);

    editor.commands.nextMatch();
    expect(storage().activeMatchIndex).toBe(1);

    editor.commands.nextMatch();
    editor.commands.nextMatch();
    expect(storage().activeMatchIndex).toBe(0);

    editor.commands.previousMatch();
    expect(storage().activeMatchIndex).toBe(2);
  });

  it('replaceCurrent substitui apenas a ocorrência ativa', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>gato gato</p>' });
    editor.commands.search('gato');

    editor.commands.replaceCurrent('cachorro');

    expect(editor.getText()).toBe('cachorro gato');
    expect(storage().matches).toHaveLength(1);
  });

  it('replaceCurrent avança para a próxima ocorrência distinta mesmo quando o texto substituto também contém o termo buscado', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>casa casa</p>' });
    editor.commands.search('casa');

    editor.commands.replaceCurrent('casamento');
    // "casamento" também contém "casa" como prefixo, então continua havendo 2 ocorrências no
    // texto — mas, sem a correção, o índice ativo ficaria travado apontando para esse match
    // recém-criado (posição 0) em vez de avançar para a próxima ocorrência real (a segunda
    // palavra "casa"), obrigando o usuário a navegar manualmente para não ficar preso no lugar.
    expect(editor.getText()).toBe('casamento casa');
    expect(storage().matches).toHaveLength(2);
    expect(storage().activeMatchIndex).toBe(1);

    editor.commands.replaceCurrent('casamento');
    expect(editor.getText()).toBe('casamento casamento');
  });

  it('replaceAll substitui todas as ocorrências numa única transação', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>gato gato gato</p>' });
    editor.commands.search('gato');

    editor.commands.replaceAll('cachorro');

    expect(editor.getText()).toBe('cachorro cachorro cachorro');
    expect(storage().matches).toHaveLength(0);
    expect(storage().activeMatchIndex).toBe(-1);
  });

  it('clearSearch zera o termo e as ocorrências', () => {
    editor = new Editor({ extensions: [StarterKit, SearchAndReplace], content: '<p>gato gato</p>' });
    editor.commands.search('gato');

    editor.commands.clearSearch();

    expect(storage().searchTerm).toBe('');
    expect(storage().matches).toHaveLength(0);
    expect(storage().activeMatchIndex).toBe(-1);
  });
});
