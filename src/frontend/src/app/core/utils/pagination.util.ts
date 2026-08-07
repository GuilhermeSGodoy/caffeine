export interface PageLayoutConfig {
  pageHeightPx: number;
  pageGapPx: number;
}

export interface BlockMeasurement {
  index: number;
  heightPx: number;
  // Quantidade de marcadores de quebra manual (nó pageBreak) consecutivos imediatamente antes
  // deste bloco. Cada um representa uma página inteiramente em branco entre a página anterior e
  // este bloco — não apenas um booleano, porque duas ou mais quebras seguidas sem nenhum bloco
  // real entre elas (ex.: Ctrl+Enter repetido sobre o mesmo parágrafo vazio) precisam continuar
  // sendo distinguíveis de uma única quebra.
  forcedBreakCount: number;
}

export interface PageBreakDecision {
  breakBeforeBlockIndex: number;
  spacerHeightPx: number;
  // Páginas inteiramente em branco embutidas neste mesmo espaçador, além da quebra "principal"
  // que antecede o bloco — ver comentário de forcedBreakCount.
  extraBlankPages: number;
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
    // documento — só quebra manual (forcedBreakCount) pode abrir uma página vazia no índice 0
    // (ex.: Ctrl+Enter na primeira página, ainda sem nenhum conteúdo antes da quebra).
    const startsNewPage = block.forcedBreakCount > 0 || (block.index > 0 && exceedsPage);

    if (startsNewPage) {
      // A faixa visual do "vão entre folhas" (gradiente em styles.scss) fica em posições fixas,
      // múltiplas de altura-da-página+vão, a partir do topo do editor — não em função de onde o
      // conteúdo real termina. Por isso o espaçador precisa completar o espaço que sobrou na
      // página atual, e só então somar a margem+vão+margem entre páginas; um valor fixo desalinha
      // a quebra real da faixa visual, e o desalinhamento cresce a cada página subsequente.
      const remainingSpaceOnPagePx = Math.max(layout.pageHeightPx - heightOnCurrentPage, 0);
      const extraBlankPages = Math.max(block.forcedBreakCount - 1, 0);
      breaks.push({
        breakBeforeBlockIndex: block.index,
        spacerHeightPx:
          remainingSpaceOnPagePx + layout.pageGapPx + extraBlankPages * (layout.pageHeightPx + layout.pageGapPx),
        extraBlankPages
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

  const extraBlankPages = breaks.reduce((sum, decision) => sum + decision.extraBlankPages, 0);
  return breaks.length + extraBlankPages + 1;
}
