import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

type CreatePlaywrightConfigOptions = {
  /** E2E server port used by both baseURL and webServer.url. */
  port: number;
  /** Command that starts the web server, such as 'pnpm start:e2e'. */
  command: string;
  /** Worker count per browser job in CI. Local runs always use '50%'. */
  ciWorkers?: number;
  /** Web server startup timeout in milliseconds. */
  webServerTimeout?: number;
  /** Additional environment variables for the web server process. */
  extraEnv?: Record<string, string>;
};

const isCI = !!process.env.CI;
const shouldReuseExistingServer =
  process.env.PLAYWRIGHT_REUSE_SERVER === 'true' || process.env.PLAYWRIGHT_REUSE_SERVER === '1';

/**
 * Node repeatedly warns when NO_COLOR is passed together with CI or FORCE_COLOR.
 * Remove the conflicting NO_COLOR variable when the environment has opted into color.
 */
function createWebServerEnv(extraEnv: Record<string, string>): Record<string, string> {
  const env = Object.fromEntries(
    Object.entries({ ...process.env, ...extraEnv }).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );

  if ((env.CI || env.FORCE_COLOR) && 'NO_COLOR' in env) {
    delete env.NO_COLOR;
  }

  return env;
}

/**
 * Shared Playwright configuration factory for monorepo applications.
 *
 * Applications provide only port, command, ciWorkers, webServerTimeout, and extraEnv.
 * The project matrix, reporter, retries, tracing, and server reuse stay in one source.
 *
 * The return value is a regular config object, so callers may spread and override rare app-specific values.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export function createPlaywrightConfig({
  port,
  command,
  ciWorkers = 2,
  webServerTimeout = 120_000,
  extraEnv = {},
}: CreatePlaywrightConfigOptions): PlaywrightTestConfig {
  return defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    /* Fail CI when test.only is committed accidentally. */
    forbidOnly: isCI,
    /* Retry only in CI. */
    retries: isCI ? 2 : 0,
    /* Use half the local workers for fast feedback without contention. */
    workers: isCI ? ciWorkers : '50%',
    reporter: isCI ? [['html'], ['github']] : 'list',
    timeout: 30_000,
    use: {
      baseURL: `http://localhost:${port}`,
      /* Capture a trace only on the first retry. */
      trace: 'on-first-retry',
      actionTimeout: 10_000,
      navigationTimeout: 15_000,
    },
    /* Run all browsers in CI and Chromium only during local feedback loops. */
    projects: isCI
      ? [
          { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
      command,
      env: createWebServerEnv(extraEnv),
      url: `http://localhost:${port}`,
      // Server reuse is opt-in to avoid attaching to a stale process accidentally.
      reuseExistingServer: shouldReuseExistingServer,
      timeout: webServerTimeout,
    },
  });
}
