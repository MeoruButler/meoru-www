import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// In CI we add the github-actions reporter so failing tests surface as
// PR-line annotations. Locally we keep the default reporter for clean output.
const reporters = process.env.GITHUB_ACTIONS === 'true' ? ['default', 'github-actions'] : ['default'];

// Add any custom config to be passed to Jest
const customJestConfig = {
  reporters,
  // CI parses coverage-summary.json for its step summary.
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@meoru/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    // Cover RSC pages and layouts with E2E tests.
    '!app/**/*.{js,jsx,ts,tsx}',
    // Exclude provider and wrapper components.
    '!components/providers.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
