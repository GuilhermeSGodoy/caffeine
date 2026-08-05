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
    const startsNewPage = block.index > 0 && (block.forcedBreakBefore || exceedsPage);

    if (startsNewPage) {
      breaks.push({ breakBeforeBlockIndex: block.index, spacerHeightPx: layout.pageGapPx });
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
