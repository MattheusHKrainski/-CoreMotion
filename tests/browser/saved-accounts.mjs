// Optional browser-test dependencies are installed outside the application's package tree.
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../.cache/session-ui/package.json', import.meta.url));
const { chromium } = require('playwright-core');
const Chromium = require('@sparticuz/chromium').default;
import assert from 'node:assert/strict';
const { inflate } = await import('../../.cache/session-ui/node_modules/@sparticuz/chromium/build/lambdafs.js');
await inflate(new URL('../../.cache/session-ui/node_modules/@sparticuz/chromium/bin/al2023.tar.br', import.meta.url).pathname);
const chromiumEnv = { ...process.env, LD_LIBRARY_PATH: `/tmp/al2023/lib:${process.env.LD_LIBRARY_PATH || ''}` };
const browser=await chromium.launch({args:Chromium.args,executablePath:await Chromium.executablePath(),headless:true,env:chromiumEnv});
const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
const users=ids.map((id,i)=>({id,email:['atleta@gmail.com','treinador@gmail.com','casual@gmail.com'][i],name:['Atleta Salvo','Treinadora Salva','Casual Sem Atalho'][i],account_type:['athlete','coach','casual'][i],role:'user',created_at:new Date().toISOString(),sport_interests:['Corrida']}));
const jwt=id=>Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test-signature';
const getUser=id=>({...users.find(u=>u.id===id),aud:'authenticated',role:'authenticated',user_metadata:{name:users.find(u=>u.id===id).name,account_type:users.find(u=>u.id===id).account_type},identities:[]});
const token=id=>({access_token:jwt(id),refresh_token:'remember-refresh-'+id,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:getUser(id)});
let passwords=0,refreshes=0,logouts=0,deny=false;
await page.route('https://**.supabase.co/**',async route=>{
 const req=route.request(),url=new URL(req.url()),path=url.pathname;
 const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 if(req.method()==='OPTIONS')return json({});
 if(path.endsWith('/token')){
  const body=req.postDataJSON();
  if(url.searchParams.get('grant_type')==='password'){
   passwords++;if(body.password!=='valid-secret')return json({error_code:'invalid_credentials',msg:'Invalid login credentials'},400);
   return json(token(users.find(u=>u.email===body.email).id));
  }
  refreshes++;if(deny)return json({error_code:'refresh_token_not_found',msg:'Revoked'},400);
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
 if(path.endsWith('/logout')){logouts++;return route.fulfill({status:204});}
 if(path.endsWith('/profiles')){const id=url.searchParams.get('id')?.replace('eq.','');return json(id?users.filter(u=>u.id===id):users);}
 return json([]);
});
await page.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.hostname==='localhost'||url.hostname.endsWith('.supabase.co'))return route.fallback();
 return route.abort();
});
const dialog=()=>page.getByRole('dialog');
const checkbox=()=>dialog().getByRole('checkbox');
const openLogin=async()=>{await page.getByRole('button',{name:'Fazer login',exact:true}).first().click();await dialog().waitFor();};
const saved=async()=>page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('coremotion_saved_accounts_v1_')))||'[]'));
const fillLogin=async(email,remember)=>{await dialog().locator('input[type=email]').fill(email);await dialog().locator('input[type=password]').fill('valid-secret');if(remember)await checkbox().check();await dialog().getByRole('button',{name:'Entrar na Plataforma',exact:true}).click();await dialog().waitFor({state:'hidden'});await page.getByRole('button',{name:'Abrir minha conta'}).waitFor();};
const switchAccounts=async()=>{await page.getByRole('button',{name:'Abrir minha conta'}).click();await page.getByRole('button',{name:'Trocar conta',exact:true}).click();await dialog().waitFor();};
try{
 await page.goto('http://localhost:3000/');await openLogin();assert.equal(await checkbox().isChecked(),false);
 await fillLogin(users[0].email,true);assert.equal((await saved()).length,1);assert.equal(passwords,1);
 await page.getByTitle('Desconectar / Sair').click();await dialog().waitFor();
 assert.equal(logouts,0);assert.equal((await saved()).length,1);
 await dialog().getByRole('button',{name:'Entrar como Atleta Salvo',exact:true}).click();await dialog().waitFor({state:'hidden'});await page.getByRole('button',{name:'Abrir minha conta'}).waitFor();assert.equal(passwords,1);assert.ok(refreshes>0);
 await switchAccounts();await dialog().getByRole('button',{name:'Fazer login',exact:true}).click();assert.equal(await checkbox().isChecked(),false);
 await fillLogin(users[1].email,true);assert.equal((await saved()).length,2);
 await switchAccounts();
 // Closing the selector leaves the current account and profile page intact.
 await dialog().getByRole('button',{name:'Fechar formulário'}).click();assert.match(await page.getByRole('button',{name:'Abrir minha conta'}).textContent(),/Treinadora Salva/);
 await page.getByRole('button',{name:'Trocar conta',exact:true}).click();
 const loginHeight = await dialog().evaluate(element=>element.getBoundingClientRect().height);
 await dialog().getByRole('button',{name:'Remover Atleta Salvo do acesso rápido',exact:true}).click();
 assert.equal(await dialog().evaluate(element=>element.getBoundingClientRect().height),loginHeight);
 assert.equal(await page.getByRole('alertdialog').evaluate(element=>element.matches(':modal')),true);
 await page.getByRole('alertdialog').getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal((await saved()).length,2);
 await dialog().getByRole('button',{name:'Remover Atleta Salvo do acesso rápido',exact:true}).click();
 await page.getByRole('alertdialog').getByRole('button',{name:'Confirmar remoção',exact:true}).click();assert.equal((await saved()).length,1);
 // Forgotten session fails gracefully without changing the current logged-in account.
 deny=true;await dialog().getByRole('button',{name:'Entrar como Treinadora Salva',exact:true}).click();await dialog().getByText(/expirou ou foi revogado/).waitFor();
 assert.equal(await dialog().locator('input[type=email]').inputValue(),users[1].email);
 await dialog().getByRole('button',{name:'Fechar formulário'}).click();assert.match(await page.getByRole('button',{name:'Abrir minha conta'}).textContent(),/Treinadora Salva/);deny=false;
 await page.getByRole('button',{name:'Trocar conta',exact:true}).click();await dialog().getByRole('button',{name:'Fazer login',exact:true}).click();
 await fillLogin(users[2].email,false);assert.equal((await saved()).length,1);assert.ok(!(await saved()).some(x=>x.id===ids[2]));
 await page.reload();await page.getByRole('button',{name:'Abrir minha conta'}).waitFor();
 await switchAccounts();await dialog().getByRole('button',{name:'Remover Treinadora Salva do acesso rápido',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Confirmar remoção',exact:true}).click();
 assert.equal((await saved()).length,0);
 await dialog().getByRole('button',{name:'Fazer login',exact:true}).click();await dialog().getByRole('button',{name:'Cadastre-se',exact:true}).click();assert.equal(await checkbox().isChecked(),false);
 await dialog().getByRole('button',{name:'Casual',exact:true}).click();await dialog().getByPlaceholder('Ex: Matheus Silveira').fill(users[2].name);await dialog().locator('input[type=email]').fill(users[2].email);await dialog().locator('input[type=password]').fill('valid-secret');await checkbox().check();await dialog().getByRole('button',{name:'Concluir Cadastro',exact:true}).click();await dialog().waitFor({state:'hidden'});await page.getByRole('button',{name:'Abrir minha conta'}).waitFor();assert.equal((await saved()).length,1);
 const all=await page.evaluate(()=>JSON.stringify(localStorage));assert.ok(!all.includes('valid-secret'));assert.deepEqual(errors,[]);
 console.log('PASS Chromium + actual Supabase SDK, mocked HTTP: opt-in login/signup, no opt-in no card, saved logout/reentry without password, two accounts, X cancellation/removal, expired session retains current identity, reload persistence, no stored passwords, no page/hydration errors.');
}catch(e){console.error(e);console.error((await page.locator('body').innerText()).slice(-4500));process.exitCode=1;}finally{await browser.close();}
