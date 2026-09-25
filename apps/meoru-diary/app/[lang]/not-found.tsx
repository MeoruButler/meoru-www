'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@meoru/ui/components/button';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/locales';

/**
 * Rendered inside the `[lang]` layout, so the matched locale is available through `useParams`
 * even though `not-found` receives no props. Falls back to English for unexpected paths.
 */
export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const lang = isLocale(params?.lang) ? params.lang : 'en';
  const dictionary = getDictionary(lang);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">{dictionary.notFound.title}</h1>
      <p className="text-muted-foreground">{dictionary.notFound.body}</p>
      <Button asChild>
        <Link href={`/${lang}`}>{dictionary.notFound.backHome}</Link>
      </Button>
    </main>
  );
}
