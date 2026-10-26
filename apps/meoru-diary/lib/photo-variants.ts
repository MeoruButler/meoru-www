import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

import type { Photo } from '@/lib/photos';

// Explicit `.ts`: the scripts load this module through Node's built-in type stripping, which
// resolves neither extensionless nor `@/` imports.
import {
  RENDITION_VERSION,
  VARIANT_FORMATS,
  VARIANT_WIDTHS,
  type VariantFormat,
  variantPath,
} from './image-variants.ts';

/**
 * Build-time generation of the static variants described in `lib/image-variants.ts`. Encoding
 * happens once per photo on the author's machine, so the free tiers never pay for transforms.
 */

/** Quality picks follow docs/image-loading.md (AVIF 55–65, WebP 78–85 for photography). */
type Pipeline = ReturnType<typeof sharp>;

const ENCODERS: Record<VariantFormat, (image: Pipeline) => Pipeline> = {
  avif: image => image.avif({ quality: 60 }),
  webp: image => image.webp({ quality: 80 }),
};

export type RenderedVariant = { width: number; format: VariantFormat; data: Buffer };

/**
 * `<16 hex chars of SHA-256>/<rendition>`. 64 bits keeps URLs short with no practical collision
 * risk at portfolio scale; editing a photo yields a new key instead of overwriting cached bytes.
 */
export function photoKey(source: Buffer): string {
  return `${createHash('sha256').update(source).digest('hex').slice(0, 16)}/${RENDITION_VERSION}`;
}

/**
 * Encode every requested width in every format. Widths above the source are served at the source
 * size, so the loader never has to know how large a photo is.
 */
export async function renderVariants(source: Buffer): Promise<RenderedVariant[]> {
  // Decode, orient, and shrink once, then derive each width from that intermediate. sharp writes no
  // metadata by default, so EXIF (including GPS) never reaches the public bucket.
  const { data, info } = await sharp(source, { failOn: 'none' })
    .rotate()
    .resize({ width: Math.max(...VARIANT_WIDTHS), withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const intermediate = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });

  return Promise.all(
    VARIANT_WIDTHS.flatMap(width =>
      VARIANT_FORMATS.map(async format => ({
        width,
        format,
        data: await ENCODERS[format](intermediate.clone().resize({ width, withoutEnlargement: true })).toBuffer(),
      }))
    )
  );
}

/**
 * Write all variants of one photo under `outDir/<key>/`. A key already on disk is skipped; files
 * are rendered into a scratch directory and renamed at the end so an interrupted run never leaves
 * a half-written key behind for later runs to skip.
 */
export async function writeVariants({
  outDir,
  key,
  source,
}: {
  outDir: string;
  key: string;
  source: Buffer;
}): Promise<'written' | 'skipped'> {
  if (existsSync(join(outDir, key))) return 'skipped';

  const scratchKey = `${key}.partial`;
  await rm(join(outDir, scratchKey), { recursive: true, force: true });
  await mkdir(join(outDir, scratchKey), { recursive: true });
  for (const { width, format, data } of await renderVariants(source)) {
    await writeFile(join(outDir, variantPath(scratchKey, width, format)), data);
  }
  await rename(join(outDir, scratchKey), join(outDir, key));
  return 'written';
}

export type BuildVariantsOptions = {
  photos: readonly Pick<Photo, 'id' | 'src' | 'key'>[];
  /** Directory that `photo.src` paths are relative to (`public/`). */
  publicDir: string;
  outDir: string;
};

/** Generate variants for every manifest photo, refusing keys that no longer match their file. */
export async function buildVariants({ photos, publicDir, outDir }: BuildVariantsOptions) {
  const result = { written: 0, skipped: 0 };
  for (const photo of photos) {
    const source = await readFile(join(publicDir, photo.src));
    if (photoKey(source) !== photo.key) {
      throw new Error(`${photo.id} changed since the manifest was built; run \`pnpm photos:manifest\` first`);
    }
    result[await writeVariants({ outDir, key: photo.key, source })] += 1;
  }
  return result;
}
