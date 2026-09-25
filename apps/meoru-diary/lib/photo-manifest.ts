import { readdir, readFile } from 'node:fs/promises';
import { join, parse, relative } from 'node:path';
import sharp from 'sharp';

import type { Photo } from '@/lib/photos';

/**
 * Build-time photo manifest logic. Kept free of CLI concerns so the pipeline that the whole
 * loading strategy depends on (intrinsic size, dominant color, blur placeholder, hand-written
 * field preservation) can be tested with real images.
 */

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const PLACEHOLDER_WIDTH = 20;

export type DescribedPhoto = Pick<Photo, 'width' | 'height' | 'dominantColor' | 'blurDataURL'>;

/** `01-spring-drive` → `spring drive`. The numeric prefix only orders folders. */
export function humanizeChapter(folder: string): string {
  return folder.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ');
}

/** `DSC_0123-final` → `DSC 0123 final`; the default alt until someone writes a real one. */
export function defaultAlt(fileName: string): string {
  return parse(fileName).name.replace(/[-_]+/g, ' ');
}

export function toHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${[r, g, b].map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

export function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSIONS.has(parse(fileName).ext.toLowerCase());
}

/**
 * Read what the client needs to reserve layout and paint a placeholder. EXIF orientation is
 * applied first so portrait phone shots report portrait dimensions.
 */
export async function describePhoto(filePath: string): Promise<DescribedPhoto> {
  const image = sharp(filePath, { failOn: 'none' }).rotate();
  const [metadata, { dominant }, placeholder] = await Promise.all([
    image.clone().metadata(),
    image.clone().stats(),
    image.clone().resize({ width: PLACEHOLDER_WIDTH }).webp({ quality: 45, alphaQuality: 0 }).toBuffer(),
  ]);
  // `metadata()` reports the stored pixel grid even after `.rotate()`; `autoOrient` is the size the
  // image will actually be displayed at once EXIF orientation is applied.
  const width = metadata.autoOrient?.width ?? metadata.width;
  const height = metadata.autoOrient?.height ?? metadata.height;
  if (!width || !height) throw new Error(`Cannot read dimensions of ${filePath}`);
  return {
    width,
    height,
    dominantColor: toHex(dominant),
    blurDataURL: `data:image/webp;base64,${placeholder.toString('base64')}`,
  };
}

export async function loadExistingManifest(manifestPath: string): Promise<Map<string, Photo>> {
  try {
    const entries = JSON.parse(await readFile(manifestPath, 'utf8')) as Photo[];
    return new Map(entries.map(entry => [entry.id, entry]));
  } catch {
    return new Map();
  }
}

export type BuildManifestOptions = {
  /** Directory holding one sub-folder per chapter. */
  photosDir: string;
  /** Previous manifest; `alt`, `caption`, and `chapter` are carried over by photo id. */
  existing?: ReadonlyMap<string, Photo>;
  /** URL prefix for `src`, e.g. `/photos` locally or a bucket path on the CDN. */
  srcPrefix?: string;
  /** Injected for tests; defaults to reading the file with sharp. */
  describe?: (filePath: string) => Promise<DescribedPhoto>;
};

/**
 * Walk `photosDir/<chapter>/<file>` in sorted order and produce manifest entries. Folder order
 * (numeric prefixes) and file-name order define the reading order of the book.
 */
export async function buildManifest({
  photosDir,
  existing = new Map(),
  srcPrefix = '/photos',
  describe = describePhoto,
}: BuildManifestOptions): Promise<Photo[]> {
  const chapterFolders = (await readdir(photosDir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .toSorted();

  const manifest: Photo[] = [];
  for (const folder of chapterFolders) {
    const files = (await readdir(join(photosDir, folder))).filter(isImageFile).toSorted();
    for (const file of files) {
      const filePath = join(photosDir, folder, file);
      const id = relative(photosDir, filePath).replace(/\.[^.]+$/, '');
      const previous = existing.get(id);
      const described = await describe(filePath);
      manifest.push({
        id,
        src: `${srcPrefix.replace(/\/$/, '')}/${folder}/${file}`,
        ...described,
        alt: previous?.alt ?? defaultAlt(file),
        chapter: previous?.chapter ?? humanizeChapter(folder),
        ...(previous?.caption ? { caption: previous.caption } : {}),
      });
    }
  }
  return manifest;
}
