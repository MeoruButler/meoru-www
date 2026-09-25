# Image loading research (2026-09)

Scope: a Next.js 16 (App Router, React 19) portfolio whose home page is one very long,
incrementally revealed grid of large photographs. Owner has no image host yet. Findings below
drove the decisions in `next.config.ts`, `lib/image-loader.ts`, and `components/sticker.tsx`.

## Recommendation

- **Hosting:** Cloudflare R2 for originals, custom domain on a Cloudflare zone, Cloudflare Image
  Transformations for resizing and format negotiation. Wire into `next/image` with
  `images.loader: 'custom'` + `loaderFile` (already in place; flip `NEXT_PUBLIC_IMAGE_CDN_URL`).
- **Placeholder:** tiny blurred WebP data URL plus dominant color, generated at manifest build time
  with sharp. ThumbHash is the alternative if payload size becomes an issue (store the 34-char hash
  and decode client-side).
- **Layout:** intrinsic `width`/`height` on every image; never fetch metadata at runtime.
- **Priority:** `loading="eager"` for everything that is mounted (mounting itself is gated by an
  IntersectionObserver two viewports ahead), `fetchPriority="high"` on the first two images only.
  Next 16 deprecates `priority` in favor of `preload`; the docs recommend `loading="eager"` or
  `fetchPriority="high"` instead when several images could be the LCP candidate.

## 1. Hosting comparison (≈2k photos, ≈50 GB, low traffic, deployed on Vercel)

| Option                         | Cost estimate / month                                      | Egress              | Resize + AVIF/WebP                                                              | Upload from Mac                         | Custom domain                         | next/image wiring                 |
| ------------------------------ | ---------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------- | --------------------------------- |
| **R2 + CF Transformations**    | ≈$0.60 storage + $0–3 transforms                           | Free                | Yes (AVIF ≤1200 px, WebP above)                                                 | Dashboard, `rclone`, S3 SDK, `wrangler` | Yes (required for caching/transforms) | `loaderFile`                      |
| Vercel Blob + Vercel optimizer | Pro plan realistically; Blob transfer billed               | Billed              | Via Vercel optimizer; Hobby: 5k transforms/month then HTTP 402 (alt text shows) | SDK / dashboard                         | No                                    | `remotePatterns`                  |
| Cloudinary                     | Free tier too small for 50 GB; Plus ≈$99                   | Credit-based        | Excellent                                                                       | UI / CLI                                | Only on Advanced ($249)               | `loaderFile`                      |
| imgix                          | Starter ≈$25 (50 GB, 100 GB bandwidth); needs S3/R2 source | Credit-based        | Excellent                                                                       | Source bucket                           | Yes                                   | `loaderFile`                      |
| UploadThing                    | ≈$10 (100 GB)                                              | n/a                 | No transforms                                                                   | SDK                                     | Not documented                        | `unoptimized` or Vercel optimizer |
| Supabase Storage               | Pro ≈$25                                                   | $0.03/GB over quota | WebP only, AVIF planned                                                         | Dashboard / CLI                         | No                                    | `loaderFile`                      |

R2 wins on cost (no egress, no plan floor) and Next.js documents a Cloudflare loader example.
Caveats: the free Images plan hard-fails past 5,000 unique transformations/month (error 9422), so
enable the usage-based paid plan (≈$0.50 per 1k after the first 5k). Cloudflare caps AVIF output
at 1,200 px and serves WebP above that; acceptable at quality 80–85. For full-size AVIF later,
pre-generate variants with sharp and upload them as static files under the same key layout.

