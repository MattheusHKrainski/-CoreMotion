import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {positionKey,savedPosition} from '@/lib/page-position';
it('separa posições por seção e por página de produto',()=>{
 assert.notEqual(positionKey('/','community'),positionKey('/','marketplace'));
 assert.notEqual(positionKey('/produto/core/1','home'),positionKey('/produto/core/2','home'));
 assert.equal(positionKey('/compras','community'),positionKey('/compras','home'));
});
it('recupera apenas coordenadas recentes e válidas sem guardar dados da conta',()=>{
 const now=100000000;
 assert.equal(savedPosition(JSON.stringify({y:980,at:now-1000}),now),980);
 assert.equal(savedPosition(JSON.stringify({y:0,at:now}),now),0);
 for(const raw of [null,'bad','{}','null',JSON.stringify({y:-1,at:now}),JSON.stringify({y:'10',at:now}),JSON.stringify({y:10,at:0}),JSON.stringify({y:10,at:now+1})])assert.equal(savedPosition(raw,now),null);
});
it('preserva seção na URL e restaura rolagem somente no reload',()=>{
 const store=readFileSync('lib/store.tsx','utf8');assert.match(store,/url.searchParams.set\('view', view\)/);assert.match(store,/window.history.replaceState\(window.history.state/);
 const source=readFileSync('components/PagePosition.tsx','utf8');assert.match(source,/navigation\?\.type==='reload'/);assert.match(source,/new ResizeObserver/);assert.match(source,/sessionStorage.setItem/);assert.match(source,/wheel',interrupt/);assert.match(source,/pagehide',write/);assert.doesNotMatch(source,/localStorage/);
});
it('explorar modalidade abre o catálogo no topo após atualizar a seção',()=>{
 const source=readFileSync('components/HomeHeroAndHighlights.tsx','utf8');
 assert.match(source,/setLaunchSport\(sport\); openMarketplace\(\)/);
 assert.match(source,/setActiveView\('marketplace'\);[\s\S]*?requestAnimationFrame\(\(\) => window.scrollTo\(\{ top: 0, behavior: 'instant' \}\)\)/);
});
it('assuntos da comunidade não exibem prefixo c/',()=>{
 const source=readFileSync('components/CommunityView.tsx','utf8');
 assert.doesNotMatch(source,/c\/\{topic.label\}/);
 assert.match(source,/>\{topic.label\}<\/button>/);
});
