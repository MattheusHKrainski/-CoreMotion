'use client';
import React, { useEffect, useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { useCoreMotiom } from '@/lib/store';
export default function LoginPage() {
  const { setAuthModalMode, setAuthModalOpen }=useCoreMotiom();
  const [ready,setReady]=useState(false);
  useEffect(()=>{const mode=new URLSearchParams(window.location.search).get('mode');setAuthModalMode(mode==='register'||mode==='forgot'||mode==='switch'?mode:'login');setAuthModalOpen(true);setReady(true);},[setAuthModalMode,setAuthModalOpen]);
  return ready?<AuthModal page/>:<main role="status" className="p-10 text-center text-zinc-400">Abrindo acesso…</main>;
}
