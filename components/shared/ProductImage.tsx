'use client';
import Image from 'next/image';
import React, { useState } from 'react';

/** Nunca substituir foto indisponível por uma foto de outro produto. */
export default function ProductImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const unavailable = !src || failedSource === src;
  return unavailable ? <div role="img" aria-label={`Imagem indisponível: ${alt}`} className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-sm text-zinc-400">Imagem indisponível</div> : <Image src={src} alt={alt} fill sizes={sizes} unoptimized={!src.startsWith('/')} onError={() => setFailedSource(src)} className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" />;
}
