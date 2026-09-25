[English](PLAN.md) | [한국어](PLAN.ko.md)

# meoru-diary plan

Living document for the concept, the design direction, and the decisions taken so far.
Update it whenever a decision changes. Implementation details live in [README.md](README.md);
image-loading research lives in [docs/image-loading.md](docs/image-loading.md).

## Decisions (2026-09-09)

| Topic            | Decision                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Budget           | Free tiers only. Anything that needs a paid plan is out of scope until revisited.                                                                                                             |
| Hosting          | Vercel Hobby. Because of its 5k/month image-transformation cap, the site must not depend on Vercel Image Optimization in production.                                                          |
| Image storage    | Cloudflare R2 on a **new** Cloudflare account, created later. The Cloudflare account currently logged in on this machine's CLI belongs to another project and must not be used or modified.   |
| Uploads          | A small admin page, modeled on `~/github/mumak-www/apps/admin` (presigned PUT to a private bucket, server-side sharp, publish to a public bucket). Deferred until the R2 account exists.      |
| Localization     | English default, plus Korean, Japanese, Simplified Chinese. Device language chooses the first visit; a manual choice is remembered in a cookie. Minimal switcher: four native-language links. |
| Accessibility    | WCAG 2.2 AA as the floor, verified with axe in E2E. Everything reachable by keyboard; infinite scroll has a button alternative and a live status line.                                        |
| Design ownership | The owner refines the visual design. This document records the direction; nothing here is final.                                                                                              |

## Concept

The site is a diary and a sticker book. Photos are stickers pasted onto paper: tilted a little,
never perfectly aligned, with generous whitespace. One endless page; bookmarks on the edge are the
table of contents; a short "about" closes the book.

## Design direction

### Two sticker dialects

Research into fursuit-fandom stickers shows two vocabularies:

