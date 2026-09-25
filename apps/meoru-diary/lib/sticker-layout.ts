/**
 * Deterministic "sticker" placement. The same index always yields the same tilt and scale,
 * so server and client markup match and nothing shifts after hydration.
 */
export type StickerPlacement = {
  /** Rotation in degrees, within [-maxTilt, maxTilt]. */
  tilt: number;
  /** Fraction of the grid cell the sticker occupies, within [minScale, 1]. */
  scale: number;
  /** Horizontal alignment of the sticker inside its grid cell. */
  align: 'start' | 'center' | 'end';
  /** The `sizes` attribute for `next/image`, matching the grid column widths in `app/diary.css`. */
  sizes: string;
};

const ALIGNMENTS: StickerPlacement['align'][] = ['start', 'end', 'center', 'end', 'start', 'center', 'end'];
const MAX_TILT_DEG = 2.2;
const MIN_SCALE = 0.72;

/**
 * Grid: 2 columns on phones, 3 on tablets, 4 on desktops, with a 6vw column gap inside a 92vw page.
 * These are the resulting cell widths, used verbatim in `sizes` so the browser picks a source
 * that is close to the rendered width instead of the viewport width.
 */
export const STICKER_SIZES = '(min-width: 1024px) 19vw, (min-width: 768px) 27vw, 43vw';

/** Small linear congruential generator mapped to [0, 1). Good enough for layout jitter. */
export function pseudoRandom(index: number): number {
  const seed = (index * 9301 + 49297) % 233280;
  return seed / 233280;
}

export function getStickerPlacement(index: number, options: { maxTilt?: number } = {}): StickerPlacement {
  const maxTilt = options.maxTilt ?? MAX_TILT_DEG;
  const tilt = Number(((pseudoRandom(index) * 2 - 1) * maxTilt).toFixed(2));
  const scale = Number((MIN_SCALE + pseudoRandom(index + 7) * (1 - MIN_SCALE)).toFixed(3));
  const align = ALIGNMENTS[index % ALIGNMENTS.length]!;
  return { tilt, scale, align, sizes: STICKER_SIZES };
}
