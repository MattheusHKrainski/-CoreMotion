'use client';

/** Prices shown in their original store currency; never passed to CoreMotion checkout. */
const VERIFIED_REFERENCES: Record<string, { name: string; price: string; url: string; note: string }[]> = {
  'superlega-italia-2026-27:allianz-milano': [
    { name: 'Camisa de jogo Away Allianz Milano 2026/27 (Erreà)', price: '€ 89', url: 'https://powervolleymilano.shop/prodotto/maglia-gara-away-2026-27/', note: 'Personalização e tamanhos sujeitos à loja' },
  ],
  'superlega-italia-2026-27:valsa-group-modena': [
    { name: 'Camisa Modena Volley Coppa CEV masculina 2026/27 (Ninesquared)', price: '€ 80', url: 'https://shop.modenavolley.it/prodotto/maglia-coppa-cev-modena-volley-2026-27/', note: 'Personalização e tamanhos disponíveis na página do fornecedor' },
  ],
  'superlega-italia-2026-27:itas-trentino-trento': [
    { name: '1ª camisa de jogo Itas Trentino — masculina', price: '€ 80', url: 'https://store.trentinovolley.it/products/1-maglia-da-gara-uomo', note: 'Temporada e estoque devem ser confirmados na loja' },
  ],
  'svleague-japao-2026-27:osaka-bluteon': [
    { name: 'Camisa réplica Osaka Bluteon 2026/27 — 1ª azul, #3–#12', price: '¥ 18.150', url: 'https://sv-bluteon.ec.e-get.jp/item/0933/?cat=150001', note: 'Preço para tamanhos S–XO2; frete e numeração variam' },
  ],
  'svleague-japao-2026-27:hiroshima-thunders': [
    { name: 'Camisa autêntica Hiroshima Thunders 2026/27', price: '¥ 29.700', url: 'https://www.store.jt-volleyball.com/shopbrand/TH_CT01/', note: 'Verifique disponibilidade e variações na loja' },
  ],
  'svleague-japao-2026-27:tokyo-great-bears': [
    { name: 'Camisa autêntica Tokyo Great Bears 2026/27', price: '¥ 22.000', url: 'https://fan.tokyo-greatbears.com/s/tlb/page/goods', note: 'Preço observado na loja oficial; escolha o jogador' },
  ],
};

export default function VerifiedVolleyMerchandise({ teamId }: { teamId: string }) {
  const items = VERIFIED_REFERENCES[teamId] || [];
  if (items.length === 0) return null;
  return <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4" aria-label="Referências verificadas da loja oficial">
    <div>
      <h3 className="text-sm font-bold text-white">Camisas encontradas na loja oficial</h3>
      <p className="mt-1 text-xs text-zinc-400">Preços de referência na moeda original da loja, sem conversão para reais. Estes links não integram o carrinho CoreMotion; estoque e envio são confirmados no fornecedor.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4 transition hover:border-red-500/60">
        <div className="flex items-start justify-between gap-2"><p className="text-xs font-bold text-white">{item.name}</p><span className="shrink-0 text-xs font-extrabold text-red-400">{item.price}</span></div>
        <p className="mt-2 text-[11px] text-zinc-500">{item.note}</p><p className="mt-3 text-[11px] font-semibold text-red-300">Consultar produto na loja oficial ↗</p>
      </a>)}
    </div>
  </section>;
}
