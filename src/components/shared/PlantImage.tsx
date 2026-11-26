'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { normalizePlantAssetUrl } from '@/lib/utils';

export interface PlantImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
}

/**
 * Renders a plant or scan image with legacy asset normalization and graceful
 * fallback when the image source is missing or fails to load.
 */
export function PlantImage({ src, alt, className, fallback }: PlantImageProps) {
  const normalizedSrc = normalizePlantAssetUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const failed = !normalizedSrc || failedSrc === normalizedSrc;

  useEffect(() => {
    const img = imgRef.current;
    if (!normalizedSrc || !img) return;
    if (img.complete && img.naturalWidth === 0) {
      const frame = requestAnimationFrame(() => setFailedSrc(normalizedSrc));
      return () => cancelAnimationFrame(frame);
    }
  }, [normalizedSrc]);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={imgRef}
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(normalizedSrc ?? null)}
    />
  );
}
