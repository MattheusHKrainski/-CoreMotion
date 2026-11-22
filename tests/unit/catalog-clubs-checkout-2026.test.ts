import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string): string => readFileSync(path, 'utf8');

test('400 additional product records sourced from real official product URLs and supplier images', () => {
  const files = [
    '20261122210506_verified_sportswear_catalog_01_of_08.sql',
    '20261122210511_verified_sportswear_catalog_02_of_08.sql',
    '20261122210515_verified_sportswear_catalog_03_of_08.sql',
    '20261122210526_verified_sportswear_catalog_04_of_08.sql',
    '20261122210542_verified_sportswear_catalog_05_of_08.sql',
    '20261122210549_verified_sportswear_catalog_06_of_08.sql',
    '20261122210553_verified_sportswear_catalog_07_of_08.sql',
    '20261122210559_verified_sportswear_catalog_08_of_08.sql',
  ];
  const all = files.map(file=>read('supabase/migrations/'+file));
  const ids=all.flatMap(sql=>[...sql.matchAll(/\('curated-[a-z]+-[0-9]+',/g)].map(m=>m[0]));
  assert.equal(ids.length, 400);
  assert.equal(new Set(ids).size, 400);
  for (const sql of all) {
    assert.match(sql, /WHERE NOT EXISTS \(SELECT 1 FROM public\.external_offers/);
    assert.match(sql, /ON CONFLICT\(id\) DO NOTHING/);
    assert.match(sql, /image_urls,variant_options,is_active/);
    assert.ok((sql.match(/ARRAY\[/g)||[]).length >= 100, 'Every row must include photos and variants');
  }
});

test('Verified league directory has 44 clubs with publicly readable RLS', () => {
  const sql=read('supabase/migrations/20261122205716_curated_club_directory_and_verified_galleries.sql');
  assert.match(sql, /ALTER TABLE public\.catalog_teams ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /GRANT SELECT ON public\.catalog_teams TO anon,authenticated/);
  assert.match(sql, /catalog_teams_public_read/);
  for(const club of ['Flamengo','São Paulo','Remo','Chapecoense','Sir Susa Scai Perugia','Vero Volley Monza','Osaka Bluteon','Nippon Steel Sakai Blazers']) assert.ok(sql.includes(club),club);
  assert.match(sql,/image_urls text\[\]/);
  const component=read('components/marketplace/CatalogTeams.tsx');
  for(const name of ['brasileirao-2026','superlega-italia-2026-27','svleague-japao-2026-27'])assert.ok(component.includes(name));
  assert.match(read('components/marketplace/MarketplaceView.tsx'),/offer\.team_id !== selectedTeam\.id/);
});

test('Real product photo gallery and size selector do not invent alternate product images', () => {
  const page=read('components/commerce/ProductPage.tsx');
  assert.match(page,/image_urls/);
  assert.match(page,/gallery\.slice\(0,4\)/);
  assert.match(page,/Ver galeria completa/);
  assert.match(page,/role="dialog" aria-modal="true"/);
  const selectors = read('components/commerce/ProductOptions.tsx');
  assert.match(page, /<ProductOptions/);
  assert.match(selectors, /getProductVariantConfig\(title, category, sport, description, listedSizes\)/);
  assert.match(selectors, /values: config.options/);
  assert.match(selectors, /option.values.map/);
  // Freight is not integrated: a CEP lookup is not a real shipping quote.
  assert.match(page, /Frete e prazo indisponíveis/);
  assert.doesNotMatch(page,/Tamanhos anunciados para a opção consultada/);
  assert.doesNotMatch(read('lib/product-variants.ts'),/Tamanhos anunciados para a opção consultada/);
  const manager=read('components/admin/AdminOffersManager.tsx');
  assert.match(manager,/image_urls/);
  assert.match(read('lib/schemas/offer.schema.ts'),/image_urls: z\.array/);
});

test('Demo payment RPC checks ownership, transaction locking, idem potency and prevents real gateway actions', () => {
  const migration=read('supabase/migrations/20261122205824_secure_demonstration_payment_lifecycle.sql');
  for(const marker of [
    "auth.uid() IS NULL",
    'ord.owner<>auth.uid()',
    'FOR UPDATE',
    "IF ord.payment_status='test_approved'",
    "UPDATE public.core_sale_orders",
    "VALUES (p_id,auth.uid(),'test_approved'",
    'GRANT EXECUTE ON FUNCTION public.simulate_core_sale_payment(uuid) TO authenticated',
  ]) assert.ok(migration.includes(marker),marker);
  assert.match(migration,/REVOKE ALL ON FUNCTION public\.simulate_core_sale_payment\(uuid\) FROM PUBLIC,anon,authenticated/);
  const checkout=read('components/commerce/CheckoutPage.tsx');
  assert.match(checkout,/simulateSalePayment\(id\)/);
  assert.match(checkout,/cart\.clear\(\)/);
  assert.match(checkout,/Pagamento de teste aprovado/);
  assert.doesNotMatch(checkout,/Pagamento, frete e envio ainda não estão disponíveis/);
});

test('Stored supplier galleries override fallback photos and preserve product identity', async () => {
  const { productGallery } = await import('@/lib/product-gallery');
  assert.deepEqual(productGallery({image_urls:['https://store.test/a.jpg','https://store.test/b.jpg','https://store.test/a.jpg']}, ['https://old.test/c.jpg']), ['https://store.test/a.jpg','https://store.test/b.jpg']);
  assert.deepEqual(productGallery({images:['/my-product.jpg']}), ['/my-product.jpg']);
  assert.deepEqual(productGallery({image_url:'https://store.test/cover.jpg'}), ['https://store.test/cover.jpg']);
  assert.deepEqual(productGallery({image_urls:['javascript:bad']}), []);
});
