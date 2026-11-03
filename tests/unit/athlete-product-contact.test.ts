import { it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import ProductDetailModal from '@/components/marketplace/ProductDetailModal';
import ProductCard from '@/components/marketplace/ProductCard';
import type { Product } from '@/lib/types';

const product: Product = {
  id: 'single-athlete-item', title: 'Tênis do atleta', description: 'Par azul, numeração 41.',
  price: 180, category: 'Calçados', sport: 'Corrida', condition: 'usado_bom',
  product_type: 'c2c', images: [], seller_id: 'seller', seller_name: 'Atleta',
  contact_phone: '(41) 98891-8146', stock: 1, status: 'active', created_at: '2026-11-03T12:00:00Z',
};
const render = (item: Product, card = false) => renderToStaticMarkup(
  React.createElement(CoreMotiomProvider, null,
    card ? React.createElement(ProductCard, { product: item }) :
      React.createElement(ProductDetailModal, { product: item, onClose() {} })),
);

it('anúncio individual preserva descrição, sem seletores, compra direta ou condições comerciais inventadas', () => {
  for (const category of ['Calçados', 'Vestuário', 'Roupas', 'Equipamentos']) {
    const html = render({ ...product, category });
    assert.match(html, /Par azul, numeração 41/);
    assert.doesNotMatch(html, /Selecione|Tabela de Medidas|Guia de Caimento|Comprar Agora|Converse com o vendedor antes de comprar|Confirme o estado do produto|12x|desconto no pagamento|Calcular frete/);
    assert.match(html, /Adicionar ao Carrinho/);
    assert.match(html, /Falar com o atleta pelo WhatsApp/);
    assert.match(html, /href="https:\/\/wa.me\/5541988918146\?text=/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  }
});
it('sem telefone válido não exibe link de WhatsApp ou caminho alternativo de compra', () => {
  for (const contact_phone of [undefined, '', '123', 'telefone']) {
    const html = render({ ...product, contact_phone });
    assert.match(html, /WhatsApp não informado pelo atleta/);
    assert.doesNotMatch(html, /wa.me|Comprar Agora/);
  }
});
it('não apresenta o aviso de conservação a confirmar como tempo de uso no catálogo de referência', () => {
  const item = { ...product, image_is_reference: true, usage_time: 'Conservação a confirmar com o anunciante' };
  for (const card of [false, true]) {
    const html = render(item, card);
    assert.doesNotMatch(html, /Conservação a confirmar com o anunciante/);
    assert.match(html, /Imagem de referência/);
  }
  assert.match(render({ ...product, usage_time: 'Dois meses' }), /Dois meses/);
});
