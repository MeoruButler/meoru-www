import manifest from '@/content/photos.json';

/**
 * A photo entry from the build-time manifest (`content/photos.json`).
 * Everything the client needs to lay out and placeholder the image is here, so the
 * browser never has to fetch metadata before the real image request.
 */
export type Photo = {
  /** Stable id, also used as the React key and the anchor for deep links. */
  id: string;
  /** Path or CDN key passed to `next/image`. Local mode: `/photos/<file>`. */
  src: string;
  width: number;
  height: number;
  /** Tiny inline placeholder rendered until the real image decodes. */
  blurDataURL: string;
  /** Average color used as the background behind the placeholder. */
  dominantColor: string;
  alt: string;
  /** Chapter (diary section) the photo belongs to. Drives the bookmark navigation. */
  chapter: string;
  /** Optional caption shown next to the sticker. */
  caption?: string;
};

export type Chapter = {
  /** URL-safe anchor id for the chapter section. */
  slug: string;
  title: string;
  photos: Photo[];
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/** Group photos into chapters while preserving manifest order. */
export function groupByChapter(photos: readonly Photo[]): Chapter[] {
  const chapters = new Map<string, Chapter>();
  for (const photo of photos) {
    const slug = slugify(photo.chapter);
    const existing = chapters.get(slug);
    if (existing) {
      existing.photos.push(photo);
    } else {
      chapters.set(slug, { slug, title: photo.chapter, photos: [photo] });
    }
  }
  return [...chapters.values()];
}

/**
 * Language of the manifest text (chapter titles, alt, captions). It is not localized yet, so pages
 * in other languages mark this content with `lang` for screen readers (WCAG 3.1.2).
 */
export const CONTENT_LANG = 'en';

export function getPhotos(): Photo[] {
  return manifest as Photo[];
}
