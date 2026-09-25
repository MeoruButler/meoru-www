#!/usr/bin/env node
/**
 * Generate placeholder photos for local development and E2E tests.
 *
 * Writes gradient JPEGs into `public/photos/<chapter>/` so the manifest builder and the
 * sticker book have realistic dimensions to work with before real photos exist.
 *
 * Usage: pnpm photos:samples
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS_DIR = join(ROOT, 'public', 'photos');
const LONG_EDGE = 1600;

/** [chapter folder, number of photos]. Folder names are humanized into chapter titles. */
const CHAPTERS = [
  ['01-spring-drive', 7],
  ['02-midsummer-streets', 6],
  ['03-late-light', 5],
];

/** Aspect ratios cycled across the samples: 3:2, 2:3, 4:5, 1:1, 16:9. */
const ASPECTS = [
  [3, 2],
  [2, 3],
  [4, 5],
  [1, 1],
  [16, 9],
];

const PALETTES = [
  ['#c9c1b5', '#6b6259'],
  ['#d8c7b0', '#8c6f4e'],
  ['#b9c4c9', '#4f6470'],
  ['#e0d3c1', '#a0785a'],
  ['#c7cfc2', '#5b6b55'],
  ['#d9cdd6', '#7a5f73'],
  ['#cfc7c0', '#3f3a36'],
];

function svgFor(width, height, [from, to], label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}" />
      <stop offset="1" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" />
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif"
    font-size="${Math.round(Math.min(width, height) / 6)}" fill="rgba(255,255,255,0.55)">${label}</text>
</svg>`;
}

let counter = 0;
for (const [chapter, count] of CHAPTERS) {
  const dir = join(PHOTOS_DIR, chapter);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const [aw, ah] = ASPECTS[counter % ASPECTS.length];
    const width = aw >= ah ? LONG_EDGE : Math.round((LONG_EDGE * aw) / ah);
    const height = aw >= ah ? Math.round((LONG_EDGE * ah) / aw) : LONG_EDGE;
    const label = String(counter + 1).padStart(2, '0');
    const svg = Buffer.from(svgFor(width, height, PALETTES[counter % PALETTES.length], label));
    const jpeg = await sharp(svg).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
    await writeFile(join(dir, `sample-${label}.jpg`), jpeg);
    counter++;
  }
}

console.log(`Wrote ${counter} sample photos to ${PHOTOS_DIR}`);
