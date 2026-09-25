import { getStickerPlacement, pseudoRandom, STICKER_SIZES } from '@/lib/sticker-layout';

describe('pseudoRandom', () => {
  it('is deterministic and stays within [0, 1)', () => {
    for (let index = 0; index < 500; index++) {
      const value = pseudoRandom(index);
      expect(value).toBe(pseudoRandom(index));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('getStickerPlacement', () => {
  it('keeps the tilt inside the configured range', () => {
    for (let index = 0; index < 500; index++) {
      const { tilt } = getStickerPlacement(index, { maxTilt: 1.5 });
      expect(Math.abs(tilt)).toBeLessThanOrEqual(1.5);
    }
  });

  it('uses the default tilt range when none is given', () => {
    const tilts = Array.from({ length: 200 }, (_, index) => getStickerPlacement(index).tilt);
    expect(Math.max(...tilts.map(Math.abs))).toBeLessThanOrEqual(2.2);
    expect(new Set(tilts).size).toBeGreaterThan(20);
  });

  it('never shrinks a sticker below 72% of its cell', () => {
    for (let index = 0; index < 500; index++) {
      const { scale } = getStickerPlacement(index);
      expect(scale).toBeGreaterThanOrEqual(0.72);
      expect(scale).toBeLessThanOrEqual(1);
    }
  });

  it('cycles the alignment and always exposes the shared sizes attribute', () => {
    const first = getStickerPlacement(0);
    expect(first.align).toBe('start');
    expect(getStickerPlacement(1).align).toBe('end');
    expect(getStickerPlacement(7).align).toBe(first.align);
    expect(first.sizes).toBe(STICKER_SIZES);
  });
});
