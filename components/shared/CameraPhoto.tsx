'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { uploadImage } from '@/services/media';

export default function CameraPhoto({ onPhoto, disabled }: { onPhoto: (url: string) => void; disabled: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const stop = () => { stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; setActive(false); };
  useEffect(() => { alive.current = true; return () => { alive.current = false; stream.current?.getTracks().forEach(track => track.stop()); }; }, []);
  const start = async () => {
    setError(''); setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Câmera indisponível. Abra o site por HTTPS em um navegador com câmera.');
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (!alive.current) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media; setActive(true);
      // The video stays mounted so the new stream can be attached immediately.
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
    } catch (reason) {
      stop(); setError(reason instanceof Error && reason.message.includes('HTTPS') ? reason.message : 'Permita o acesso à câmera. Se estiver no painel de preview, abra o site em uma aba separada e tente novamente.');
    } finally { if (alive.current) setBusy(false); }
  };
  const capture = async () => {
    if (!video.current?.videoWidth) return;
    setBusy(true); setError('');
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1600 / Math.max(video.current.videoWidth, video.current.videoHeight));
      canvas.width = Math.round(video.current.videoWidth * scale); canvas.height = Math.round(video.current.videoHeight * scale);
      canvas.getContext('2d')!.drawImage(video.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível tirar a foto.')), 'image/jpeg', 0.9));
      const url = await uploadImage(new File([blob], 'produto.jpg', { type: 'image/jpeg' }), 'products');
      onPhoto(url); stop();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a foto.'); }
    finally { if (alive.current) setBusy(false); }
  };
  return <div className="space-y-3">
    <video ref={video} muted playsInline className={`${active ? 'block' : 'hidden'} max-h-72 w-full rounded-xl bg-black`} aria-label="Câmera do produto" />
    <div className="flex flex-wrap gap-2">
      {!active ? <button type="button" disabled={disabled || busy} onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Camera className="h-4 w-4" />{busy ? 'Abrindo câmera…' : 'Tirar foto do produto'}</button> : <>
        <button type="button" disabled={busy} onClick={capture} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Salvando foto…' : 'Capturar foto'}</button>
        <button type="button" disabled={busy} onClick={stop} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm">Cancelar câmera</button>
      </>}
    </div>
    {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
  </div>;
}
