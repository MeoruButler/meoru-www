import { createPlaywrightConfig } from '@meoru/playwright-config/create-playwright-config';

export default createPlaywrightConfig({
  port: 3002,
  command: 'pnpm start:e2e',
});
