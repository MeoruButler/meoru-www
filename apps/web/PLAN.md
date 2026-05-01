# Phase 1 — 트위터 공식 사이트 셋업 계획

## Context
`apps/web` 위에 개인 트위터(@meoru) 공식 사이트의 Phase 1을 구축한다. Phase 1의 범위는 "런칭 가능한 최소 골격"이며, 콘텐츠/포스팅(MDX)은 Phase 2로 미룬다. 단, Phase 2에서 콘텐츠 영역을 ko/en으로 분리해 도입할 예정이므로 디렉토리 구조와 라우팅은 그 확장을 처음부터 수용하도록 설계한다.

이 작업의 목적:
- 단순한 3-region 레이아웃(Header → Body → Footer)에 light/dark 테마 토글
- ko/en 두 로케일을 path-based로 분리한 i18n 골격
- shadcn 기반 UI 일관성 (`@workspace/ui` 우선 사용)
- Vercel 배포 + Speed Insights/Analytics 연결
- 트위터 임베드 컴포넌트 (랜딩에 placeholder 1~2개)
- 기존 Vitest 100% coverage 정책 + Playwright e2e 회귀 안전망 유지

명시적으로 **Phase 1에서 제외**:
- `/about` 페이지
- MDX 렌더링 (단, `content/{ko,en}/` 디렉토리는 미리 생성)
- CMS, 동적 OG 이미지, 분석 도구(Plausible 등)

---

## Phase 1 룰 (모든 Step에 공통 적용)

- **디자인**: 가능한 한 심플. 단일 3-region 레이아웃 — `<Header>` (navbar) → `<main>` (페이지별 body) → `<Footer>`. 자체 디자인 언어를 새로 만들지 말고 shadcn 기본 토큰/간격을 그대로 사용.
- **반응형**: 모바일 우선(Tailwind 기본 breakpoint 사용, `sm:`/`md:`로 점진 확장). 360px 너비에서 깨짐 없어야 하고, 모바일 nav는 `Sheet`로 전환.
- **파일명**: 반드시 **kebab-case** (`tweet-embed.tsx`, `tweet-embed.test.tsx`, `theme-provider.test.tsx`). 컴포넌트의 export 이름은 그대로 PascalCase(`TweetEmbed`). 단, TanStack Router의 라우트 파일(`$locale.tsx`, `index.tsx`)이나 자동 생성 파일(`routeTree.gen.ts`)처럼 컨벤션이 정해진 파일은 예외.
- **Step 완료 정의 (DoD)** — 다음 5가지를 모두 충족해야 해당 step을 끝낸 것으로 본다:
  1. 코드 변경 완료
  2. **Vitest 단위 테스트** 작성 — `apps/web/vitest.config.ts:28-33` 의 100% coverage threshold 통과
  3. 해당 step의 사용자-가시 동작에 대한 **Playwright e2e 테스트 1개 이상** (`apps/web/e2e/<name>.spec.ts`)
  4. `pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web test && pnpm --filter web test:e2e` 모두 pass — **회귀 포함**(이전 step의 vitest/e2e가 모두 그대로 통과해야 함)
  5. 단일 커밋(Apartmentary 컨벤션 따름)

---

## 핵심 의사결정

