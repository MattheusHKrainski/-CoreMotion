import { it } from 'node:test';
import assert from 'node:assert/strict';
import { matchesSport } from '@/lib/modalities';
import { normalizePhone, validPhone, sellerContactUrl } from '@/lib/seller-contact';
import { productCreateSchema } from '@/lib/schemas/product.schema';

it('busca modalidades parcialmente e sem depender de acentos', () => {
  assert.ok(matchesSport('Ginástica artística', 'ginastica'));
  assert.ok(matchesSport('Jiu-Jitsu', 'jiu'));
  assert.ok(matchesSport(undefined, ''));
  assert.ok(!matchesSport(undefined, 'tenis'));
});
it('normaliza telefones e monta contato seguro sem inventar números em anúncios antigos', () => {
  assert.equal(normalizePhone('(41) 99999-9999'), '5541999999999');
  assert.ok(validPhone('+55 41 99999-9999'));
  assert.ok(!validPhone('123'));
  assert.equal(sellerContactUrl(null, 'Antigo'), null);
  assert.match(sellerContactUrl('(41) 99999-9999', 'Tênis & raquete')!, /^https:\/\/wa.me\/5541999999999\?text=/);
});
it('exige telefone para publicar e rejeita contato inválido na API', () => {
  const listing = { title: 'Tênis usado', description: 'Tênis com poucos meses de uso', price: 120, category: 'Calçados', sport: 'Corrida', condition: 'usado_bom', images: ['https://example.test/photo.jpg'] };
  assert.equal(productCreateSchema.safeParse(listing).success, false);
  assert.equal(productCreateSchema.safeParse({ ...listing, contact_phone: '123' }).success, false);
  const parsed = productCreateSchema.safeParse({ ...listing, contact_phone: '(41) 99999-9999' });
  assert.ok(parsed.success);
  if (parsed.success) assert.equal(parsed.data.contact_phone, '5541999999999');
});
