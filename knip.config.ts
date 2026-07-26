import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // next/jest resolves from the repository root and cannot find the app directory.
  jest: false,
  workspaces: {
    'apps/meoru-next': {
      entry: ['__tests__/**/*.test.tsx', 'jest.config.mjs', 'jest.setup.ts'],
      ignoreDependencies: ['jest-environment-jsdom'],
    },
    'packages/typescript-config': {
      // The Next.js plugin is resolved by the consuming app.
      ignoreUnresolved: ['next'],
    },
  },
};

export default config;