| 영역 | 결정 | 이유 |
|---|---|---|
| 배포 | Vercel (Nitro `vercel` preset) | 사용자 지정 |
| 인사이트/분석 | `@vercel/speed-insights` + `@vercel/analytics` | 사용자 지정 |
| 디자인 | 3-region 단순 레이아웃, shadcn 토큰 그대로 | 콘텐츠 위주 사이트, 별도 디자인 시스템 불필요 |
| 반응형 | 모바일 우선, `Sheet` 기반 모바일 nav | 단순함 + shadcn 기본 컴포넌트로 충분 |
| 테마 라이브러리 | **자체 구현** (cookie 기반 SSR-safe ThemeProvider) | `next-themes`는 Next 전용. TanStack Start SSR에서 FOUC 방지하려면 cookie + `<html class>` 서버 주입 필요 |
| 테마 모드 | `light` / `dark` / `system` 3-way | shadcn 표준, system은 `prefers-color-scheme` 추적 |
| i18n 라이브러리 | **자체 구현** (typed dictionary + `useLocale` 훅) | 사이트가 작고 UI 문자열 수가 적음. 의존성 최소화. 추후 콘텐츠가 늘면 `react-i18next`로 마이그레이션 가능 |
| i18n 라우팅 | path-based `/$locale/*` | SEO/hreflang에 가장 깔끔. TanStack Router의 dynamic param 라우트(`routes/$locale.tsx`)로 자연스럽게 구현 |
| `/` 처리 | 서버 redirect: cookie → Accept-Language → 기본값(`en`) | bookmarkable URL 보존, hreflang 친화적 |
| 콘텐츠 디렉토리 | `apps/web/content/{ko,en}/` 빈 디렉토리만(.gitkeep) | Phase 2 MDX 도입 시 그대로 사용 |
| Twitter 임베드 | `<TweetEmbed tweetId>` 클라이언트 컴포넌트, `widgets.js` 동적 1회 로드 + theme 동기화 | CSP는 `script-src https://platform.twitter.com` 만 허용 |
| 에셋 위치 | `apps/web/public/` (favicon, og.png 등) | 사용자 지정 |
| 파일명 컨벤션 | kebab-case (라우트/자동생성 파일 제외) | Phase 1 룰 |

---

## 파일/디렉토리 변경 맵

### 추가
```
apps/web/
├── content/                              # Phase 2 MDX 자리 (빈 디렉토리)
│   ├── ko/.gitkeep
│   └── en/.gitkeep
├── nitro.config.ts                       # NITRO_PRESET=vercel
├── vercel.json                           # (필요 시) rewrites/headers
├── public/
│   └── og.png                            # OG 이미지 (1200x630)
├── e2e/                                  # 이미 존재, 신규 spec만 추가
│   ├── theme.spec.ts                     # Step 1
│   ├── locale.spec.ts                    # Step 2 (redirect, $locale 검증)
│   ├── layout.spec.ts                    # Step 3 (header/footer/모바일 nav/lang switch)
│   ├── tweet-embed.spec.ts               # Step 4
│   └── pages.spec.ts                     # Step 5 (랜딩 + links 페이지)
└── src/
    ├── i18n/
    │   ├── messages/
    │   │   ├── ko.ts                     # typed dictionary
    │   │   └── en.ts
    │   ├── config.ts                     # SUPPORTED_LOCALES, DEFAULT_LOCALE, isLocale()
    │   ├── locale.server.ts              # cookie + Accept-Language 파싱 (server-only)
    │   ├── locale-provider.tsx           # context + useLocale, useT
    │   └── __tests__/
    │       ├── locale.server.test.ts
    │       └── locale-provider.test.tsx
    ├── theme/
    │   ├── theme-provider.tsx            # cookie 기반, system 추적
    │   ├── theme.server.ts               # cookie 읽기 server-only
    │   ├── use-theme.ts
    │   └── __tests__/
    │       └── theme-provider.test.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── header.tsx                # 로고 + nav + ThemeToggle + LangSwitcher (모바일은 Sheet)
    │   │   ├── footer.tsx                # SNS 링크 + 저작권
    │   │   ├── theme-toggle.tsx          # DropdownMenu (light/dark/system)
    │   │   └── lang-switcher.tsx         # DropdownMenu (ko/en)
    │   ├── twitter/
    │   │   ├── tweet-embed.tsx
    │   │   └── widgets-loader.ts
    │   └── __tests__/
    │       ├── header.test.tsx
    │       ├── footer.test.tsx
    │       ├── theme-toggle.test.tsx
    │       ├── lang-switcher.test.tsx
    │       └── tweet-embed.test.tsx
    └── routes/
        ├── $locale.tsx                   # 로케일 layout: param 검증 + Header/Footer + LocaleProvider
        ├── $locale/index.tsx             # 랜딩 (hero + 트윗 임베드 placeholder)
        └── $locale/links.tsx             # 링크트리
```

### 변경
- `apps/web/src/routes/__root.tsx` — `<html lang>`/`class` 동적화, ThemeProvider 주입, SSR cookie 읽기, OG/Twitter Card 메타, Speed Insights/Analytics 스크립트
- `apps/web/src/routes/index.tsx` — `/` 진입 시 `redirect()`로 `/$locale` 보냄 (서버 사이드 결정)
- `apps/web/src/router.tsx` — locale/theme context가 필요하면 `context` 옵션 활용
- `apps/web/e2e/home.spec.ts` — 기존 "Project ready!" / "TanStack Start Starter" 회귀 테스트는 Step 5 시점에 새 hero/title에 맞춰 갱신 (404 케이스는 그대로 유지)
- `apps/web/package.json` — 의존성 추가 (아래)
- `packages/ui/src/components/` — `dropdown-menu`, `sheet`, `avatar`, `switch` 4개 추가 (Step 3에서)

