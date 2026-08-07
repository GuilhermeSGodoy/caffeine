import { BlockMeasurement, calculatePageBreaks, countPages, PageLayoutConfig } from './pagination.util';

describe('calculatePageBreaks', () => {
  const layout: PageLayoutConfig = { pageHeightPx: 1000, pageGapPx: 32 };

  function block(index: number, heightPx: number, forcedBreakCount = 0): BlockMeasurement {
    return { index, heightPx, forcedBreakCount };
  }

  it('não gera quebras quando não há blocos', () => {
    expect(calculatePageBreaks([], layout)).toEqual([]);
  });

  it('não gera quebras quando os blocos cabem inteiros na primeira página', () => {
    const measurements = [block(0, 300), block(1, 300), block(2, 300)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([]);
  });

  it('quebra antes do bloco que estoura o espaço restante da página, preenchendo o espaço que sobrou', () => {
    const measurements = [block(0, 600), block(1, 600)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 1, spacerHeightPx: 432, extraBlankPages: 0 }
    ]);
  });

  it('migra um bloco maior que uma página inteira para a próxima página, mesmo sem couber', () => {
    const measurements = [block(0, 600), block(1, 1500)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 1, spacerHeightPx: 432, extraBlankPages: 0 }
    ]);
  });

  it('força quebra quando forcedBreakCount é 1, preenchendo o espaço que sobrou até o fim da página', () => {
    const measurements = [block(0, 100), block(1, 100, 1)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 1, spacerHeightPx: 932, extraBlankPages: 0 }
    ]);
  });

  it('nunca gera quebra automática (por altura) antes do primeiro bloco do documento', () => {
    const measurements = [block(0, 1500)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([]);
  });

  it('força quebra manual mesmo quando ela é a primeira do documento (página inicial vazia)', () => {
    const measurements = [block(0, 100, 1)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 0, spacerHeightPx: 1032, extraBlankPages: 0 }
    ]);
  });

  it('acumula páginas em branco extras quando há múltiplas quebras manuais consecutivas antes do mesmo bloco', () => {
    // Cenário real: Ctrl+Enter pressionado repetidamente sobre o mesmo parágrafo vazio empilha
    // vários nós pageBreak antes dele, sem nenhum bloco real entre eles (ver page-break.extension.ts).
    const measurements = [block(0, 100, 3)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 0, spacerHeightPx: 1032 + 2 * 1032, extraBlankPages: 2 }
    ]);
  });

  it('gera múltiplas quebras em um documento com várias páginas', () => {
    const measurements = [block(0, 600), block(1, 600), block(2, 600), block(3, 600)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 1, spacerHeightPx: 432, extraBlankPages: 0 },
      { breakBeforeBlockIndex: 2, spacerHeightPx: 432, extraBlankPages: 0 },
      { breakBeforeBlockIndex: 3, spacerHeightPx: 432, extraBlankPages: 0 }
    ]);
  });
});

describe('countPages', () => {
  it('retorna 1 página quando não há blocos', () => {
    expect(countPages([], 0)).toBe(1);
  });

  it('retorna o número de quebras mais um', () => {
    const breaks = [
      { breakBeforeBlockIndex: 1, spacerHeightPx: 32, extraBlankPages: 0 },
      { breakBeforeBlockIndex: 2, spacerHeightPx: 32, extraBlankPages: 0 }
    ];

    expect(countPages(breaks, 3)).toBe(3);
  });

  it('soma as páginas em branco extras de cada quebra ao total', () => {
    const breaks = [{ breakBeforeBlockIndex: 0, spacerHeightPx: 32, extraBlankPages: 2 }];

    expect(countPages(breaks, 1)).toBe(4);
  });
});
