import * as React from 'react';

import '@testing-library/jest-dom';

type NextImageProps = React.ComponentPropsWithoutRef<'img'> & {
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
};

// Render `next/image` as a plain <img> so tests can assert on the DOM attributes that matter
// (alt, width, height, sizes, loading, fetchpriority) without the optimizer.
jest.mock('next/image', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLImageElement, NextImageProps>(function MockNextImage(
    {
      priority: _priority,
      quality: _quality,
      fill: _fill,
      placeholder: _placeholder,
      blurDataURL: _blur,
      unoptimized: _u,
      ...props
    },
    ref
  ) {
    return React.createElement('img', { ...props, ref, 'data-testid': 'next-image' });
  }),
}));

// Default no-op observers; tests that need to drive intersections install their own mock.
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
