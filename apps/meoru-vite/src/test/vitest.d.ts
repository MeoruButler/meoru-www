import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

import 'vitest';

// Vitest 5 exposes matchers as `Matchers<R, T>`; @testing-library/jest-dom/vitest still augments the
// legacy single-parameter `Assertion<T>`, so re-declare the matchers on the new interface.
declare module 'vitest' {
  interface Matchers<R, T> extends TestingLibraryMatchers<unknown, R> {}
}
