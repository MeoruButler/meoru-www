// @ts-check

import pluginRouter from "@tanstack/eslint-plugin-router"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.output/**",
      "**/.nitro/**",
      "**/.turbo/**",
      "**/.tanstack/**",
      "**/.vinxi/**",
      "**/coverage/**",
      "src/routeTree.gen.ts",
    ],
  },
  ...tseslint.configs.recommended,
  ...pluginRouter.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  }
)
