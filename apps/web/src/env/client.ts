import { createEnv } from "@t3-oss/env-core"

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
  skipValidation: import.meta.env.SKIP_ENV_VALIDATION === "true",
})
