import type { Locale } from '@/lib/i18n/locales';

export type Dictionary = {
  siteTitle: string;
  /** Document title: names the site and what it is (WCAG 2.4.2). */
  metaTitle: string;
  tagline: string;
  metaDescription: string;
  skipToContent: string;
  chaptersNav: string;
  languageNav: string;
  about: { title: string; body: string };
  showMore: string;
  /** Uses `{shown}` and `{total}` placeholders. */
  showing: string;
  endOfBook: string;
  notFound: { title: string; body: string; backHome: string };
  error: { title: string; body: string; retry: string };
};

const en: Dictionary = {
  siteTitle: 'Meoru',
  metaTitle: 'Meoru — fursuit photo diary',
  tagline: 'A diary kept in photographs, pasted in one by one.',
  metaDescription: 'A fursuit photography diary kept as a sticker book.',
  skipToContent: 'Skip to photos',
  chaptersNav: 'Chapters',
  languageNav: 'Language',
  about: {
    title: 'About',
    body: 'Fursuit photography, kept like a diary. This page is the whole book: scroll to turn it, use the bookmarks to jump between chapters.',
  },
  showMore: 'Show more photos',
  showing: '{shown} of {total} photos shown',
  endOfBook: 'End of the book',
  notFound: { title: 'Page not found', body: 'The page you requested does not exist.', backHome: 'Back to home' },
  error: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred while rendering this page.',
    retry: 'Try again',
  },
};

const ko: Dictionary = {
  siteTitle: 'Meoru',
  metaTitle: 'Meoru — 퍼슈트 사진 일기',
  tagline: '사진으로 쓴 일기, 한 장씩 붙여 둡니다.',
  metaDescription: '스티커북처럼 엮은 퍼슈트 사진 일기.',
  skipToContent: '사진으로 건너가기',
  chaptersNav: '챕터',
  languageNav: '언어',
  about: {
    title: '소개',
    body: '퍼슈트 사진을 일기처럼 모아 둔 곳입니다. 이 페이지가 책 전체이고, 스크롤로 넘기며 책갈피로 챕터를 오갑니다.',
  },
  showMore: '사진 더 보기',
  showing: '전체 {total}장 중 {shown}장 표시',
  endOfBook: '책의 끝',
  notFound: { title: '페이지를 찾을 수 없습니다', body: '요청한 페이지가 존재하지 않습니다.', backHome: '홈으로' },
  error: {
    title: '문제가 발생했습니다',
    body: '페이지를 그리는 중 예상치 못한 오류가 났습니다.',
    retry: '다시 시도',
  },
};

const ja: Dictionary = {
  siteTitle: 'Meoru',
  metaTitle: 'Meoru — ファースーツ写真日記',
  tagline: '写真でつづる日記。一枚ずつ貼っていきます。',
  metaDescription: 'シール帳のようにまとめたファースーツ写真の日記。',
  skipToContent: '写真へスキップ',
  chaptersNav: '章',
  languageNav: '言語',
  about: {
    title: 'このサイトについて',
    body: 'ファースーツ写真を日記のように集めた場所です。このページが本のすべてで、スクロールでページをめくり、ブックマークで章を移動します。',
  },
  showMore: '写真をもっと見る',
  showing: '全{total}枚のうち{shown}枚を表示',
  endOfBook: '本の終わり',
  notFound: { title: 'ページが見つかりません', body: 'お探しのページは存在しません。', backHome: 'ホームへ戻る' },
  error: {
    title: '問題が発生しました',
    body: 'ページの表示中に予期しないエラーが発生しました。',
    retry: '再試行',
  },
};

const zh: Dictionary = {
  siteTitle: 'Meoru',
  metaTitle: 'Meoru — 兽装摄影日记',
  tagline: '用照片写的日记，一张一张贴上去。',
  metaDescription: '像贴纸簿一样收藏的兽装摄影日记。',
  skipToContent: '跳转到照片',
  chaptersNav: '章节',
  languageNav: '语言',
  about: {
    title: '关于',
    body: '这里收集着如日记一般的兽装照片。这一页就是整本书：滚动翻页，用书签在章节之间跳转。',
  },
  showMore: '查看更多照片',
  showing: '已显示 {shown} / {total} 张照片',
  endOfBook: '全书完',
  notFound: { title: '找不到页面', body: '您请求的页面不存在。', backHome: '返回首页' },
  error: {
    title: '出了点问题',
    body: '渲染此页面时发生意外错误。',
    retry: '重试',
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, ko, ja, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Replace `{name}` placeholders. Missing values are left in place so mistakes are visible. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
