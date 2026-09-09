[English](README.md) | [한국어](README.ko.md)

# meoru-www

pnpm과 Turborepo 기반 웹 모노레포입니다.

## 구조

```text
apps/
  meoru-next/    Next.js App Router 애플리케이션
  meoru-vite/    React + Vite 애플리케이션
packages/
  ui/                 shadcn/ui 기반 공유 컴포넌트 (@meoru/ui)
  shared/             플랫폼 무관 공유 로직 (@meoru/shared)
  typescript-config/  공유 tsconfig 프리셋 (base / nextjs / react-vite / react-library)
  playwright-config/  공유 Playwright 설정 팩토리
```

## 도구

- 패키지 관리자: `packageManager`로 고정된 pnpm
- 런타임: `.nvmrc`에 지정된 Node.js 24.21.0
- 태스크 러너: Turborepo
- 타입 검사: `@typescript/native` 별칭으로 설치한 TypeScript 7(네이티브)의 `tsc`를 사용하고, 컴파일러를 라이브러리로 불러오는 도구를 위해 `typescript`는 TypeScript 6으로 둔다
- 린트 및 포맷: oxlint와 oxfmt
- 미사용 코드 탐지: knip
- Git 훅: Husky와 lint-staged
- 단위 테스트: Next.js는 Jest, Vite는 Vitest
- E2E 테스트: Playwright

## 명령어

```bash
pnpm install
pnpm dev            # portless를 통해 모든 개발 서버 실행
pnpm build          # 모든 애플리케이션 빌드
pnpm quality        # 린트 및 포맷 검사
pnpm check-types    # TypeScript 검사
pnpm test:ci        # 커버리지와 함께 단위 테스트 실행
pnpm test:e2e       # E2E 테스트 실행
pnpm verify         # E2E를 제외한 모든 필수 검사 실행
```

필터를 사용해 특정 애플리케이션의 태스크만 실행할 수 있습니다.

```bash
pnpm turbo run build --filter=meoru-next
```

## AI 에이전트 구성

- [`AGENTS.md`](AGENTS.md)가 저장소 지침의 단일 원천입니다.
- Claude Code와 Gemini는 얇은 import 파일을 통해 같은 지침을 읽습니다.
- 공용 프로젝트 스킬은 [`.agents/skills`](.agents/skills)에 있습니다.
- 커밋 메시지는 영어로 작성해야 하며, Husky 훅이 비 ASCII 커밋 문자를 거부합니다.

설치된 프로젝트 스킬:

- Addy Osmani의 테스트 주도 개발
- Vercel의 React 및 Next.js 모범 사례
- Addy Osmani의 웹 접근성
