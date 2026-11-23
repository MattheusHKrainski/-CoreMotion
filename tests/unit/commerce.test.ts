import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EMPTY_ADDRESS, validateAddress, validateCart, retailPriceCents, priceWithMargin, productPath } from '@/lib/commerce';
import { createPayment, quoteShipping } from '@/lib/commerce-adapters';
import { POST as payment } from '@/app/api/commerce/payment/route';
import { POST as shipping } from '@/app/api/commerce/shipping/route';

it('valida carrinho próprio sem aceitar preços de clientes, quantidades inválidas ou duplicatas', () => {
  assert.deepEqual(validateCart([{offerId:'one',quantity:2,variant:'40',price:1}]), [{offerId:'one',quantity:2,variant:'40'}]);
  for(const value of [null, [], [{offerId:'one',quantity:0,variant:''}], [{offerId:'one',quantity:11,variant:''}], [{offerId:'one',quantity:1.5,variant:''}], [{offerId:'one',quantity:1,variant:''},{offerId:'one',quantity:1,variant:''}], Array.from({length:31},(_,i)=>({offerId:String(i),quantity:1,variant:''}))]) assert.throws(()=>validateCart(value));
});
it('endereço é obrigatório e sem valores fictícios pré-preenchidos', () => {
  assert.ok(Object.values(EMPTY_ADDRESS).every(value=>value===''));
  assert.throws(()=>validateAddress(EMPTY_ADDRESS));
  const valid={...EMPTY_ADDRESS,recipient:'Pessoa Teste',phone:'41999999999',postalCode:'80000-000',street:'Rua Teste',number:'1',district:'Centro',city:'Curitiba',state:'PR'};
  assert.doesNotThrow(()=>validateAddress(valid));
  assert.throws(()=>validateAddress({...valid,postalCode:'123'}));
  assert.throws(()=>validateAddress({...valid,state:'Paraná'}));
});
it('formação de preço usa centavos, acréscimo sobre custo e despesa fixa', () => {
  assert.equal(retailPriceCents(159.99),15999);
  assert.equal(priceWithMargin(10000,2500,199),12699);
  assert.throws(()=>priceWithMargin(10000,-1));
  assert.throws(()=>priceWithMargin(Number.MAX_SAFE_INTEGER,100000));
  assert.throws(()=>retailPriceCents(NaN));
});
it('gateway e logística falham fechados, sem cobrança, frete grátis fictício ou sucesso simulado', async () => {
  await assert.rejects(createPayment,/Pagamentos desativados/);
  assert.deepEqual((await quoteShipping()).quotes,[]);
  const paymentResponse=await payment(); assert.equal(paymentResponse.status,503);assert.equal((await paymentResponse.json()).success,false);
  const shippingResponse=await shipping();assert.equal(shippingResponse.status,503);assert.equal((await shippingResponse.json()).status,'unavailable');
});
it('URLs completas distinguem produtos CoreMotion e anúncios C2C', () => {
  assert.equal(productPath('core','id com espaço'),'/produto/core/id%20com%20espa%C3%A7o');
  assert.equal(productPath('athlete','123'),'/produto/athlete/123');
});
it('banco impede preço manipulado, pagamento aprovado e atualizações diretas dos pedidos', () => {
  const sql=readFileSync('supabase/migrations/20261106050000_core_commerce_preparation.sql','utf8');
  assert.match(sql,/CHECK\(payment_status='disabled'\)/);
  assert.match(sql,/CHECK\(total_cents IS NULL\)/);
  assert.match(sql,/round\(offer.price\*100\)/);
  assert.match(sql,/REVOKE ALL ON public.core_sale_orders FROM anon,authenticated/);
  assert.match(sql,/pg_advisory_xact_lock/);
  assert.match(sql,/UNIQUE\(owner,request_key\)/);
  assert.match(sql,/o.owner<>auth.uid\(\) OR p_status<>'cancelled'/);
  assert.match(sql,/public.core_sale_events/);
  assert.doesNotMatch(sql,/UPDATE public.orders|ALTER TABLE public.orders/);
});
it('variantes obrigatórias são verificadas também no banco', () => {
  const sql=readFileSync('supabase/migrations/20261106051000_core_commerce_variant_validation.sql','utf8');
  assert.match(sql,/BEFORE INSERT ON public.core_sale_orders/);
  assert.match(sql,/Informe a variante desejada/);
});
it('comunidade dispõe de descoberta lateral, busca, ordenação e mantém curtidas reais', () => {
  const source=readFileSync('components/CommunityView.tsx','utf8');
  assert.match(source,/Buscar na comunidade/); assert.match(source,/Ordenar publicações/);
  assert.match(source,/Explorar assuntos/); assert.match(source,/likeCommunityPost\(post.id\)/);
  assert.doesNotMatch(source,/11 mil|visitantes semanais|Continuar com Google/);
});
