'use client';

import { useParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@meoru/ui/components/button';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/locales';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const params = useParams<{ lang?: string }>();
  const dictionary = getDictionary(isLocale(params?.lang) ? params.lang : 'en');

  React.useEffect(() => {
    // Report to an error tracking service here.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">{dictionary.error.title}</h1>
      <p className="text-muted-foreground">{dictionary.error.body}</p>
      <Button onClick={reset}>{dictionary.error.retry}</Button>
    </main>
  );
}
