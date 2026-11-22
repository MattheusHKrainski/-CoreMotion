// Read-only 2026 football club shop discovery. No tokens or checkout transactions.
const stores=[
 ['athletico-paranaense','https://loja.athletico.com.br','Camisa'],
 ['atletico-mg','https://www.lojadogalo.com.br','Camisa'],
 ['bahia','https://www.lojaesquadrao.com.br','camisa'],
 ['botafogo','https://store.botafogo.com.br','camisa'],
 ['chapecoense','https://www.kappa.com.br','Chapecoense'],
 ['cruzeiro','https://loja.cruzeiro.com.br','Camisa'],
 ['flamengo','https://loja.flamengo.com.br','Camisa'],
 ['fluminense','https://loja.fluminense.com.br','Camisa'],
 ['gremio','https://loja.gremiomania.com.br','Camisa'],
 ['palmeiras','https://www.palmeirasstore.com','Camisa'],
 ['red-bull-bragantino','https://www.redbullshop.com.br','Camisa'],
 ['santos','https://www.umbro.com.br','Santos'],
 ['sao-paulo','https://www.saostore.com.br','Camisa'],
 ['vitoria','https://www.lojasounego.com.br','Camisa'],
];
const q=x=>encodeURIComponent(x);const clean=t=>String(t||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const [team,base,search]of stores){
 try{
 const url=base+'/api/catalog_system/pub/products/search?ft='+q(search)+'&_from=0&_to=29';
 const response=await fetch(url,{headers:{accept:'application/json','user-agent':'Mozilla/5.0 (CoreMotion educational catalog integration)'},signal:AbortSignal.timeout(16000)});
 if(!response.ok){console.log('CLUB_PROBE '+JSON.stringify({team,http:response.status}));continue}
 const data=await response.json();
 if(!Array.isArray(data)){console.log('CLUB_PROBE '+JSON.stringify({team,error:'non-array'}));continue}
 const eligible=data.filter(p=>/(camisa|camiseta|manto|uniforme|regata|jaqueta)/i.test(p.productName||'') && /https:\/\//i.test(p.link||'')).slice(0,15);
 const records=[];
 for(const p of eligible){
  let found=null;
  for(const item of p.items||[]){
   const seller=(item.sellers||[]).find(s=>Number(s.commertialOffer?.Price)>0 && s.commertialOffer?.IsAvailable!==false);
   const imgs=[...new Set((item.images||[]).map(x=>x.imageUrl).filter(x=>/^https:\/\//.test(x)))];
   if(seller&&imgs.length){found={price:seller.commertialOffer.Price,original:seller.commertialOffer.ListPrice,imgs,variants:(p.items||[]).map(i=>(i.name||'').match(/(?:^|\s)(PP|P|M|G|GG|XG|XGG|2GG|3G|4G)(?:\s|$)/i)?.[1]).filter(Boolean)};break}
  }
  if(!found)continue;
  records.push({id:String(p.productId),title:clean(p.productName),link:p.link,price:found.price,original:found.original,images:found.imgs.slice(0,8),sizes:[...new Set(found.variants)]});
 }
 console.log('CLUB_PROBE '+JSON.stringify({team,http:response.status,total:data.length,eligible:eligible.length,products:records.slice(0,5)}));
 } catch(e){console.log('CLUB_PROBE '+JSON.stringify({team,error:String(e).slice(0,150)}))}
}
