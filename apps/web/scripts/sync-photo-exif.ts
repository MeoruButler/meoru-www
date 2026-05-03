import { existsSync } from "node:fs"
import { stat, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import exifr from "exifr"
import sharp from "sharp"
import { manifest } from "../src/data/photo-manifest"
import type {
  LocalizedString,
  Photo,
  PhotoEntry,
  PhotoExif,
  PhotoLocation,
} from "../src/data/photo-types"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const PUBLIC_PHOTOS = path.join(ROOT, "public", "photos")
const OUTPUT = path.join(ROOT, "src", "data", "photos.generated.ts")

const MEDIUM_WIDTH = 1600
const THUMB_WIDTH = 400
const MEDIUM_QUALITY = 80
const THUMB_QUALITY = 75

type ExtractedExif = {
  Make?: string
  Model?: string
  LensModel?: string
  FocalLength?: number
  FNumber?: number
  ExposureTime?: number
  ISO?: number
  latitude?: number
  longitude?: number
  DateTimeOriginal?: Date | string
  DateCreated?: Date | string
  City?: string
  State?: string
  Country?: string
}

function formatShutter(seconds: number): string {
  if (seconds <= 0) return ""
  if (seconds < 1) return `1/${Math.round(1 / seconds)}s`
  return `${seconds}s`
}

function mergeExif(base: PhotoExif, extracted: ExtractedExif): PhotoExif {
  const camera = extracted.Model
    ? extracted.Make
      ? `${extracted.Make} ${extracted.Model}`.trim()
      : extracted.Model
    : base.camera
  return {
    camera: camera ?? base.camera,
    lens: extracted.LensModel ?? base.lens,
    focalLength:
      typeof extracted.FocalLength === "number"
        ? `${Math.round(extracted.FocalLength)}mm`
        : base.focalLength,
    aperture:
      typeof extracted.FNumber === "number"
        ? `f/${extracted.FNumber}`
        : base.aperture,
    shutter:
      typeof extracted.ExposureTime === "number"
        ? formatShutter(extracted.ExposureTime)
        : base.shutter,
    iso: typeof extracted.ISO === "number" ? extracted.ISO : base.iso,
  }
}

const KOREAN_PLACE_NAMES: Record<string, string> = {
  "South Korea": "대한민국",
  "Korea, Republic of": "대한민국",
  "Republic of Korea": "대한민국",
  Seoul: "서울특별시",
  Busan: "부산광역시",
  Daegu: "대구광역시",
  Incheon: "인천광역시",
  Gwangju: "광주광역시",
  Daejeon: "대전광역시",
  Ulsan: "울산광역시",
  Sejong: "세종특별자치시",
  "Gyeonggi-do": "경기도",
  "Gangwon-do": "강원도",
  "Gangwon-State": "강원특별자치도",
  "Chungcheongbuk-do": "충청북도",
  "Chungcheongnam-do": "충청남도",
  "Jeollabuk-do": "전라북도",
  "Jeollanam-do": "전라남도",
  "Gyeongsangbuk-do": "경상북도",
  "Gyeongsangnam-do": "경상남도",
  "Jeju-do": "제주특별자치도",
  Suwon: "수원시",
  Goyang: "고양시",
  Seongnam: "성남시",
  Bucheon: "부천시",
  Anyang: "안양시",
  Ansan: "안산시",
  Yongin: "용인시",
  Pyeongtaek: "평택시",
  Hwaseong: "화성시",
  Gwangmyeong: "광명시",
  Gimpo: "김포시",
  Namyangju: "남양주시",
  Uijeongbu: "의정부시",
  Paju: "파주시",
  Icheon: "이천시",
  Pocheon: "포천시",
  Yangju: "양주시",
  Anseong: "안성시",
  Hanam: "하남시",
  Osan: "오산시",
  Gunpo: "군포시",
  Yeoju: "여주시",
  Dongducheon: "동두천시",
  Yangpyeong: "양평군",
  Gapyeong: "가평군",
  Yeoncheon: "연천군",
  Chuncheon: "춘천시",
  Wonju: "원주시",
  Gangneung: "강릉시",
  Cheongju: "청주시",
  Chungju: "충주시",
  Jecheon: "제천시",
  Cheonan: "천안시",
  Asan: "아산시",
  Seosan: "서산시",
  Jeonju: "전주시",
  Iksan: "익산시",
  Gunsan: "군산시",
  Mokpo: "목포시",
  Yeosu: "여수시",
  Suncheon: "순천시",
  Naju: "나주시",
  Pohang: "포항시",
  Gyeongju: "경주시",
  Gumi: "구미시",
  Andong: "안동시",
  Yeongju: "영주시",
  Changwon: "창원시",
  Jinju: "진주시",
  Tongyeong: "통영시",
  Gimhae: "김해시",
  Geoje: "거제시",
  Yangsan: "양산시",
  Miryang: "밀양시",
  Jeju: "제주시",
  Seogwipo: "서귀포시",
}

const ENGLISH_PLACE_NAMES: Record<string, string> = (() => {
  const reverse: Record<string, string> = {}
  for (const [en, ko] of Object.entries(KOREAN_PLACE_NAMES)) {
    const key = ko.normalize("NFC")
    if (!(key in reverse)) reverse[key] = en
  }
  return reverse
})()

function normalize(value: string): string {
  return value.trim().normalize("NFC")
}

function toKorean(value: string): string {
  const trimmed = normalize(value)
  if (ENGLISH_PLACE_NAMES[trimmed]) return trimmed
  return KOREAN_PLACE_NAMES[trimmed] ?? trimmed
}

function toEnglish(value: string): string {
  const trimmed = normalize(value)
  if (KOREAN_PLACE_NAMES[trimmed]) return trimmed
  return ENGLISH_PLACE_NAMES[trimmed] ?? trimmed
}

function joinDeduped(parts: ReadonlyArray<string>): string {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of parts) {
    if (seen.has(part)) continue
    seen.add(part)
    out.push(part)
  }
  return out.join(", ")
}

