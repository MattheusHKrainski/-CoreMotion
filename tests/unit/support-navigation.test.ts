import { it } from 'node:test';
import assert from 'node:assert/strict';
import { HELP_SECTIONS, helpSection } from '@/lib/support';
it('agrupa ajuda sem perder categorias de protocolos antigos',()=>{
 assert.equal(HELP_SECTIONS.length,6);
 assert.equal(helpSection('delivery').id,'orders');
 assert.equal(helpSection('returns').id,'payments');
 assert.equal(helpSection('corporate').id,'contact');
 assert.equal(helpSection('size').id,'products');
 assert.equal(helpSection('general').label,'Central de Atendimento');
 assert.equal(HELP_SECTIONS.filter(item=>item.id==='size').length,0);
 assert.equal(new Set(HELP_SECTIONS.flatMap(item=>item.topics)).size,10);
});
