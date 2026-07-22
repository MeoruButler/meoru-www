[English](README.md) | [한국어](README.ko.md)

# @meoru/playwright-config

A shared Playwright E2E configuration factory for applications in this monorepo.

It replaces nearly identical `apps/*/playwright.config.ts` files with one source. Applications provide only the values that vary; the package owns the browser matrix, reporters, retries, tracing, server reuse, and CI/FORCE_COLOR versus NO_COLOR normalization.

## Usage

```ts
// apps/<app>/playwright.config.ts
import { createPlaywrightConfig } from '@meoru/playwright-config/create-playwright-config';

export default createPlaywrightConfig({
  port: 3002,
  command: 'pnpm start:e2e',
  extraEnv: { E2E_INCLUDE_DRAFT: '1' }, // Optional
});
```

## Options

| Option             | Required | Default   | Description                                              |
| ------------------ | -------- | --------- | -------------------------------------------------------- |
| `port`             | Yes      | -         | E2E server port used by `baseURL` and `webServer.url`    |
| `command`          | Yes      | -         | Command that starts the web server                       |
| `ciWorkers`        | No       | `2`       | Workers per browser job in CI; local runs always use 50% |
| `webServerTimeout` | No       | `120_000` | Web server startup timeout in milliseconds               |
| `extraEnv`         | No       | `{}`      | Additional environment variables for the server process  |

## Escape Hatch

The factory returns a regular configuration object. Override a rare application-specific value at the call site:

```ts
const base = createPlaywrightConfig({ port: 3000, command: 'pnpm start:e2e' });
export default { ...base, timeout: 60_000 };
```

The abstraction exists to remove duplication and prevent drift. Keep application-specific reporter, plugin, and project branches at the call site.
