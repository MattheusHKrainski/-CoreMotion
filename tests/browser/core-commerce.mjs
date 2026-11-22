import { INITIAL_EXTERNAL_OFFERS } from '../../fixtures/real-offers.ts';
import { INITIAL_PRODUCTS } from '../../fixtures/initial-data.ts';
// Optional browser-test dependencies are installed outside the application's package tree.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../.cache/session-ui/package.json', import.meta.url));
const { chromium } = require('playwright-core');
const Chromium = require('@sparticuz/chromium').default;
import assert from 'node:assert/strict';
const { inflate } = await import('../../.cache/session-ui/node_modules/@sparticuz/chromium/build/lambdafs.js');
await inflate(new URL('../../.cache/session-ui/node_modules/@sparticuz/chromium/bin/al2023.tar.br', import.meta.url).pathname);
const chromiumEnv = { ...process.env, LD_LIBRARY_PATH: `/tmp/al2023/lib:${process.env.LD_LIBRARY_PATH || ''}` };
const browser=await chromium.launch({args:[...Chromium.args,'--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'],executablePath:await Chromium.executablePath(),headless:true,env:chromiumEnv});
const context=await browser.newContext({viewport:{width:process.env.MOBILE ? 390 : 1440,height:1000},permissions:['camera']});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
const users=ids.map((id,i)=>({id,email:['atleta@gmail.com','treinador@gmail.com','casual@gmail.com'][i],name:['Atleta Salvo','Treinadora Salva','Casual Sem Atalho'][i],account_type:['athlete','coach','casual'][i],role:'user',created_at:new Date().toISOString(),sport_interests:['Corrida']}));
const jwt=id=>Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test-signature';
const getUser=id=>({...users.find(u=>u.id===id),aud:'authenticated',role:'authenticated',user_metadata:{name:users.find(u=>u.id===id).name,account_type:users.find(u=>u.id===id).account_type},identities:[]});
const token=id=>({access_token:jwt(id),refresh_token:'remember-refresh-'+id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:getUser(id)});
const deny=false;
let follows=[], products=INITIAL_PRODUCTS, tickets=[], saleOrders=[];
const posts=[{id:'44444444-4444-4444-8444-444444444444',author_id:ids[1],author_name:users[1].name,title:'Treino da comunidade',content:'Uma dica útil para corredores.',category:'treino',created_at:new Date().toISOString(),likes_count:0,comments_count:0,comments:[]}];
let png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII=','base64');
await page.route('https://**.supabase.co/**',async route=>{
 const req=route.request(),url=new URL(req.url()),path=url.pathname;
 const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 if(req.method()==='OPTIONS')return json({});
 if(path.endsWith('/token')){
  const body=req.postDataJSON();
  if(url.searchParams.get('grant_type')==='password'){
   if(body.password!=='valid-secret')return json({error_code:'invalid_credentials',msg:'Invalid login credentials'},400);
   return json(token(users.find(u=>u.email===body.email).id));
  }
  if(deny)return json({error_code:'refresh_token_not_found',msg:'Revoked'},400);
  return json(token(body.refresh_token.replace('remember-refresh-','')));
 }
 if(path.endsWith('/signup')){
  const body=req.postDataJSON();return json(token(users.find(u=>u.email===body.email).id));
 }
 if(path.endsWith('/user')){
  const auth=req.headers().authorization||'';let id;
  try{id=JSON.parse(Buffer.from(auth.split('.')[1],'base64url').toString()).sub;}catch{}
  return id?json(getUser(id)):json({msg:'Not authenticated'},401);
 }
 if(path.endsWith('/logout')){return route.fulfill({status:204});}
 if(path.includes('/storage/v1/object/public/'))return route.fulfill({status:200,contentType:'image/png',body:png});
 if(path.includes('/storage/v1/object/')&&req.method()==='POST'){return json({Key:path.split('/object/')[1]});}
 if(path.endsWith('/external_offers')) {const id=url.searchParams.get('id')?.replace('eq.','');return json(id?INITIAL_EXTERNAL_OFFERS.find(item=>item.id===id):INITIAL_EXTERNAL_OFFERS);}
 if(path.endsWith('/prepare_core_sale')) {
   const input=req.postDataJSON(); const old=saleOrders.find(item=>item.request_key===input.p_request_key); if(old)return json(old.id);
   const order={id:'88888888-8888-4888-8888-888888888889',owner:ids[0],request_key:input.p_request_key,status:'preparation',payment_status:'disabled',shipping_status:'not_quoted',shipping_cents:null,total_cents:null,address:input.p_address,items:input.p_items.map(line=>{const offer=INITIAL_EXTERNAL_OFFERS.find(item=>item.id===line.offerId);return {...line,title:offer.title,supplier:offer.store_name,unitPriceCents:Math.round(offer.price*100)};}),note:'',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};order.subtotal_cents=order.items.reduce((sum,item)=>sum+item.unitPriceCents*item.quantity,0);saleOrders.push(order);return json(order.id);
 }
 if(path.endsWith('/core_sale_orders'))return json(saleOrders);
 if(path.endsWith('/core_supplier_settings'))return json([{name:'Centauro',agreement_status:'unconfirmed',operation_notes:''}]);
 if(path.endsWith('/support_tickets')) {
  if(req.method()==='POST'){const ticket={...req.postDataJSON(),id:'88888888-8888-4888-8888-888888888888',owner:ids[0],status:'open',response:'',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};tickets.push(ticket);return json(ticket);}
  return json(tickets);
 }
 if(path.endsWith('/community_follows')){
  if(req.method()==='POST'){follows=[{following_id:ids[1],follower_id:ids[0]}];return json(null);}
  if(req.method()==='DELETE'){follows=[];return json(null);}
  return json(follows);
 }
 if(path.endsWith('/community_posts')){
  if(req.method()==='POST'){const body=req.postDataJSON();const post={...(Array.isArray(body)?body[0]:body),id:'55555555-5555-4555-8555-555555555555',created_at:new Date().toISOString()};posts.unshift(post);return json(post);}
  return json(posts);
 }
 if(path.endsWith('/products')){
  if(req.method()==='POST'){const post={...req.postDataJSON(),id:'66666666-6666-4666-8666-666666666666',created_at:new Date().toISOString(),views:0,likes_count:0};products.push(post);return json(post);}
  return json(products);
 }
 if(path.endsWith('/sports_records'))return json([{id:'77777777-7777-4777-8777-777777777777',owner:ids[1],kind:'coach',data:{name:'Treinadora Contato',sport:'Corrida',city:'Curitiba, PR',qualifications:'Educação física',methodology:'Aulas para iniciantes',availability:'Segunda às 9h',contact:'(41) 98891-8146'}}]);
 if(path.endsWith('/profiles')){
  const id=url.searchParams.get('id')?.replace('eq.','');
  if(req.method()==='PATCH'){Object.assign(users.find(u=>u.id===id),req.postDataJSON());return json(users.find(u=>u.id===id));}
  return json(id?users.filter(u=>u.id===id):users);
 }
 return json([]);
});
await page.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.hostname==='localhost'||url.hostname.endsWith('.supabase.co'))return route.fallback();
 return route.abort();
});
try {
 await page.goto('http://localhost:3001/');
 await page.getByRole('heading',{name:'BLACK FRIDAY.'}).waitFor();
 const discount=page.getByRole('region',{name:'Descontos em destaque'});
 await discount.getByRole('button').first().click();
 await page.waitForURL('**/produto/core/**');
 await page.getByRole('heading',{level:1}).waitFor();
 await page.screenshot({path:'.cache/product-page-'+(process.env.MOBILE?'mobile':'desktop')+'.png'});
 assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByLabel('Numeração (BR)', { exact: true }).selectOption('40');
 await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
 await page.getByRole('status').filter({hasText:/adicionado ao carrinho/i}).waitFor();
 await page.getByRole('link',{name:/Carrinho CoreMotion/}).click();
 await page.getByRole('button',{name:'Continuar para endereço'}).click();
 await page.getByRole('dialog').locator('input[type=email]').fill(users[0].email);await page.getByRole('dialog').locator('input[type=password]').fill('valid-secret');await page.getByRole('dialog').getByRole('button',{name:'Entrar na Plataforma',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 // The header avatar is absent on the dedicated checkout; login still succeeds.
 await page.getByRole('button',{name:'Continuar para endereço'}).click();
 for(const [label,value] of [['Destinatário','Atleta Teste'],['Telefone','41999999999'],['CEP','80000000'],['Rua','Rua de Teste'],['Número','123'],['Bairro','Centro'],['Cidade','Curitiba'],['UF','PR']]) await page.getByLabel(label,{exact:true}).fill(value);
 await page.getByRole('button',{name:'Revisar preparação'}).click();
 assert.equal(await page.getByRole('button',{name:'Pagar — indisponível'}).isDisabled(),true);
 await page.getByRole('button',{name:'Consultar disponibilidade de frete'}).click();
 await page.getByRole('status').filter({hasText:'Frete e prazo ainda não configurados'}).waitFor();
 await page.getByRole('button',{name:'Salvar preparação — sem concluir compra'}).click();
 await page.getByRole('heading',{name:'Preparação salva — não é uma compra concluída'}).waitFor();
 assert.equal(saleOrders.length,1);assert.equal(saleOrders[0].payment_status,'disabled');
 await page.getByRole('link',{name:'Acompanhar preparação →'}).click();
 await page.getByText('Em preparação — compra não concluída',{exact:true}).waitFor();
 const athlete=INITIAL_PRODUCTS.find(item=>item.product_type==='c2c'&&item.status==='active'&&item.contact_phone);
 await page.goto(`http://localhost:3001/produto/athlete/${encodeURIComponent(athlete.id)}`);
 await page.getByRole('heading',{name:athlete.title,exact:true}).waitFor();
 await page.getByRole('link',{name:'Conversar com o atleta pelo WhatsApp'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).count(),0);
 assert.equal(await page.getByRole('dialog').count(),0);
 await page.goto('http://localhost:3001/');
 if(process.env.MOBILE) {await page.getByRole('button',{name:'Abrir barra de funções'}).click();await page.getByRole('navigation',{name:'Navegação da plataforma'}).getByRole('button').filter({hasText:'Comunidade'}).click();}
 else await page.getByRole('navigation',{name:'Navegação da loja'}).getByRole('button',{name:'Comunidade',exact:true}).click();
 await page.getByRole('heading',{name:'Comunidade',exact:true}).waitFor();
 await page.getByLabel('Buscar na comunidade').fill('não existente');
 await page.getByText('A conversa pode começar com você',{exact:true}).waitFor();
 await page.getByLabel('Buscar na comunidade').fill('');
 await page.getByLabel('Ordenar publicações').selectOption('popular');
 await page.getByRole('heading',{name:'Treino da comunidade',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'.cache/community-'+(process.env.MOBILE?'mobile':'desktop')+'.png'});
 users[0].role='admin';
 await page.goto('http://localhost:3001/pedidos');
 await page.getByRole('heading',{name:'Gestão de pedidos CoreMotion',exact:true}).waitFor();
 await page.getByRole('heading',{name:'Formação do preço de venda'}).waitFor();
 await page.getByLabel('Custo verificado (R$)',{exact:true}).fill('100');
 await page.getByLabel('Acréscimo sobre custo (%)',{exact:true}).fill('25');
 await page.getByLabel('Despesa fixa (R$)',{exact:true}).fill('1.99');
 await page.getByText('R$ 126,99',{exact:true}).waitFor();
 await page.getByRole('heading',{name:'Fornecedores e operação'}).waitFor();
 await page.getByRole('heading',{name:'Centauro',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:/Marcar.*pag|Enviar pedido|Confirmar pagamento/}).count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS commerce: product URLs for CoreMotion and athletes, C2C WhatsApp kept separate, variant, guest cart merged after login, checkout/address/review, shipping unavailable, payments disabled, saved preparation/history, Reddit community search/sort; mocked backend '+(process.env.MOBILE?'mobile':'desktop'));
} catch(error){console.error(error);console.error((await page.locator('body').innerText()).slice(-3000));process.exitCode=1;} finally {await browser.close();}
