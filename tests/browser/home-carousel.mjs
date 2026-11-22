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
try{
 await page.goto('http://localhost:3000/');const carousel=page.getByRole('region',{name:'Produtos e ofertas em destaque'});
 await carousel.getByRole('button',{name:'Próximo produto'}).waitFor();
 const firstProduct=INITIAL_PRODUCTS.find(item=>item.product_type==='c2c'&&item.status==='active');await carousel.getByRole('heading',{name:firstProduct.title,exact:true}).waitFor();
 const current=()=>carousel.locator('[aria-current=true]').getAttribute('aria-label');const first=await current();
 await carousel.getByRole('button',{name:'Próximo produto'}).click();assert.notEqual(await current(),first);
 await carousel.getByRole('button',{name:'Produto anterior'}).click();assert.equal(await current(),first);
 await carousel.getByRole('button',{name:/Mostrar produto 3:/}).click();assert.match(await current(),/^Mostrar produto 3:/);
 await carousel.press('ArrowRight');assert.match(await current(),/^Mostrar produto 4:/);
 await carousel.getByRole('button',{name:/Mostrar produto 1:/}).click();
 await carousel.getByRole('button',{name:'Pausar carrossel'}).click();assert.equal(await carousel.getByRole('button',{name:'Retomar carrossel'}).getAttribute('aria-pressed'),'true');
 await carousel.getByRole('button',{name:'Retomar carrossel'}).click();await page.locator('body').click({position:{x:2,y:2}});await page.mouse.move(2,2);
 const before=await current();await page.waitForTimeout(6400);assert.notEqual(await current(),before);
 await page.emulateMedia({reducedMotion:'reduce'});await carousel.getByRole('button',{name:'Retomar carrossel'}).waitFor();assert.equal(await carousel.getByRole('button',{name:'Retomar carrossel'}).isDisabled(),true);
 await carousel.getByRole('button',{name:/Mostrar produto 1:/}).click();await carousel.getByRole('button',{name:'Conhecer produto',exact:true}).click();await page.waitForURL('**/produto/athlete/**');
 await page.getByRole('heading',{name:firstProduct.title,exact:true}).waitFor();
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS carousel: arrows, indicators, keyboard, pause/resume, autoplay, reduced motion, exact product details, no overflow '+(process.env.MOBILE?'mobile':'desktop'));
}catch(error){console.error(error);console.error((await page.locator('body').innerText()).slice(-2500));process.exitCode=1;}finally{await browser.close();}
