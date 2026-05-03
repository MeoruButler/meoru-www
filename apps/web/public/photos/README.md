# Photos

원본 사진은 컬렉션 폴더 단위로 둡니다 (예: `225-studio/`, `harry-studio/`). 폴더 이름이 사이드바 컬렉션 라벨이 됩니다 (`225-studio` → `"225 Studio"`).

빌드 타임 산출물도 같은 폴더에 사이드카로 생성됩니다:

- `<원본>.md.webp` — 1600w, q80 (PhotoViewer가 사용)
- `<원본>.thumb.webp` — 400w, q75 (Filmstrip 썸네일)

## 워크플로우

새 사진을 추가했을 때:

```bash
# 새 폴더 추가 (manifest 새로 작성 + EXIF/위치/사이드카 한 번에)
pnpm --filter web bootstrap:photos

# 기존 폴더에 사진 추가/교체 (사이드카만 갱신)
pnpm --filter web sync:photos
```

`sync:photos`는 원본 mtime이 사이드카보다 새로울 때만 재생성하므로 반복 실행해도 빠릅니다.

## 자동 추출되는 메타데이터

- 카메라/렌즈/조리개/셔터/ISO (EXIF)
- 촬영 일시 (EXIF DateTimeOriginal 또는 IPTC DateCreated)
- 도시/국가 텍스트 (IPTC City, State, Country)
- GPS 좌표 (EXIF GPS IFD 또는 XMP)

`src/data/photo-manifest.ts`의 `alt`, `caption`만 본인이 직접 다듬으면 됩니다.

## 외부 호스팅 마이그레이션

저장 용량이 커지면 (Cloudflare Images / Vercel Blob 등) — `manifest.src`(과 medium/thumb)을 CDN URL로 바꾸기만 하면 됩니다. `localFile`은 그대로 둬도 EXIF 추출용으로 동작합니다.
