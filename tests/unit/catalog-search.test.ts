import { it } from 'node:test';
import assert from 'node:assert/strict';
import { matchesCatalogSearch, catalogSearchScore } from '@/lib/catalog-search';
it('encontra termos fora de ordem em nome, marca e descrição sem acentos', () => {
 assert.ok(matchesCatalogSearch('corrida olympikus tenis', 'Tênis masculino Olympikus', 'Ideal para corrida'));
 assert.ok(matchesCatalogSearch('quero uma bola de volei', 'Bola profissional de vôlei'));
 assert.ok(matchesCatalogSearch('luvas boxe', 'Luva para boxe'));
 assert.ok(!matchesCatalogSearch('tenis azul', 'Tênis vermelho'));
 assert.ok(matchesCatalogSearch('42 nike', 'Nike', 'Numeração 42'));
 assert.ok(matchesCatalogSearch('', 'Qualquer produto'));
});
it('prioriza correspondências no título sem ignorar palavras obrigatórias', () => {
 assert.ok(catalogSearchScore('tenis corrida', 'Tênis de corrida') > catalogSearchScore('tenis corrida', 'Calçado esportivo'));
 assert.ok(!matchesCatalogSearch('nike 42', 'Nike tamanho 40'));
});
