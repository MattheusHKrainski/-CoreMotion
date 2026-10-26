'use client';
import React, { useId } from 'react';
import { MODALITIES } from '@/lib/modalities';
export default function SportPicker({ value, onChange, options = [], label = 'Modalidade', required = false }: { value: string; onChange: (value: string) => void; options?: string[]; label?: string; required?: boolean }) {
  const id = useId();
  const sports = [...new Set([...MODALITIES, ...options].filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  return <label className="block space-y-2 text-xs text-zinc-300"><span>{label}{required ? ' *' : ''}</span><div className="flex gap-2"><input aria-label={label} list={id} value={value === 'all' ? '' : value} onChange={e => onChange(e.target.value)} placeholder={required ? 'Digite ou escolha sua modalidade' : 'Buscar modalidade (todas se vazio)'} required={required} maxLength={60} className="min-w-0 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white" autoComplete="off" />{value && value !== 'all' && <button type="button" aria-label={`Limpar ${label.toLowerCase()}`} onClick={() => onChange('')} className="px-2 text-zinc-400">×</button>}</div><datalist id={id}>{sports.map(sport => <option value={sport} key={sport} />)}</datalist></label>;
}
