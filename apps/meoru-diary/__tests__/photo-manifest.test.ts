/**
 * @jest-environment node
 */
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

import {
  buildManifest,
  defaultAlt,
  describePhoto,
  humanizeChapter,
  isImageFile,
  loadExistingManifest,
  toHex,
} from '@/lib/photo-manifest';
import type { Photo } from '@/lib/photos';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'meoru-manifest-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function writeSolid(path: string, width: number, height: number, rgb: [number, number, number]) {
  await mkdir(join(path, '..'), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } })
    .jpeg({ quality: 90 })
    .toFile(path);
}

describe('pure helpers', () => {
  it('turns folder and file names into readable defaults', () => {
    expect(humanizeChapter('01-spring-drive')).toBe('spring drive');
    expect(humanizeChapter('late_light')).toBe('late light');
    expect(humanizeChapter('2024 tokyo')).toBe('tokyo');
    expect(defaultAlt('DSC_0123-final.jpg')).toBe('DSC 0123 final');
  });

  it('formats colors and filters image files', () => {
    expect(toHex({ r: 255, g: 0, b: 15.6 })).toBe('#ff0010');
    expect(isImageFile('a.JPG')).toBe(true);
    expect(isImageFile('a.avif')).toBe(true);
    expect(isImageFile('notes.txt')).toBe(false);
    expect(isImageFile('.DS_Store')).toBe(false);
  });
});

describe('describePhoto', () => {
  it('reads dimensions, dominant color, and a tiny webp placeholder from a real image', async () => {
    const file = join(dir, 'red.jpg');
    await writeSolid(file, 120, 80, [200, 30, 30]);
    const described = await describePhoto(file);
    expect(described.width).toBe(120);
    expect(described.height).toBe(80);
    // JPEG compression shifts the exact value slightly; the hue must still be clearly red.
    const [r, g, b] = [1, 3, 5].map(offset => Number.parseInt(described.dominantColor.slice(offset, offset + 2), 16));
    expect(r).toBeGreaterThan(150);
    expect(g).toBeLessThan(80);
    expect(b).toBeLessThan(80);
    expect(described.blurDataURL).toMatch(/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/);
    // Placeholders must stay tiny; the whole manifest ships as props.
    expect(described.blurDataURL.length).toBeLessThan(600);
  });

  it('applies EXIF orientation so portrait phone shots report portrait dimensions', async () => {
    const file = join(dir, 'rotated.jpg');
    await sharp({ create: { width: 120, height: 80, channels: 3, background: '#808080' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(file);
    const described = await describePhoto(file);
    expect(described.width).toBe(80);
    expect(described.height).toBe(120);
  });

  it('rejects files sharp cannot size', async () => {
    const file = join(dir, 'broken.jpg');
    await writeFile(file, 'not an image');
    await expect(describePhoto(file)).rejects.toThrow();
  });
});

describe('buildManifest', () => {
  const fakeDescribe = async () => ({
    width: 3,
    height: 2,
    dominantColor: '#123456',
    blurDataURL: 'data:image/webp;base64,AA==',
  });

  it('walks chapters and files in sorted order and skips non-images', async () => {
    await writeSolid(join(dir, '02-summer', 'b.jpg'), 4, 4, [0, 0, 0]);
    await writeSolid(join(dir, '02-summer', 'a.jpg'), 4, 4, [0, 0, 0]);
    await writeSolid(join(dir, '01-spring', 'x.jpg'), 4, 4, [0, 0, 0]);
    await writeFile(join(dir, '01-spring', 'notes.txt'), 'ignore me');
    await writeFile(join(dir, 'stray.jpg'), 'files outside a chapter folder are ignored');

    const manifest = await buildManifest({ photosDir: dir, describe: fakeDescribe });
    expect(manifest.map(photo => photo.id)).toEqual(['01-spring/x', '02-summer/a', '02-summer/b']);
    expect(manifest[0]).toEqual({
      id: '01-spring/x',
      src: '/photos/01-spring/x.jpg',
      width: 3,
      height: 2,
      dominantColor: '#123456',
      blurDataURL: 'data:image/webp;base64,AA==',
      alt: 'x',
      chapter: 'spring',
    });
  });

  it('keeps hand-written alt, caption, and chapter for unchanged ids and applies the src prefix', async () => {
    await writeSolid(join(dir, '01-spring', 'x.jpg'), 4, 4, [0, 0, 0]);
    await writeSolid(join(dir, '01-spring', 'y.jpg'), 4, 4, [0, 0, 0]);
    const existing = new Map<string, Photo>([
      [
        '01-spring/x',
        {
          id: '01-spring/x',
          src: '/old/x.jpg',
          width: 1,
          height: 1,
          dominantColor: '#000000',
          blurDataURL: 'data:image/webp;base64,old',
          alt: 'Wet road at dawn',
          chapter: 'Spring drive, day one',
          caption: 'Seoul · rain',
        },
      ],
    ]);

    const manifest = await buildManifest({
      photosDir: dir,
      existing,
      srcPrefix: 'https://img.example.com/diary/',
      describe: fakeDescribe,
    });
    expect(manifest[0]).toMatchObject({
      src: 'https://img.example.com/diary/01-spring/x.jpg',
      alt: 'Wet road at dawn',
      chapter: 'Spring drive, day one',
      caption: 'Seoul · rain',
      // Measured fields always come from the file, never from the old manifest.
      width: 3,
      dominantColor: '#123456',
    });
    expect(manifest[1]).toMatchObject({ alt: 'y', chapter: 'spring' });
    expect(manifest[1]).not.toHaveProperty('caption');
  });

  it('uses the real describer by default', async () => {
    await writeSolid(join(dir, '01-spring', 'x.jpg'), 30, 10, [10, 10, 200]);
    const [photo] = await buildManifest({ photosDir: dir });
    expect(photo).toMatchObject({ width: 30, height: 10 });
  });
});

describe('loadExistingManifest', () => {
  it('indexes entries by id and tolerates a missing or invalid file', async () => {
    const path = join(dir, 'photos.json');
    expect((await loadExistingManifest(path)).size).toBe(0);
    await writeFile(path, '{not json');
    expect((await loadExistingManifest(path)).size).toBe(0);
    await writeFile(
      path,
      JSON.stringify([
        { id: 'a/1', alt: 'one' },
        { id: 'b/2', alt: 'two' },
      ])
    );
    const loaded = await loadExistingManifest(path);
    expect(loaded.get('b/2')?.alt).toBe('two');
  });
});