### 의존성 추가
- `apps/web`: `@vercel/speed-insights`, `@vercel/analytics`
- `packages/ui`: shadcn add 시 자동으로 들어오는 `@base-ui/react` 의존성 (이미 있음)

---

## 단계별 작업 (Stacked PR — 각 Step 끝에 단일 커밋)

> 각 Step은 위의 **Step 완료 정의(DoD)** 를 만족해야 끝난 것으로 본다. 즉 unit + e2e 테스트 작성 → 회귀 포함 전체 pass → 커밋.

### Step 1 — 테마 인프라 (cookie 기반 light/dark/system)
- 코드: `theme/theme-provider.tsx`, `theme/theme.server.ts`, `theme/use-theme.ts`. `__root.tsx`에서 SSR 시 cookie 읽어 `<html class>` 결정 (FOUC 방지).
- 토글 UI는 Step 3에서 등장. Step 1에서는 `system` 모드 추적 + cookie persistence만.
- **Vitest**: `theme-provider.test.tsx` — cookie persistence, system 변경 시 class 토글, mount 시 SSR 값과 client 값 일치.
- **Playwright** (`e2e/theme.spec.ts`): cookie 강제 set 후 `goto("/")` → `<html>` 에 해당 class 적용 확인. system 모드에서 `page.emulateMedia({ colorScheme: 'dark' })` 시 dark 적용.

### Step 2 — i18n 골격 (`/$locale` 라우팅 + 자체 구현 dict)
- 코드: `i18n/config.ts` (`SUPPORTED_LOCALES = ['ko','en']`, `DEFAULT_LOCALE='en'`), `i18n/messages/{ko,en}.ts`, `i18n/locale.server.ts`, `i18n/locale-provider.tsx`. `routes/$locale.tsx` 추가(잘못된 param이면 404), `routes/index.tsx`는 redirect로 변경. `content/{ko,en}/.gitkeep`만 추가.
- **Vitest**: `locale.server.test.ts` (Accept-Language 우선순위/cookie 우선/잘못된 locale fallback), `locale-provider.test.tsx` (`useT()` 타입/값).
- **Playwright** (`e2e/locale.spec.ts`): `/` → `/en` redirect, `Accept-Language: ko` → `/ko` redirect, `/zz` → 404.

### Step 3 — Layout 컴포넌트 + shadcn 컴포넌트 추가
- shadcn add: `pnpm dlx shadcn@latest add dropdown-menu sheet avatar switch` (`packages/ui` 안에서).
- 코드: `components/layout/{header,footer,theme-toggle,lang-switcher}.tsx`. `routes/$locale.tsx` layout에 Header/Footer 배치. 모바일에서 Header nav는 Sheet로 전환. ThemeToggle/LangSwitcher는 DropdownMenu 사용.
- **Vitest**: 4개 컴포넌트 단위 테스트 (렌더링 + 인터랙션). 100% coverage 유지.
- **Playwright** (`e2e/layout.spec.ts`): 데스크톱에서 nav 표시, 모바일 viewport(360px)에서 햄버거 → Sheet 열림. ThemeToggle로 light↔dark 전환되어 `<html>` 클래스 반영. LangSwitcher로 `/en` ↔ `/ko` URL 전환.

### Step 4 — Twitter 임베드
- 코드: `components/twitter/widgets-loader.ts` (`platform.twitter.com/widgets.js` 단일 로드 + `window.twttr.ready()` Promise), `components/twitter/tweet-embed.tsx` (`data-theme`/`data-lang`을 현재 ThemeProvider/LocaleProvider 값에 맞춤).
- **Vitest**: `tweet-embed.test.tsx` — widgets.js를 mock하고, theme/locale 변경 시 reflow 호출되는지, 다중 마운트 시 스크립트가 1회만 추가되는지.
- **Playwright** (`e2e/tweet-embed.spec.ts`): platform.twitter.com 요청을 `page.route()` 로 stub, `<TweetEmbed>` 가 마운트되고 placeholder/blockquote가 보이는지. 테마 토글 시 `data-theme` 속성 변경 확인.