Sources: [R2 pricing](https://developers.cloudflare.com/r2/pricing/) ·
[CF Images pricing](https://developers.cloudflare.com/images/pricing/) ·
[CF limits](https://developers.cloudflare.com/images/get-started/limits/) ·
[CF transform URL](https://developers.cloudflare.com/images/transform-images/transform-via-url/) ·
[R2 + Image Resizing reference architecture](https://developers.cloudflare.com/reference-architecture/diagrams/content-delivery/optimizing-image-delivery-with-cloudflare-image-resizing-and-r2/) ·
[Vercel Image Optimization limits](https://vercel.com/docs/image-optimization/limits-and-pricing) ·
[Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) ·
[Cloudinary](https://cloudinary.com/pricing) · [imgix](https://www.imgix.com/pricing) ·
[UploadThing](https://uploadthing.com/pricing) ·
[Supabase transforms](https://supabase.com/docs/guides/storage/serving/image-transformations)

## 2. `next/image` in Next.js 16 (docs for 16.3.x)

- `sizes` present → full `w`-descriptor srcset from `deviceSizes` + `imageSizes`; absent → 1x/2x
  only. Missing `sizes` on `fill` means the browser assumes 100vw. Always set it.
- `priority` is deprecated in favor of `preload` (emits `<link rel="preload">`). Docs recommend
  `loading="eager"` or `fetchPriority="high"` when multiple images could be LCP.
- `placeholder="blur"` accepts any `data:image/...` URL via `blurDataURL`; keep it tiny (≈10–20 px).
  This project renders its own placeholder layer instead so the real image can fade in over it.
- `decoding` defaults to `async`.
- `images.qualities` default changed to `[75]` in v16; other values are coerced. Set the list
  explicitly (`[60, 75, 85]` here).
- `images.minimumCacheTTL` default rose from 60 s to 4 h in v16; `imageSizes` dropped 16.
  `deviceSizes` default unchanged (`640…3840`).
- Local images with query strings require `images.localPatterns.search` in v16.
- `images.domains` deprecated; use `remotePatterns` (accepts `URL` objects since 15.3).
- With `images.loader: 'custom'`, `remotePatterns` is not consulted (it guards the built-in
  optimizer). The pattern is still derived in `lib/image-cdn.ts` so switching back is a one-liner.
- Verdict on pricing: bypass the Vercel optimizer once a transforming CDN exists. Vercel bills per
  transformation and cache read/write, and the Hobby cap fails loudly.

Sources: [Image component](https://nextjs.org/docs/app/api-reference/components/image) ·
[images config](https://nextjs.org/docs/app/api-reference/config/next-config-js/images) ·
[v16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) ·
[Managing image optimization costs](https://vercel.com/docs/image-optimization/managing-image-optimization-costs)

## 3. Perceived performance in a scroll gallery

- **Placeholders:** ThumbHash beats BlurHash (more detail per byte, encodes aspect ratio, correct
  colors) but both need client JS to decode. Decoding at build time into a data URL sidesteps that;
  a 20 px sharp-generated WebP achieves the same with no extra dependency. Also store the average
  color as `background-color` so the box is never blank.
- **CLS:** `width`/`height` (or `aspect-ratio`) from the manifest on every tile. Browser-level lazy
  loading also needs dimensions to decide what is in view.
- **Fetch priority:** `fetchPriority="high"` on the first 1–2 tiles, `loading="eager"` for the
  first viewport, lazy for the rest. Chrome's lazy threshold is ≈1250 px on 4G / 2500 px on 3G.
- **Prefetch ahead:** an `IntersectionObserver` with `rootMargin: '200% 0px'` that mounts (or flips
  to eager) the next tiles buys roughly two viewports of runway over native lazy loading.
- **`content-visibility: auto`** with `contain-intrinsic-size` skips layout and paint for far
  off-screen tiles while keeping find-in-page and accessibility intact.
- **Virtualization:** not worth it below several thousand tiles; it reintroduces blank tiles during
  fast scrolls and breaks native lazy heuristics. Revisit with `@tanstack/react-virtual` only past
  ≈5k tiles or measurable long frames.
- **Infinite scroll:** prefer a pre-rendered manifest over paginated fetching. Render the first
  page server-side and append from the in-memory manifest; no network round-trip, no spinner.

Sources: [ThumbHash](https://github.com/evanw/thumbhash) ·
[Mux on blurry placeholders](https://www.mux.com/blog/blurry-image-placeholders-on-the-web) ·
[web.dev fetchpriority](https://web.dev/articles/fetch-priority) ·
[web.dev browser-level lazy loading](https://web.dev/articles/browser-level-image-lazy-loading) ·
[web.dev content-visibility](https://web.dev/articles/content-visibility)

## 4. Formats and sizing

- AVIF ≈20–30% smaller than WebP for photos; WebP ≈25–35% smaller than JPEG. All browsers Next 16
  supports decode AVIF. AVIF encoding is 5–10× slower, which is why edge caches matter.
- Quality: Cloudflare defaults to 85; sharp defaults AVIF 50 / WebP 80 / JPEG 80. For a portfolio:
  AVIF 55–65, WebP 78–85, JPEG ≈82.
- Sizing here: stickers render at 19–43vw, so the srcset needs 256–640 px for phones and
  828–1600 px for 2x desktops. `deviceSizes: [640, 828, 1080, 1280, 1600, 1920]`,
  `imageSizes: [256, 384, 512]`. Anything above 1920 is wasted bytes for this layout.
- Serve AVIF/WebP via `format=auto` (Accept negotiation, cached per format).

## 5. Upload pipeline (when the CDN exists)

1. `sharp` reads the EXIF-rotated original, records width/height, dominant color, and a 20 px blur;
   optionally re-encodes the original as JPEG q90 with metadata stripped.
2. Upload with `@aws-sdk/client-s3` (`region: 'auto'`, endpoint
   `https://<account>.r2.cloudflarestorage.com`) or `rclone copy ./drop r2:bucket/photos`.
   Key by content hash for immutable caching.
3. Append to `content/photos.json`, commit, deploy. `scripts/build-photo-manifest.mjs` already does
   step 1 for local files and accepts `--src-prefix` for the bucket path; the upload step is the
   only addition needed.

Sources: [R2 with AWS SDK v3](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/) ·
[R2 with rclone](https://developers.cloudflare.com/r2/examples/rclone/) ·
[sharp output options](https://sharp.pixelplumbing.com/api-output/)
