// Read only public catalog feeds from official Brazilian sportswear brands.
// Product identity, price and images come from their own API response, not generated SKUs.
const providers = [
 {id:'Umbro',url:'https://www.umbro.com.br',max:200},
 {id:'Fila',url:'https://www.fila.com.br',max:200},
 {id:'Olympikus',url:'https://www.olympikus.com.br',max:200},
 {id:'Mizuno',url:'https://www.mizuno.com.br',max:200},
 {id:'Penalty',url:'https://www.penalty.com.br',max:200},
];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const unaccent=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const clean=x=>String(x||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
const https=x=>typeof x==='string'&&/^https:\/\//i.test(x);
const excluded=/(halter|musculacao|academia|creatina|whey|peso de |anilha|caneleira de peso|estimulante|pre-treino|suplemento)/;
function classify(item){
 const name=unaccent(item.productName);
 const cats=unaccent((item.categories||[]).join(' '));
 const t=name+' '+cats;
 if(excluded.test(t) && !/tenis|camiseta|short|calca|bermuda|chinelo|sandalia/.test(name))return null;
 let category;
 if(/\b(tenis|chuteira|chinelo|slide|sandalia|papete|sapatilha|sapato)\b/.test(name))category='Calçados';
 else if(/\b(camisa|camiseta|regata|bermuda|short|calca|legging|jaqueta|agasalho|moletom|top|vestido|casaco|blusa|uniforme|polo|conjunto)\b/.test(name))category='Vestuário';
 else if(/\b(bone|mochila|bolsa|meia|oculos|viseira|garrafa|squeeze|carteira|pochete)\b/.test(name))category='Acessórios';
 else if(/\b(bola|raquete|luva|caneleira|joelheira)\b/.test(name))category='Equipamentos';
 else return null;
 let sport=/\b(volei|volley|volleyball|vp[ -]?5000)\b/.test(t)?'Vôlei':
   /\b(futebol|chuteira|futsal|society|umbro|gremio|santos|fluminense|atletico|chapecoense|brasiliense|coritiba|sport club|camisa oficial)\b/.test(t)?'Futebol':
   /\b(corrida|running|maratona|runner|corre|velocity|speed|performance|sportstyle)\b/.test(t)?'Corrida':
   /\b(basquete|basket|nba)\b/.test(t)?'Basquete':
   /\b(treinamento|treino|fitness)\b/.test(t)?'Treinamento':'Casual';
 if(category==='Calçados' && /\b(chinelo|slide|sandalia|papete)\b/.test(name))sport='Casual';
 if(category==='Vestuário' && /camisa (oficial|gremio|santos|fluminense|atletico|chapecoense)/.test(t))sport='Futebol';
 return {category,sport};
}
function parseProduct(row,brand){
 const cls=classify(row);if(!cls)return null;
 const productId=String(row.productId||'');
 const title=clean(row.productName);
 const url=row.link;
 if(!/^\d{2,12}$/.test(productId)||title.length<8||title.length>230||!https(url)||!url.startsWith(brand.url+'/'))return null;
 const variants=Array.isArray(row.items)?row.items:[];
 let selected=null;
 for(const item of variants){
  for(const seller of item.sellers||[]){
   const offer=seller.commertialOffer||{};
   if(offer.IsAvailable===false||!(Number(offer.Price)>0))continue;
   if(!(item.images||[]).some(x=>https(x.imageUrl)))continue;
   selected={item,offer};break;
  }
  if(selected)break;
 }
 if(!selected)return null;
 const price=Math.round(Number(selected.offer.Price)*100)/100;
 if(!Number.isFinite(price)||price<8||price>8500)return null;
 const gallery=[...new Set((selected.item.images||[]).map(x=>x.imageUrl).filter(https))].slice(0,8);
 if(!gallery.length)return null;
 const sizes=[...new Set(variants.filter(item=>(item.sellers||[]).some(s=>s.commertialOffer?.IsAvailable!==false && Number(s.commertialOffer?.Price)>0)).map(item=>{
  const full=clean(item.name||item.nameComplete||'');
  const m=full.match(/(?:^|[\s/-])(3[0-9]|4[0-7]|PP|P|M|G|GG|XG|XGG|UNICO|ÚNICO)(?:$|[\s/-])/i);
  return m?m[1].toUpperCase():'';
 }).filter(Boolean))].slice(0,18);
 const description=clean(row.description).slice(0,360)||title;
 const previous=Number(selected.offer.ListPrice);
 const original=Number.isFinite(previous)&&previous>price&&previous<price*5 ? Math.round(previous*100)/100 : null;
 const firstCat=cls.category;
 return {
  id:'curated-'+brand.id.toLowerCase()+'-'+productId,
  title,description,store_name:brand.id,
  category:firstCat,sport:cls.sport,price,original_price:original,
  image_url:gallery[0],image_urls:gallery,source_url:url,variant_options:sizes,
  discovered_category:(row.categories||[]).join(' > ').slice(0,140)
 };
}
const all=[];const errors=[];const counts={};
for(const brand of providers){
 let total=0,usable=0;
 for(let from=0;from<brand.max;from+=20){
  const url=brand.url+'/api/catalog_system/pub/products/search?_from='+from+'&_to='+(from+19);
  try{
   const response=await fetch(url,{headers:{'accept':'application/json','user-agent':'Mozilla/5.0 (CoreMotion educational catalog review)'},signal:AbortSignal.timeout(30000)});
   if(response.status!==206 && response.status!==200){errors.push(brand.id+' '+from+' http '+response.status);break}
   const body=await response.json();
   if(!Array.isArray(body)||!body.length)break;
   total+=body.length;
   for(const row of body){const parsed=parseProduct(row,brand);if(parsed){usable++;all.push(parsed)}}
   if(body.length<20)break;
   await sleep(150);
  }catch(e){errors.push(brand.id+' '+from+' '+String(e).slice(0,120));break}
 }
 counts[brand.id]={total,usable};
}
const byCategory={'Calçados':[],'Vestuário':[],'Acessórios':[],'Equipamentos':[]};
const dedupe=new Set();
for(const p of all){if(dedupe.has(p.source_url))continue;dedupe.add(p.source_url);byCategory[p.category].push(p)}
// Avoid collecting 400 nearly identical shoes; round-robin suppliers for each category.
const selected=[];const selectedIds=new Set();
function add(cat,amount){
 const arr=byCategory[cat]||[];const groups={};for(const p of arr){(groups[p.store_name]??=[]).push(p)}
 const names=Object.keys(groups).sort();
 let found=true;
 while(selected.length<400 && amount>0 && found){found=false;for(const brand of names){const p=groups[brand].shift();if(p && !selectedIds.has(p.id)){selected.push(p);selectedIds.add(p.id);amount--;found=true;if(amount===0)break}}}
}
add('Vestuário',125);
add('Calçados',220);
add('Acessórios',35);
add('Equipamentos',20);
for(const cat of ['Vestuário','Calçados','Acessórios','Equipamentos'])add(cat,400-selected.length);
console.log('CATALOG_SUMMARY '+JSON.stringify({counts,byCategory:Object.fromEntries(Object.entries(byCategory).map(([k,v])=>[k,v.length])),selected:selected.length,selectedCategories:Object.fromEntries(['Calçados','Vestuário','Acessórios','Equipamentos'].map(k=>[k,selected.filter(p=>p.category===k).length])),errors}));
for(const p of selected)console.log('CATALOG_RECORD '+JSON.stringify(p));
if(selected.length<400)process.exitCode=2;
