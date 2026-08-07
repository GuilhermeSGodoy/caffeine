import { measureBlocksFromDom } from './dom-block-measurer';

function pageBreakDiv(): HTMLDivElement {
  const div = document.createElement('div');
  div.setAttribute('data-type', 'page-break');
  return div;
}

describe('measureBlocksFromDom', () => {
  it('não marca nenhuma quebra forçada quando não há nó pageBreak antes do bloco', () => {
    const root = document.createElement('div');
    root.appendChild(document.createElement('p'));

    const measurements = measureBlocksFromDom(root);

    expect(measurements).toEqual([expect.objectContaining({ index: 0, forcedBreakCount: 0 })]);
  });

  it('conta um único nó pageBreak como uma quebra forçada', () => {
    const root = document.createElement('div');
    root.appendChild(pageBreakDiv());
    root.appendChild(document.createElement('p'));

    const measurements = measureBlocksFromDom(root);

    expect(measurements).toEqual([expect.objectContaining({ index: 0, forcedBreakCount: 1 })]);
  });

  it('conta múltiplos nós pageBreak consecutivos sem nenhum bloco real entre eles', () => {
    // Cenário real: Ctrl+Enter pressionado repetidamente sobre o mesmo parágrafo vazio empilha
    // vários nós pageBreak consecutivos antes dele (ver page-break.extension.ts) — a contagem
    // precisa refletir todos eles, não colapsar em "houve uma quebra".
    const root = document.createElement('div');
    root.appendChild(pageBreakDiv());
    root.appendChild(pageBreakDiv());
    root.appendChild(pageBreakDiv());
    root.appendChild(document.createElement('p'));

    const measurements = measureBlocksFromDom(root);

    expect(measurements).toEqual([expect.objectContaining({ index: 0, forcedBreakCount: 3 })]);
  });

  it('reinicia a contagem de quebras forçadas para o bloco seguinte após um bloco real', () => {
    const root = document.createElement('div');
    root.appendChild(document.createElement('p'));
    root.appendChild(pageBreakDiv());
    root.appendChild(pageBreakDiv());
    root.appendChild(document.createElement('p'));

    const measurements = measureBlocksFromDom(root);

    expect(measurements).toEqual([
      expect.objectContaining({ index: 0, forcedBreakCount: 0 }),
      expect.objectContaining({ index: 1, forcedBreakCount: 2 })
    ]);
  });
});
