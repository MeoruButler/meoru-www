'use client';

import * as React from 'react';

import { BookmarkNav, type Bookmark } from '@/components/bookmark-nav';
import { Sticker } from '@/components/sticker';
import { format } from '@/lib/i18n/dictionaries';
import type { Chapter } from '@/lib/photos';

type StickerBookLabels = {
  chaptersNav: string;
  showMore: string;
  /** Template with `{shown}` and `{total}`. */
  showing: string;
  endOfBook: string;
};

type StickerBookProps = {
  chapters: readonly Chapter[];
  labels: StickerBookLabels;
  /** Stickers revealed per scroll step. */
  pageSize?: number;
  /** Stickers rendered in the initial HTML. */
  initialCount?: number;
  /** Stickers that get `fetchPriority="high"`. */
  priorityCount?: number;
  /** Extra bookmarks appended after the chapters, such as the about section. */
  extraBookmarks?: readonly Bookmark[];
  /** Language of manifest text (titles, alt, captions) when it differs from the page language. */
  contentLang?: string;
};

/** Reveal the next page when the sentinel comes within two viewports of the bottom edge. */
const SENTINEL_ROOT_MARGIN = '0px 0px 200% 0px';
/** A chapter counts as active once its section crosses the upper-middle band of the viewport. */
const ACTIVE_ROOT_MARGIN = '-35% 0px -60% 0px';

type IndexedPhoto = Chapter['photos'][number] & { index: number };

function indexChapters(chapters: readonly Chapter[]) {
  let index = 0;
  const lastIndexBySlug = new Map<string, number>();
  const indexed = chapters.map(chapter => {
    const photos: IndexedPhoto[] = chapter.photos.map(photo => ({ ...photo, index: index++ }));
    lastIndexBySlug.set(chapter.slug, index - 1);
    return { ...chapter, photos };
  });
  return { indexed, total: index, lastIndexBySlug };
}

/**
 * The endless notebook. All chapter headings render immediately so anchors resolve, while
 * stickers are appended in pages as the reader approaches the end of what is rendered.
 * Scrolling is not the only way forward: a "show more" button does the same for keyboard and
 * screen-reader users, and a polite status line reports how much of the book is on the page.
 * Photos are never fetched from the network here; the manifest arrives as props.
 */
export function StickerBook({
  chapters,
  labels,
  pageSize = 6,
  initialCount = 12,
  priorityCount = 2,
  extraBookmarks = [],
  contentLang,
}: StickerBookProps) {
  const { indexed, total, lastIndexBySlug } = React.useMemo(() => indexChapters(chapters), [chapters]);
  const [visibleCount, setVisibleCount] = React.useState(() => Math.min(initialCount, total));
  const [hashHandled, setHashHandled] = React.useState(false);
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef(new Map<string, HTMLElement>());

  const showNextPage = React.useCallback(() => {
    setVisibleCount(count => Math.min(count + pageSize, total));
  }, [pageSize, total]);

  const revealThrough = React.useCallback(
    (slug: string) => {
      const lastIndex = lastIndexBySlug.get(slug);
      if (lastIndex === undefined) return;
      setVisibleCount(count => Math.max(count, Math.min(lastIndex + 1 + pageSize, total)));
    },
    [lastIndexBySlug, pageSize, total]
  );

  // Deep links (`/#chapter`) must show the chapter's photos, not just its heading. The hash is only
  // known on the client, so this runs once after hydration instead of in the state initializer.
  if (typeof window !== 'undefined' && !hashHandled) {
    setHashHandled(true);
    const slug = window.location.hash.slice(1);
    if (slug) revealThrough(slug);
  }

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= total) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) showNextPage();
      },
      { rootMargin: SENTINEL_ROOT_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, total, showNextPage]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSlug(entry.target.id);
        }
      },
      { rootMargin: ACTIVE_ROOT_MARGIN }
    );
    for (const section of sectionRefs.current.values()) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const registerSection = (slug: string) => (element: HTMLElement | null) => {
    if (element) sectionRefs.current.set(slug, element);
    else sectionRefs.current.delete(slug);
  };

  const bookmarks: Bookmark[] = [
    ...indexed.map(({ slug, title }) => ({ slug, title, lang: contentLang })),
    ...extraBookmarks,
  ];
  const isComplete = visibleCount >= total;

  return (
    <>
      <BookmarkNav
        bookmarks={bookmarks}
        activeSlug={activeSlug}
        label={labels.chaptersNav}
        onNavigate={revealThrough}
      />
      <div className="flex flex-col gap-[28vh]">
        {indexed.map(chapter => (
          <section
            key={chapter.slug}
            id={chapter.slug}
            ref={registerSection(chapter.slug)}
            // Anchor targets take focus so the bookmark jump is announced and keyboard scrolling continues from here.
            tabIndex={-1}
            aria-labelledby={`${chapter.slug}-title`}
            className="scroll-mt-24 outline-none"
          >
            <h2
              id={`${chapter.slug}-title`}
              lang={contentLang}
              className="mb-[10vh] text-xs tracking-[0.18em] text-muted-foreground uppercase"
            >
              {chapter.title}
            </h2>
            <div className="sticker-grid">
              {chapter.photos
                .filter(photo => photo.index < visibleCount)
                .map(photo => (
                  <Sticker
                    key={photo.id}
                    photo={photo}
                    index={photo.index}
                    priority={photo.index < priorityCount}
                    lang={contentLang}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-[14vh] flex flex-col items-start gap-3">
        <p role="status" aria-live="polite" className="text-xs tracking-[0.12em] text-muted-foreground">
          {isComplete ? labels.endOfBook : format(labels.showing, { shown: visibleCount, total })}
        </p>
        {isComplete ? null : (
          <>
            <button
              type="button"
              onClick={showNextPage}
              className="min-h-6 text-xs tracking-[0.12em] text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {labels.showMore}
            </button>
            <div ref={sentinelRef} aria-hidden data-testid="sticker-book-sentinel" className="h-px" />
          </>
        )}
      </div>
    </>
  );
}
