import { Injectable, signal } from '@angular/core';
import {
  PAGE_CONTENT_HEIGHT_PX,
  PAGE_GAP_PX,
  PAGE_MARGIN_BOTTOM_PX,
  PAGE_MARGIN_TOP_PX
} from '../utils/page-layout.constants';
import { BlockMeasurer, measureBlocksFromDom } from '../utils/dom-block-measurer';
import { calculatePageBreaks, countPages } from '../utils/pagination.util';

// Distância visual que o conteúdo precisa "pular" entre o fim de uma página e o início da
// próxima: margem inferior da página atual + vão decorativo entre folhas + margem superior da
// próxima página. Precisa bater exatamente com o ciclo do gradiente CSS em styles.scss.
const INTER_PAGE_SPACER_PX = PAGE_MARGIN_BOTTOM_PX + PAGE_GAP_PX + PAGE_MARGIN_TOP_PX;

@Injectable({ providedIn: 'root' })
export class PaginationEngineService {
  readonly pageCount = signal(1);

  blockMeasurer: BlockMeasurer = measureBlocksFromDom;

  recalculate(tiptapRoot: HTMLElement): void {
    const children = Array.from(tiptapRoot.children) as HTMLElement[];
    children.forEach((child) => (child.style.marginBottom = ''));

    const measurements = this.blockMeasurer(tiptapRoot);
    const breaks = calculatePageBreaks(measurements, {
      pageHeightPx: PAGE_CONTENT_HEIGHT_PX,
      pageGapPx: INTER_PAGE_SPACER_PX
    });

    const contentChildren = children.filter(
      (child) => child.getAttribute('data-type') !== 'page-break'
    );

    for (const decision of breaks) {
      const target = contentChildren[decision.breakBeforeBlockIndex - 1];
      if (target) {
        target.style.marginBottom = `${decision.spacerHeightPx}px`;
      }
    }

    this.pageCount.set(countPages(breaks, measurements.length));
  }
}
