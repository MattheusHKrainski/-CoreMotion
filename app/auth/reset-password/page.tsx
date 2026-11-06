'use client';
import Link from 'next/link';
import { MIN_PASSWORD_LENGTH } from '@/lib/signup-validation';
import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/services/supabaseClient';
export default function ResetPasswordPage() {
  const [password,setPassword] = useState('');
  const [confirmation,setConfirmation] = useState('');
  const [ready,setReady] = useState(false);
  const [message,setMessage] = useState('Verificando o link de recuperação…');
  const [busy,setBusy] = useState(false);
  const [done,setDone] = useState(false);
  useEffect(() => {
    const client=getSupabaseClient();
    if (!client) { setMessage('Supabase não configurado.'); return; }
    let active=true;
    const {data}=client.auth.onAuthStateChange(event=>{if(active && event==='PASSWORD_RECOVERY'){setReady(true);setMessage('Escolha uma nova senha.');}});
    client.auth.getSession().then(({data,error})=>{if(!active)return;if(data.session&&!error){setReady(true);setMessage('Escolha uma nova senha.');}else setMessage('Abra o link de recuperação enviado ao seu e-mail.');});
    return()=>{active=false;data.subscription.unsubscribe();};
  },[]);
  return <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white"><form className="max-w-md w-full space-y-5 rounded-2xl border border-zinc-700 p-6" onSubmit={async event=>{
    event.preventDefault();if(!ready||busy||done)return;if(password.length<MIN_PASSWORD_LENGTH){setMessage('A senha deve ter no mínimo 6 caracteres.');return;}if(password!==confirmation){setMessage('As senhas não coincidem.');return;}setBusy(true);
    try { const client=getSupabaseClient();if(!client)throw new Error();const {error}=await client.auth.updateUser({password});if(error)throw error;setDone(true);setMessage('Senha alterada. Volte ao site e entre com a nova senha.');await client.auth.signOut(); }catch{setMessage('Não foi possível alterar a senha. Solicite um novo link e tente novamente.');}finally{setBusy(false);}
  }}><h1 className="text-2xl font-bold">Alterar senha</h1><p role="status" className="text-sm text-zinc-300">{message}</p>{ready&&!done&&<><label className="block text-sm">Nova senha<input type="password" minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="block w-full p-3 mt-2 rounded-xl bg-zinc-900 border border-zinc-700"/></label><label className="block text-sm">Repita a senha<input type="password" minLength={MIN_PASSWORD_LENGTH} required autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="block w-full p-3 mt-2 rounded-xl bg-zinc-900 border border-zinc-700"/></label><button disabled={busy} className="rounded-xl bg-red-600 p-3 font-bold disabled:opacity-50">{busy?'Salvando…':'Salvar nova senha'}</button></>}<Link href="/?entrar=1" className="block text-red-400 text-sm">Voltar ao login</Link></form></main>;
}
