import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const isVercelTarget =
  !!process.env.VERCEL || process.env.NITRO_PRESET === "vercel"
const nitroOptions = isVercelTarget ? { preset: "vercel" } : {}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [nitro(nitroOptions), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
