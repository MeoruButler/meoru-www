#!/usr/bin/env node
/**
 * Build `content/photos.json` from the files in `public/photos/<chapter>/*`.
 *
 * For every photo the manifest records the intrinsic size, the dominant color, and a tiny inline
 * WebP placeholder, so the client can reserve layout and paint something meaningful before the
 * first byte of the real image arrives. Hand-written fields (`alt`, `caption`, `chapter`) from an
 * existing manifest are preserved when the photo id is unchanged.
 *
 * Folder convention: `public/photos/<NN-chapter-name>/<file>.jpg`. Folders sort by name (use a
 * numeric prefix for ordering); the prefix is stripped and dashes become spaces for the title.
 *
 * When the photos move to a CDN, point `--src-prefix` at the bucket path instead of `/photos`.
 * The logic lives in `lib/photo-manifest.ts` (loaded through Node's built-in type stripping).
 *
 * Usage: pnpm photos:manifest [--src-prefix /photos]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildManifest, loadExistingManifest } from '../lib/photo-manifest.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS_DIR = join(ROOT, 'public', 'photos');
const MANIFEST_PATH = join(ROOT, 'content', 'photos.json');

const srcPrefixIndex = process.argv.indexOf('--src-prefix');
const srcPrefix = srcPrefixIndex === -1 ? '/photos' : process.argv[srcPrefixIndex + 1];

const existing = await loadExistingManifest(MANIFEST_PATH);
const manifest = await buildManifest({ photosDir: PHOTOS_DIR, existing, srcPrefix });

await mkdir(dirname(MANIFEST_PATH), { recursive: true });
await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${manifest.length} photos to ${relative(ROOT, MANIFEST_PATH)}`);
