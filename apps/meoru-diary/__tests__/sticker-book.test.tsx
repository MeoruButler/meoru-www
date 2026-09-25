import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StickerBook } from '@/components/sticker-book';
import type { Chapter, Photo } from '@/lib/photos';

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  targets: Element[];
  disconnect: jest.Mock;
};

const observers: ObserverRecord[] = [];

beforeEach(() => {
  observers.length = 0;
  global.IntersectionObserver = jest
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      const record: ObserverRecord = { callback, options, targets: [], disconnect: jest.fn() };
      observers.push(record);
      return {
        observe: (target: Element) => record.targets.push(target),
        unobserve: jest.fn(),
        disconnect: record.disconnect,
      };
    }) as unknown as typeof IntersectionObserver;
  window.location.hash = '';
});

function makeChapter(slug: string, title: string, count: number, offset: number): Chapter {
  const photos: Photo[] = Array.from({ length: count }, (_, i) => ({
    id: `${slug}/${i}`,
    src: `/photos/${slug}/${i}.jpg`,
    width: 3,
    height: 2,
    blurDataURL: 'data:image/webp;base64,AA==',
    dominantColor: '#cccccc',
    alt: `Photo ${offset + i}`,
    chapter: title,
  }));
  return { slug, title, photos };
}

const labels = {
  chaptersNav: 'Chapters',
  showMore: 'Show more photos',
  showing: '{shown} of {total} photos shown',
  endOfBook: 'End of the book',
};

const chapters = [
  makeChapter('spring', 'Spring', 4, 0),
  makeChapter('summer', 'Summer', 4, 4),
  makeChapter('autumn', 'Autumn', 4, 8),
];

/** Find the observer that watches the sentinel (the one created with the large bottom rootMargin). */
const sentinelObserver = () => observers.find(record => record.options?.rootMargin?.includes('200%'));
const activeObserver = () => observers.find(record => record.options?.rootMargin?.includes('-35%'));

function intersect(record: ObserverRecord | undefined, target?: Element) {
  if (!record) throw new Error('observer not registered');
  const entryTarget = target ?? record.targets[0]!;
  act(() => {
    record.callback(
      [{ isIntersecting: true, target: entryTarget } as IntersectionObserverEntry],
      record as unknown as IntersectionObserver
    );
  });
}

describe('StickerBook', () => {
  it('renders every chapter heading but only the initial page of stickers', () => {
    render(<StickerBook chapters={chapters} labels={labels} initialCount={3} pageSize={2} />);
    expect(screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual([
      'Spring',
      'Summer',
      'Autumn',
    ]);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByTestId('sticker-book-sentinel')).toBeInTheDocument();
  });

  it('appends a page each time the sentinel comes within reach and removes it at the end', () => {
    render(<StickerBook chapters={chapters} labels={labels} initialCount={3} pageSize={4} />);
    intersect(sentinelObserver());
    expect(screen.getAllByRole('img')).toHaveLength(7);
    intersect(sentinelObserver());
    expect(screen.getAllByRole('img')).toHaveLength(11);
    intersect(sentinelObserver());
    expect(screen.getAllByRole('img')).toHaveLength(12);
    expect(screen.queryByTestId('sticker-book-sentinel')).toBeNull();
  });

  it('ignores observer callbacks that are not intersecting', () => {
    render(<StickerBook chapters={chapters} labels={labels} initialCount={3} pageSize={4} />);
    const record = sentinelObserver()!;
    act(() => {
      record.callback(
        [{ isIntersecting: false, target: record.targets[0]! } as IntersectionObserverEntry],
        record as never
      );
    });
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('reveals a chapter through its last sticker when its bookmark is clicked', async () => {
    const user = userEvent.setup();
    render(<StickerBook chapters={chapters} labels={labels} initialCount={2} pageSize={1} />);
    await user.click(screen.getByRole('link', { name: 'Autumn' }));
    // All 12 photos: the autumn chapter ends at index 11, plus one page of runway (capped at total).
    expect(screen.getAllByRole('img')).toHaveLength(12);
  });

  it('does nothing for bookmarks that are not chapters', async () => {
    const user = userEvent.setup();
    render(
      <StickerBook
        chapters={chapters}
        labels={labels}
        initialCount={2}
        pageSize={1}
        extraBookmarks={[{ slug: 'about', title: 'About' }]}
      />
    );
    await user.click(screen.getByRole('link', { name: 'About' }));
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('reveals the chapter named in the URL hash on mount', () => {
    window.location.hash = '#summer';
    render(<StickerBook chapters={chapters} labels={labels} initialCount={2} pageSize={2} />);
    // Summer ends at index 7, plus a page of two.
    expect(screen.getAllByRole('img')).toHaveLength(10);
  });

  it('marks the chapter crossing the viewport band as the active bookmark', () => {
    render(<StickerBook chapters={chapters} labels={labels} initialCount={12} pageSize={4} />);
    const record = activeObserver()!;
    expect(record.targets.map(target => target.id)).toEqual(['spring', 'summer', 'autumn']);
    intersect(record, record.targets[1]);
    expect(screen.getByRole('link', { name: 'Summer' })).toHaveAttribute('aria-current', 'location');
    expect(screen.queryByTestId('sticker-book-sentinel')).toBeNull();
  });

  it('offers a button that reveals the next page and reports progress politely', async () => {
    const user = userEvent.setup();
    render(<StickerBook chapters={chapters} initialCount={3} pageSize={4} labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent('3 of 12 photos shown');
    await user.click(screen.getByRole('button', { name: 'Show more photos' }));
    expect(screen.getAllByRole('img')).toHaveLength(7);
    expect(screen.getByRole('status')).toHaveTextContent('7 of 12 photos shown');
    await user.click(screen.getByRole('button', { name: 'Show more photos' }));
    await user.click(screen.getByRole('button', { name: 'Show more photos' }));
    expect(screen.queryByRole('button', { name: 'Show more photos' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('End of the book');
  });

  it('makes chapter sections programmatically focusable for bookmark jumps', () => {
    render(<StickerBook chapters={chapters} initialCount={3} labels={labels} />);
    expect(screen.getByRole('region', { name: 'Summer' })).toHaveAttribute('tabindex', '-1');
  });

  it('marks manifest text with the content language but leaves page-language bookmarks alone', () => {
    render(
      <StickerBook
        chapters={chapters}
        initialCount={2}
        labels={labels}
        contentLang="en"
        extraBookmarks={[{ slug: 'about', title: '소개' }]}
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Spring' })).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('link', { name: 'Spring' })).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('link', { name: '소개' })).not.toHaveAttribute('lang');
    expect(screen.getAllByRole('img')[0]?.closest('figure')).toHaveAttribute('lang', 'en');
  });

  it('marks the first two stickers as high priority only', () => {
    render(<StickerBook chapters={chapters} labels={labels} initialCount={4} priorityCount={2} />);
    const priorities = screen.getAllByRole('img').map(img => img.getAttribute('fetchpriority'));
    expect(priorities).toEqual(['high', 'high', 'auto', 'auto']);
  });
});
