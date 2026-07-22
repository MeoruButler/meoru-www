[English](README.md) | [한국어](README.ko.md)

# meoru-www

A pnpm and Turborepo-based web monorepo.

## Structure

```text
apps/
  meoru-next/    Next.js App Router application
  meoru-vite/    React + Vite application
packages/
  ui/                 Shared shadcn/ui-based components (@meoru/ui)
  shared/             Platform-neutral shared logic (@meoru/shared)
  typescript-config/  Shared tsconfig presets (base / nextjs / react-vite / react-library)
  playwright-config/  Shared Playwright configuration factory
```

## Tooling

- Package manager: pnpm pinned through `packageManager`
- Runtime: Node.js 24.11.1 from `.nvmrc`
- Task runner: Turborepo
- Linting and formatting: oxlint and oxfmt
- Unused code detection: knip
- Git hooks: Husky and lint-staged
- Unit tests: Jest for Next.js and Vitest for Vite
- End-to-end tests: Playwright

## Commands

```bash
pnpm install
pnpm dev            # Start all development servers through portless
pnpm build          # Build all applications
pnpm quality        # Run lint and formatting checks
pnpm check-types    # Run TypeScript checks
pnpm test:ci        # Run unit tests with coverage
pnpm test:e2e       # Run end-to-end tests
pnpm verify         # Run every required check except E2E
```

Run a task for one application with a filter:

```bash
pnpm turbo run build --filter=meoru-next
```

## AI Agent Setup

- [`AGENTS.md`](AGENTS.md) is the canonical repository instruction source.
- Claude Code and Gemini load the same instructions through thin import files.
- Shared project skills live in [`.agents/skills`](.agents/skills).
- Commit messages must be written in English; a Husky hook rejects non-ASCII commit text.

Installed project skills:

- Test-driven development by Addy Osmani
- React and Next.js best practices by Vercel
- Web accessibility by Addy Osmani
