import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { PhotoEntry } from "../src/data/photo-types"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos")
const OUTPUT = path.join(ROOT, "src", "data", "photo-manifest.ts")

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".webp", ".png"])

function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .map((part) =>
      part.length === 0 ? "" : part[0].toUpperCase() + part.slice(1)
    )
    .join(" ")
}

function makeId(folder: string, file: string): string {
  const base = path.basename(file, path.extname(file)).toLowerCase()
  return `${folder.toLowerCase()}-${base}`
}

async function main(): Promise<void> {
  const dirEntries = await readdir(PUBLIC_PHOTOS, { withFileTypes: true })
  const folders = dirEntries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const entries: PhotoEntry[] = []
  for (const folder of folders) {
    const folderPath = path.join(PUBLIC_PHOTOS, folder)
    const files = (await readdir(folderPath))
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort()
    const collection = toTitleCase(folder)
    files.forEach((file, index) => {
      entries.push({
        id: makeId(folder, file),
        src: `/photos/${folder}/${file}`,
        localFile: `${folder}/${file}`,
        alt: `${collection} #${String(index + 1).padStart(2, "0")}`,
        collection,
        takenAt: "",
        exif: {
          camera: "",
          lens: "",
          focalLength: "",
          aperture: "",
          shutter: "",
          iso: 0,
        },
      })
    })
  }

  const body = `import type { PhotoEntry } from "./photo-types"

export const manifest: ReadonlyArray<PhotoEntry> = ${JSON.stringify(entries, null, 2)}
`
  await writeFile(OUTPUT, body, "utf8")
  console.log(
    `Wrote ${entries.length} entries from ${folders.length} folders to ${path.relative(ROOT, OUTPUT)}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