function buildLocationName(
  extracted: ExtractedExif
): LocalizedString | undefined {
  const raw = [extracted.City, extracted.State, extracted.Country].filter(
    (v): v is string => Boolean(v)
  )
  if (raw.length === 0) return undefined
  return {
    en: joinDeduped(raw.map(toEnglish)),
    ko: joinDeduped(raw.map(toKorean)),
  }
}

function mergeLocation(
  base: PhotoLocation | undefined,
  extracted: ExtractedExif
): PhotoLocation | undefined {
  const extractedName = buildLocationName(extracted)
  const lat =
    typeof extracted.latitude === "number" ? extracted.latitude : base?.lat
  const lng =
    typeof extracted.longitude === "number" ? extracted.longitude : base?.lng
  const name = extractedName ?? base?.name
  if (!name && (typeof lat !== "number" || typeof lng !== "number")) {
    return undefined
  }
  const out: PhotoLocation = {}
  if (name) out.name = name
  if (typeof lat === "number") out.lat = lat
  if (typeof lng === "number") out.lng = lng
  return out
}

function mergeTakenAt(base: string, extracted: ExtractedExif): string {
  const candidate = extracted.DateTimeOriginal ?? extracted.DateCreated
  if (candidate instanceof Date) {
    return candidate.toISOString().slice(0, 10)
  }
  if (typeof candidate === "string" && candidate.length >= 10) {
    return candidate.slice(0, 10)
  }
  return base
}

type VariantOutput = {
  mediumUrl?: string
  thumbUrl?: string
}

async function shouldRegenerate(
  source: string,
  output: string
): Promise<boolean> {
  if (!existsSync(output)) return true
  const [src, out] = await Promise.all([stat(source), stat(output)])
  return src.mtimeMs > out.mtimeMs
}

async function generateVariant({
  source,
  output,
  width,
  quality,
}: {
  source: string
  output: string
  width: number
  quality: number
}): Promise<void> {
  if (!(await shouldRegenerate(source, output))) return
  await sharp(source)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output)
}

async function buildVariants(localFile: string): Promise<VariantOutput> {
  const absolute = path.join(PUBLIC_PHOTOS, localFile)
  if (!existsSync(absolute)) return {}

  const dir = path.dirname(absolute)
  const stem = path.basename(absolute, path.extname(absolute))
  const mediumPath = path.join(dir, `${stem}.md.webp`)
  const thumbPath = path.join(dir, `${stem}.thumb.webp`)

  await Promise.all([
    generateVariant({
      source: absolute,
      output: mediumPath,
      width: MEDIUM_WIDTH,
      quality: MEDIUM_QUALITY,
    }),
    generateVariant({
      source: absolute,
      output: thumbPath,
      width: THUMB_WIDTH,
      quality: THUMB_QUALITY,
    }),
  ])

  const relativeDir = path.dirname(localFile).replace(/\\/g, "/")
  const baseUrl = relativeDir === "." ? "/photos" : `/photos/${relativeDir}`
  return {
    mediumUrl: `${baseUrl}/${stem}.md.webp`,
    thumbUrl: `${baseUrl}/${stem}.thumb.webp`,
  }
}

async function resolveEntry(entry: PhotoEntry): Promise<Photo> {
  const { localFile, ...rest } = entry
  if (!localFile) return rest
  const absolute = path.join(PUBLIC_PHOTOS, localFile)
  if (!existsSync(absolute)) {
    console.warn(`  ⚠️  ${entry.id}: file not found at ${absolute}`)
    return rest
  }
  const extracted = (await exifr.parse(absolute, {
    iptc: true,
    xmp: true,
    gps: true,
    exif: true,
  })) as ExtractedExif | undefined

  const variants = await buildVariants(localFile)

  if (!extracted) {
    console.warn(`  ⚠️  ${entry.id}: no metadata in ${localFile}`)
    return {
      ...rest,
      ...(variants.mediumUrl ? { medium: variants.mediumUrl } : {}),
      ...(variants.thumbUrl ? { thumb: variants.thumbUrl } : {}),
    }
  }

  console.log(`  ✓ ${entry.id}`)
  const location = mergeLocation(rest.location, extracted)
  return {
    ...rest,
    takenAt: mergeTakenAt(rest.takenAt, extracted),
    exif: mergeExif(rest.exif, extracted),
    ...(location ? { location } : {}),
    ...(variants.mediumUrl ? { medium: variants.mediumUrl } : {}),
    ...(variants.thumbUrl ? { thumb: variants.thumbUrl } : {}),
  }
}

function stringifyPhotos(photos: ReadonlyArray<Photo>): string {
  return JSON.stringify(photos, null, 2)
}

async function main(): Promise<void> {
  console.log(`Resolving ${manifest.length} manifest entries…`)
  const resolved: Photo[] = []
  for (const entry of manifest) {
    resolved.push(await resolveEntry(entry))
  }
  const file = `// AUTO-GENERATED. Do not edit.
// Run \`pnpm --filter web sync:photos\` to regenerate from photo-manifest.ts.

import type { Photo } from "./photo-types"

export const photos: ReadonlyArray<Photo> = ${stringifyPhotos(resolved)}
`
  await writeFile(OUTPUT, file, "utf8")
  console.log(
    `Wrote ${resolved.length} entries to ${path.relative(ROOT, OUTPUT)}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
