import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
it('remove pedidos cancelados da lista e usa a lista ativa no estado vazio',()=>{
 const source=readFileSync('components/commerce/OrdersPage.tsx','utf8');
 assert.match(source,/const activeOrders=orders.filter\(order=>order.status!=='cancelled'\)/);
 assert.match(source,/activeOrders.map\(order=><OrderCard/);
 assert.match(source,/!loading&&!activeOrders.length&&!error/);
 assert.doesNotMatch(source,/\{orders.map\(order=><OrderCard/);
 assert.match(source,/await reviewSale\(order.id,status,note\);await refresh\(\)/);
});
