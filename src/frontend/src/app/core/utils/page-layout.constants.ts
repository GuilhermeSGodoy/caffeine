const PX_PER_MM = 3.7795;

function mmToPx(mm: number): number {
  return Math.round(mm * PX_PER_MM);
}

export const A4_WIDTH_PX = mmToPx(210);
export const A4_HEIGHT_PX = mmToPx(297);
export const PAGE_MARGIN_TOP_PX = mmToPx(25);
export const PAGE_MARGIN_BOTTOM_PX = mmToPx(25);
export const PAGE_MARGIN_LEFT_PX = mmToPx(25);
export const PAGE_MARGIN_RIGHT_PX = mmToPx(25);
export const PAGE_GAP_PX = 32;

export const PAGE_CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_LEFT_PX - PAGE_MARGIN_RIGHT_PX;
export const PAGE_CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_MARGIN_TOP_PX - PAGE_MARGIN_BOTTOM_PX;
