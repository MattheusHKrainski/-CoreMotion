'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { validImageUrl } from '@/lib/media';

export default function UserAvatar({ src, name, large = false }: { src?: string; name: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 font-bold text-zinc-100 ${large ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'}`}>
    {src && (validImageUrl(src) || src.startsWith('/profiles/')) && !failed ? <Image src={src} alt={name} fill sizes={large ? '64px' : '40px'} unoptimized onError={() => setFailed(true)} className="object-cover" /> : name.slice(0, 1).toUpperCase()}
  </span>;
}
