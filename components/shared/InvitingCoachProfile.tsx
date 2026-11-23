import React from 'react';
import type { SportsRecord } from '@/lib/sports';
import { invitingCoachProfile, sportsProfileDetails } from '@/lib/sports-profile';
import { coachContactUrl } from '@/lib/coach-contact';
export default function InvitingCoachProfile({invite,records,recipientId}:{invite:SportsRecord;records:SportsRecord[];recipientId:string}) {
 if(invite.kind!=='invite'||invite.data.recipient!==recipientId)return null;
 const profile=invitingCoachProfile(invite,records,recipientId);
 const contact=profile?coachContactUrl(profile.data.contact):null;
 return <details className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-3">
  <summary className="cursor-pointer text-sm font-bold text-red-400">Ver perfil profissional do treinador</summary>
  {profile?<div className="mt-4 space-y-4">
   <h4 className="break-words text-base font-bold">{profile.data.name||'Treinador'}</h4>
   <dl className="grid gap-3 sm:grid-cols-2">{sportsProfileDetails(profile).map(item=><div key={item.label} className="min-w-0"><dt className="text-xs font-semibold text-zinc-500">{item.label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-200 [overflow-wrap:anywhere]">{item.value}</dd></div>)}</dl>
   {contact&&<a href={contact} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg border border-zinc-600 px-3 py-2 text-xs font-bold">Contatar treinador <span className="sr-only">(abre em outra aba)</span></a>}
   <p className="text-xs text-zinc-500">Informações publicadas pelo profissional, sem verificação de formação pela CoreMotion. Confirme equipe, local e condições antes de aceitar.</p>
  </div>:<p className="mt-3 text-sm text-zinc-400">Este remetente não possui um perfil profissional publicado ou o perfil não está mais disponível. Solicite mais informações antes de responder.</p>}
 </details>;
}
