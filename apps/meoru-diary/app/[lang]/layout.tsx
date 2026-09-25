import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, LOCALE_META, LOCALES } from '@/lib/i18n/locales';

import '@meoru/ui/globals.css';
import '../diary.css';

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);
  return {
    title: {
      default: dictionary.metaTitle,
      template: `%s | ${dictionary.siteTitle}`,
    },
    description: dictionary.metaDescription,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LOCALES.map(locale => [LOCALE_META[locale].htmlLang, `/${locale}`])),
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dictionary = getDictionary(lang);

  return (
    <html lang={LOCALE_META[lang].htmlLang}>
      <body>
        {/* First tab stop: lets keyboard and screen-reader users bypass the fixed navigation. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
        >
          {dictionary.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
