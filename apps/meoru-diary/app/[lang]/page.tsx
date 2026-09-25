import { LanguageSwitcher } from '@/components/language-switcher';
import { StickerBook } from '@/components/sticker-book';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/locales';
import { CONTENT_LANG, getPhotos, groupByChapter } from '@/lib/photos';

const ABOUT_SLUG = 'about';

type PageProps = Readonly<{ params: Promise<{ lang: string }> }>;

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : 'en';
  const dictionary = getDictionary(locale);
  // Manifest text is English for now; other pages tag it so screen readers switch voices.
  const contentLang = locale === CONTENT_LANG ? undefined : CONTENT_LANG;
  const chapters = groupByChapter(getPhotos());

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col px-[4vw] pt-32 pb-[30vh] md:pt-[18vh] md:pr-[max(4vw,3.5rem)]">
      <header className="mb-[22vh] md:mb-[30vh]">
        <h1 className="text-sm tracking-[0.18em] uppercase">{dictionary.siteTitle}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{dictionary.tagline}</p>
        <LanguageSwitcher current={locale} label={dictionary.languageNav} className="mt-6" />
      </header>
      {/* `tabIndex={-1}` lets the skip link move focus here without adding a tab stop. */}
      <main id="main" tabIndex={-1} className="outline-none">
        <StickerBook
          chapters={chapters}
          labels={{
            chaptersNav: dictionary.chaptersNav,
            showMore: dictionary.showMore,
            showing: dictionary.showing,
            endOfBook: dictionary.endOfBook,
          }}
          extraBookmarks={[{ slug: ABOUT_SLUG, title: dictionary.about.title }]}
          contentLang={contentLang}
        />
        <section
          id={ABOUT_SLUG}
          tabIndex={-1}
          aria-labelledby={`${ABOUT_SLUG}-title`}
          className="mt-[30vh] max-w-md scroll-mt-24 outline-none"
        >
          <h2 id={`${ABOUT_SLUG}-title`} className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {dictionary.about.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed">{dictionary.about.body}</p>
        </section>
      </main>
    </div>
  );
}
