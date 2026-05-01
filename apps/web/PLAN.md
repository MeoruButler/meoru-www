# Meoru Butler — 사이트 작업 플랜

## Context
Phase 1(런칭 가능한 최소 골격)이 main 브랜치에 누적 완료됐다. 이 문서는 그 다음에 해야 할 일을 추적한다:

1. **Vercel 배포 셋업** — 코드는 vercel preset에 맞춰져 있고 인사이트/애널리틱스도 마운트되어 있지만, 실제 Vercel 프로젝트 연결과 도메인 결정은 사용자 액션 필요.
2. **Phase 1에 남긴 placeholder 정리** — 아이콘/OG 이미지, 트윗 ID, sitemap 등 콘텐츠성 자리.
3. **Phase 2 작업** — MDX 콘텐츠, `/about`, 추가 SNS 채널, 동적 OG 등.

기본 룰(파일명 kebab-case, vitest 100% coverage, e2e 회귀, step별 단일 커밋)은 Phase 1과 동일하게 유지한다.

---

## Phase 1 완료 상태 (참고)
- 테마(cookie + system, FOUC-safe inline script + `suppressHydrationWarning`)
- i18n(`/$locale` path-based, Accept-Language redirect, ko/en 자체 dictionary)
- 3-region 반응형 레이아웃(Header / main / Footer, mobile Sheet, LangSwitcher + ThemeToggle 모바일 헤더 노출)
- shadcn primitives: button(기존), dropdown-menu, sheet, avatar, switch
- 트위터 임베드(theme/locale sync, widgets.js 싱글톤 로더)
- 랜딩 + `/links` 링크트리(현재 X 1개)
- Vercel preset(env-driven), Speed Insights + Analytics(production-only)
- OG/Twitter Card/hreflang/manifest 메타, dynamic `<html lang>`
- vitest 78 / e2e 30 / 100% coverage

---

## Vercel 배포 셋업

### 1. 프로젝트 연결 (사용자 액션 필요)
- [ ] [vercel.com/new](https://vercel.com/new)에서 GitHub 리포 선택, **Root Directory**를 `apps/web`으로 지정
- [ ] Framework Preset: **Other** (Vite + Nitro 자동 감지)
- [ ] Build Command: `pnpm --filter web build`
- [ ] Install Command: `pnpm install --frozen-lockfile`
- [ ] Output Directory: `.vercel/output` (Nitro vercel preset가 생성)
- [ ] Node.js Version: 20+ (`apps/web/package.json` 의 `engines.node`)
- [ ] Environment Variables: 현재 필수값 없음 (필요 시 `VITE_*` 접두로 추가, 이미 turbo.json `env: ["VITE_*"]` 통과)

### 2. 모노레포 빌드 설정
Vercel이 monorepo root에서 `pnpm install` 후 `apps/web` 디렉토리에서 빌드한다. 워크스페이스 의존성(`@workspace/ui`)이 자동으로 함께 빌드되도록 다음을 보장:
- [ ] 루트 `package.json` scripts에 `build`가 turbo로 모든 패키지 빌드하는지 확인 (현재 OK)
- [ ] `pnpm-workspace.yaml`에 `apps/*`, `packages/*` 둘 다 포함 (현재 OK)
- [ ] Vercel Build Output API 디렉토리(`apps/web/.vercel/output`)가 `.gitignore`에 포함되어 있는지

### 3. (선택) `apps/web/vercel.json`
프레임워크 자동 감지가 어긋날 경우에만 추가:
```json
{
  "framework": null,
  "buildCommand": "pnpm --filter web build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".vercel/output"
}
```
> 보통 자동 감지로 충분하므로 첫 배포 후 문제 없으면 추가하지 않는다.

### 4. 도메인 결정 후 후속 작업
배포 URL이 정해지면 다음 placeholder들을 실제 값으로 교체한다:
- [ ] `apps/web/public/sitemap.xml` 생성 — 정적 또는 build-time(`apps/web/scripts/build-sitemap.ts` 같은 형태)
- [ ] `apps/web/public/robots.txt`에 `Sitemap: https://<domain>/sitemap.xml` 라인 추가
- [ ] `__root.tsx` head의 `og:url`/`twitter:url` 메타 절대 URL로 보강 (현재는 path-relative `/en`)
- [ ] hreflang `href`도 절대 URL로 변경

검증: 배포 후 `https://<domain>/en` 라이트하우스 90+ 목표.

---

## Phase 1 placeholder 정리 (콘텐츠 작업)
배포와 무관하게 사용자가 콘텐츠 결정해서 채울 자리:
- [ ] `apps/web/public/og.png` — 현재 1x1 transparent placeholder. **1200×630** OG 이미지로 교체
- [ ] `apps/web/public/favicon.ico`, `manifest.json` 의 logo192/512 — 브랜드 아이콘 디자인 후 교체
- [ ] `apps/web/src/routes/$locale/index.tsx`의 `HERO_TWEETS` 배열 — 실제 강조하고 싶은 트윗 ID 2개로 교체
- [ ] `apps/web/src/routes/$locale/links.tsx`의 `SOCIAL_LINKS` 배열 — GitHub/Email/Threads 등 추가 채널 등록 (메시지에 라벨 키 추가 필요)

---

## Phase 2 작업 후보

### A. MDX 콘텐츠 도입
- `apps/web/content/{en,ko}/` 디렉토리에 MDX 파일 추가
- vite의 `@mdx-js/rollup` 또는 `vite-plugin-mdx` 통합
- `routes/$locale/posts.tsx` (목록) + `routes/$locale/posts/$slug.tsx` (개별)
- frontmatter parsing(gray-matter) + 발행일/태그
- syntax highlight (shiki 또는 prism)
- 사용자 의향: 트위터 위주라 우선순위 낮음. 회고/장문 포스팅 필요해질 때 도입

### B. `/about` 페이지
- MDX 도입 이후 `content/{ko,en}/about.mdx`로 작성
- 또는 단순 React 페이지로 먼저 띄우고 추후 MDX로 이전

### C. 트윗 자동 동기화 (선택)
- 현재는 `tweetId` hardcode. X API v2로 최근 트윗 fetch 후 build-time 캐싱
- API key 비용/제약 있어 실효성 검토 필요. 없다면 hardcode 유지

### D. 동적 OG 이미지
- `@vercel/og` 또는 `satori` 활용해 페이지별 OG 이미지 생성 (`/api/og`)
- Phase 1의 정적 og.png 대체

### E. sitemap 자동화
- `apps/web/scripts/build-sitemap.ts` — TanStack Router의 routeTree에서 라우트 수집 + locale 곱
- prebuild step으로 `public/sitemap.xml` 생성

### F. 페이지 추가 시 주의
- 모든 신규 라우트는 `routes/$locale/<page>.tsx` 아래로 (i18n 일관성)
- nav 항목 추가 시 `header.tsx`의 `navLinks` + messages.nav.* 키 동시 갱신
- 새 컴포넌트는 router 의존이면 e2e로 cover, 아니면 단위 테스트 + 100% coverage 유지

---

## 검증 명령 (변경 시마다)
```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test       # vitest + 100% coverage
pnpm --filter web test:e2e   # playwright (production build)
```

배포 검증:
```bash
NITRO_PRESET=vercel pnpm --filter web build   # 로컬에서 vercel 빌드 시뮬레이션
```
