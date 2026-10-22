import type { Product, Store } from '@/lib/types';

/** Catálogo inicial de lojas e equipamentos esportivos da plataforma. */
export const CATALOG_STORES: Store[] = [
  ['10000000-0000-4000-8000-000000000001', 'Core Street Sports', 'core-street-sports', 'Multiesportes & Outdoor'],
  ['10000000-0000-4000-8000-000000000002', 'Ritmo Running', 'ritmo-running', 'Corrida & Atletismo'],
  ['10000000-0000-4000-8000-000000000003', 'Move Training', 'move-training', 'Treino & Academia'],
].map(([id, name, slug, category]) => ({
  id, name, slug, category, owner_id: `seller-${slug}`,
  description: 'Equipamentos, calçados e vestuário técnico selecionados para alta performance esportiva.',
  logo_url: '/products/adidas-ultraboost-1.jpg',
  banner_url: '/products/jaqueta-corta-vento.jpg',
  is_verified: true, verification_status: 'verified',
  contact_email: `contato@${slug}.com.br`, location: 'Curitiba, PR',
  rating: 4.9, sales_count: 140, products_count: 0,
  created_at: '2026-10-19T12:00:00Z',
}));

const items: [string, string, string, number, string, number, string][] = [
  ['Tênis Adidas Samba OG Couro', 'Calçados', 'Casual', 289.9, 'adidas-samba-og.jpg', 0, 'Adidas'],
  ['Moletom Esportivo Capuz Fleece', 'Vestuário', 'Casual', 179.9, 'moletom-cinza-capuz.png', 0, 'Nike'],
  ['Tênis Puma Suede Classic XXI', 'Calçados', 'Casual', 249.9, 'puma-suede-1.jpg', 0, 'Puma'],
  ['Tênis Asics Gel-Nimbus 26 Masculino', 'Calçados', 'Corrida', 499.9, 'asics-gel-nimbus-1.jpg', 1, 'Asics'],
  ['Tênis Adidas Ultraboost Light', 'Calçados', 'Casual', 429.9, 'adidas-ultraboost-1.jpg', 1, 'Adidas'],
  ['Jaqueta Corta-Vento Impermeável Running', 'Vestuário', 'Corrida', 219.9, 'jaqueta-corta-vento.jpg', 1, 'Track&Field'],
  ['Camiseta Dry-Fit Respirável de Treino', 'Vestuário', 'Treino', 89.9, 'camiseta-treino-preta.png', 2, 'Nike'],
  ['Bermuda de Compressão Térmica', 'Vestuário', 'Treino', 119.9, 'bermuda-compressao-preta.png', 2, 'Under Armour'],
  ['Tênis Asics Japan S Couro Branco/Vermelho', 'Calçados', 'Corrida', 329.9, 'asics-japan-s-1.jpg', 2, 'Asics'],
  ['Mochila Esportiva Impermeável 28L', 'Acessórios', 'Aventura', 159.9, 'mochila-esportiva.jpg', 0, 'Nike'],
  ['Boné Nike AeroBill Featherlight', 'Acessórios', 'Corrida', 79.9, 'bone-aerobill-1.jpg', 1, 'Nike'],
  ['Garrafa Térmica Inox Parede Dupla 750ml', 'Acessórios', 'Treino', 99.9, 'garrafa-termica-1.jpg', 2, 'Stanley'],
  ['Camisa Oficial Seleção Brasileira Torcedor', 'Vestuário', 'Futebol', 139.9, 'brasil-camisa-amarela.png', 0, 'Nike'],
  ['Camiseta Técnica Futebol & Funcional', 'Vestuário', 'Futebol', 89.9, 'camiseta-treino-preta.png', 2, 'Adidas'],
];

export const CATALOG_PRODUCTS: Product[] = items.flatMap(([title, category, sport, price, image, storeIndex, brand], index) => {
  const store = CATALOG_STORES[storeIndex];
  return (['b2c', 'c2c'] as const).map((type, variant) => ({
    id: `20000000-0000-4000-8000-${String(index * 2 + variant + 1).padStart(12, '0')}`,
    title: type === 'c2c' ? `${title} — Seminovo` : title,
    description: type === 'c2c'
      ? `${title} em excelente estado de conservação, revisado e higienizado, com mínimo desgaste de uso e pronto para treinos e provas.`
      : `${title} original com acabamento técnico de alta durabilidade, conforto térmico e envio imediato para todo o Brasil.`,
    price: type === 'c2c' ? Math.round(price * 60) / 100 : price,
    original_price: type === 'c2c' ? price : undefined,
    category, sport, condition: type === 'b2c' ? 'novo' : 'usado_excelente',
    product_type: type, images: [`/products/${image}`],
    brand,
    seller_id: type === 'b2c' ? store.owner_id : index % 2 === 0 ? 'user-c2c-1' : 'user-c2c-2',
    seller_name: type === 'b2c' ? store.name : index % 2 === 0 ? 'Carlos Eduardo Ramos' : 'Marina Duarte',
    store_id: type === 'b2c' ? store.id : null,
    store_name: type === 'b2c' ? store.name : null,
    is_verified_store: type === 'b2c', stock: type === 'b2c' ? 12 : 1,
    location: 'Curitiba, PR', shipping_available: true, status: 'active',
    created_at: '2026-10-19T12:00:00Z', tags: [category, sport, brand],
  }));
});

for (const store of CATALOG_STORES) {
  store.products_count = CATALOG_PRODUCTS.filter((p) => p.store_id === store.id).length;
}
