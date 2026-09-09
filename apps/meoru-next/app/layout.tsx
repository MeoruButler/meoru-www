import type { Metadata } from 'next';
import * as React from 'react';

import { Providers } from '@/components/providers';

import '@meoru/ui/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Meoru Next',
    template: '%s | Meoru Next',
  },
  description: 'Next.js App Router template for the meoru-www monorepo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
