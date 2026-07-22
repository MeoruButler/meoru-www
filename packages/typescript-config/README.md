[English](README.md) | [한국어](README.ko.md)

# @meoru/typescript-config

Shared TypeScript configurations for this monorepo.

## Presets

### `base.json`

The common foundation for every environment.

- ES2023 target and libraries
- Strict type checking
- NodeNext modules and resolution
- Declaration and declaration map support
- `noUncheckedIndexedAccess`

### `nextjs.json`

Extends `base.json` for Next.js applications.

- Preserves JSX for Next.js
- Uses bundler module resolution
- Enables the Next.js TypeScript plugin
- Allows JavaScript files
- Disables emitting declarations

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

Extends `base.json` for React component libraries and enables the `react-jsx` transform.

```json
{
  "extends": "@meoru/typescript-config/react-library.json"
}
```

### `react-vite.json`

Extends `base.json` for React applications built with Vite.

- Uses bundler module resolution
- Enables the `react-jsx` transform
- Allows TypeScript import extensions
- Enables synthetic default imports and ES module interoperability
- Disables emitting declarations

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

## Responsibility Boundaries

| Layer          | Location                               | Responsibility                                 |
| -------------- | -------------------------------------- | ---------------------------------------------- |
| Shared presets | `packages/typescript-config/*.json`    | Compiler, module, JSX, and strictness settings |
| Consumers      | Application or package `tsconfig.json` | Paths, includes, and excludes                  |

Keep environment-wide compiler behavior in these presets. Keep paths and file selection in the consuming project.

## Migration

1. Extend the closest shared preset from the consumer's `tsconfig.json`.
2. Keep only consumer-specific paths, includes, and excludes locally.
3. Remove redundant split configurations such as `tsconfig.app.json` or `tsconfig.node.json` after verifying the build and type checks.
