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

## 커밋 메시지

Conventional Commits 형식을 따릅니다.

```
<type>(<scope>): <동사로 시작하는 변경 내용>
```

- **type**: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `ci`
- **scope**: 변경된 패키지/앱 이름 (`web`, `ui`). 레포 루트 전반에 걸친 변경이면 생략
- **subject**: 영어 동사 원형으로 시작 (`add`, `update`, `remove`, `scaffold`, `fix` 등). 마침표 없이

예시:

- `chore(web): scaffold dev tooling, testing, and env validation`
- `feat(ui): add dropdown menu component`
- `fix(web): handle empty session in router guard`
- `chore: add AGENTS.md with shared agent instructions`
