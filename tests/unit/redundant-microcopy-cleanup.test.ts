import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('Home editorial banners do not render repetitive photographic and pricing disclaimers', () => {
  const campaigns = read('components/HomeVerifiedCampaigns.tsx');
  const launches = read('components/HomeRealLaunches.tsx');
  const discounts = read('components/HomeBlackFriday.tsx');
  const carousel = read('components/HomeProductCarousel.tsx');
  const landing = read('components/WelcomeCatalog.tsx');

  for (const copy of [
    'Fotos dos produtos do catálogo. Preços e disponibilidade sujeitos à atualização.',
    'Campanhas por modalidade com produtos e preços do catálogo.',
    'abaixo do preço de referência',
  ]) assert.ok(!campaigns.includes(copy), copy);
  for (const copy of [
    'Anúncios oficiais, não ofertas inventadas',
    'Imagem divulgada pela marca',
    'não é fotografia do produto',
    'Fontes: comunicados oficiais das marcas.',
    'Produtos da mesma modalidade; não são o lançamento anunciado acima.',
  ]) assert.ok(!launches.includes(copy), copy);
  assert.match(launches, /Arte conceitual/);
  assert.match(launches, /current\.availability/);

  assert.doesNotMatch(discounts, /fotos e preços de referência verificados|Descontos calculados sobre preços de referência/);
  assert.doesNotMatch(carousel, /Veja cores, fotos e tamanhos disponíveis no catálogo|Negocie diretamente com o anunciante/);
  assert.doesNotMatch(landing, /Produtos de atletas e ofertas de lojas, com fotos e preços/);
  assert.match(campaigns, /Conhecer produto/);
  assert.match(discounts, /ATÉ/);
});

test('CoreShop removes image-reference microcopy but keeps meaningful item and stock warnings', () => {
  const catalog = read('components/marketplace/MarketplaceView.tsx');
  const offerModal = read('components/marketplace/ExternalOfferModal.tsx');
  const athleteCard = read('components/marketplace/ProductCard.tsx');
  const athleteModal = read('components/marketplace/ProductDetailModal.tsx');
  const productPage = read('components/commerce/ProductPage.tsx');
  const checkout = read('components/commerce/CheckoutPage.tsx');

  assert.doesNotMatch(catalog, /Consulte fotos, tamanhos e preços de referência de cada produto/);
  assert.doesNotMatch(offerModal, /Preço de referência\. Confira na loja|A loja abre em nova aba\. Se o navegador bloquear/);
  assert.doesNotMatch(athleteCard, /Imagem de referência · exemplar não verificado/);
  assert.doesNotMatch(athleteModal, /Imagem de referência, não do exemplar anunciado/);
  assert.doesNotMatch(productPage, /Imagem de referência fornecida pelo anunciante|imagem[s]? do produto<\/span>/);
  for(const component of [athleteCard, athleteModal, productPage]) assert.ok(component.includes('Foto ilustrativa'));
  assert.match(athleteCard, /disabled=\{!hasIdentifiedSeller/);
  assert.match(productPage, /soldOut/);
  assert.match(checkout, /nenhuma cobrança financeira é realizada/);
});
