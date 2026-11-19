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
 await page.getByRole('heading',{name:'BLACK FRIDAY.'}).waitFor();
 const menu=page.getByRole('button',{name:'Abrir barra de funções'});
 assert.equal(await menu.getAttribute('aria-expanded'),'false');
 assert.equal(await page.getByRole('dialog',{name:'Menu CoreMotion'}).count(),0);
 const discounts=page.getByRole('region',{name:'Descontos em destaque'});
 await discounts.getByRole('button').first().click();
 await page.getByRole('button',{name:'Fechar detalhes da oferta'}).click();
 await menu.click();
 const drawer=page.getByRole('dialog',{name:'Menu CoreMotion'});await drawer.waitFor();
 await drawer.getByRole('button',{name:/CoreShop/}).click();
 await page.getByRole('heading',{name:'CoreShop',exact:true}).waitFor();
 assert.equal(await menu.getAttribute('aria-expanded'),'false');
 await menu.click();await page.keyboard.press('Escape');assert.equal(await drawer.count(),0);
 await page.getByRole('button',{name:'Ver carrinho',exact:true}).click();
 await page.getByRole('heading',{name:/Carrinho/i}).first().waitFor();
 await page.keyboard.press('Escape');
 await page.goto('http://localhost:3000/');await page.getByRole('button',{name:'Ver favoritos e salvos'}).click();
 await page.getByRole('dialog').waitFor();
 assert.deepEqual(errors,[]);
 await page.getByRole('button',{name:'Fechar formulário'}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'.cache/coreshop-'+(process.env.MOBILE?'mobile':'desktop')+'.png',fullPage:false});
 console.log('PASS CoreShop: Black Friday, actual discount detail, collapsed drawer, CoreShop navigation, Esc, top cart, favorites auth, no overflow '+(process.env.MOBILE?'mobile':'desktop'));
} catch(error) {console.error(error); console.error((await page.locator('body').innerText()).slice(-1800));process.exitCode=1;} finally {await browser.close();}
