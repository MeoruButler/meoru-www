[English](README.md) | [한국어](README.ko.md)

# @meoru/playwright-config

모노레포 애플리케이션을 위한 공통 Playwright E2E 설정 팩토리입니다.

거의 동일했던 `apps/*/playwright.config.ts` 파일을 하나의 원천으로 통합합니다. 애플리케이션은 달라지는 값만 제공하고, 브라우저 매트릭스, 리포터, 재시도, 트레이스, 서버 재사용, CI/FORCE_COLOR와 NO_COLOR 정규화는 이 패키지가 담당합니다.

## 사용법

```ts
// apps/<app>/playwright.config.ts
import { createPlaywrightConfig } from '@meoru/playwright-config/create-playwright-config';

export default createPlaywrightConfig({
  port: 3002,
  command: 'pnpm start:e2e',
  extraEnv: { E2E_INCLUDE_DRAFT: '1' }, // 선택 사항
});
```

## 옵션

| 옵션               | 필수   | 기본값    | 설명                                                    |
| ------------------ | ------ | --------- | ------------------------------------------------------- |
| `port`             | 예     | -         | `baseURL`과 `webServer.url`에 사용하는 E2E 서버 포트    |
| `command`          | 예     | -         | 웹 서버를 시작하는 명령                                 |
| `ciWorkers`        | 아니오 | `2`       | CI 브라우저 작업별 worker 수. 로컬 실행은 항상 50% 사용 |
| `webServerTimeout` | 아니오 | `120_000` | 웹 서버 시작 제한 시간(ms)                              |
| `extraEnv`         | 아니오 | `{}`      | 서버 프로세스에 추가할 환경 변수                        |

## 예외 처리

팩토리는 일반 설정 객체를 반환합니다. 드문 애플리케이션별 값은 호출부에서 재정의합니다.

```ts
const base = createPlaywrightConfig({ port: 3000, command: 'pnpm start:e2e' });
export default { ...base, timeout: 60_000 };
```

이 추상화의 목적은 중복 제거와 드리프트 방지입니다. 애플리케이션별 리포터, 플러그인, 프로젝트 분기는 호출부에 유지합니다.
