'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getProductVariantConfig } from '@/lib/product-variants';
import { productPresentation } from '@/lib/product-presentation';

interface OptionGroup { label: string; values: string[] }

/** Show only store-confirmed SKUs; never invent stock for a shoe or shirt. */
export default function ProductOptions({ id, category, source, title = '', sport = '', description = '', listedSizes, onChange }: {
  id: string;
  category: string;
  source?: string;
  title?: string;
  sport?: string;
  description?: string;
  listedSizes?: string[];
  onChange: (value: string) => void;
}) {
  const verified = productPresentation(id, source);
  const [selected, setSelected] = useState<Record<string,string>>({});
  const hasCatalogSizes = Boolean(listedSizes?.some(size => size.trim()));

  const options = useMemo<OptionGroup[]>(() => {
    const sizes = [...new Set((listedSizes || []).map(size => size.trim()).filter(Boolean))];
    if (sizes.length) return [{ label: 'Tamanho', values: sizes }];
    if (verified?.options.length) return verified.options.map(option => ({
      label: option.label,
      values: [...new Set(option.values.map(v => v.trim()).filter(Boolean))],
    }));
    // Some balls identify a single, fixed model size in the verified product description.
    if (/^bola\b/i.test(title) && (/(?:tamanho|size)\s*[1-9]/i.test(title + ' ' + description) || /cerâmica\s*2[.,]0/i.test(title))) {
      const ball = getProductVariantConfig(title, category, sport, description, []);
      if (ball) return [{ label: ball.label, values: ball.options }];
    }
    return [];
  }, [listedSizes, verified, title, category, sport, description]);

  useEffect(() => {
    if (!options.length) { onChange(''); return; }
    if (hasCatalogSizes) {
      // The database compares variants against the EXACT SKU strings, not "Tamanho: 40".
      const sizes = options[0].values;
      onChange(selected.Tamanho || (sizes.length === 1 ? sizes[0] : ''));
      return;
    }
    if (!options.every(option => selected[option.label])) { onChange(''); return; }
    onChange(options.length === 1
      ? selected[options[0].label]
      : options.map(option => option.label + ': ' + selected[option.label]).join('; '));
  }, [options, selected, hasCatalogSizes, onChange]);

  if (!options.length) return null;
  return <div className="space-y-4">
    {options.map(option => {
      const current = selected[option.label] || (hasCatalogSizes && option.values.length === 1 ? option.values[0] : '');
      return <fieldset key={option.label}>
        <legend className="mb-3 text-sm font-bold text-white">{option.label}{current && <span className="ml-2 font-normal text-zinc-400">{current}</span>}</legend>
        <div className="flex flex-wrap gap-2">{option.values.map(value =>
          <button key={value} type="button" aria-pressed={current === value}
            onClick={() => setSelected(previous => ({...previous, [option.label]: value}))}
            className={'min-h-11 min-w-11 rounded-lg border px-3 py-2 text-xs font-bold transition ' +
              (current === value ? 'border-red-500 bg-red-600 text-white' : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-400')}>
            {value}
          </button>
        )}</div>
      </fieldset>;
    })}
    <p className="text-[11px] leading-relaxed text-zinc-500">
      {hasCatalogSizes ? 'Numerações cadastradas pelo fornecedor.' : 'Opções identificadas para este modelo na fonte consultada.'} A seleção não reserva estoque.
    </p>
  </div>;
}
