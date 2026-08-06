import { Injectable, signal } from '@angular/core';
import {
  PAGE_CONTENT_HEIGHT_PX,
  PAGE_GAP_PX,
  PAGE_MARGIN_BOTTOM_PX,
  PAGE_MARGIN_TOP_PX
} from '../utils/page-layout.constants';
import { BlockMeasurer, measureBlocksFromDom } from '../utils/dom-block-measurer';
import { calculatePageBreaks, countPages, PageBreakDecision } from '../utils/pagination.util';

// Distância visual que o conteúdo precisa "pular" entre o fim de uma página e o início da
// próxima: margem inferior da página atual + vão decorativo entre folhas + margem superior da
// próxima página. Precisa bater exatamente com o ciclo do gradiente CSS em styles.scss.
const INTER_PAGE_SPACER_PX = PAGE_MARGIN_BOTTOM_PX + PAGE_GAP_PX + PAGE_MARGIN_TOP_PX;

@Injectable({ providedIn: 'root' })
export class PaginationEngineService {
  readonly pageCount = signal(1);

  blockMeasurer: BlockMeasurer = measureBlocksFromDom;

  // Só mede o DOM e decide onde quebrar — não aplica nenhum estilo. A aplicação visual é
  // responsabilidade de quem chama (a extensão Tiptap usa Decorations do ProseMirror, que
  // sobrevivem a re-renders do editor; mutar style diretamente no DOM não sobrevive).
  computeBreaks(tiptapRoot: HTMLElement): PageBreakDecision[] {
    const measurements = this.blockMeasurer(tiptapRoot);
    const breaks = calculatePageBreaks(measurements, {
      pageHeightPx: PAGE_CONTENT_HEIGHT_PX,
      pageGapPx: INTER_PAGE_SPACER_PX
    });

    this.pageCount.set(countPages(breaks, measurements.length));

    return breaks;
  }
}
