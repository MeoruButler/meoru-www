# meoru-diary

A photographic diary kept as a sticker book. One long page, photos pasted in at slight angles with
generous whitespace between them, bookmarks on the edge for jumping between chapters.

Reference for the tone: [gregorcollienne.com](https://gregorcollienne.com/) (staggered grid,
warm off-white paper, tiny uppercase labels, images small relative to the viewport).

## Concept

- **The page is the book.** The home route is the whole site. Scrolling turns the pages; chapters
  are sections of the same page. An `about` section closes the book.
- **Photos are stickers.** Each photo sits in a staggered 2/3/4-column grid, rotated by a
  deterministic tilt of up to ±2.2° and scaled to 72–100% of its cell. The same index always
  produces the same placement, so server and client render identical markup.
- **Bookmarks, not menus.** Chapter tabs stick out of the right edge on desktop (top strip on
  phones). They are plain anchors to `section#<slug>`, so deep links and keyboard navigation work
  without JavaScript. The tab for the chapter in view is extended and marked `aria-current`.
- **Whitespace is the design.** Row gaps of 18–22vh, chapter gaps of 28vh, and a single
  small-caps wordmark. Everything else is left for the photos.

## Image loading strategy

Nothing here should ever look like it is loading. The building blocks:

| Concern              | How it is handled                                                                                                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout shift         | `width`/`height` from the manifest on every `<img>`, `aspect-ratio` on the frame. Boxes exist before any bytes arrive.                                                                                                                 |
| Empty boxes          | Frame background is the photo's dominant color, with a 20px blurred WebP data URL (~150–500 B) painted on top. The real image fades in over 500 ms once decoded.                                                                       |
| Fetching too late    | Stickers mount only when the reader is within two viewports of the end of the rendered set (`IntersectionObserver`, `rootMargin: 200%`) and use `loading="eager"`, so fetching starts well before the browser's native lazy threshold. |
| First paint          | The first two stickers get `fetchPriority="high"`. `priority`/`preload` is avoided because several images compete for LCP.                                                                                                             |
| Wrong source size    | `sizes` describes the real cell width (19vw / 27vw / 43vw), and `deviceSizes`/`imageSizes` in `next.config.ts` cover 256–1920 px so 2x screens get a matching candidate instead of the viewport-width one.                             |
| Off-screen cost      | `content-visibility: auto` with `contain-intrinsic-size` on each sticker skips layout and paint far from the viewport.                                                                                                                 |
| Metadata round-trips | `content/photos.json` is generated at build time and rendered by the server component; the client never fetches metadata.                                                                                                              |

The full research behind these choices, including hosting comparison, is in
[`docs/image-loading.md`](docs/image-loading.md). Concept, design direction, and decisions are in
[`PLAN.md`](PLAN.md).

### Hosting modes

`next.config.ts` switches modes on `NEXT_PUBLIC_IMAGE_CDN_URL`:

1. **Prototype (now):** variable unset. Files under `public/photos` are served through the
   built-in `/_next/image` optimizer.
2. **CDN (later):** set `NEXT_PUBLIC_IMAGE_CDN_URL=https://img.example.com`. `lib/image-loader.ts`
   is registered as the `next/image` loader and emits Cloudflare Image Transformations URLs
   (`/cdn-cgi/image/width=…,format=auto/…`), so resizing and AVIF/WebP happen at the edge and
   Vercel's per-image optimization billing is bypassed. Adjust `buildCdnUrl` for another vendor.
   Rebuild the manifest with `pnpm photos:manifest --src-prefix <bucket path>`.

Registering a custom loader disables `/_next/image` entirely, which is why the loader is only
attached when the CDN exists. To let Vercel optimize with the CDN as a plain origin instead,
drop the two loader lines; `remotePatterns` is already derived from the same variable.

## Localization

- Locales: `en` (default), `ko`, `ja`, `zh` (Simplified, `lang="zh-Hans"`). Every page lives under
  `/<locale>` and is prerendered; `proxy.ts` redirects bare paths to the remembered choice
  (`meoru-locale` cookie), else the `Accept-Language` header, else English.
- Visiting a localized URL records it in the cookie, so the language switcher is just links.
  Prefetch requests are ignored by the proxy so speculative loads cannot change the choice.
- UI strings live in `lib/i18n/dictionaries.ts`; a test asserts every locale has every key with
  the same placeholders. Chapter titles, alt text, and captions come from the manifest and are not
  localized yet.
- `alternates.languages` emits `hreflang` links per locale.

## Accessibility

Target: WCAG 2.2 AA. An axe scan (`@axe-core/playwright`) runs in E2E against `/en`.

- Skip link is the first tab stop and moves focus to `main` (tabindex -1).
- Landmarks: `header`, `main`, `nav` for chapters and language (labelled in the page language),
  `section` per chapter with a heading. Sections take focus on bookmark jumps so the jump is
  announced and keyboard scrolling continues from there.
- Infinite scroll has a visible "show more" button as the non-scroll path, and a polite
  `role="status"` line reports "N of M photos shown" / "End of the book".
- Muted text is 4.9:1 on the paper; the focus ring is near-ink so it stays above 3:1 on photos.
- Language links are written in their own language with `lang` and `hreflang`.
- Reduced motion disables the fade-in and bookmark transitions.
- Manifest text is English until content localization lands; on other pages it is tagged
  `lang="en"` (headings, bookmarks, figures) so screen readers switch voices (3.1.2).
- Document titles name the site and what it is per locale (2.4.2).
- Verified by exploration on the production build (ARIA tree, tab order, 320 px reflow, 200%
  zoom, forced colors, reduced motion, axe on every locale and at 390/320 px): no violations.
  Not yet done: a manual VoiceOver pass.

## Adding photos

```bash
# 1. Drop originals into a chapter folder. Folders sort by name; the numeric prefix is stripped
#    and dashes become spaces for the chapter title.
public/photos/04-winter-coast/DSC01234.jpg

# 2. Regenerate the manifest (dimensions, dominant color, blur placeholder).
pnpm photos:manifest

# 3. Optionally edit alt / caption / chapter in content/photos.json. Hand-written fields survive
#    the next manifest run as long as the photo id (folder/filename) is unchanged.
```

`pnpm photos:samples` regenerates the gradient placeholder photos used for development and E2E.

## Scaling notes

- The manifest is passed to the client component as props. At ~2,000 photos with 300–500 B
  placeholders that is roughly 1 MB of RSC payload; before that point, split the manifest per
  chapter and load chapters through a route handler, or switch placeholders to ThumbHash strings
  decoded on the client (34 chars each).
- Virtualization is intentionally absent. `content-visibility: auto` plus incremental mounting is
  cheaper and does not blank tiles during fast scrolls.

## Commands

```bash
pnpm --filter meoru-diary dev        # https://diary.meoru.localhost via portless
pnpm --filter meoru-diary test       # Jest unit tests
pnpm --filter meoru-diary test:e2e   # Playwright against the production build on :3002
```
