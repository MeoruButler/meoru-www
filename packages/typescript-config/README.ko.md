[English](README.md) | [한국어](README.ko.md)

# @meoru/typescript-config

이 모노레포에서 사용하는 공통 TypeScript 설정입니다.

## 프리셋

### `base.json`

모든 환경이 상속하는 공통 기반입니다.

- ES2023 대상 및 라이브러리
- 엄격한 타입 검사
- NodeNext 모듈 및 해석 방식
- 선언 파일과 선언 맵 지원
- `noUncheckedIndexedAccess`

### `nextjs.json`

Next.js 애플리케이션용으로 `base.json`을 확장합니다.

- Next.js 처리를 위해 JSX 보존
- Bundler 모듈 해석 사용
- Next.js TypeScript 플러그인 활성화
- JavaScript 파일 허용
- 선언 파일 출력 비활성화

```json
{
  "extends": "@meoru/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@meoru/ui/*": ["../../packages/ui/src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `react-library.json`

React 컴포넌트 라이브러리용으로 `base.json`을 확장하고 `react-jsx` 변환을 활성화합니다.

```json
{
  "extends": "@meoru/typescript-config/react-library.json"
}
```

### `react-vite.json`

Vite로 빌드하는 React 애플리케이션용으로 `base.json`을 확장합니다.

- Bundler 모듈 해석 사용
- `react-jsx` 변환 활성화
- TypeScript import extension 허용
- synthetic default import와 ES module 상호 운용 활성화
- 선언 파일 출력 비활성화

```json
{
  "extends": "@meoru/typescript-config/react-vite.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@meoru/ui/*": ["../../packages/ui/src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "vitest.config.js", "playwright.config.ts"],
  "exclude": ["node_modules"]
}
```

## 책임 경계

| 계층          | 위치                                     | 책임                               |
| ------------- | ---------------------------------------- | ---------------------------------- |
| 공통 프리셋   | `packages/typescript-config/*.json`      | 컴파일러, 모듈, JSX 및 엄격성 설정 |
| 사용 프로젝트 | 애플리케이션 또는 패키지 `tsconfig.json` | 경로, include 및 exclude           |

환경 공통 컴파일러 동작은 이 프리셋에 유지하고, 경로와 파일 선택은 사용하는 프로젝트에 둡니다.

## 마이그레이션

1. 사용하는 프로젝트의 `tsconfig.json`에서 가장 가까운 공통 프리셋을 상속합니다.
2. 프로젝트별 경로, include, exclude만 로컬에 유지합니다.
3. 빌드와 타입 검사를 확인한 뒤 `tsconfig.app.json`, `tsconfig.node.json` 같은 중복 설정을 제거합니다.
