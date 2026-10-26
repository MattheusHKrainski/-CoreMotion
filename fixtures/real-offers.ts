import type { ExternalOffer } from '@/lib/types';

/** Revisão manual em 25/10/2026: página do produto + foto da própria galeria.
 * Não usar resultados de busca como oferta. Preço/estoque continuam sujeitos à loja.
 * Itens antigos sem correspondência confirmada foram retirados, não substituídos por similares.
 */
const shop = 'https://www.decathlon.com.br/';
const photo = (id: string, filename: string) => `https://decathlonpro.vtexassets.com/arquivos/ids/${id}/${filename}.jpg`;

export const INITIAL_EXTERNAL_OFFERS: ExternalOffer[] = [
  {
    id: 'offer-decathlon-bjj-8920531',
    title: 'Kimono Adulto de Jiu-Jitsu GI Outshock 500 Preto',
    description: 'Modelo 8920531, preto. Tecido de 450 g/m² e reforços nos joelhos, ombros e axilas. Confira o tamanho disponível na página da loja.',
    store_name: 'Decathlon', category: 'Artes Marciais', sport: 'Jiu-Jitsu', price: 499.99,
    source_url: shop + 'kimono-adulto-de-jiu-jitsu-brasileiro-500-preto-8920531-outshock/p',
    image_url: photo('165327447', 'bjj-gi-500-v2-blue-a3-185-195cm-preta-a1-165-175cm1'),
    is_active: true, is_demo: false, created_at: '2026-10-25T12:00:00Z',
  },
  {
    id: 'offer-decathlon-basquete-8826693',
    title: 'Tênis Adulto de Basquete Canaveral 900 Kipsta Preto',
    description: 'Modelo 8826693, preto, com amortecimento V-FOAM e cano médio. Anúncio somente do tênis; não inclui bola. Numeração e condições de pagamento na loja.',
    store_name: 'Decathlon', category: 'Calçados', sport: 'Basquete', price: 549.99,
    source_url: shop + 'tenis-masculino-de-basquete-canaveral-900-mid-preto-8826693-kipsta/p',
    image_url: photo('178921311', 'packshot-codigo-modelo-8826693'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:59:00Z',
  },
  {
    id: 'offer-decathlon-corda-8639002',
    title: 'Corda Adulta de Pular de Treino Domyos Preta',
    description: 'Modelo 8639002, preto, com corda ajustável de 3 metros em PVC. Indicada para iniciação e velocidade moderada, sem rolamentos. Não inclui elásticos.',
    store_name: 'Decathlon', category: 'Equipamentos', sport: 'Musculação', price: 17.99, original_price: 19.99,
    source_url: shop + 'corda-de-pular-de-treino-basica-8639002-domyos/p',
    image_url: photo('43362978', '--corda-100-pto-no-size1'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:58:00Z',
  },
  {
    id: 'offer-decathlon-tenis-8808874',
    title: 'Conjunto de Tênis Adulto Essential Decathlon Preto',
    description: 'Modelo 8808874: duas raquetes de alumínio de 270 g, duas bolas e uma bolsa de transporte. Conjunto para começar a jogar tênis.',
    store_name: 'Decathlon', category: 'Equipamentos', sport: 'Tênis', price: 399.99,
    source_url: shop + 'conjunto-de-2-raquetes-de-tenis-essential-adulto-2-bolas-e-1-bolsa-preto-8808874-decathlon/p',
    image_url: photo('170246474', 'packshot-codigo-modelo-8808874'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:57:00Z',
  },
  {
    id: 'offer-decathlon-trail-8911457',
    title: 'Mochila de Hidratação 8L Trail Running Kiprun Cinza',
    description: 'Modelo 8911457, cinza, com dez bolsos e bolsa de água de 1 litro inclusa. Os dois frascos frontais de 500 ml não estão inclusos.',
    store_name: 'Decathlon', category: 'Acessórios', sport: 'Corrida', price: 499.99,
    source_url: shop + 'mochila-de-trail-running-8l-cinza-8911457-kiprun/p',
    image_url: photo('170550376', 'packshot-codigo-modelo-8911457'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:56:00Z',
  },
  {
    id: 'offer-decathlon-volei-8972765',
    title: 'Bola de Vôlei VNL VB500 Tamanho 5 Kipsta Laranja',
    description: 'Modelo 8972765, laranja. Bola de quadra tamanho 5, de 260 a 280 g, com revestimento sintético e construção termossoldada.',
    store_name: 'Decathlon', category: 'Equipamentos', sport: 'Vôlei', price: 107.99, original_price: 119.99,
    // A loja mantém "azul" no slug, mas o produto, a cor selecionada e a foto são laranja.
    source_url: shop + 'bola-de-volei-vnl-vb500-tamanho-5-azul-8972765-kipsta/p',
    image_url: photo('174442237', 'bola-de-volei-kipsta-vnl-vb500-tamanho-5'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:55:00Z',
  },
  {
    id: 'offer-decathlon-karate-8914337',
    title: 'Kimono Adulto de Karatê 100 Outshock Branco',
    description: 'Modelo 8914337, branco, com tecido de algodão e poliéster de 220 g/m². Indicado para iniciação. Faixa e luvas não inclusas.',
    store_name: 'Decathlon', category: 'Artes Marciais', sport: 'Karatê', price: 249.99,
    source_url: shop + 'kimono-de-karate-100-branco-8914337-outshock/p',
    image_url: photo('169563564', 'karate-100-adult-new-200-cm-branco-60cm1'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:54:00Z',
  },
  {
    id: 'offer-decathlon-umbro-2145645567',
    title: 'Chuteira Campo Umbro Ultimate',
    description: 'Referência MP-2145645567, vendida pela Umbro no marketplace Decathlon. Chuteira para campo com cabedal sintético e solado FG. Confira a variante e numeração disponíveis.',
    store_name: 'Decathlon', category: 'Calçados', sport: 'Futebol', price: 159.99, original_price: 229.99,
    source_url: shop + 'chuteira-campo-umbro-ultimate-2145645567/p',
    image_url: photo('146863944', '17190060914710'),
    is_active: true, is_demo: false, created_at: '2026-10-25T11:53:00Z',
  },
];

/** Identificadores da curadoria anterior. Não representam anúncios criados pelo administrador. */
export const LEGACY_SEARCH_OFFERS: Record<string, string> = {
  'offer-aliexpress-gps-bike': 'https://pt.aliexpress.com/w/wholesale-ciclocomputador-gps-xoss.html',
  'offer-centauro-kimono-bjj': 'https://www.centauro.com.br/busca?q=kimono+jiu+jitsu+azul',
  'offer-aliexpress-fone-osseo': 'https://pt.aliexpress.com/w/wholesale-fone-conducao-ossea-esportivo.html',
  'offer-netshoes-kit-basquete': 'https://www.netshoes.com.br/busca?nsCat=Natural&q=tenis+basquete+masculino',
  'offer-mercadolivre-kit-cross': 'https://lista.mercadolivre.com.br/kit-corda-speed-rope-super-band',
  'offer-amazon-raquete-tenis': 'https://www.amazon.com.br/s?k=raquete+de+tenis+grafite+adulto',
  'offer-decathlon-colete-hidratacao': 'https://www.decathlon.com.br/pesquisa?q=colete+hidratacao+corrida',
  'offer-mercadolivre-bola-volei': 'https://lista.mercadolivre.com.br/bola-volei-oficial-quadra-profissional',
  'offer-amazon-kimono-karate': 'https://www.amazon.com.br/s?k=kimono+karate+adulto+lona',
  'offer-netshoes-chuteira-campo': 'https://www.netshoes.com.br/busca?nsCat=Natural&q=chuteira+campo',
  'offer-olympikus-corre-3': 'https://www.olympikus.com.br/corre',
  'offer-decathlon-camiseta-dry': 'https://www.decathlon.com.br/pesquisa?q=camiseta+dry+treino+masculina',
};
