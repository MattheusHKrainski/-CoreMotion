import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(file:string)=>readFileSync(file,'utf8');
it('rodapé unifica links sem misturar negociação e totais dos vendedores',()=>{
 const footer=read('components/shared/Footer.tsx');
 assert.match(footer,/href="\/pedidos"[^>]*>Pedidos<\/a>/);
 assert.match(footer,/href="\/compras"[^>]*>Carrinho<\/a>/);
 assert.doesNotMatch(footer,/Pedidos de atletas|Pedidos CoreMotion|Carrinho CoreMotion|Carrinho de atletas/);
 const cart=read('components/commerce/CheckoutPage.tsx');
 assert.match(cart,/Vendido pela CoreMotion/);
 assert.match(cart,/Vendido por atletas/);
 assert.match(cart,/sellerContactUrl/);
 assert.match(cart,/não entram no pedido nem no subtotal CoreMotion/);
 const orders=read('components/commerce/OrdersPage.tsx');
 assert.match(orders,/<AthleteOrderHistory/);
 assert.match(read('components/commerce/AthleteOrderHistory.tsx'),/getMyOrders\(userId,true\)/);
});
