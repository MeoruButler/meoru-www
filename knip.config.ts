import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // next/jest resolves from the repository root and cannot find the app directory.
  jest: false,
  workspaces: {
    'apps/meoru-next': {
      entry: ['__tests__/**/*.test.tsx', 'jest.config.mjs', 'jest.setup.ts'],
      ignoreDependencies: ['jest-environment-jsdom'],
    },
    'apps/meoru-diary': {
      // `lib/image-loader.ts` is referenced by path string in `next.config.ts` (`images.loaderFile`).
      entry: [
        '__tests__/**/*.test.{ts,tsx}',
        'jest.config.mjs',
        'jest.setup.ts',
        'lib/image-loader.ts',
        'scripts/*.mjs',
      ],
      ignoreDependencies: ['jest-environment-jsdom'],
    },
    'packages/typescript-config': {
      // The Next.js plugin is resolved by the consuming app.
      ignoreUnresolved: ['next'],
    },
  },
};

export default config;
