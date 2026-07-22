'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

export function Providers({ children }: React.PropsWithChildren) {
  const props = {
    attribute: 'class' as const,
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: true,
    enableColorScheme: true,
    children,
  };

  return <NextThemesProvider {...props} />;
}
