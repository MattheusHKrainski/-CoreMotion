'use client';
import {useState} from 'react';
import {getSupabaseClient} from '@/services/supabaseClient';
import {removeOwnAccountMedia} from '@/services/accountMedia';
import {savedAccountVault} from '@/services/savedAccounts';
export default function DeleteOwnAccount(){
 const [open,setOpen]=useState(false),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 return <section className="mt-6 rounded-xl border border-red-950 p-4" aria-label="Excluir própria conta">
  <h2 className="text-sm font-bold">Excluir minha conta</h2><p className="mt-2 text-xs text-zinc-400">Exclusão permanente da conta, publicações, anúncios e interações. Esta ação não pode ser desfeita.</p>
  {!open?<button type="button" onClick={()=>setOpen(true)} className="mt-3 text-xs font-bold text-red-400">Quero excluir minha conta</button>:<div className="mt-3 space-y-3">
   <label className="block text-xs">Digite EXCLUIR para confirmar<input disabled={busy} value={confirmation} onChange={event=>setConfirmation(event.target.value)} className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm" autoComplete="off"/></label>
   <p className="text-xs text-amber-300">Ao confirmar, seus arquivos começam a ser removidos. Não feche a página durante a operação.</p>
   {error&&<p role="alert" className="text-xs text-red-300">{error}</p>}
   <div className="flex gap-3"><button type="button" disabled={busy||confirmation!=='EXCLUIR'} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold disabled:opacity-40" onClick={async()=>{
    const client=getSupabaseClient();if(!client){setError('Conecte sua conta para solicitar a exclusão.');return;}setBusy(true);setError('');
    try{
     const {data,error:authError}=await client.auth.getUser();if(authError||!data.user)throw new Error('Entre novamente antes de excluir.');
     // Check protected identity before removing media.
     const {data:profile,error:profileError}=await client.from('profiles').select('email').eq('id',data.user.id).single();
     if(profileError||!profile)throw new Error('Não foi possível verificar sua conta.');
     if(profile.email?.toLowerCase()==='mattheus.h.krainski@gmail.com')throw new Error('A conta administrativa principal é protegida.');
     await removeOwnAccountMedia(client);
     const {error:deleteError}=await client.rpc('delete_my_account',{p_confirmation:confirmation});
     if(deleteError)throw new Error('Não foi possível concluir a exclusão. Tente novamente ou contate o suporte.');
     try{savedAccountVault().remove(data.user.id);}catch{/* Account already deleted; storage must not prevent leaving. */}
     await client.auth.signOut({scope:'local'});window.location.assign('/entrar');
    }catch(reason){setError(reason instanceof Error?reason.message:'Não foi possível excluir sua conta.');setBusy(false);}
   }}>{busy?'Excluindo…':'Excluir permanentemente'}</button><button type="button" disabled={busy} onClick={()=>{setOpen(false);setConfirmation('');setError('');}} className="text-xs text-zinc-400">Cancelar</button></div>
  </div>}
 </section>;
}
