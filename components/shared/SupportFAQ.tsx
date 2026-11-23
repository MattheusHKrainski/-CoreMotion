'use client';
import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SUPPORT_FAQ } from '@/lib/support-faq';
import { matchesCatalogSearch } from '@/lib/catalog-search';
export default function SupportFAQ({ onContact }: { onContact: () => void }) {
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('Todas');
 const categories=['Todas',...new Set(SUPPORT_FAQ.map(item=>item.category))];
 const visible=useMemo(()=>SUPPORT_FAQ.filter(item=>(category==='Todas'||item.category===category)&&matchesCatalogSearch(query,item.question,item.answer,item.category)),[query,category]);
 return <section aria-labelledby="support-faq-title" className="space-y-5">
  <header><h3 id="support-faq-title" className="text-xl font-black">Perguntas frequentes</h3><p className="mt-2 text-sm text-zinc-400">Encontre respostas sobre conta, produtos, compras e atendimento. Não precisa entrar para consultar.</p></header>
  <label className="block text-xs text-zinc-400">Pesquisar nas perguntas frequentes<div className="relative mt-2"><Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ex.: senha, entrega, tamanho…" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-3 text-sm text-white focus:border-red-500 focus:outline-none" /></div></label>
  <label className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">Filtrar por assunto<select value={category} onChange={event=>setCategory(event.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-white">{categories.map(item=><option key={item}>{item}</option>)}</select></label>
  <p role="status" className="text-xs text-zinc-500">{visible.length} pergunta(s) encontrada(s)</p>
  <div className="space-y-3">{visible.map(item=><details key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><summary className="cursor-pointer text-sm font-bold focus-visible:outline focus-visible:outline-red-500">{item.question}</summary><p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.answer}</p></details>)}</div>
  {!visible.length && <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400"><p>Nenhuma pergunta encontrada. Tente outra palavra ou outro assunto.</p><button type="button" onClick={()=>{setQuery('');setCategory('Todas');}} className="mt-3 font-bold text-red-400">Limpar filtros</button></div>}
  <div className="rounded-xl border border-zinc-700 p-4"><p className="text-sm font-bold">Não encontrou a resposta?</p><button type="button" onClick={onContact} className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500">Falar com a equipe</button></div>
 </section>;
}
