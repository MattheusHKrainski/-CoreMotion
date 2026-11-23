import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(path,'utf8');

test('Same-product fallback uses only the current gallery, never a stock replacement',()=>{
 const img=read('components/shared/ProductImage.tsx');
 assert.match(img,/fallbackSrcs/);
 assert.match(img,/\[\.\.\.new Set\(\[src, \.\.\.fallbackSrcs\]/);
 assert.match(img,/onError=\{\(\) => setFailed/);
 assert.doesNotMatch(img,/unsplash\.com|example\.com|image-unavailable\.svg/);
 for(const path of ['components/marketplace/ExternalOfferCard.tsx','components/marketplace/ExternalOfferModal.tsx','components/commerce/ProductPage.tsx']){
  assert.match(read(path),/fallbackSrcs=/,path);
 }
});

test('Products without manufacturer-confirmed sizes cannot be added to the cart',()=>{
 const detail=read('components/commerce/ProductPage.tsx');
 assert.match(detail,/missingVerifiedSizes/);
 assert.match(detail,/!coreOffer.variant_options.includes\(variant\)/);
 assert.match(detail,/needsVariant && !variant.trim\(\)/);
 assert.match(detail,/A numeração deste modelo ainda não foi confirmada no catálogo/);
 assert.doesNotMatch(detail,/Consultar tamanhos na loja|Ver produto na loja|Referência de/);
 assert.match(detail,/disabled=\{!available \|\| soldOut \|\| variantRequired\}/);
 const controls=read('components/commerce/ProductOptions.tsx');
 assert.match(controls,/hasCatalogSizes/);
 assert.match(controls,/onChange\(selected\.Tamanho/);
 assert.doesNotMatch(controls,/Outra variante desejada/);
});

test('Postgres prevents photo-primary mismatch and preserves gallery on cover replacement',()=>{
 const migrations=readdirSync('supabase/migrations').filter(name=>name.includes('protect_verified_product_galleries_and_fix_c2c_photos'));
 assert.equal(migrations.length,1);
 const sql=read('supabase/migrations/'+migrations[0]);
 assert.match(sql,/CREATE TRIGGER external_offers_normalize_gallery/);
 assert.match(sql,/NEW\.image_url IS DISTINCT FROM OLD\.image_url/);
 assert.match(sql,/image_url=image_urls\[1\]/);
 assert.match(sql,/images\[3\] LIKE 'https:\/\/images\.unsplash\.com\/%'/);
});

test('Confirmed same-item manufacturer galleries and descriptions are versioned in migrations',()=>{
 const batches=readdirSync('supabase/migrations').filter(name=>name.includes('verified_same_sku_photos_and_details_'));
 assert.equal(batches.length,10);
 for(const file of batches){
  const sql=read('supabase/migrations/'+file);
  assert.match(sql,/expected_images/);
  assert.match(sql,/offer\.image_url=verified\.main_image/);
  assert.match(sql,/offer\.description=verified\.expected_description/);
 }
});
