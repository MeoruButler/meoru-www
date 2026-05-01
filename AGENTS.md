# Agent Instructions

이 파일은 이 레포에서 작업하는 AI 코딩 에이전트(Claude Code, Cursor, Codex, Aider 등)가 공유하는 규칙입니다. `CLAUDE.md`는 이 파일에 대한 symlink이므로 규칙은 한 곳에서만 관리하세요.

## 파일 네이밍

소스 파일과 디렉토리는 **kebab-case**를 사용합니다.

- `admin-home.tsx`
- `use-current-user.ts`
- `admin-home.test.tsx`
- `api-client/index.ts`

PascalCase, camelCase, snake_case 파일명은 사용하지 않습니다.

### 예외

다음 경우는 kebab-case 규칙에서 제외됩니다.

- **대문자 컨벤션 문서**: `README.md`, `AGENTS.md`, `CLAUDE.md`, `LICENSE`, `CHANGELOG.md`, `PLAN.md` 등
- **도구가 지정한 설정 파일**: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js` 등
- **자동 생성 파일**: `routeTree.gen.ts` 등 `*.gen.*` 산출물
- **TanStack Router 특수 파일**: `__root.tsx`, `-index.tsx`처럼 prefix(`__`, `-`, `_`)가 라우터에 의미를 가지는 경우
