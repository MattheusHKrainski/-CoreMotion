import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMO_PAYMENT_METHODS, demoPaymentLabel, demoPaymentReference } from '@/lib/demo-payments';

it('oferece os quatro métodos sem credenciais de cobrança', () => {
  assert.deepEqual(DEMO_PAYMENT_METHODS.map(m => m.id), ['pix','credit','debit','boleto']);
  assert.equal(demoPaymentLabel('credit'),'Cartão de crédito');
  assert.equal(demoPaymentLabel(null),'Não informado');
  assert.match(demoPaymentReference('pix','12345678-0000-0000-0000-000000000000'),/^COREMOTION-DEMONSTRACAO-PIX-/);
  assert.doesNotMatch(demoPaymentReference('pix','12345678-0000-0000-0000-000000000000'), /^000201/);
});

it('checkout confirma pedido atomicamente e só limpa o carrinho depois da resposta', () => {
  const page = readFileSync('components/commerce/CheckoutPage.tsx','utf8');
  const service = readFileSync('services/commerce.ts','utf8');
  assert.match(page, /confirmDemoSale\(/);
  assert.match(page, /setSaved\(id\)/);
  assert.ok(page.indexOf('setSaved(id)') < page.indexOf('cart.clear()'));
  assert.match(service, /rpc\('confirm_demo_order'/);
  assert.doesNotMatch(page, /simulateSalePayment\(/);
});

it('script SQL é idempotente e protege a confirmação por dono e chave da requisição', () => {
  const sql = readFileSync('supabase/migrations/20261123073833_simulated_checkout_payment_methods.sql','utf8');
  assert.match(sql, /CREATE OR REPLACE FUNCTION public.confirm_demo_order/);
  assert.match(sql, /prepare_core_sale\(p_items,p_address,p_request_key\)/);
  assert.match(sql, /owner=auth.uid\(\)/);
  assert.match(sql, /payment_method=p_method/);
  assert.match(sql, /REVOKE ALL ON FUNCTION public.confirm_demo_order/);
});
