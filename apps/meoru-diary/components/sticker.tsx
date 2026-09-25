'use client';

import Image from 'next/image';
import * as React from 'react';

import { cn } from '@meoru/ui/lib/utils';

import type { Photo } from '@/lib/photos';
import { getStickerPlacement } from '@/lib/sticker-layout';

type StickerProps = {
  photo: Photo;
  /** Global position in the book; drives the deterministic tilt, scale, and alignment. */
  index: number;
  /** Above-the-fold stickers are fetched with high priority so the first paint is not delayed. */
  priority?: boolean;
  /** Language of the alt text and caption when it differs from the page. */
  lang?: string;
};

const ALIGN_CLASS = {
  start: 'justify-self-start',
  center: 'justify-self-center',
  end: 'justify-self-end',
} as const;

/**
 * One photo pasted into the diary. The box reserves the exact aspect ratio before any bytes
 * arrive (no layout shift), shows the dominant color plus a blurred inline preview instantly,
 * then fades the real image in once it has decoded.
 */
export function Sticker({ photo, index, priority = false, lang }: StickerProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const placement = getStickerPlacement(index);

  // Images cached by the browser can finish before React attaches `onLoad`; check on mount.
  const handleImageRef = React.useCallback((element: HTMLImageElement | null) => {
    if (element?.complete && element.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <figure
      id={photo.id}
      lang={lang}
      className={cn('sticker', ALIGN_CLASS[placement.align])}
      style={
        {
          '--tilt': `${placement.tilt}deg`,
          width: `${placement.scale * 100}%`,
        } as React.CSSProperties
      }
    >
      <div
        className="sticker-frame relative overflow-hidden"
        style={{ aspectRatio: `${photo.width} / ${photo.height}`, backgroundColor: photo.dominantColor }}
        data-loaded={isLoaded}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny inline placeholder, not optimized */}
        <img
          aria-hidden
          alt=""
          src={photo.blurDataURL}
          className="absolute inset-0 size-full scale-110 object-cover blur-xl"
          decoding="async"
        />
        <Image
          ref={handleImageRef}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={placement.sizes}
          quality={85}
          // Stickers only mount when they are within two viewports, so fetch immediately instead of
          // waiting for the browser's native lazy threshold (~1250px on 4G).
          loading="eager"
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'relative size-full object-cover transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
      {photo.caption ? (
        <figcaption className="mt-3 text-[11px] tracking-wide text-muted-foreground">{photo.caption}</figcaption>
      ) : null}
    </figure>
  );
}
