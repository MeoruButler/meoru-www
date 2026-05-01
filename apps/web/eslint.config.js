// @ts-check

import pluginRouter from "@tanstack/eslint-plugin-router"

export default [
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
  ...pluginRouter.configs["flat/recommended"],
]
