import { BlockMeasurement } from './pagination.util';

const PAGE_BREAK_ATTRIBUTE = 'data-type';
const PAGE_BREAK_VALUE = 'page-break';

export type BlockMeasurer = (tiptapRoot: HTMLElement) => BlockMeasurement[];

export const measureBlocksFromDom: BlockMeasurer = (tiptapRoot) => {
  const children = Array.from(tiptapRoot.children) as HTMLElement[];
  const measurements: BlockMeasurement[] = [];
  let forcedBreakBeforeNext = false;

  children.forEach((child) => {
    if (child.getAttribute(PAGE_BREAK_ATTRIBUTE) === PAGE_BREAK_VALUE) {
      forcedBreakBeforeNext = true;
      return;
    }

    measurements.push({
      index: measurements.length,
      heightPx: child.getBoundingClientRect().height,
      forcedBreakBefore: forcedBreakBeforeNext
    });
    forcedBreakBeforeNext = false;
  });

  return measurements;
};
