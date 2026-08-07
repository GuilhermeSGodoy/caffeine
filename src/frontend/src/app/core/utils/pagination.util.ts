export interface PageLayoutConfig {
  pageHeightPx: number;
  pageGapPx: number;
}

export interface BlockMeasurement {
  index: number;
  heightPx: number;
  forcedBreakBefore: boolean;
}

export interface PageBreakDecision {
  breakBeforeBlockIndex: number;
  spacerHeightPx: number;
}

export function calculatePageBreaks(
  measurements: BlockMeasurement[],
  layout: PageLayoutConfig
): PageBreakDecision[] {
  const breaks: PageBreakDecision[] = [];
  let heightOnCurrentPage = 0;

  for (const block of measurements) {
    const exceedsPage = heightOnCurrentPage + block.heightPx > layout.pageHeightPx;
    // Quebra automática (por altura) nunca força uma página fantasma antes do primeiro bloco do
    // documento — só quebra manual (forcedBreakBefore) pode abrir uma página vazia no índice 0
    // (ex.: Ctrl+Enter na primeira página, ainda sem nenhum conteúdo antes da quebra).
    const startsNewPage = block.forcedBreakBefore || (block.index > 0 && exceedsPage);

    if (startsNewPage) {
      // A faixa visual do "vão entre folhas" (gradiente em styles.scss) fica em posições fixas,
      // múltiplas de altura-da-página+vão, a partir do topo do editor — não em função de onde o
      // conteúdo real termina. Por isso o espaçador precisa completar o espaço que sobrou na
      // página atual, e só então somar a margem+vão+margem entre páginas; um valor fixo desalinha
      // a quebra real da faixa visual, e o desalinhamento cresce a cada página subsequente.
      const remainingSpaceOnPagePx = Math.max(layout.pageHeightPx - heightOnCurrentPage, 0);
      breaks.push({
        breakBeforeBlockIndex: block.index,
        spacerHeightPx: remainingSpaceOnPagePx + layout.pageGapPx
      });
      heightOnCurrentPage = 0;
    }

    heightOnCurrentPage += block.heightPx;
  }

  return breaks;
}

export function countPages(breaks: PageBreakDecision[], totalBlocks: number): number {
  if (totalBlocks === 0) {
    return 1;
  }

  return breaks.length + 1;
}
