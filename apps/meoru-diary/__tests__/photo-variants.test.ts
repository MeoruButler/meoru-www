/**
 * @jest-environment node
 */
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

import { RENDITION_VERSION, VARIANT_FORMATS, VARIANT_WIDTHS, variantPath } from '@/lib/image-variants';
import { buildVariants, photoKey, renderVariants, writeVariants } from '@/lib/photo-variants';
import type { Photo } from '@/lib/photos';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'meoru-variants-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

function solidJpeg(width: number, height: number, background = '#c04040') {
  return sharp({ create: { width, height, channels: 3, background } })
    .jpeg({ quality: 90 })
    .toBuffer();
}

describe('photoKey', () => {
  it('is a short content hash plus the rendition version', async () => {
    const key = photoKey(await solidJpeg(40, 30));
    expect(key).toMatch(new RegExp(`^[0-9a-f]{16}/${RENDITION_VERSION}$`));
  });

  it('is stable for identical bytes and changes when the content changes', async () => {
    const bytes = await solidJpeg(40, 30);
    expect(photoKey(Buffer.from(bytes))).toBe(photoKey(bytes));
    expect(photoKey(await solidJpeg(40, 30, '#4040c0'))).not.toBe(photoKey(bytes));
  });
});

describe('renderVariants', () => {
  it('encodes every requested width in AVIF and WebP without enlarging small sources', async () => {
    const variants = await renderVariants(await solidJpeg(600, 400));

    expect(variants).toHaveLength(VARIANT_WIDTHS.length * VARIANT_FORMATS.length);
    const byName = new Map(variants.map(variant => [`${variant.width}.${variant.format}`, variant.data]));

    const small = await sharp(byName.get('384.avif')).metadata();
    expect(small).toMatchObject({ format: 'heif', compression: 'av1', width: 384, height: 256 });
    // The loader may ask for 1920 even when the source is 600 wide; serve the source size instead.
    const large = await sharp(byName.get('1920.webp')).metadata();
    expect(large).toMatchObject({ format: 'webp', width: 600, height: 400 });
  });

  it('applies EXIF orientation and drops metadata such as GPS', async () => {
    const rotated = await sharp(await solidJpeg(120, 80))
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const [first] = await renderVariants(rotated);
    const metadata = await sharp(first!.data).metadata();
    expect(metadata).toMatchObject({ width: 80, height: 120 });
    expect(metadata.exif).toBeUndefined();
  });
});

describe('writeVariants', () => {
  it('writes the files at the paths the loader requests and skips keys already on disk', async () => {
    const source = await solidJpeg(300, 200);
    const key = photoKey(source);

    await expect(writeVariants({ outDir: dir, key, source })).resolves.toBe('written');
    const expected = VARIANT_WIDTHS.flatMap(width => VARIANT_FORMATS.map(format => variantPath(key, width, format)));
    for (const path of expected) {
      expect((await stat(join(dir, path))).size).toBeGreaterThan(0);
    }
    // Nothing but the final key directory is left behind.
    expect(await readdir(join(dir, key.split('/')[0]!))).toEqual([RENDITION_VERSION]);

    const before = (await stat(join(dir, expected[0]!))).mtimeMs;
    await expect(writeVariants({ outDir: dir, key, source })).resolves.toBe('skipped');
    expect((await stat(join(dir, expected[0]!))).mtimeMs).toBe(before);
  });
});

describe('buildVariants', () => {
  async function setup() {
    const publicDir = join(dir, 'public');
    const outDir = join(dir, '.variants');
    await mkdir(join(publicDir, 'photos', 'spring'), { recursive: true });
    const source = await solidJpeg(300, 200);
    await writeFile(join(publicDir, 'photos', 'spring', 'one.jpg'), source);
    const photo = { id: 'spring/one', src: '/photos/spring/one.jpg', key: photoKey(source) } as Photo;
    return { publicDir, outDir, photo };
  }

  it('renders each manifest photo once and reports what it did', async () => {
    const { publicDir, outDir, photo } = await setup();

    await expect(buildVariants({ photos: [photo], publicDir, outDir })).resolves.toEqual({ written: 1, skipped: 0 });
    expect(await readFile(join(outDir, variantPath(photo.key, 640, 'avif')))).toBeInstanceOf(Buffer);
    await expect(buildVariants({ photos: [photo], publicDir, outDir })).resolves.toEqual({ written: 0, skipped: 1 });
  });

  it('refuses a stale manifest whose key no longer matches the file', async () => {
    const { publicDir, outDir, photo } = await setup();
    await writeFile(join(publicDir, 'photos', 'spring', 'one.jpg'), await solidJpeg(300, 200, '#000000'));

    await expect(buildVariants({ photos: [photo], publicDir, outDir })).rejects.toThrow(/spring\/one.*photos:manifest/);
  });
});