|              | Western (US/EU)                                                              | Japanese (ケモノ / シール帳)                                                                                      |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Cut          | Die-cut, 3 mm white offset border (≈4% of a 3" sticker), rounded joins       | フレークシール, 2 mm offset, tighter                                                                              |
| Material     | Gloss and holographic vinyl are common; toony art                            | Matte more common; キラキラ (holo) reserved for a few prized pieces                                               |
| Arrangement  | "Organized chaos": anchor sticker, fill outward, heavy overlap, edge to edge | Stickers stay peelable, so they rarely overlap; pages themed by character or color                                |
| Page grammar | Fill the surface                                                             | 40–60% coverage, ≤3 accent colors, elements placed along a letter shape (て・く・ノ・L・O), tiny factual captions |
| Attachments  | Stickers themselves                                                          | Washi tape (15 mm) at corners, photo corners, cheki (instax) prints                                               |

**Direction: Japanese page grammar, Western sticker object.** The brief asks for minimal and
wide margins, which is the シール帳 / 手帳デコ sensibility. Each photo, however, should read as a
die-cut sticker with a white offset border and a soft lift, which is what fursuit fandom stickers
look like. Restraint on the page, tactility on the object.

### Sticker variants

One default plus a few accents, chosen per photo in the manifest (`variant` field, to be added):

1. **Die-cut (default):** rounded-rectangle photo with a 3–4% white offset border and a small,
   slightly offset shadow (lift, not glow). Later, if a photo has an alpha mask, the border can
   follow the fursuit silhouette instead of the rectangle.
2. **Instax mini:** for portraits. Frame 54:86, borders scaled from ≈4.1 mm sides / 7.4 mm top /
   15.7 mm bottom; the bottom band carries the caption.
3. **Instax square:** for 1:1 crops, frame 72:86, same caption band.
4. **Washi-taped print:** bordered print with two translucent tape strips on opposite corners,
   one strip tucked behind the photo. Tape colors are the chapter's accent palette.
5. **Holo accent:** at most one per viewport. Banded conic gradient (bright around cyan/blue,
   darker around red/orange) with slow drift, blend mode `overlay`, pointer-driven angle.

### Mixed content: photos, fursona stickers, doodles (to be explored)

The book should not be photos only. Between and around the photos, the owner's fursona appears
as illustrated expression stickers, and the pages carry small hand-drawn or hand-written marks,
like a decorated diary. Three item kinds, each with its own layout behavior:

| Kind      | What it is                                                             | Layout behavior                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `photo`   | Fursuit photographs taken by the owner                                 | The current staggered grid. Large, restrained, the main rhythm of the page.                                                                                                                            |
| `sticker` | Fursona illustrations: expression sheet, poses, chibi, occasional holo | Small (roughly a third of a photo cell). Sits in the gaps of the grid or peeks over a photo edge in the Western "peeking" way. Silhouette die-cut with the white offset border; alpha-masked PNG/WebP. |
| `doodle`  | Handwriting, arrows, underlines, stamps, tape, small media assets      | Free-positioned decoration anchored to a photo, a chapter heading, or the page margin. Never carries required information; purely decorative, so `aria-hidden`.                                        |

Ideas to work out:

- **Manifest shape.** Add `kind` to every manifest entry. Photos keep the current fields.
  Stickers add `mask` (alpha asset) and `anchor` (which photo or gap they attach to). Doodles add
  `anchor`, `offset`, and `asset` (SVG or image). A separate `content/stickers.json` may be cleaner
  than mixing kinds in `photos.json`; decide once the first sticker set exists.
- **Placement rules.** Keep the Japanese page grammar: coverage still 40–60%, at most one or two
  stickers per photo row, doodles sparse. Stickers use a wider tilt range (±5–8°) than photos so
  they read as casual. A deterministic seed per chapter decides which gaps get filled.
- **Expression stickers as a system.** A small set (e.g. 8–12 expressions) reused across chapters,
  chosen to echo the mood of the nearby photos. Rare "holo" variants for a few chapters.
- **Handwriting.** Captions and doodles in one handwritten face (Latin + Korean + Japanese coverage
  needed for i18n; may fall back to a marker-style Latin face plus system fonts for CJK). Doodle
  text that carries meaning must also exist as real text for screen readers; otherwise keep it
  decorative.
- **Loading.** Stickers and doodles are tiny and repeat, so they can be inlined or preloaded once;
  they must never delay photos. Photos keep priority in the fetch order.
- **Authoring.** The admin page later gains a "sticker" upload path (alpha PNG → WebP with alpha)
  and a simple picker to attach stickers/doodles to a photo or gap.

Open questions: whether stickers overlap photos at all (Western) or only sit in gaps (Japanese);
whether doodles are hand-drawn assets or an SVG library; how much of this survives the minimal
brief. Prototype one chapter both ways before deciding.

### Texture

- Paper grain over the whole page: SVG `feTurbulence`, ≈4% opacity, tiled.
- Prints get a finer grain than the paper. Vinyl stickers get a faint diagonal gloss streak.
- Shadows are asymmetric (paper lifts on one side). One curled corner occasionally, never all.
- Avoid uniform glow, spinning holo, and heavy skeuomorphism. The page must still feel quiet.

### Layout and motion

- Staggered 2/3/4-column grid with row gaps of 18–22vh (already implemented).
- Tilt ±2–3°, one ±5° accent per viewport. Straighten to 0° on hover is optional; respect
  `prefers-reduced-motion`.
- Photo area per "page" capped around 40–60%. Whitespace is content.
- Chapters are pages themed by character, color, or event. The chapter label is the only heading.

### Typography and color

- Paper `oklch(0.967 0.004 84)`, ink near-black. Up to three accent colors per chapter, taken
  from the washi tape / photo palette.
- Labels: tiny uppercase tracking (current). Captions follow the 手帳デコ grammar: date, place,
  weather, in a fine handwriting-like face. Font choice is open (the reference site uses a single
  heavy narrow grotesque; that is not the mood here).

### Navigation

- Bookmark ribbons on the right edge (vertical text on desktop, strip on mobile). Consider giving
  the active ribbon the chapter's accent color like a washi tab.
- Optional: a キャラ名刺 / conbadge-style credit card for the fursuiter (3.5×2" proportions,
  clip hole, gloss streak) shown on hover or in a detail view.

## Image infrastructure on free tiers

The research recommended R2 + Cloudflare Image Transformations. On the free plan Transformations
stop after 5,000 unique transforms per month, so the free-tier path is:

1. **Pre-generate variants at upload time** with sharp (AVIF + WebP at 384/640/828/1080/1280/1600,
   plus the 20 px blur and dominant color) and store them in the public R2 bucket. No runtime
   transforms, no quota.
2. **Loader maps width to a pre-generated file** (`<key>/w1080.avif`) instead of a transform URL.
   `lib/image-loader.ts` will gain this mode; `format=auto` is replaced by `<picture>`-style
   negotiation through `next/image` formats or by serving AVIF with WebP fallback keys.
3. **Manifest** stays in the repo for now (`content/photos.json`). Once the admin page exists it
   moves to the private bucket and the site reads it at build time or through ISR.
4. R2 free tier: 10 GB storage, 10 M reads/month, zero egress. Fine for this scale.

## Admin upload page (later)

Borrow from `mumak-www/apps/admin`:

- Separate Vercel project and repo app (`apps/meoru-admin`) so the public site has no write path.
- Browser gets a presigned PUT for a private staging key (Vercel functions cap request bodies at
  4.5 MB, so uploads must go straight to R2).
- Server: validate JPEG, EXIF-rotate, generate variants, write to the public bucket with
  `Cache-Control: public, max-age=31536000, immutable`, update the manifest, revalidate the site.
- Token-digest login with a signed session cookie; production credentials only on Vercel, never
  in Git. Daily upload cap as a budget guard.
- Fields per photo: chapter, alt, caption (date · place · weather), variant, optional accent color.

## Open decisions

- Site name and wordmark (currently the placeholder "Meoru").
- Font pair for labels and captions.
- Chapter scheme: by event, by character, or by season.
- Whether to attempt silhouette die-cuts (needs background removal per photo).
- Mixed content: sticker/doodle data model, overlap rules, handwriting font with CJK coverage.
- Manual screen-reader pass (VoiceOver on macOS/iOS) once real photos and alt text exist; the
  automated checks are clean but cannot judge whether alt text is useful.
- Detail view: none, lightbox, or a "peel off the page" interaction.

## Roadmap

1. Prototype grid, loading pipeline, bookmarks. **Done.**
1. Localization (en/ko/ja/zh) and accessibility baseline. **Done.** Content fields in the manifest
   (chapter titles, alt, captions) still need per-locale variants.
1. Sticker variants and texture layer behind a `variant` field; owner tunes the look.
1. New Cloudflare account, R2 buckets, pre-generated variants, loader mode for static keys.
1. Admin upload app.
1. About section content, metadata, OG image, analytics (free tier).
