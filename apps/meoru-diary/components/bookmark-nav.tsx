'use client';

import * as React from 'react';

import { cn } from '@meoru/ui/lib/utils';

export type Bookmark = {
  slug: string;
  title: string;
  /** BCP 47 tag when the title is not in the page language. */
  lang?: string;
};

type BookmarkNavProps = {
  bookmarks: readonly Bookmark[];
  activeSlug: string | null;
  /** Accessible name for the navigation landmark, in the current language. */
  label: string;
  /** Called before the browser follows the anchor so the target chapter can be revealed. */
  onNavigate?: (slug: string) => void;
};

/**
 * Bookmark ribbons sticking out of the right edge of the notebook (a horizontal strip on phones).
 * Each tab is a plain anchor to a chapter section, so deep links and keyboard navigation work
 * without JavaScript. The active ribbon is pulled out a little further.
 */
export function BookmarkNav({ bookmarks, activeSlug, label, onNavigate }: BookmarkNavProps) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 top-0 z-10 flex gap-1 overflow-x-auto px-4 py-3 md:inset-x-auto md:top-24 md:right-0 md:flex-col md:items-end md:gap-2 md:px-0 md:py-0"
    >
      {bookmarks.map(bookmark => {
        const isActive = bookmark.slug === activeSlug;
        return (
          <a
            key={bookmark.slug}
            href={`#${bookmark.slug}`}
            aria-current={isActive ? 'location' : undefined}
            lang={bookmark.lang}
            onClick={() => onNavigate?.(bookmark.slug)}
            className={cn(
              'bookmark-tab shrink-0 text-xs tracking-[0.18em] uppercase transition-[padding,color] duration-300 motion-reduce:transition-none',
              'px-3 py-1.5 md:px-2 md:py-4',
              isActive ? 'text-foreground md:px-3.5' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {bookmark.title}
          </a>
        );
      })}
    </nav>
  );
}
