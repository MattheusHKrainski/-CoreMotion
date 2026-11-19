// Run with: node --import tsx tests/browser/home-carousel.mjs
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {INITIAL_PRODUCTS} from '../../fixtures/initial-data.ts';
import {INITIAL_EXTERNAL_OFFERS} from '../../fixtures/real-offers.ts';
const require=createRequire(new URL('../../.cache/session-ui/package.json',import.meta.url));
const {chromium}=require('playwright-core');const Chromium=require('@sparticuz/chromium').default;
const {inflate}=await import('../../.cache/session-ui/node_modules/@sparticuz/chromium/build/lambdafs.js');
await inflate(new URL('../../.cache/session-ui/node_modules/@sparticuz/chromium/bin/al2023.tar.br',import.meta.url).pathname);
const browser=await chromium.launch({args:Chromium.args,executablePath:await Chromium.executablePath(),headless:true,env:{...process.env,LD_LIBRARY_PATH:'/tmp/al2023/lib'}});
const page=await browser.newPage({viewport:{width:process.env.MOBILE?390:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.route('https://**.supabase.co/**',async route=>{const path=new URL(route.request().url()).pathname;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(path.endsWith('/products')?INITIAL_PRODUCTS:path.endsWith('/external_offers')?INITIAL_EXTERNAL_OFFERS:[])});});
try {
 await page.goto('http://localhost:3000/');
 const footer=page.locator('footer');
 await footer.getByRole('button',{name:'Central de Atendimento',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Central de Atendimento'});
 await dialog.waitFor();
 for (const label of ['Dúvidas gerais','Encontre seu tamanho','Entregas','Pedidos','Devoluções','Pagamentos','Produtos','Corporativo','Fale conosco','Relatar problema']) {
   await dialog.getByRole('button',{name:label,exact:true}).click();
   assert.equal(await dialog.getByRole('link',{name:'Enviar e-mail'}).getAttribute('href'),`mailto:coremotionempresas@gmail.com?subject=${encodeURIComponent(`CoreMotion — ${label}`)}`);
 }
 await dialog.getByRole('button',{name:'Fechar atendimento'}).click();
 assert.equal(await footer.getByRole('link',{name:'coremotionempresas@gmail.com',exact:true}).getAttribute('href'),'mailto:coremotionempresas@gmail.com');
 await footer.getByRole('button',{name:'Trocar conta',exact:true}).click();
 await page.getByText('Selecionar conta', {exact:true}).first().waitFor();
 assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS help center: all 10 topics, mailto, close, switch account, no overflow '+(process.env.MOBILE?'mobile':'desktop'));
} catch(error) { console.error(error); console.error((await page.locator('body').innerText()).slice(-3500)); process.exitCode=1; } finally { await browser.close(); }
