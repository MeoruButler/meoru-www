# Repository Instructions

These instructions apply to the entire repository. A more specific `AGENTS.md` may override them for its subtree.

`AGENTS.md` is the canonical instruction source. Tool-specific entry points must import or link to this file instead of copying its contents.

## Project Map

- `apps/meoru-next`: Next.js App Router application with Jest tests.
- `apps/meoru-vite`: React + Vite application with Vitest tests.
- `packages/ui`: shared shadcn/ui-based React components.
- `packages/shared`: platform-neutral shared logic.
- `packages/typescript-config`: shared TypeScript configurations.
- `packages/playwright-config`: shared Playwright configuration factory.

## Working Rules

- Use the Node version from `.nvmrc` and pnpm from the root `packageManager`; do not use npm or Yarn.
- Before editing, read the target, its tests, and one similar implementation. Reuse `@meoru/ui` and `@meoru/shared` before adding app-local duplicates.
- Keep changes scoped. Do not refactor unrelated code or add abstractions for hypothetical reuse.
- Do not add a dependency unless the task requires it. Commit `pnpm-lock.yaml` whenever dependency metadata changes.
- Preserve existing user changes and never commit secrets, `.env` files, or generated outputs such as `.next`, `dist`, coverage, and Playwright reports.
- Ask before changing public APIs, repository visibility, branch rules, CI secrets, or other external state unless the task explicitly requests it.

## Language

- English is the canonical language for source code, comments, documentation, agent instructions, issues, pull requests, and commit messages.
- Korean documentation belongs in matching `*.ko.md` files. Keep English and Korean README variants linked and synchronized.
- Commit subjects and bodies must use English ASCII text. Use concise imperative Conventional Commit messages when practical.

## Code Conventions

- Follow the existing strict TypeScript configuration and let oxlint/oxfmt enforce style and import ordering.
- Prefer named exports for reusable components and helpers; framework entrypoints may use required default exports.
- Use existing `@/` and `@meoru/*` path aliases instead of long relative imports.
- Keep accessibility semantics intact and test user-visible behavior with roles or labels.
- Add or update the smallest test that would fail if non-trivial behavior regresses.

## Repository Skills

- Canonical project skills live only in `.agents/skills`; do not edit generated links under `.claude/skills`.
- Use `test-driven-development` for behavior changes and bug fixes; skip it for documentation and configuration-only edits.
- Use `vercel-react-best-practices` when writing, reviewing, or refactoring React or Next.js code.
- Use `accessibility` for UI implementation and accessibility audits.

## Verification

- Run `pnpm verify` before handing off a completed change.
- Run `pnpm test:e2e` as well when user-visible flows, routing, or Playwright configuration changes.
- Use package filters for faster iteration, but finish with the repository-level command.
- Report any check that could not run and why; do not claim unrun checks passed.
- Commit or push only when explicitly requested.
