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
let follows=[], uploads=0, products=[], tickets=[];
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
 if(path.includes('/storage/v1/object/')&&req.method()==='POST'){uploads++;return json({Key:path.split('/object/')[1]});}
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
const dialog=()=>page.getByRole('dialog');
const checkbox=()=>dialog().getByRole('checkbox');
const fillLogin=async(email,remember)=>{await dialog().locator('input[type=email]').fill(email);await dialog().locator('input[type=password]').fill('valid-secret');if(remember)await checkbox().check();await dialog().getByRole('button',{name:'Entrar na Plataforma',exact:true}).click();await dialog().waitFor({state:'hidden'});await page.getByRole('button',{name:'Abrir minha conta'}).waitFor();};
const navigate=async label=>{if(process.env.MOBILE)await page.getByRole('button',{name:'Abrir barra de funções'}).click();await page.getByRole('navigation',{name:'Navegação da plataforma'}).getByRole('button').filter({hasText:label}).first().click();};
try {
 await page.goto('http://localhost:3000/');
 await page.getByRole('button',{name:'Entrar',exact:true}).first().click(); await fillLogin(users[0].email,false);
 await page.locator('footer').getByRole('button',{name:'Relatar problema',exact:true}).click();
 const help=page.getByRole('dialog',{name:'Central de Atendimento'});
 await help.getByLabel('Assunto',{exact:true}).fill('Falha ao abrir um anúncio');
 await help.getByLabel('Descrição da solicitação').fill('O anúncio não abre ao tocar no botão de detalhes.');
 await help.getByRole('button',{name:'Registrar solicitação',exact:true}).click();
 await help.getByRole('status').filter({hasText:'Solicitação registrada'}).waitFor();
 assert.equal(tickets.length,1); assert.equal(tickets[0].category,'problem');
 await help.getByRole('button',{name:'Fechar atendimento'}).click();
 await page.locator('footer').getByRole('button',{name:'Central de Atendimento',exact:true}).click();
 await help.getByRole('heading',{name:'Falha ao abrir um anúncio'}).waitFor();
 assert.equal(await help.getByText('Resposta da equipe',{exact:true}).count(),0);
 assert.deepEqual(errors,[]); console.log('PASS support: signed-in ticket registration, persisted history on reopen, ordinary user has no reply controls (mocked backend)');
} catch(error) {console.error(error);process.exitCode=1;} finally {await browser.close();}
