import { format, getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { LOCALES } from '@/lib/i18n/locales';

function leafStrings(value: unknown, path: string[] = []): [string, string][] {
  if (typeof value === 'string') return [[path.join('.'), value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => leafStrings(child, [...path, key]));
}

describe('dictionaries', () => {
  const english = getDictionary('en');

  it.each(LOCALES)('%s has every key filled in and the same placeholders as English', locale => {
    const dictionary: Dictionary = getDictionary(locale);
    const englishLeaves = new Map(leafStrings(english));
    for (const [key, text] of leafStrings(dictionary)) {
      expect(text.trim()).not.toBe('');
      const placeholders = [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).toSorted();
      const englishPlaceholders = [...(englishLeaves.get(key) ?? '').matchAll(/\{(\w+)\}/g)]
        .map(match => match[1])
        .toSorted();
      expect(placeholders).toEqual(englishPlaceholders);
    }
  });
});

describe('format', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('{shown} of {total}', { shown: 3, total: 10 })).toBe('3 of 10');
    expect(format('{missing} here', {})).toBe('{missing} here');
  });
});
