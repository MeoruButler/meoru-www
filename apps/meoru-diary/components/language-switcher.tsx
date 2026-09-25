import Link from 'next/link';

import { cn } from '@meoru/ui/lib/utils';

import { LOCALE_META, LOCALES, type Locale } from '@/lib/i18n/locales';

type LanguageSwitcherProps = {
  current: Locale;
  /** Accessible name for the navigation landmark, in the current language. */
  label: string;
  className?: string;
};

/**
 * Plain links to each localized home. Each name is written in its own language and tagged with
 * `lang` so screen readers switch voices; the current one is marked with `aria-current`.
 */
export function LanguageSwitcher({ current, label, className }: LanguageSwitcherProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs tracking-[0.12em]">
        {LOCALES.map(locale => {
          const isCurrent = locale === current;
          return (
            <li key={locale}>
              <Link
                href={`/${locale}`}
                // Prefetching every locale would also let the proxy see speculative requests; the
                // switcher is used rarely, so a full navigation is fine.
                prefetch={false}
                hrefLang={LOCALE_META[locale].htmlLang}
                lang={LOCALE_META[locale].htmlLang}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-6 items-center underline-offset-4',
                  isCurrent
                    ? 'text-foreground underline'
                    : 'text-muted-foreground hover:text-foreground hover:underline'
                )}
              >
                {LOCALE_META[locale].nativeName}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
