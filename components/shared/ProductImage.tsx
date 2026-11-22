'use client';
import Image from 'next/image';
import React, { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  sizes: string;
  fallbackSrcs?: string[];
  fit?: 'contain' | 'cover';
}

/**
 * Try another photo from the SAME product when a supplier CDN fails.
 * Never replace the item with a generic image or a different product.
 */
export default function ProductImage({ src, alt, sizes, fallbackSrcs = [], fit = 'contain' }: ProductImageProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const candidates = [...new Set([src, ...fallbackSrcs].filter(value =>
    typeof value === 'string' && (/^https:\/\//i.test(value) || value.startsWith('/'))
  ))];
  const selected = candidates.find(url => !failed.includes(url));
  if (!selected) {
    return <div role="img" aria-label={'Imagem indisponível: ' + alt}
      className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-4 text-center text-xs text-zinc-400">
      Imagem indisponível
    </div>;
  }
  return <Image
    key={selected}
    src={selected}
    alt={alt}
    fill
    sizes={sizes}
    unoptimized={!selected.startsWith('/') || selected.endsWith('.svg')}
    onError={() => setFailed(previous => previous.includes(selected) ? previous : [...previous, selected])}
    className={'transition-transform duration-500 group-hover:scale-105 ' + (fit === 'cover' ? 'object-cover' : 'object-contain p-4')}
  />;
}
