'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { validCommunityVideoUrl } from '@/lib/media';
export default function CommunityMedia({image,video,author}:{image?:string;video?:string;author:string}) {
 const [failedImage,setFailedImage]=useState(''),[failedVideo,setFailedVideo]=useState('');
 return <>{image&&(image===failedImage?<p className="mt-3 text-xs text-zinc-500">A imagem desta publicação não está disponível.</p>:<div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><Image src={image} alt={`Imagem de ${author}`} fill sizes="(max-width:640px) 85vw, 640px" unoptimized onError={()=>setFailedImage(image)} className="object-contain"/></div>)}{video&&(validCommunityVideoUrl(video)&&video!==failedVideo?<video className="mt-4 max-h-[70dvh] w-full rounded-2xl border border-zinc-800 bg-black" controls playsInline preload="none" onError={()=>setFailedVideo(video)} aria-label={`Vídeo de ${author}`}><source src={video}/>Seu navegador não suporta este vídeo.</video>:<p className="mt-3 text-xs text-zinc-500">Não foi possível reproduzir o vídeo. Verifique sua conexão ou tente outro navegador.</p>)}</>;
}
