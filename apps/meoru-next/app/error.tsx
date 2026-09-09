'use client';

import * as React from 'react';

import { Button } from '@meoru/ui/components/button';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    // Report to an error tracking service here.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred while rendering this page.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
