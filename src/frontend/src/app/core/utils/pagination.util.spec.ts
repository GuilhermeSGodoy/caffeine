import { BlockMeasurement, calculatePageBreaks, countPages, PageLayoutConfig } from './pagination.util';

describe('calculatePageBreaks', () => {
  const layout: PageLayoutConfig = { pageHeightPx: 1000, pageGapPx: 32 };

  function block(index: number, heightPx: number, forcedBreakBefore = false): BlockMeasurement {
    return { index, heightPx, forcedBreakBefore };
  }

  it('não gera quebras quando não há blocos', () => {
    expect(calculatePageBreaks([], layout)).toEqual([]);
  });

  it('não gera quebras quando os blocos cabem inteiros na primeira página', () => {
    const measurements = [block(0, 300), block(1, 300), block(2, 300)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([]);
  });

  it('quebra antes do bloco que estoura o espaço restante da página', () => {
    const measurements = [block(0, 600), block(1, 600)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([{ breakBeforeBlockIndex: 1, spacerHeightPx: 32 }]);
  });

  it('migra um bloco maior que uma página inteira para a próxima página, mesmo sem couber', () => {
    const measurements = [block(0, 600), block(1, 1500)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([{ breakBeforeBlockIndex: 1, spacerHeightPx: 32 }]);
  });

  it('força quebra quando forcedBreakBefore é true, mesmo com espaço sobrando', () => {
    const measurements = [block(0, 100), block(1, 100, true)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([{ breakBeforeBlockIndex: 1, spacerHeightPx: 32 }]);
  });

  it('nunca força quebra antes do primeiro bloco do documento', () => {
    const measurements = [block(0, 100, true)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([]);
  });

  it('gera múltiplas quebras em um documento com várias páginas', () => {
    const measurements = [block(0, 600), block(1, 600), block(2, 600), block(3, 600)];

    expect(calculatePageBreaks(measurements, layout)).toEqual([
      { breakBeforeBlockIndex: 1, spacerHeightPx: 32 },
      { breakBeforeBlockIndex: 2, spacerHeightPx: 32 },
      { breakBeforeBlockIndex: 3, spacerHeightPx: 32 }
    ]);
  });
});

describe('countPages', () => {
  it('retorna 1 página quando não há blocos', () => {
    expect(countPages([], 0)).toBe(1);
  });

  it('retorna o número de quebras mais um', () => {
    const breaks = [
      { breakBeforeBlockIndex: 1, spacerHeightPx: 32 },
      { breakBeforeBlockIndex: 2, spacerHeightPx: 32 }
    ];

    expect(countPages(breaks, 3)).toBe(3);
  });
});
