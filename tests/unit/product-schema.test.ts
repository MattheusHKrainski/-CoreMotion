/** Regras de publicação: o catálogo interno aceita somente anúncios C2C. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { productCreateSchema } from '../../lib/schemas/product.schema';

const validListing = {
  title: 'Tênis de corrida usado',
  description: 'Anúncio demonstrativo entre atletas para teste.',
  price: 250,
  category: 'Calçados',
  sport: 'Corrida',
  condition: 'usado_bom',
  images: ['https://example.test/tenis.jpg'],
};

describe('productCreateSchema', () => {
  it('aplica o tipo C2C por padrão', () => {
    const parsed = productCreateSchema.safeParse(validListing);
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(parsed.data.product_type, 'c2c');
  });

  it('recusa publicação B2C no catálogo interno', () => {
    const parsed = productCreateSchema.safeParse({ ...validListing, product_type: 'b2c' });
    assert.equal(parsed.success, false);
  });
});
