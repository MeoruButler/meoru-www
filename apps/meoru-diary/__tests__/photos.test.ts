import { getPhotos, groupByChapter, slugify, type Photo } from '@/lib/photos';

const photo = (overrides: Partial<Photo>): Photo => ({
  id: 'x',
  src: '/photos/x.jpg',
  width: 3,
  height: 2,
  blurDataURL: 'data:image/webp;base64,AA==',
  dominantColor: '#000000',
  alt: 'x',
  chapter: 'Chapter',
  ...overrides,
});

describe('slugify', () => {
  it('lowercases, strips accents, and collapses separators', () => {
    expect(slugify('Late Light')).toBe('late-light');
    expect(slugify('  Séoul // 2024  ')).toBe('seoul-2024');
    expect(slugify('서울 밤')).toBe('서울-밤');
  });
});

describe('groupByChapter', () => {
  it('keeps chapter order of first appearance and photo order within a chapter', () => {
    const chapters = groupByChapter([
      photo({ id: 'a', chapter: 'Spring' }),
      photo({ id: 'b', chapter: 'Summer' }),
      photo({ id: 'c', chapter: 'Spring' }),
    ]);
    expect(chapters.map(chapter => chapter.slug)).toEqual(['spring', 'summer']);
    expect(chapters[0]?.title).toBe('Spring');
    expect(chapters[0]?.photos.map(item => item.id)).toEqual(['a', 'c']);
  });
});

describe('getPhotos', () => {
  it('exposes the manifest with everything the client needs to reserve layout', () => {
    const photos = getPhotos();
    expect(photos.length).toBeGreaterThan(0);
    for (const item of photos) {
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
      expect(item.blurDataURL.startsWith('data:image/')).toBe(true);
      expect(item.dominantColor).toMatch(/^#[0-9a-f]{6}$/);
      expect(item.alt).not.toBe('');
      expect(item.chapter).not.toBe('');
    }
  });
});
