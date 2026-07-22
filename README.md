# meoru-www

pnpm + Turborepo 기반 웹 모노레포 스캐폴드.

## 구조

```
apps/
  meoru-next/    Next.js (App Router)
  meoru-vite/    React + Vite
packages/
  ui/                 shadcn/ui 기반 공유 컴포넌트 (@meoru/ui)
  shared/             플랫폼 무관 공유 로직 (@meoru/shared)
  typescript-config/  공유 tsconfig (base / nextjs / react-vite / react-library)
  playwright-config/  공유 Playwright config 팩토리
```

## 툴링

- 패키지 매니저: pnpm (`packageManager` 고정), Node 24.11.1 (`.nvmrc`)
- 태스크: Turborepo (`turbo.json`)
- Lint / Format: oxlint + oxfmt
- 미사용 코드: knip
- 훅: husky + lint-staged (pre-commit)
- 단위 테스트: Jest (Next) / Vitest (Vite)
- E2E: Playwright

## 명령어

```bash
pnpm install
pnpm dev            # 전체 dev (portless)
pnpm build          # 전체 빌드
pnpm quality        # lint + format:check
pnpm check-types    # 타입 체크
pnpm test:ci        # 단위 테스트 (coverage)
pnpm test:e2e       # E2E
```

특정 앱만: `pnpm turbo run build --filter=meoru-next`
