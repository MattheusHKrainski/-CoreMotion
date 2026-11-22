import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getProductVariantConfig } from '../../lib/product-variants';

describe('product variants for catalog', () => {
  it('offers Brazilian footwear sizes without repetitive inventory warning labels', () => {
    const result = getProductVariantConfig('Tênis Nike de corrida', 'Calçados', 'Corrida');
    assert.ok(result);
    assert.equal(result.label, 'Numeração (BR)');
    assert.deepEqual(result.options, ['34','35','36','37','38','39','40','41','42','43','44','45']);
    assert.equal(result.note, '');
  });
  it('offers clothing sizes for apparel', () => {
    const result = getProductVariantConfig('Camiseta Adidas', 'Vestuário', 'Treinamento');
    assert.ok(result);
    assert.deepEqual(result.options, ['PP','P','M','G','GG','XGG']);
  });
  it('offers adult gi sizes only for kimono products', () => {
    const result = getProductVariantConfig('Kimono Jiu-Jitsu Adulto', 'Lutas', 'Jiu-Jitsu');
    assert.ok(result);
    assert.deepEqual(result.options, ['A0','A1','A2','A3','A4','A5']);
    assert.equal(getProductVariantConfig('Luva de treino', 'Equipamentos', 'Jiu-Jitsu')?.label, 'Tamanho da luva');
  });
  it('uses fixed or sport-specific ball sizing', () => {
    assert.equal(getProductVariantConfig('Bola de Vôlei Penalty', 'Equipamentos', 'Vôlei')?.fixedValue, '5');
    assert.deepEqual(getProductVariantConfig('Bola de Basquete', 'Equipamentos', 'Basquete')?.options, ['5','6','7']);
    assert.deepEqual(getProductVariantConfig('Bola de Futebol', 'Equipamentos', 'Futebol')?.options, ['3','4','5']);
    assert.equal(getProductVariantConfig('Bola Adidas tamanho 7', 'Equipamentos', 'Basquete')?.fixedValue, '7');
    assert.equal(getProductVariantConfig('Bola de Basquete Wilson', 'Equipamentos', 'Basquete', 'Tamanho oficial 7 segundo o vendedor.')?.fixedValue, '7');
  });

  it('never shows clothing sizes for a football ball when descriptions contain apparel terms', () => {
    const ball = getProductVariantConfig('Bola De Campo Umbro Cerâmica 2.0', 'Equipamentos', 'Futebol', 'Combina com camiseta e uniformes esportivos.');
    assert.deepEqual(ball?.options, ['5']);
    assert.equal(ball?.fixedValue, '5');
    assert.equal(ball?.label, 'Tamanho da bola');
  });
  it('does not invent variant selectors for fixed-size equipment/accessories', () => {
    assert.equal(getProductVariantConfig('Garrafa 600 ml', 'Acessórios', 'Treinamento'), null);
    assert.equal(getProductVariantConfig('Halter 3 kg', 'Equipamentos', 'Musculação'), null);
  });
});

it('usa apenas a grade capturada para o modelo e distingue esporte de calçado', () => {
  const shoe = getProductVariantConfig('Chuteira Futsal', 'Calçados', 'Futsal', '', ['40', '42']);
  assert.deepEqual(shoe?.options, ['40', '42']);
  assert.equal(getProductVariantConfig('Raquete de tênis', 'Equipamentos', 'Tênis'), null);
  assert.equal(getProductVariantConfig('Camiseta', 'Vestuário', 'Treinamento', '', ['M'])?.fixedValue, 'M');
});


it('does not duplicate or keep blank manufacturer SKU sizes', () => {
  const config = getProductVariantConfig('Tênis Fila', 'Calçados', 'Corrida', '', ['40', ' 40 ', '', '41']);
  assert.deepEqual(config?.options, ['40', '41']);
});
