'use client';
import React, { useState } from 'react';
import HelpCenter from '@/components/shared/HelpCenter';
export default function SupportDesk() {
  const [open,setOpen]=useState(false);
  return <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
    <h2 className="text-xl font-black">Atendimento ao cliente</h2>
    <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">Consulte protocolos, leia as mensagens dos clientes, responda pela conta da equipe e atualize a situação. O histórico fica salvo para o cliente acompanhar. Não há respostas automáticas em nome da equipe nem envio automático de e-mail.</p>
    <button type="button" onClick={()=>setOpen(true)} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold">Abrir fila de atendimento</button>
    {open && <HelpCenter initialTopic="contact" onClose={()=>setOpen(false)} />}
  </section>;
}