### Step 5 — 페이지 콘텐츠 (랜딩 + 링크트리)
- 코드: `routes/$locale/index.tsx` (hero + 트윗 임베드 placeholder + CTA), `routes/$locale/links.tsx` (트위터/이메일/기타). 모든 텍스트는 `useT()` 통해.
- **Vitest**: 라우트 컴포넌트 렌더링 테스트 (locale별 텍스트 분기).
- **Playwright** (`e2e/pages.spec.ts`): `/en`, `/ko` 랜딩 hero 텍스트 확인, `/en/links` 의 링크 클릭 가능 여부.
- **회귀 갱신**: `e2e/home.spec.ts` 의 "Project ready!" / "TanStack Start Starter" 단언을 새 hero/title에 맞게 업데이트. 404 케이스는 유지.

### Step 6 — Vercel 통합 + 메타/SEO
- 코드: `nitro.config.ts` (또는 `vite.config.ts`의 `tanstackStart({ target: 'vercel' })`)로 Vercel preset 명시. `__root.tsx` 에 `<SpeedInsights />` + `<Analytics />` 마운트(production-only). `head()`에 OG/Twitter Card, locale별 `og:locale` + `<link rel="alternate" hreflang>`. `public/og.png`, `public/robots.txt`, `public/sitemap.xml` (정적, 라우트 늘면 build-time 생성으로 전환).
- **Vitest**: `__root.tsx` head 함수가 locale에 따라 올바른 `og:locale`/`hreflang`을 반환하는지.
- **Playwright** (`e2e/seo.spec.ts` 또는 `home.spec.ts` 확장): `<html lang>` 값, `<meta property="og:title">`, `<link rel="alternate" hreflang>` 존재 검증. production build에서 `/_vercel/insights/script.js` 같은 인사이트 스크립트가 로드되는지(또는 `<Analytics>`가 마운트된 흔적).

---

## 활용할 기존 자산
- `packages/ui/src/styles/globals.css` — light/dark CSS 변수 + `@custom-variant dark` 이미 완비
- `packages/ui/src/components/button.tsx` — dark variant 적용된 Button
- `packages/ui/src/lib/utils.ts` — `cn()` 헬퍼
- `apps/web/src/routes/__root.tsx` — `appCss` import + head/meta 구조 이미 존재
- `apps/web/vitest.config.ts` 의 100% coverage 정책 + `vitest.setup.ts` 의 jest-dom
- `apps/web/playwright.config.ts` + `apps/web/e2e/home.spec.ts` — playwright 셋업 + 기존 회귀 spec (Step 5에서 갱신)

---

## 검증 (End-to-End, 모든 Step 종료 후)
1. **로컬 개발**: `pnpm --filter web dev` → `localhost:3000`
   - `/` → `/en` 또는 `/ko` redirect (cookie/Accept-Language 시나리오)
   - 테마 토글 light ↔ dark ↔ system + 새로고침 시 유지 + FOUC 없음
   - 언어 토글 ko ↔ en, URL 동기화
   - 모바일 뷰포트(360px) Sheet 기반 nav
2. **테스트**: `pnpm --filter web test` (vitest, 100% coverage) + `pnpm --filter web test:e2e` (playwright, 모든 spec pass)
3. **타입/린트**: `pnpm --filter web typecheck && pnpm --filter web lint`
4. **빌드**: `pnpm --filter web build` — Nitro Vercel preset으로 `.output/` 생성 확인
5. **Vercel preview**: PR 단위 preview URL에서 실기기 확인 (라이트하우스 90+ 목표)
6. **트위터 임베드**: 실제 위젯이 light/dark + locale에 동기화

---

## Phase 2로 미루는 것 (참고용)
- MDX 도입 (`content/{ko,en}/*.mdx` 렌더링, frontmatter, syntax highlight)
- `/about` 페이지
- 트윗 자동 동기화/캐싱 (X API 또는 정적 빌드시 fetch)
- 동적 OG 이미지 (Satori)
- sitemap 자동 생성
- A/B나 GrowthBook류 실험 인프라 (현재 불필요)
