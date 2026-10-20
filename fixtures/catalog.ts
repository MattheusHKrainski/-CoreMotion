import type { Product, Store } from '@/lib/types';

/** Catálogo fictício exclusivo do modo de demonstração, sem gravação no banco. */
export const CATALOG_STORES: Store[] = [
  ['10000000-0000-4000-8000-000000000001', 'Core Street Sports', 'core-street-sports', 'Multiesportes & Outdoor'],
  ['10000000-0000-4000-8000-000000000002', 'Ritmo Running', 'ritmo-running', 'Corrida & Atletismo'],
  ['10000000-0000-4000-8000-000000000003', 'Move Training', 'move-training', 'Treino & Academia'],
].map(([id, name, slug, category]) => ({
  id, name, slug, category, owner_id: `seller-${slug}`,
  description: 'Equipamentos, calçados e roupas para acompanhar sua rotina esportiva.',
  logo_url: '/products/adidas-ultraboost-1.jpg',
  banner_url: '/products/jaqueta-corta-vento.jpg',
  is_verified: false, verification_status: 'none',
  contact_email: `${slug}@exemplo.test`, location: 'Curitiba, PR',
  rating: 4.8, sales_count: 0, products_count: 0,
  created_at: '2026-10-19T12:00:00Z',
}));

const items: [string, string, string, number, string, number][] = [
  ['Tênis urbano clássico', 'Calçados', 'Casual', 289.9, 'adidas-samba-og.jpg', 0],
  ['Moletom com capuz cinza', 'Vestuário', 'Casual', 179.9, 'moletom-cinza-capuz.png', 0],
  ['Tênis casual verde-oliva', 'Calçados', 'Casual', 249.9, 'puma-suede-1.jpg', 0],
  ['Tênis de corrida amortecimento diário', 'Calçados', 'Corrida', 499.9, 'asics-gel-nimbus-1.jpg', 1],
  ['Tênis casual branco', 'Calçados', 'Casual', 429.9, 'adidas-ultraboost-1.jpg', 1],
  ['Jaqueta corta-vento Running', 'Vestuário', 'Corrida', 219.9, 'jaqueta-corta-vento.jpg', 1],
  ['Camiseta respirável de treino', 'Vestuário', 'Treino', 89.9, 'camiseta-treino-preta.png', 2],
  ['Bermuda de compressão', 'Vestuário', 'Treino', 119.9, 'bermuda-compressao-preta.png', 2],
  ['Tênis de corrida branco e vermelho', 'Calçados', 'Corrida', 329.9, 'asics-japan-s-1.jpg', 2],
  ['Mochila esportiva multiuso', 'Acessórios', 'Aventura', 159.9, 'mochila-esportiva.jpg', 0],
  ['Boné leve para corrida', 'Acessórios', 'Corrida', 79.9, 'bone-aerobill-1.jpg', 1],
  ['Garrafa térmica verde', 'Acessórios', 'Treino', 99.9, 'garrafa-termica-1.jpg', 2],
  ['Camiseta de futebol Brasil 2024', 'Vestuário', 'Futebol', 139.9, 'brasil-camisa-amarela.png', 0],
  ['Camiseta para futebol e treino', 'Vestuário', 'Futebol', 89.9, 'camiseta-treino-preta.png', 2],
];

export const CATALOG_PRODUCTS: Product[] = items.flatMap(([title, category, sport, price, image, storeIndex], index) => {
  const store = CATALOG_STORES[storeIndex];
  return (['b2c', 'c2c'] as const).map((type, variant) => ({
    id: `20000000-0000-4000-8000-${String(index * 2 + variant + 1).padStart(12, '0')}`,
    title: type === 'c2c' ? `${title} — seminovo` : title,
    description: type === 'c2c'
      ? `Anúncio demonstrativo de ${title.toLowerCase()}; condição, disponibilidade e entrega não foram verificadas.`
      : `Item demonstrativo para ${sport.toLowerCase()}; descrição, disponibilidade e estoque são ilustrativos.`,
    price: type === 'c2c' ? Math.round(price * 60) / 100 : price,
    category, sport, condition: type === 'b2c' ? 'novo' : 'usado_excelente',
    product_type: type, images: [`/products/${image}`],
    seller_id: type === 'b2c' ? store.owner_id : index % 2 === 0 ? 'user-c2c-1' : 'user-c2c-2',
    seller_name: type === 'b2c' ? store.name : index % 2 === 0 ? 'Carlos Eduardo Ramos' : 'Marina Duarte',
    store_id: type === 'b2c' ? store.id : null,
    store_name: type === 'b2c' ? store.name : null,
    is_verified_store: false, stock: type === 'b2c' ? 12 : 1,
    location: 'Curitiba, PR', shipping_available: true, status: 'active',
    created_at: '2026-10-19T12:00:00Z', tags: [category, sport],
  }));
});

for (const store of CATALOG_STORES) {
  store.products_count = CATALOG_PRODUCTS.filter((p) => p.store_id === store.id).length;
}
