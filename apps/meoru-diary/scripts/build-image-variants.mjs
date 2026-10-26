#!/usr/bin/env node
/**
 * Pre-generate the AVIF/WebP widths that stickers request in CDN mode.
 *
 * Reads `content/photos.json`, encodes every photo into `.variants/<key>/w<width>.<format>`, and
 * skips keys that already exist, so reruns only encode new or edited photos. Upload the folder
 * as-is to the image bucket (see README "Hosting modes"). Run `pnpm photos:manifest` first; a
 * photo whose bytes no longer match its manifest key aborts the run.
 *
 * The logic lives in `lib/photo-variants.ts` (loaded through Node's built-in type stripping).
 *
 * Usage: pnpm photos:variants
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildVariants } from '../lib/photo-variants.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'content', 'photos.json');
const OUT_DIR = join(ROOT, '.variants');

const photos = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
const { written, skipped } = await buildVariants({ photos, publicDir: join(ROOT, 'public'), outDir: OUT_DIR });
console.log(`Encoded ${written} photos into ${relative(ROOT, OUT_DIR)} (${skipped} already there)`);
